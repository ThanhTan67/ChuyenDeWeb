package org.example.backend.user.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.ProductDetailDTO;
import org.example.backend.user.dto.ProductGridDTO;
import org.example.backend.user.entity.Product;
import org.example.backend.user.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    @GetMapping("/grid")
    public ResponseEntity<Map<String, Object>> getProductsForGrid(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        if (page < 0 || size <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tham số trang hoặc kích thước không hợp lệ"));
        }
        Page<Product> productPage = productService.getAllProductsForGrid(page, size);
        List<ProductGridDTO> products = productService.mapToDTO(productPage);
        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("totalPages", productPage.getTotalPages());
        response.put("currentPage", productPage.getNumber());
        response.put("totalItems", productPage.getTotalElements());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchProducts(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        if (page < 0 || size <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tham số trang hoặc kích thước không hợp lệ"));
        }
        Page<Product> productPage = productService.searchProducts(keyword, page, size);
        List<ProductGridDTO> products = productService.mapToDTO(productPage);
        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("totalPages", productPage.getTotalPages());
        response.put("currentPage", productPage.getNumber());
        response.put("totalItems", productPage.getTotalElements());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sorted")
    public ResponseEntity<Map<String, Object>> getSortedProducts(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        if (page < 0 || size <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tham số trang hoặc kích thước không hợp lệ"));
        }
        if (!sortBy.equals("name") && !sortBy.equals("price")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tham số sắp xếp không hợp lệ. Phải là 'name' hoặc 'price'"));
        }
        if (!sortOrder.equalsIgnoreCase("asc") && !sortOrder.equalsIgnoreCase("desc")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tham số thứ tự không hợp lệ. Phải là 'asc' hoặc 'desc'"));
        }
        Page<Product> productPage = productService.getSortedProducts(keyword, page, size, sortBy, sortOrder);
        List<ProductGridDTO> products = productService.mapToDTO(productPage);
        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("totalPages", productPage.getTotalPages());
        response.put("currentPage", productPage.getNumber());
        response.put("totalItems", productPage.getTotalElements());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filter")
    public ResponseEntity<Map<String, Object>> getFilteredProducts(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String category,
            @RequestParam(defaultValue = "") String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        if (page < 0 || size <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tham số trang hoặc kích thước không hợp lệ"));
        }
        if (!sortBy.equals("name") && !sortBy.equals("price")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tham số sắp xếp không hợp lệ. Phải là 'name' hoặc 'price'"));
        }
        if (!sortOrder.equalsIgnoreCase("asc") && !sortOrder.equalsIgnoreCase("desc")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tham số thứ tự không hợp lệ. Phải là 'asc' hoặc 'desc'"));
        }
        String categoryParam = category.isBlank() ? null : category;
        String brandParam = brand.isBlank() ? null : brand;
        Page<Product> productPage = productService.getFilteredProducts(keyword, categoryParam, brandParam, page, size, sortBy, sortOrder);
        List<ProductGridDTO> products = productService.mapToDTO(productPage);
        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("totalPages", productPage.getTotalPages());
        response.put("currentPage", productPage.getNumber());
        response.put("totalItems", productPage.getTotalElements());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bestsellers")
    public ResponseEntity<Map<String, Object>> getBestSellers(
            @RequestParam(defaultValue = "6") int size) {
        if (size <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tham số kích thước không hợp lệ"));
        }
        List<Product> bestSellers = productService.getBestSellers(size);
        List<ProductGridDTO> products = productService.mapToDTO(bestSellers);
        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getProductDetails(@PathVariable Long id) {
        try {
            ProductDetailDTO product = productService.getProductDetails(id);
            if (product == null) {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "Không tìm thấy sản phẩm với ID: " + id));
            }
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Lỗi server nội bộ: " + e.getMessage()));
        }
    }
}