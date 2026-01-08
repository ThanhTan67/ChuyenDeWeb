package org.example.backend.user.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.ResponseDTO;
import org.example.backend.user.dto.VoucherDTO;
import org.example.backend.user.repository.CategoryRepository;
import org.example.backend.user.repository.ProductVariantRepository;
import org.example.backend.user.service.VoucherService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {
    private final VoucherService voucherService;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository productVariantRepository;

     @GetMapping("/user")
    public ResponseEntity<ResponseDTO<List<VoucherDTO>>> getActiveVouchersForUser() {
        try {
            List<VoucherDTO> vouchers = voucherService.getActiveVouchersForUser();
            return ResponseEntity.ok(new ResponseDTO<>("success", "Lấy danh sách voucher đang hoạt động thành công", vouchers));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>("error", "Lỗi hệ thống khi lấy danh sách voucher", null));
        }
    }

}