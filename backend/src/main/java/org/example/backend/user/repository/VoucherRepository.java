<<<<<<< HEAD
package org.example.backend.user.repository;

import org.example.backend.user.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    boolean existsByCode(String code);
    Page<Voucher> findAllByOrderByIdDesc(Pageable pageable);
=======
package org.example.backend.user.repository;

import org.example.backend.user.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    boolean existsByCode(String code);
    Page<Voucher> findAllByOrderByIdDesc(Pageable pageable);
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}