package org.example.backend.user.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.backend.user.service.SocialAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class SocialAuthController {

    private final SocialAuthService socialAuthService;
    private static final Logger logger = LoggerFactory.getLogger(SocialAuthController.class);

    @PostMapping("/social")
    public ResponseEntity<?> socialLogin(@RequestBody SocialLoginRequest request) {
        logger.info("Processing social login for provider: {}", request.getProvider());

        Map<String, Object> response;
        if ("google".equalsIgnoreCase(request.getProvider())) {
            response = socialAuthService.googleLogin(request.getToken());
        } else if ("facebook".equalsIgnoreCase(request.getProvider())) {
            response = socialAuthService.facebookLogin(request.getToken());
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid provider", "success", false));
        }

        if (!(Boolean) response.get("success")) {
            return ResponseEntity.badRequest().body(response);
        }

        return ResponseEntity.ok()
                .headers(createAuthCookies((String) response.get("accessToken"), (String) response.get("refreshToken")))
                .body(response);
    }

    private HttpHeaders createAuthCookies(String accessToken, String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(15 * 60)
                .build().toString());
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .build().toString());
        return headers;
    }

    @Data
    public static class SocialLoginRequest {
        private String provider;
        private String token;
    }
}