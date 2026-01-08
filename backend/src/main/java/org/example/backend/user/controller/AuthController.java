package org.example.backend.user.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.AuthResponseDTO;
import org.example.backend.user.dto.LoginRequestDTO;
import org.example.backend.user.dto.RegisterRequestDTO;
import org.example.backend.user.entity.User;
import org.example.backend.user.repository.UserRepository;
import org.example.backend.user.security.JwtService;
import org.example.backend.user.service.AuthService;
import org.example.backend.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO request) {
        Map<String, String> errors = new java.util.HashMap<>();
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            errors.put("username", "Tên người dùng đã tồn tại");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            errors.put("email", "Email đã tồn tại");
        }
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            errors.put("phone", "Số điện thoại đã tồn tại");
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }

        try {
            AuthResponseDTO authResponse = authService.register(request);
            return ResponseEntity.ok()
                    .headers(createAuthCookies(authResponse))
                    .body(Map.of(
                            "message", "Đăng ký thành công",
                            "accessToken", authResponse.getAccessToken(),
                            "refreshToken", authResponse.getRefreshToken()
                    ));
        } catch (RuntimeException e) {
            logger.error("Lỗi đăng ký: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            AuthResponseDTO authResponse = authService.login(request);
            User user = userRepository.findByEmailOrPhone(request.getEmail(), request.getPhone())
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

            // Lấy tên role
            String roleName = user.getRole() != null ? user.getRole().getRoleName() : "";

            return ResponseEntity.ok()
                    .headers(createAuthCookies(authResponse))
                    .body(Map.of(
                            "message", "Đăng nhập thành công",
                            "accessToken", authResponse.getAccessToken(),
                            "refreshToken", authResponse.getRefreshToken(),
                            "success", true,
                            "user", Map.of(
                                    "id", user.getId(),
                                    "username", user.getUsername(),
                                    "email", user.getEmail(),
                                    "phone", user.getPhone(),
                                    "failedAttempts", user.getFailed() != null ? user.getFailed() : 0,
                                    "locked", user.getLocked() != null ? user.getLocked() : false,
                                    "roleName", roleName   // Trả về role cho FE biết
                            )
                    ));
        } catch (RuntimeException e) {
            logger.error("Lỗi đăng nhập: {}", e.getMessage());
            User user = userRepository.findByEmailOrPhone(request.getEmail(), request.getPhone())
                    .orElse(null);
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", e.getMessage(),
                            "success", false,
                            "failedAttempts", user != null && user.getFailed() != null ? user.getFailed() : 0,
                            "locked", user != null && user.getLocked() != null ? user.getLocked() : false
                    ));
        } catch (Exception e) {
            logger.error("Lỗi đăng nhập: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", e.getMessage(),
                            "success", false,
                            "failedAttempts", 0,
                            "locked", false
                    ));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        try {
            AuthResponseDTO authResponse = authService.refreshToken(refreshToken);
            String username = jwtService.extractUsername(authResponse.getAccessToken());
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));

            // Lấy tên role
            String roleName = user.getRole() != null ? user.getRole().getRoleName() : "";

            return ResponseEntity.ok()
                    .headers(createAuthCookies(authResponse))
                    .body(Map.of(
                            "message", "Làm mới token thành công",
                            "accessToken", authResponse.getAccessToken(),
                            "refreshToken", authResponse.getRefreshToken(),
                            "user", Map.of(
                                    "id", user.getId(),
                                    "username", user.getUsername(),
                                    "email", user.getEmail(),
                                    "phone", user.getPhone(),
                                    "failedAttempts", user.getFailed() != null ? user.getFailed() : 0,
                                    "locked", user.getLocked() != null ? user.getLocked() : false,
                                    "roleName", roleName
                            )
                    ));
        } catch (Exception e) {
            logger.error("Lỗi khi làm mới token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Refresh token không hợp lệ hoặc đã hết hạn"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, createClearedCookie("accessToken").toString());
        headers.add(HttpHeaders.SET_COOKIE, createClearedCookie("refreshToken").toString());

        return ResponseEntity.ok()
                .headers(headers)
                .body(Map.of("message", "Đăng xuất thành công"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            userService.createPasswordResetToken(request.getEmail(), request.getFrontendUrl());
            return ResponseEntity.ok("Đã gửi email đặt lại mật khẩu.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("Đặt lại mật khẩu thành công.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private HttpHeaders createAuthCookies(AuthResponseDTO authResponse) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from("accessToken", authResponse.getAccessToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(15 * 60)
                .build().toString());
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(true)//chỉ gửi cookie qua http
                .sameSite("None")//cho phép gửi khác cors
                .path("/")
                .maxAge(30 * 60)
                .build().toString());
        return headers;
    }

    private ResponseCookie createClearedCookie(String name) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(0)
                .build();
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
        private String frontendUrl;
    }

    @Data
    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;
    }
}