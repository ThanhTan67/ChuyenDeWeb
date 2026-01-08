package org.example.backend.user.controller;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.UpdateUserDTO;
import org.example.backend.user.dto.UserDTO;
import org.example.backend.user.service.AuthService;
import org.example.backend.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;
    private final AuthService authService;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateUser(@Valid @RequestBody UpdateUserDTO updateUserDTO, Principal principal) {
        try {
            if (principal == null || principal.getName() == null) {
                logger.warn("Không tìm thấy người dùng đã xác thực trong Principal");
                return ResponseEntity.status(401).body(Map.of("message", "Không được phép: Không tìm thấy người dùng đã xác thực"));
            }

            String username = principal.getName();
            logger.info("Đang cố gắng cập nhật người dùng với username: {}", username);

            Long userId = authService.getCurrentUserId();
            UserDTO updatedUserDTO = userService.updateUser(userId, updateUserDTO, username);
            logger.info("Đã cập nhật thành công người dùng với ID: {}", userId);

            return ResponseEntity.ok(updatedUserDTO);
        } catch (ConstraintViolationException e) {
            logger.error("Lỗi xác thực khi cập nhật người dùng: {}", e.getMessage());
            Map<String, String> errors = new HashMap<>();
            e.getConstraintViolations().forEach(violation ->
                    errors.put(violation.getPropertyPath().toString(), violation.getMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        } catch (IllegalArgumentException e) {
            logger.error("Xung đột khi cập nhật người dùng: {}", e.getMessage());
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        } catch (IllegalAccessException e) {
            logger.error("Cố gắng cập nhật không được phép: {}", e.getMessage());
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Không tìm thấy người dùng: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi hệ thống khi cập nhật người dùng: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi hệ thống, vui lòng thử lại sau"));
        }
    }

}