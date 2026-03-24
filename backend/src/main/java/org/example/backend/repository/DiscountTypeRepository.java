package org.example.backend.repository;

import org.example.backend.entity.DiscountType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountTypeRepository extends JpaRepository<DiscountType, Long> {
}