package org.example.backend.user.dto;

import lombok.*;

@Data
public class OrderDetailDTO {
    private Long productVariantId;
    private Integer quantity;
}