package org.example.backend.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Tracks user behavior events: VIEW, CLICK, ADD_TO_CART, PURCHASE, SEARCH.
 * Used by the Python recommendation service for behavior-based scoring.
 */
@Getter
@Setter
@Entity
@Table(name = "user_behavior_event", indexes = {
        @Index(name = "idx_behavior_user", columnList = "user_id"),
        @Index(name = "idx_behavior_user_product", columnList = "user_id, product_id"),
        @Index(name = "idx_behavior_created", columnList = "created_at")
})
public class UserBehaviorEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "event_type", nullable = false, length = 20)
    private String eventType;  // VIEW, CLICK, ADD_TO_CART, PURCHASE, SEARCH

    @Column(name = "search_query", length = 255)
    private String searchQuery;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
