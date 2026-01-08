package org.example.backend.user.repository;

import org.example.backend.user.entity.DiscountType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountTypeRepository extends JpaRepository<DiscountType, Long> {
}