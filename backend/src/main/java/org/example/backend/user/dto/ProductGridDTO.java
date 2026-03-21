<<<<<<< HEAD
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
=======
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
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}