<<<<<<< HEAD
package org.example.backend.user.repository;

import org.example.backend.user.entity.Product;
import org.example.backend.user.entity.User;
import org.example.backend.user.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUser(User user);
    Optional<WishlistItem> findByUserAndProduct(User user, Product product);
    void deleteByUserAndProduct(User user, Product product);
=======
package org.example.backend.user.repository;

import org.example.backend.user.entity.Product;
import org.example.backend.user.entity.User;
import org.example.backend.user.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUser(User user);
    Optional<WishlistItem> findByUserAndProduct(User user, Product product);
    void deleteByUserAndProduct(User user, Product product);
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}