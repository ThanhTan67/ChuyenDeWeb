package org.example.backend.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "discounttype")
public class DiscountType {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "type", length = 15)
    private String type;

}