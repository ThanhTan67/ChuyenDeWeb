package org.example.backend.repository;

import org.example.backend.entity.EVoucher;
import org.example.backend.entity.User;
import org.example.backend.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EVoucherRepository extends JpaRepository<EVoucher, Long> {
    Optional<EVoucher> findByUserAndVoucher(User user, Voucher voucher);
    List<EVoucher> findByUser(User user);
    Optional<EVoucher> findByUserAndVoucher_Id(User user, Long voucherId);
}