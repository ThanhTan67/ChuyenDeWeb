<<<<<<< HEAD
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
=======
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
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}