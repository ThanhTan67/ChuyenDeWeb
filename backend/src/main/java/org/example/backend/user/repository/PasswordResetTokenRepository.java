<<<<<<< HEAD
package org.example.backend.user.repository;

import org.example.backend.user.entity.ResetPassword;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<ResetPassword, Long> {
    Optional<ResetPassword> findByToken(String token);
}
=======
package org.example.backend.user.repository;

import org.example.backend.user.entity.ResetPassword;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<ResetPassword, Long> {
    Optional<ResetPassword> findByToken(String token);
}
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
