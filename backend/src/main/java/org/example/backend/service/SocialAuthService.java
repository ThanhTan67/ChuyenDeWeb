package org.example.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.AuthResponseDTO;
import org.example.backend.entity.Role;
import org.example.backend.entity.User;
import org.example.backend.repository.RoleRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SocialAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final RestTemplate restTemplate;

    private static final Logger logger = LoggerFactory.getLogger(SocialAuthService.class);

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.facebook.client-id}")
    private String facebookClientId;

    @Value("${spring.security.oauth2.client.registration.facebook.client-secret}")
    private String facebookClientSecret;

    public Map<String, Object> googleLogin(String token) {
        logger.info("⚡ [Google Login] Processing Google ID token");

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), JacksonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(token);
            if (idToken == null) {
                logger.warn("❌ [Google Login] Invalid or expired token");
                return Map.of("error", "Invalid Google token", "success", false);
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            logger.info("✅ [Google Login] Valid token - Email: {}, Name: {}", email, name);

            User user = findOrCreateUser(email, name);
            logger.info("👤 [Google Login] Processed user: {} (username: {})", user.getEmail(), user.getUsername());

            Map<String, Object> response = createAuthResponse(user);
            logger.info("🎉 [Google Login] Successful login for user: {}", user.getUsername());

            return response;

        } catch (Exception e) {
            logger.error("🔥 [Google Login] Error during Google login: {}", e.getMessage(), e);
            return Map.of("error", "Google login failed: " + e.getMessage(), "success", false);
        }
    }

    public Map<String, Object> facebookLogin(String token) {
        logger.info("⚡ [Facebook Login] Processing Facebook access token");

        try {
            String verifyUrl = String.format(
                    "https://graph.facebook.com/v18.0/me?access_token=%s&fields=id,name,email", token);

            Map<String, Object> fbResponse = restTemplate.getForObject(verifyUrl, Map.class);

            if (fbResponse == null || fbResponse.containsKey("error")) {
                logger.warn("❌ [Facebook Login] Invalid token: {}", fbResponse != null ? fbResponse.get("error") : "null");
                return Map.of("error", "Invalid Facebook token", "success", false);
            }

            String email = (String) fbResponse.get("email");
            String name = (String) fbResponse.get("name");

            if (email == null) {
                logger.warn("❌ [Facebook Login] Email not provided by Facebook");
                return Map.of("error", "Email is required for Facebook login", "success", false);
            }

            logger.info("✅ [Facebook Login] Valid token - Email: {}, Name: {}", email, name);

            User user = findOrCreateUser(email, name);
            logger.info("👤 [Facebook Login] Processed user: {} (username: {})", user.getEmail(), user.getUsername());

            Map<String, Object> response = createAuthResponse(user);
            logger.info("🎉 [Facebook Login] Successful login for user: {}", user.getUsername());

            return response;

        } catch (Exception e) {
            logger.error("🔥 [Facebook Login] Error during Facebook login: {}", e.getMessage(), e);
            return Map.of("error", "Facebook login failed: " + e.getMessage(), "success", false);
        }
    }

    private User findOrCreateUser(String email, String name) {
        return userRepository.findByEmailWithRole(email)
                .orElseGet(() -> {
                    logger.info("🆕 [User] Creating new user with email: {}", email);
                    Role role = roleRepository.findByRoleName("ROLE_CLIENT")
                            .orElseThrow(() -> new RuntimeException("Default role not found"));

                    User user = new User();
                    user.setEmail(email);
                    user.setUsername(name);
                    user.setPhone("");
                    user.setPassword("");
                    user.setRole(role);
                    user.setTokenVersion(jwtService.generateTokenVersion());
                    user.setFailed(0);
                    user.setLocked(false);

                    logger.info("💾 [User] Saving new user: {}", user.getUsername());
                    return userRepository.save(user);
                });
    }

    private Map<String, Object> createAuthResponse(User user) {
        UserDetails userDetails = createUserDetails(user);
        String tokenVersion = user.getTokenVersion() != null ? user.getTokenVersion() : jwtService.generateTokenVersion();

        user.setTokenVersion(tokenVersion);
        user.setFailed(0);
        user.setLocked(false);
        userRepository.save(user);

        AuthResponseDTO authResponse = new AuthResponseDTO(
                jwtService.generateToken(userDetails, tokenVersion),
                jwtService.generateRefreshToken(userDetails, tokenVersion)
        );

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_CLIENT";

        return Map.of(
                "message", "Login successful",
                "success", true,
                "user", Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "failedAttempts", 0,
                        "locked", false,
                        "roleName", roleName
                ),
                "accessToken", authResponse.getAccessToken(),
                "refreshToken", authResponse.getRefreshToken()
        );
    }

    private UserDetails createUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword() != null ? user.getPassword() : "")
                .authorities(new SimpleGrantedAuthority(user.getRole().getRoleName()))
                .build();
    }
}