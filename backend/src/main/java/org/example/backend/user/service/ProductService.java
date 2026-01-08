package org.example.backend.user.service;

import org.example.backend.user.dto.ImageDTO;
import org.example.backend.user.dto.ProductDetailDTO;
import org.example.backend.user.dto.ProductGridDTO;
import org.example.backend.user.dto.ProductVariantDTO;
import org.example.backend.user.entity.Product;
import org.example.backend.user.entity.ProductImage;
import org.example.backend.user.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepository;

    public Page<Product> getAllProductsForGrid(int page, int size) {
        logger.info("Lấy sản phẩm cho trang: {}, kích thước: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findAll(pageable);
    }

    public Page<Product> searchProducts(String keyword, int page, int size) {
        logger.info("Tìm kiếm sản phẩm với từ khóa: {}, trang: {}, kích thước: {}", keyword, page, size);
        Pageable pageable = PageRequest.of(page, size);
        if (keyword == null || keyword.trim().isEmpty()) {
            return productRepository.findAll(pageable);
        }
        return productRepository.findByNameContainingIgnoreCaseOrBrandNameContainingIgnoreCase(keyword, pageable);
    }

    public Page<Product> getSortedProducts(String keyword, int page, int size, String sortBy, String sortOrder) {
        logger.info("Lấy sản phẩm sắp xếp với từ khóa: {}, trang: {}, kích thước: {}, sắp xếp theo: {}, thứ tự: {}", keyword, page, size, sortBy, sortOrder);
        Pageable pageable = PageRequest.of(page, size);

        if (sortBy.equals("price")) {
            if (keyword == null || keyword.trim().isEmpty()) {
                return sortOrder.equalsIgnoreCase("asc")
                        ? productRepository.findAllByPriceAsc(pageable)
                        : productRepository.findAllByPriceDesc(pageable);
            } else {
                return sortOrder.equalsIgnoreCase("asc")
                        ? productRepository.findByNameOrBrandByPriceAsc(keyword, pageable)
                        : productRepository.findByNameOrBrandByPriceDesc(keyword, pageable);
            }
        } else {
            Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
            pageable = PageRequest.of(page, size, sort);
            if (keyword == null || keyword.trim().isEmpty()) {
                return productRepository.findAll(pageable);
            }
            return productRepository.findByNameContainingIgnoreCaseOrBrandNameContainingIgnoreCase(keyword, pageable);
        }
    }

    public Page<Product> getFilteredProducts(String keyword, String category, String brand, int page, int size, String sortBy, String sortOrder) {
        logger.info("Lọc sản phẩm với từ khóa: {}, danh mục: {}, thương hiệu: {}, trang: {}, kích thước: {}, sắp xếp theo: {}, thứ tự: {}",
                keyword, category, brand, page, size, sortBy, sortOrder);
        Pageable pageable;

        if (sortBy.equals("price")) {
            pageable = PageRequest.of(page, size);
            return sortOrder.equalsIgnoreCase("asc")
                    ? productRepository.findByFiltersPriceAsc(keyword, category, brand, pageable)
                    : productRepository.findByFiltersPriceDesc(keyword, category, brand, pageable);
        } else {
            Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
            pageable = PageRequest.of(page, size, sort);
            return productRepository.findByFilters(keyword, category, brand, pageable);
        }
    }

    public List<Product> getBestSellers(int size) {
        logger.info("Lấy sản phẩm bán chạy, kích thước: {}", size);
        Pageable pageable = PageRequest.of(0, size);
        return productRepository.findBestSellers(pageable);
    }

    public ProductDetailDTO getProductDetails(Long id) {
        logger.info("Lấy chi tiết sản phẩm với ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        return mapToDetailDTO(product);
    }

    public ProductDetailDTO mapToDetailDTO(Product product) {
        ProductDetailDTO dto = new ProductDetailDTO();
        dto.setId(product.getId());
        dto.setName(product.getName() != null ? product.getName() : "Không xác định");
        dto.setDescription(product.getDescription() != null ? product.getDescription() : "");
        dto.setBrand(product.getBrand() != null ? product.getBrand().getName() : "Không xác định");
        dto.setCategory(product.getCategory() != null ? product.getCategory().getName() : "Không xác định");

        List<ProductVariantDTO> variants = product.getProductVariantList() != null
                ? product.getProductVariantList().stream().map(variant -> {
            ProductVariantDTO variantDTO = new ProductVariantDTO();
            variantDTO.setId(variant.getId());
            variantDTO.setAttribute(variant.getProductAttribute() != null ? variant.getProductAttribute() : "N/A");
            variantDTO.setVariant(variant.getVariant() != null ? variant.getVariant() : "N/A");
            variantDTO.setPrice(variant.getPrice() != null ? variant.getPrice() : new BigDecimal(0));
            variantDTO.setQuantity(variant.getQuantity() != 0 ? variant.getQuantity() : 0);

            List<ImageDTO> images = variant.getProductImageList() != null
                    ? variant.getProductImageList().stream().map(img -> {
                ImageDTO imageDTO = new ImageDTO();
                imageDTO.setPublicId(img.getImage() != null && img.getImage().getPublicId() != null
                        ? img.getImage().getPublicId() : "default_image");
                imageDTO.setMain(img.isMainImage());
                return imageDTO;
            }).collect(Collectors.toList())
                    : Collections.singletonList(new ImageDTO("default_image", true));

            variantDTO.setImages(images);
            return variantDTO;
        }).collect(Collectors.toList())
                : Collections.singletonList(new ProductVariantDTO(null, "N/A", "N/A", new BigDecimal(0), 0, Collections.singletonList(new ImageDTO("default_image", true))));

        dto.setVariants(variants);
        return dto;
    }

    public List<ProductGridDTO> mapToDTO(Page<Product> productPage) {
        return productPage.stream().map(this::mapProductToDTO).collect(Collectors.toList());
    }

    public List<ProductGridDTO> mapToDTO(List<Product> products) {
        return products.stream().map(this::mapProductToDTO).collect(Collectors.toList());
    }

    private ProductGridDTO mapProductToDTO(Product product) {
        ProductGridDTO dto = new ProductGridDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setBrand(product.getBrand() != null ? product.getBrand().getName() : "Không xác định");
        dto.setCategory(product.getCategory() != null ? product.getCategory().getName() : "Không xác định");

        if (!product.getProductVariantList().isEmpty()) {
            var variants = product.getProductVariantList();
            var mainVariant = variants.stream()
                    .filter(v -> v.getProductImageList().stream().anyMatch(ProductImage::isMainImage))
                    .findFirst()
                    .orElseGet(() -> {
                        logger.warn("Không tìm thấy ảnh chính cho sản phẩm ID: {}. Sử dụng biến thể đầu tiên.", product.getId());
                        return variants.get(0);
                    });

            dto.setPrice(mainVariant.getPrice());
            dto.setStock(mainVariant.getQuantity());
            dto.setAttributes(mainVariant.getProductAttribute() != null ? mainVariant.getProductAttribute() + " - " + mainVariant.getVariant() : "N/A");

            mainVariant.getProductImageList().stream()
                    .filter(ProductImage::isMainImage)
                    .findFirst()
                    .ifPresent(img -> dto.setMainImageUrl(img.getImage().getPublicId()));
        } else {
            logger.warn("Không tìm thấy biến thể cho sản phẩm ID: {}", product.getId());
            dto.setStock(0);
            dto.setAttributes("N/A");
        }
        return dto;
    }
}