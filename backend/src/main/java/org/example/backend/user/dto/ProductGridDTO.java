package org.example.backend.user.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductGridDTO {
    private Long id;
    private String name;
    private BigDecimal price;
    private String attributes;
    private String description;
    private String mainImageUrl;
    private String brand;
    private String category;
    private Integer stock; // Tổng số lượng tồn kho từ các variant
}