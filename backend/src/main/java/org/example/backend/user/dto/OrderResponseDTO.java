<<<<<<< HEAD
package org.example.backend.user.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.backend.user.enums.OrderStatus;

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
=======
package org.example.backend.user.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.backend.user.enums.OrderStatus;

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
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}