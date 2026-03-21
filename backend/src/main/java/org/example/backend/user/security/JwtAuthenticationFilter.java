package org.example.backend.user.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.backend.user.entity.User;
import org.example.backend.user.repository.UserRepository;
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

        // ✅ 1. Bypass preflight (CORS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String requestPath = request.getServletPath();

        // ✅ 2. Public endpoints
        if (requestPath.startsWith("/api/auth")
                || requestPath.startsWith("/api/products")
                || requestPath.startsWith("/api/shipping")
                || requestPath.startsWith("/api/vouchers")
                || requestPath.startsWith("/api/categories")
                || requestPath.startsWith("/api/images")
                || requestPath.startsWith("/api/review")) {

            filterChain.doFilter(request, response);
            return;
        }

        // ✅ 3. Lấy token từ cookie
        String accessToken = extractTokenFromCookies(request, "accessToken");
        String refreshToken = extractTokenFromCookies(request, "refreshToken");

        // ❗ Không block ở đây → cho Spring Security xử lý
        if (accessToken == null || accessToken.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String username = jwtService.extractUsername(accessToken);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                // ✅ Token hợp lệ
                if (jwtService.isTokenValid(accessToken, userDetails, user.getTokenVersion())) {
                    setAuthentication(request, userDetails);
                }
                // ✅ Refresh token
                else if (refreshToken != null &&
                        jwtService.isRefreshTokenValid(refreshToken, userDetails, user.getTokenVersion())) {

                    String newVersion = jwtService.generateTokenVersion();
                    String newAccessToken = jwtService.generateToken(userDetails, newVersion);
                    String newRefreshToken = jwtService.generateRefreshToken(userDetails, newVersion);

                    user.setTokenVersion(newVersion);
                    userRepository.save(user);

                    response.addHeader("Set-Cookie", createAccessTokenCookie(newAccessToken).toString());
                    response.addHeader("Set-Cookie", createRefreshTokenCookie(newRefreshToken).toString());

                    setAuthentication(request, userDetails);
                }
            }

        } catch (Exception e) {
            // ❗ Không trả 401 ở đây → tránh phá CORS
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(HttpServletRequest request, UserDetails userDetails) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    private String extractTokenFromCookies(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;

        return Arrays.stream(cookies)
                .filter(c -> name.equals(c.getName()))
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