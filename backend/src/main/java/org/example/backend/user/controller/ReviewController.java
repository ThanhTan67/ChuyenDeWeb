package org.example.backend.user.controller;

import jakarta.validation.Valid;
import org.example.backend.user.dto.ReviewDTO;
import org.example.backend.user.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/review")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ReviewDTO> createReview(
            @Valid @RequestPart("review") ReviewDTO reviewDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        ReviewDTO createdReview = reviewService.createReview(reviewDTO, images);
        return ResponseEntity.ok(createdReview);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByProduct(@PathVariable Long productId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByProduct(productId);
        return ResponseEntity.ok(reviews);
    }

}