package org.example.backend.user.controller;

import org.example.backend.user.dto.ResponseDTO;
import org.example.backend.user.dto.VoucherDTO;
import org.example.backend.user.repository.CategoryRepository;
import org.example.backend.user.repository.ProductVariantRepository;
import org.example.backend.user.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/e-vouchers")
public class EVoucherController {
    @Autowired
    private VoucherService voucherService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;
    // Lấy danh sách voucher đã lưu của user
    @GetMapping("/user")
    public ResponseEntity<ResponseDTO<List<VoucherDTO>>> getUserSavedVouchers(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseDTO<>("error", "Chưa đăng nhập", null));
            }
            String username = authentication.getName();
            List<VoucherDTO> vouchers = voucherService.getUserSavedVouchers(username);
            return ResponseEntity.ok(new ResponseDTO<>("success", "Lấy danh sách voucher đã lưu thành công", vouchers));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>("error", "Lỗi hệ thống khi lấy danh sách voucher đã lưu", null));
        }
    }

    // Lưu voucher cho user
    @PostMapping
    public ResponseEntity<ResponseDTO<String>> saveVoucherForUser(
            @RequestBody Map<String, Long> request, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseDTO<>("error", "Chưa đăng nhập", null));
            }
            String username = authentication.getName();
            Long voucherId = request.get("voucherId");
            voucherService.saveVoucherForUser(username, voucherId);
            return ResponseEntity.ok(new ResponseDTO<>("success", "Lưu voucher thành công", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ResponseDTO<>("error", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>("error", "Lỗi hệ thống khi lưu voucher", null));
        }
    }

    // Kiểm tra user đã lưu voucher chưa
    @GetMapping("/check")
    public ResponseEntity<ResponseDTO<Boolean>> checkUserSavedVoucher(
            @RequestParam Long voucherId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseDTO<>("error", "Chưa đăng nhập", null));
            }
            String username = authentication.getName();
            boolean isSaved = voucherService.checkUserSavedVoucher(username, voucherId);
            return ResponseEntity.ok(new ResponseDTO<>("success", "Kiểm tra thành công", isSaved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>("error", "Lỗi hệ thống khi kiểm tra voucher", null));
        }
    }
}
