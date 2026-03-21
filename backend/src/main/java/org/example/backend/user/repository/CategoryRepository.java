<<<<<<< HEAD
package org.example.backend.user.repository;

import org.example.backend.user.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String categoryName);
}
=======
package org.example.backend.user.repository;

import org.example.backend.user.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String categoryName);
}
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
