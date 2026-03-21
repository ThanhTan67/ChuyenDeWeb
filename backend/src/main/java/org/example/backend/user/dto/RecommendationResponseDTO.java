package org.example.backend.user.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class RecommendationResponseDTO {
    private String strategy;
    private Boolean coldStart;
    private Integer count;
    private List<RecommendedProduct> products;

    @Data
    public static class RecommendedProduct {
        private Long productId;
        private Double finalScore;
        private Integer rank;
        private Map<String, Double> scores;

        // Enriched from Spring Boot DB
        private String name;
        private String brand;
        private String category;
        private java.math.BigDecimal price;
        private String mainImageUrl;
    }
}
