package org.example.backend.dto;

import lombok.*;

@Data
public class OrderDetailDTO {
    private Long productVariantId;
    private Integer quantity;
}