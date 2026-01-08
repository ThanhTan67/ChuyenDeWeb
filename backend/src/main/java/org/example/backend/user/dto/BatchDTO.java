package org.example.backend.user.dto;

import lombok.*;
import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BatchDTO implements Serializable {
    Long id;
    String name;
    Date manufacturingDate;
    Date expiryDate;
    Date dateOfImporting;
    int quantity;
    int currentQuantity;
    double priceImport;
    BrandDTO provider;
    ProductDTO product;
}