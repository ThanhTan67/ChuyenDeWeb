package org.example.backend.user.repository;

import org.example.backend.user.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Query("SELECT ci FROM CartItem ci " +
            "JOIN FETCH ci.productVariant pv " +
            "JOIN FETCH pv.product p " +
            "JOIN FETCH p.brand " +
            "JOIN FETCH p.category " +
            "LEFT JOIN FETCH pv.productImageList pi " +
            "WHERE ci.cart.id = :cartId")
    List<CartItem> findByCartIdWithImages(@Param("cartId") Long cartId);

    void deleteByCartId(Long cartId);
}