package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.backend.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class OrderResponseDTO {
    private Long id;
    private UserDTO user;
    private Instant bookingDate;
    private Instant deliveryDate;
    private String consigneeName;
    private String consigneePhone;
    private String address;
    private String orderNotes;
    private BigDecimal ship;
    private BigDecimal discountValue;
    private BigDecimal totalMoney;
    private OrderStatus orderStatus;
    private String paymentMethod;
}