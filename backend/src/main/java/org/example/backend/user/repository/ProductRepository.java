package org.example.backend.user.repository;

import org.example.backend.user.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p WHERE (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.brand.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:category IS NULL OR p.category.name = :category) AND (:brand IS NULL OR p.brand.name = :brand)")
    Page<Product> findByFilters(@Param("keyword") String keyword, @Param("category") String category, @Param("brand") String brand, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN p.productVariantList pv LEFT JOIN pv.productImageList pi " +
            "WHERE (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.brand.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:category IS NULL OR p.category.name = :category) AND (:brand IS NULL OR p.brand.name = :brand) " +
            "AND (pi.mainImage = true OR pi IS NULL) ORDER BY pv.price ASC")
    Page<Product> findByFiltersPriceAsc(@Param("keyword") String keyword, @Param("category") String category, @Param("brand") String brand, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN p.productVariantList pv LEFT JOIN pv.productImageList pi " +
            "WHERE (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.brand.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:category IS NULL OR p.category.name = :category) AND (:brand IS NULL OR p.brand.name = :brand) " +
            "AND (pi.mainImage = true OR pi IS NULL) ORDER BY pv.price DESC")
    Page<Product> findByFiltersPriceDesc(@Param("keyword") String keyword, @Param("category") String category, @Param("brand") String brand, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.brand.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Product> findByNameContainingIgnoreCaseOrBrandNameContainingIgnoreCase(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN p.productVariantList pv LEFT JOIN pv.productImageList pi WHERE pi.mainImage = true OR pi IS NULL ORDER BY pv.price ASC")
    Page<Product> findAllByPriceAsc(Pageable pageable);

    @Query("SELECT p FROM Product p JOIN p.productVariantList pv LEFT JOIN pv.productImageList pi WHERE pi.mainImage = true OR pi IS NULL ORDER BY pv.price DESC")
    Page<Product> findAllByPriceDesc(Pageable pageable);

    @Query("SELECT p FROM Product p JOIN p.productVariantList pv LEFT JOIN pv.productImageList pi WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.brand.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND (pi.mainImage = true OR pi IS NULL) ORDER BY pv.price ASC")
    Page<Product> findByNameOrBrandByPriceAsc(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN p.productVariantList pv LEFT JOIN pv.productImageList pi WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.brand.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND (pi.mainImage = true OR pi IS NULL) ORDER BY pv.price DESC")
    Page<Product> findByNameOrBrandByPriceDesc(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN p.productVariantList pv LEFT JOIN pv.productImageList pi LEFT JOIN OrderDetail od ON pv.id = od.variant.id " +
            "WHERE pi.mainImage = true OR pi IS NULL " +
            "GROUP BY p.id, p.name, p.description, p.brand, p.category, p.viewCount " +
            "ORDER BY COALESCE(SUM(od.quantity), 0) DESC")
    List<Product> findBestSellers(Pageable pageable);
}