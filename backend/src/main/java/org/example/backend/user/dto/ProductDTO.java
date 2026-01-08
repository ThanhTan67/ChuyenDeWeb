package org.example.backend.user.dto;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private Double price;
    private String description;
    private String brandName;
    private String categoryName;
    private String mainImage;
    private List<ProductVariantDTO> variants;
}