<<<<<<< HEAD
package org.example.backend.user.repository;

import org.example.backend.user.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdAndIsAcceptTrue(Long productId);
=======
package org.example.backend.user.repository;

import org.example.backend.user.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdAndIsAcceptTrue(Long productId);
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}