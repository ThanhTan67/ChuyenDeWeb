package org.example.backend.user.dto;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageDTO implements Serializable {
    private Long id;
    private ProductVariantDTO product;
    private boolean isMainImage;
    private ImageDTO image;
}