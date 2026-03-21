<<<<<<< HEAD
package org.example.backend.user.repository;

import org.example.backend.user.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findById(Long aLong);
}
=======
package org.example.backend.user.repository;

import org.example.backend.user.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findById(Long aLong);
}
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
