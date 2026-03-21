<<<<<<< HEAD
package org.example.backend.user.repository;

import org.example.backend.user.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    List<OrderDetail> findByOrderId(Long orderId);

}
=======
package org.example.backend.user.repository;

import org.example.backend.user.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    List<OrderDetail> findByOrderId(Long orderId);

}
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
