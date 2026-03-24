package org.example.backend.repository;

import org.example.backend.entity.ResetPassword;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<ResetPassword, Long> {
    Optional<ResetPassword> findByToken(String token);
}
