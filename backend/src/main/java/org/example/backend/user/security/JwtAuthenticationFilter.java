package org.example.backend.user.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.backend.user.entity.User;
import org.example.backend.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String requestPath = request.getServletPath();
        // Các endpoint public được phép truy cập không cần xác thực
        if (requestPath.startsWith("/api/auth")
//                || requestPath.startsWith("/oauth2")
                || requestPath.startsWith("/api/products")
                || requestPath.startsWith("/api/shipping")
                || requestPath.startsWith("/api/voucher")
                || requestPath.startsWith("/api/categories")
                || requestPath.startsWith("/api/images")
                || requestPath.startsWith("/api/review")){
            filterChain.doFilter(request, response);
            return;
        }

        final String accessToken = extractTokenFromCookies(request, "accessToken");
        final String refreshToken = extractTokenFromCookies(request, "refreshToken");

        if (accessToken == null || accessToken.isBlank()) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("{\"error\": \"Access token is missing\"}");
            return;
        }

        try {
            String username = jwtService.extractUsername(accessToken);
            if (username == null) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.getWriter().write("{\"error\": \"Invalid access token\"}");
                return;
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

            if (jwtService.isTokenValid(accessToken, userDetails, user.getTokenVersion())) {
                setAuthentication(request, userDetails);
            } else if (refreshToken != null && jwtService.isRefreshTokenValid(refreshToken, userDetails, user.getTokenVersion())) {
                // Tạo token mới và refresh token mới
                String newTokenVersion = jwtService.generateTokenVersion();
                String newAccessToken = jwtService.generateToken(userDetails, newTokenVersion);
                String newRefreshToken = jwtService.generateRefreshToken(userDetails, newTokenVersion);

                // Cập nhật token version mới vào DB
                user.setTokenVersion(newTokenVersion);
                userRepository.save(user);

                // Set cookie mới cho client
                response.addHeader("Set-Cookie", createAccessTokenCookie(newAccessToken).toString());
                response.addHeader("Set-Cookie", createRefreshTokenCookie(newRefreshToken).toString());

                setAuthentication(request, userDetails);
            } else {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.getWriter().write("{\"error\": \"Tokens are invalid or expired\"}");
                return;
            }
        } catch (Exception ex) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("{\"error\": \"Authentication error: " + ex.getMessage() + "\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(HttpServletRequest request, UserDetails userDetails) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    private String extractTokenFromCookies(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;

        return Arrays.stream(cookies)
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private ResponseCookie createAccessTokenCookie(String token) {
        return ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(15 * 60)
                .build();
    }

    private ResponseCookie createRefreshTokenCookie(String token) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(30 * 60)
                .build();
    }
}