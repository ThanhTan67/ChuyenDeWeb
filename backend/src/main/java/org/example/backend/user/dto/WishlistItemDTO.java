package org.example.backend.user.dto;

import lombok.Data;

@Data
public class WishlistItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String brandName;
    private String categoryName;
    private String mainImageUrl;
    private Double price;
    private Integer stock;
}