package org.example.backend.user.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.AuthResponseDTO;
import org.example.backend.user.dto.LoginRequestDTO;
import org.example.backend.user.dto.RegisterRequestDTO;
import org.example.backend.user.entity.Role;
import org.example.backend.user.entity.User;
import org.example.backend.user.mapper.UserMapper;
import org.example.backend.user.repository.RoleRepository;
import org.example.backend.user.repository.UserRepository;
import org.example.backend.user.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent())
            throw new RuntimeException("Tên người dùng đã tồn tại");

        if (userRepository.findByEmail(request.getEmail()).isPresent())
            throw new RuntimeException("Email đã tồn tại");

        if (userRepository.findByEmailOrPhone(null, request.getPhone()).isPresent())
            throw new RuntimeException("Số điện thoại đã tồn tại");

        Role userRole = roleRepository.findByRoleName("ROLE_CLIENT")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò mặc định"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setRole(userRole);
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(userRole);
        user.setTokenVersion(jwtService.generateTokenVersion());
        user.setFailed(0);
        user.setLocked(false);
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        return new AuthResponseDTO(
                jwtService.generateToken(userDetails, user.getTokenVersion()),
                jwtService.generateRefreshToken(userDetails, user.getTokenVersion())
        );
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        if (request.getEmail() == null && request.getPhone() == null){
            throw new BadCredentialsException("Vui lòng cung cấp chính xác một trong hai: email hoặc số điện thoại");
        }

        User user = userRepository.findByEmailOrPhone(request.getEmail(), request.getPhone())
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy email hoặc số điện thoại"));

        if (user.getFailed() == null) user.setFailed(0);
        if (user.getLocked() == null) user.setLocked(false);

        //tài khoản đã bị khóa
        if (user.getLocked()) {
            if (user.getLockTime() != null && Instant.now().isBefore(user.getLockTime().plus(15, ChronoUnit.MINUTES))) {
                throw new RuntimeException("Tài khoản đã bị khóa. Vui lòng thử lại sau 15 phút.");
            } else {
                user.setLocked(false);
                user.setFailed(0);
                user.setLockTime(null);
                userRepository.save(user);
            }
        }

        //đăng nhập sai
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.setFailed(user.getFailed() + 1);
            if (user.getFailed() >= 5) {
                user.setLocked(true);
                user.setLockTime(Instant.now());
                userRepository.save(user);
                throw new RuntimeException("Tài khoản đã bị khóa. Vui lòng thử lại sau 15 phút.");
            }
            userRepository.save(user);
            throw new BadCredentialsException("Mật khẩu không hợp lệ. Lần thử: " + user.getFailed() + "/5");
        }

        //đăng nhập thành công
        user.setFailed(0);
        userRepository.save(user);

        UserDetails userDetails = loadUserDetails(user);
        return new AuthResponseDTO(
                jwtService.generateToken(userDetails, user.getTokenVersion()),
                jwtService.generateRefreshToken(userDetails, user.getTokenVersion())
        );
    }

    public AuthResponseDTO refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadCredentialsException("Refresh token bị thiếu");
        }

        String username = jwtService.extractUsername(refreshToken);
        if (username == null) {
            throw new BadCredentialsException("Refresh token không hợp lệ");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (!jwtService.isRefreshTokenValid(refreshToken, userDetails, user.getTokenVersion())) {
            throw new BadCredentialsException("Refresh token đã hết hạn hoặc không hợp lệ");
        }

        userRepository.save(user);

        return new AuthResponseDTO(
                jwtService.generateToken(userDetails, user.getTokenVersion()),
                jwtService.generateRefreshToken(userDetails, user.getTokenVersion())
        );
    }

    private UserDetails loadUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(new SimpleGrantedAuthority(user.getRole().getRoleName()))
                .build();
    }

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
            throw new UsernameNotFoundException("Không tìm thấy người dùng đã xác thực");
        }

        Object principal = authentication.getPrincipal();
        String username = ((UserDetails) principal).getUsername();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với tên: " + username));
        return user.getId();
    }
}