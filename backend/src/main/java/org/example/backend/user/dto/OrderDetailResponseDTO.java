<<<<<<< HEAD
package org.example.backend.user.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderDetailResponseDTO {
    private Long id;
    private Long variantId;
    private String productName;
    private String variantAttribute;
    private String variantName;
    private Integer quantity;
    private BigDecimal productPrice;
    private BigDecimal priceWithQuantity;
    private String mainImage;
=======
package org.example.backend.user.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderDetailResponseDTO {
    private Long id;
    private Long variantId;
    private String productName;
    private String variantAttribute;
    private String variantName;
    private Integer quantity;
    private BigDecimal productPrice;
    private BigDecimal priceWithQuantity;
    private String mainImage;
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}