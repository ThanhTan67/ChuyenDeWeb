package org.example.backend.admin.controller;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.CreateUserDTO;
import org.example.backend.user.dto.UserDTO;
import org.example.backend.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(UserAdminController.class);

    @GetMapping("/list")
    // TODO: Reinstating @PreAuthorize("hasRole('ADMIN')") for production to secure this endpoint
    public ResponseEntity<?> getAllUsers() {
        try {
            logger.info("Đang lấy danh sách người dùng");
            List<UserDTO> users = userService.getAllUsers();
            logger.info("Đã lấy thành công {} người dùng", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách người dùng: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi hệ thống, vui lòng thử lại sau"));
        }
    }
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserDTO createUserDTO) {
        try {
            logger.info("Đang tạo người dùng mới: {}", createUserDTO.getUsername());
            UserDTO userDTO = userService.createUser(createUserDTO);
            logger.info("Đã tạo người dùng thành công: {}", userDTO.getUsername());
            return ResponseEntity.ok(userDTO);
        } catch (ConstraintViolationException e) {
            logger.error("Lỗi xác thực: {}", e.getMessage());
            Map<String, String> errors = new HashMap<>();
            e.getConstraintViolations().forEach(violation ->
                    errors.put(violation.getPropertyPath().toString(), violation.getMessage()));
            return ResponseEntity.badRequest().body(errors);
        } catch (IllegalArgumentException e) {
            logger.error("Lỗi: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi hệ thống: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi hệ thống, vui lòng thử lại sau"));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            logger.info("Đang xóa người dùng với ID: {}", userId);
            userService.deleteUser(userId);
            logger.info("Đã xóa thành công người dùng với ID: {}", userId);
            return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công"));
        } catch (IllegalArgumentException e) {
            logger.error("Lỗi khi xóa người dùng: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi hệ thống khi xóa người dùng: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi hệ thống, vui lòng thử lại sau"));
        }
    }
}