<<<<<<< HEAD
package org.example.backend.user.repository;

import org.example.backend.user.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findByName(String brandName);
}
=======
package org.example.backend.user.repository;

import org.example.backend.user.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findByName(String brandName);
}
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
