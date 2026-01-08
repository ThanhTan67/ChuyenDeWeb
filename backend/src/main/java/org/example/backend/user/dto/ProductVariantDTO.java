package org.example.backend.user.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantDTO {
    private Long id;
    private String attribute;
    private String variant;
    private BigDecimal price;
    private Integer quantity;
    private List<ImageDTO> images;}
