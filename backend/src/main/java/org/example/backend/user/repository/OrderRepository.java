package org.example.backend.user.repository;

import org.example.backend.user.entity.Order;
import org.example.backend.user.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o ORDER BY o.bookingDate DESC")
    List<Order> findAll();

    Optional<Order> findByVnpTxnRef(Long vnpTxnRef);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.bookingDate DESC")
    List<Order> findByUserId(Long userId);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.bookingDate DESC")
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.orderStatus = :status ORDER BY o.bookingDate DESC")
    List<Order> findByOrderStatus(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.orderStatus = :status ORDER BY o.bookingDate DESC")
    Page<Order> findByOrderStatus(OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.orderStatus = :status ORDER BY o.bookingDate DESC")
    Page<Order> findByUserIdAndOrderStatus(Long userId, OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderDetails od LEFT JOIN FETCH od.variant v LEFT JOIN FETCH v.product WHERE o.vnpTxnRef = :vnpTxnRef")
    Optional<Order> findByVnpTxnRefWithDetails(Long vnpTxnRef);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderDetails od LEFT JOIN FETCH od.variant v LEFT JOIN FETCH v.product WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(Long id);
}