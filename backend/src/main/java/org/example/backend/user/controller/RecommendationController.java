package org.example.backend.user.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.RecommendationResponseDTO;
import org.example.backend.user.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * Personalized hybrid recommendations for a user.
     */
    @GetMapping("/personal")
    public ResponseEntity<RecommendationResponseDTO> getPersonalRecommendations(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "10") Integer topN,
            @RequestParam(defaultValue = "0.3") Double diversity
    ) {
        Map<String, String> params = new HashMap<>();
        params.put("top_n", topN.toString());
        params.put("diversity", diversity.toString());

        RecommendationResponseDTO response =
                recommendationService.getRecommendations("/recommend/" + userId, params);
        return ResponseEntity.ok(response);
    }

    /**
     * Similar products (content-based).
     */
    @GetMapping("/similar/{productId}")
    public ResponseEntity<RecommendationResponseDTO> getSimilarProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "10") Integer topN
    ) {
        Map<String, String> params = new HashMap<>();
        params.put("top_n", topN.toString());

        RecommendationResponseDTO response =
                recommendationService.getRecommendations("/recommend/similar/" + productId, params);
        return ResponseEntity.ok(response);
    }

    /**
     * Trending products.
     */
    @GetMapping("/trending")
    public ResponseEntity<RecommendationResponseDTO> getTrending(
            @RequestParam(defaultValue = "10") Integer topN,
            @RequestParam(defaultValue = "7") Integer days
    ) {
        Map<String, String> params = new HashMap<>();
        params.put("top_n", topN.toString());
        params.put("days", days.toString());

        RecommendationResponseDTO response =
                recommendationService.getRecommendations("/recommend/trending", params);
        return ResponseEntity.ok(response);
    }

    /**
     * Top-selling products.
     */
    @GetMapping("/top-selling")
    public ResponseEntity<RecommendationResponseDTO> getTopSelling(
            @RequestParam(defaultValue = "10") Integer topN
    ) {
        Map<String, String> params = new HashMap<>();
        params.put("top_n", topN.toString());

        RecommendationResponseDTO response =
                recommendationService.getRecommendations("/recommend/top-selling", params);
        return ResponseEntity.ok(response);
    }

    /**
     * Top-rated products (Bayesian average).
     */
    @GetMapping("/top-rated")
    public ResponseEntity<RecommendationResponseDTO> getTopRated(
            @RequestParam(defaultValue = "10") Integer topN,
            @RequestParam(defaultValue = "2") Integer minReviews
    ) {
        Map<String, String> params = new HashMap<>();
        params.put("top_n", topN.toString());
        params.put("min_reviews", minReviews.toString());

        RecommendationResponseDTO response =
                recommendationService.getRecommendations("/recommend/top-rated", params);
        return ResponseEntity.ok(response);
    }

    /**
     * Category-based recommendations.
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<RecommendationResponseDTO> getCategoryRecommendations(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "10") Integer topN
    ) {
        Map<String, String> params = new HashMap<>();
        params.put("top_n", topN.toString());

        RecommendationResponseDTO response =
                recommendationService.getRecommendations("/recommend/category/" + categoryId, params);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check for Python recommendation service.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(recommendationService.getHealth());
    }

    /**
     * Trigger model retraining.
     */
    @PostMapping("/train")
    public ResponseEntity<Map<String, Object>> triggerTraining() {
        return ResponseEntity.ok(recommendationService.triggerTraining());
    }
}
