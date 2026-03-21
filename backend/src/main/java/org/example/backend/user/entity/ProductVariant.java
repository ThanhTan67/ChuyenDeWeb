<<<<<<< HEAD
package org.example.backend.user.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Entity
@Table(name = "productvariant")
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_attribute")
    private String productAttribute;

    @Column(name = "variant", length = 100)
    private String variant;

    private BigDecimal price;
    private int quantity;

    @OneToMany(mappedBy = "productVariant")
    private List<ProductImage> productImageList;
}
=======
package org.example.backend.user.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Entity
@Table(name = "productvariant")
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_attribute")
    private String productAttribute;

    @Column(name = "variant", length = 100)
    private String variant;

    private BigDecimal price;
    private int quantity;

    @OneToMany(mappedBy = "productVariant")
    private List<ProductImage> productImageList;
}
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
