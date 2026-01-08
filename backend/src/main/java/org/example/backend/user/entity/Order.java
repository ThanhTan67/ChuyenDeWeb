package org.example.backend.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.backend.user.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_date")
    private Instant bookingDate;

    @Column(name = "delivery_date")
    private Instant deliveryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "consignee_name", length = 30)
    private String consigneeName;

    @Column(name = "consignee_phone", length = 15)
    private String consigneePhone;

    @Column(name = "ship", precision = 15, scale = 3)
    private BigDecimal ship;

    @Column(name = "discount_value", precision = 15, scale = 3)
    private BigDecimal discountValue;

    @Column(name = "total_money", precision = 15, scale = 3)
    private BigDecimal totalMoney;

    @Column(name = "address")
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Column(name = "order_notes")
    private String orderNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    private OrderStatus orderStatus;

    @Column(name = "vnp_txn_ref")
    private Long vnpTxnRef;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderDetail> orderDetails = new ArrayList<>();
}