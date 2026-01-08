package org.example.backend.admin.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.ProductDetailDTO;
import org.example.backend.user.entity.*;
import org.example.backend.user.repository.*;
import org.example.backend.user.service.CloudinaryService;
import org.example.backend.user.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ProductAdminController {
    private final ProductService productService;
    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ImageRepository imageRepository;
    private final ProductImageRepository productImageRepository;
    private final CloudinaryService cloudinaryService;
    private static final Logger logger = LoggerFactory.getLogger(ProductAdminController.class);

    @GetMapping("/brands")
    public ResponseEntity<List<Brand>> getAllBrands() {
        try {
            logger.info("Fetching all brands");
            List<Brand> brands = brandRepository.findAll();
            return ResponseEntity.ok(brands);
        } catch (Exception e) {
            logger.error("Error fetching brands: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        try {
            logger.info("Fetching all categories");
            List<Category> categories = categoryRepository.findAll();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            logger.error("Error fetching categories: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProductsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        try {
            logger.info("Fetching products for admin, page: {}, size: {}", page, size);
            if (page < 0 || size <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid page or size parameters"));
            }
            Page<Product> productPage = productService.getAllProductsForGrid(page, size);
            List<ProductDetailDTO> products = productPage.stream()
                    .map(productService::mapToDetailDTO)
                    .collect(Collectors.toList());
            Map<String, Object> response = new HashMap<>();
            response.put("products", products);
            response.put("totalPages", productPage.getTotalPages());
            response.put("currentPage", productPage.getNumber());
            response.put("totalItems", productPage.getTotalElements());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching products: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/products", consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, Object>> addProduct(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("brand") String brandName,
            @RequestParam("category") String categoryName,
            @RequestParam Map<String, String> allParams,
            @RequestParam(value = "variants[0].images", required = false) List<MultipartFile> images) {
        try {
            logger.info("Adding new product: {}", name);
            logger.info("All params: {}", allParams);

            // Tìm hoặc tạo brand
            Brand brand = brandRepository.findByName(brandName)
                    .orElseGet(() -> {
                        Brand newBrand = new Brand();
                        newBrand.setName(brandName);
                        return brandRepository.save(newBrand);
                    });

            // Tìm hoặc tạo category
            Category category = categoryRepository.findByName(categoryName)
                    .orElseGet(() -> {
                        Category newCategory = new Category();
                        newCategory.setName(categoryName);
                        return categoryRepository.save(newCategory);
                    });

            // Tạo sản phẩm mới
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setBrand(brand);
            product.setCategory(category);
            product.setProductVariantList(new ArrayList<>());

            // Xử lý các biến thể
            Map<Integer, ProductVariant> variants = new HashMap<>();
            allParams.forEach((key, value) -> {
                if (key.startsWith("variants[")) {
                    String[] parts = key.split("\\[|\\]|\\.");
                    if (parts.length == 4) {
                        int index = Integer.parseInt(parts[1]);
                        String field = parts[3];

                        variants.computeIfAbsent(index, k -> new ProductVariant());
                        ProductVariant variant = variants.get(index);

                        switch (field) {
                            case "attribute":
                                variant.setProductAttribute(value);
                                break;
                            case "variant":
                                variant.setVariant(value);
                                break;
                            case "price":
                                try {
                                    variant.setPrice(new BigDecimal(value));
                                } catch (NumberFormatException e) {
                                    logger.warn("Invalid price format for variant[{}]: {}", index, value);
                                }
                                break;
                            case "quantity":
                                try {
                                    variant.setQuantity(Integer.parseInt(value));
                                } catch (NumberFormatException e) {
                                    logger.warn("Invalid quantity format for variant[{}]: {}", index, value);
                                }
                                break;
                        }
                        // Thiết lập quan hệ với product
                        variant.setProduct(product);
                    } else {
                        logger.warn("Invalid key format: {}", key);
                    }
                }
            });

            logger.info("Variants created: {}", variants);

            // Thêm các biến thể vào product
            if (variants.isEmpty()) {
                logger.warn("No variants provided for product: {}", name);
            } else {
                for (ProductVariant variant : variants.values()) {
                    product.getProductVariantList().add(variant);
                    variant.setProductImageList(new ArrayList<>());
                }
            }

            // Lưu sản phẩm và biến thể trước
            Product savedProduct = productRepository.save(product);
            logger.info("Saved product and variants: {}", savedProduct);

            // Xử lý hình ảnh sau khi biến thể đã được lưu
            if (images != null && !images.isEmpty() && !variants.isEmpty()) {
                ProductVariant firstVariant = savedProduct.getProductVariantList().get(0); // Lấy biến thể đã lưu
                List<ProductImage> productImages = new ArrayList<>();
                for (int i = 0; i < images.size(); i++) {
                    MultipartFile file = images.get(i);
                    // Upload ảnh lên Cloudinary
                    String imageUrl = cloudinaryService.upLoadImage(file);
                    // Trích xuất public_id từ URL
                    String publicId = extractPublicIdFromUrl(imageUrl);
                    logger.info("Uploaded image to Cloudinary, public_id: {}", publicId);

                    // Lưu vào bảng images
                    Image image = new Image();
                    image.setPublicId(publicId);
                    Image savedImage = imageRepository.save(image);

                    // Tạo ProductImage
                    ProductImage productImage = new ProductImage();
                    productImage.setProductVariant(firstVariant);
                    productImage.setImage(savedImage);
                    productImage.setMainImage(i == 0);
                    productImages.add(productImage);
                }
                // Lưu danh sách ProductImage
                productImageRepository.saveAll(productImages);
                firstVariant.getProductImageList().addAll(productImages);
                // Cập nhật ProductVariant
                productRepository.save(savedProduct); // Lưu lại để cập nhật productImageList
            }

            return ResponseEntity.ok(Map.of("message", "Product added successfully"));
        } catch (Exception e) {
            logger.error("Error adding product: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    // Hàm trích xuất public_id từ URL của Cloudinary
    private String extractPublicIdFromUrl(String imageUrl) {
        // URL mẫu: https://res.cloudinary.com/<cloud_name>/image/upload/v<timestamp>/<public_id>.<extension>
        String[] parts = imageUrl.split("/");
        String lastPart = parts[parts.length - 1];
        // Loại bỏ extension (ví dụ: .jpg, .png)
        return lastPart.substring(0, lastPart.lastIndexOf("."));
    }
}
