<<<<<<< HEAD
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
=======
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
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
