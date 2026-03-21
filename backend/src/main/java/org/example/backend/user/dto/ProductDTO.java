<<<<<<< HEAD
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
=======
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
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}