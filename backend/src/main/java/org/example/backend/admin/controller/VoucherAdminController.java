package org.example.backend.admin.controller;

import jakarta.validation.Valid;
import org.example.backend.user.dto.CategoryDTO;
import org.example.backend.user.dto.ResponseDTO;
import org.example.backend.user.dto.VoucherDTO;
import org.example.backend.user.repository.CategoryRepository;
import org.example.backend.user.repository.ProductVariantRepository;
import org.example.backend.user.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class VoucherAdminController {
    @Autowired
    private VoucherService voucherService;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;

    @PostMapping("/vouchers/create")
    public ResponseEntity<ResponseDTO<VoucherDTO>> createVoucher(@Valid @RequestBody VoucherDTO voucherDTO) {
        try {
            VoucherDTO createdVoucher = voucherService.createVoucher(voucherDTO);
            return ResponseEntity.ok(new ResponseDTO<>("success", "Tạo voucher thành công", createdVoucher));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ResponseDTO<>("error", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>("error", "Lỗi hệ thống khi tạo voucher", null));
        }
    }

    @GetMapping("/vouchers")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllVouchersForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<VoucherDTO> voucherPage = voucherService.getAllVouchersForAdmin(pageable);
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("vouchers", voucherPage.getContent());
            responseData.put("currentPage", voucherPage.getNumber());
            responseData.put("totalItems", voucherPage.getTotalElements());
            responseData.put("totalPages", voucherPage.getTotalPages());
            return ResponseEntity.ok(new ResponseDTO<>("success", "Lấy danh sách voucher thành công", responseData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>("error", "Lỗi hệ thống khi lấy danh sách voucher", null));
        }
    }

    @GetMapping("/category")
    public ResponseEntity<ResponseDTO<List<CategoryDTO>>> getAllCategories() {
        try {
            List<CategoryDTO> categories = categoryRepository.findAll().stream()
                    .map(category -> new CategoryDTO(category.getId(), category.getName()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new ResponseDTO<>("success", "Lấy danh sách danh mục thành công", categories));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>("error", "Lỗi hệ thống khi lấy danh sách danh mục", null));
        }
    }

    @GetMapping("/product-variants")
    public ResponseEntity<ResponseDTO<List<Map<String, Object>>>> getAllProductVariants() {
        try {
            List<Map<String, Object>> productVariants = productVariantRepository.findAll().stream()
                    .map(productVariant -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", productVariant.getId());
                        map.put("productName", productVariant.getProduct().getName());
                        map.put("attribute", productVariant.getProductAttribute());
                        map.put("variant", productVariant.getVariant());
                        map.put("price", productVariant.getPrice());
                        map.put("quantity", productVariant.getQuantity());
                        return map;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new ResponseDTO<>("success", "Lấy danh sách biến thể sản phẩm thành công", productVariants));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>("error", "Lỗi hệ thống khi lấy danh sách biến thể sản phẩm", null));
        }
    }
}