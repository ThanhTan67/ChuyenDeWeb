package org.example.backend.user.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CartItemDTO {
    private Long productVariantId;
    private String productName;
    private String attribute;    // Product variant attribute
    private String variant;      // Product variant type
    private BigDecimal price;
    private int quantity;
    private String mainImageUrl;
    private List<String> additionalImageUrls;
    private Long productId;
    private String brandName;
    private String categoryName;
}