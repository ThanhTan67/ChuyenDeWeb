package org.example.backend.admin.controller;

import org.example.backend.user.dto.ReviewDTO;
import org.example.backend.user.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class ReviewAdminController {
    @Autowired
    private ReviewService reviewService;


    @GetMapping("/review")
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        List<ReviewDTO> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/review/{reviewId}/accept")
    public ResponseEntity<ReviewDTO> acceptReview(@PathVariable Long reviewId) {
        ReviewDTO acceptedReview = reviewService.acceptReview(reviewId);
        return ResponseEntity.ok(acceptedReview);
    }

    @PutMapping("/review/{reviewId}/reply")
    public ResponseEntity<ReviewDTO> replyToReview(@PathVariable Long reviewId, @RequestBody String response) {
        ReviewDTO repliedReview = reviewService.replyToReview(reviewId, response);
        return ResponseEntity.ok(repliedReview);
    }

}
