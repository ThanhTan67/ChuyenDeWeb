package org.example.backend.user.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.RecommendationResponseDTO;
import org.example.backend.user.entity.Product;
import org.example.backend.user.entity.ProductImage;
import org.example.backend.user.entity.ProductVariant;
import org.example.backend.user.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);

    private final WebClient recommendationWebClient;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Call Python service and enrich results with product data from DB.
     */
    public RecommendationResponseDTO getRecommendations(String path, Map<String, String> params) {
        try {
            String response = recommendationWebClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path(path);
                        params.forEach(builder::queryParam);
                        return builder.build();
                    })
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseAndEnrich(response);
        } catch (WebClientResponseException e) {
            logger.error("Recommendation service error: {} {}", e.getStatusCode(), e.getResponseBodyAsString());
            return fallbackResponse();
        } catch (Exception e) {
            logger.error("Failed to call recommendation service: {}", e.getMessage());
            return fallbackResponse();
        }
    }

    /**
     * Trigger model training on the Python service.
     */
    public Map<String, Object> triggerTraining() {
        try {
            String response = recommendationWebClient.post()
                    .uri("/train")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return objectMapper.readValue(response, Map.class);
        } catch (Exception e) {
            logger.error("Training trigger failed: {}", e.getMessage());
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    /**
     * Get health status from Python service.
     */
    public Map<String, Object> getHealth() {
        try {
            String response = recommendationWebClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return objectMapper.readValue(response, Map.class);
        } catch (Exception e) {
            return Map.of("status", "unavailable", "error", e.getMessage());
        }
    }

    // ── Private helpers ─────────────────────────────────────────────

    private RecommendationResponseDTO parseAndEnrich(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            RecommendationResponseDTO dto = new RecommendationResponseDTO();
            dto.setStrategy(root.path("strategy").asText("unknown"));
            dto.setColdStart(root.path("cold_start").asBoolean(false));
            dto.setCount(root.path("count").asInt(0));

            List<RecommendationResponseDTO.RecommendedProduct> enrichedProducts = new ArrayList<>();
            JsonNode productsNode = root.path("products");

            if (productsNode.isArray()) {
                // Collect all product IDs
                List<Long> productIds = new ArrayList<>();
                for (JsonNode pNode : productsNode) {
                    productIds.add(pNode.path("product_id").asLong());
                }

                // Batch load products from DB
                Map<Long, Product> productMap = productRepository.findAllById(productIds)
                        .stream()
                        .collect(Collectors.toMap(Product::getId, p -> p));

                // Build enriched response
                for (JsonNode pNode : productsNode) {
                    RecommendationResponseDTO.RecommendedProduct rp = new RecommendationResponseDTO.RecommendedProduct();
                    long productId = pNode.path("product_id").asLong();
                    rp.setProductId(productId);
                    rp.setFinalScore(pNode.path("final_score").asDouble());
                    rp.setRank(pNode.path("rank").asInt());

                    // Parse score breakdown
                    JsonNode scoresNode = pNode.path("scores");
                    if (!scoresNode.isMissingNode()) {
                        Map<String, Double> scores = new HashMap<>();
                        scoresNode.fields().forEachRemaining(
                                entry -> scores.put(entry.getKey(), entry.getValue().asDouble())
                        );
                        rp.setScores(scores);
                    }

                    // Enrich with product data from DB
                    Product product = productMap.get(productId);
                    if (product != null) {
                        rp.setName(product.getName());
                        rp.setBrand(product.getBrand() != null ? product.getBrand().getName() : null);
                        rp.setCategory(product.getCategory() != null ? product.getCategory().getName() : null);

                        // Get main variant price and image
                        if (product.getProductVariantList() != null && !product.getProductVariantList().isEmpty()) {
                            ProductVariant mainVariant = product.getProductVariantList().stream()
                                    .filter(v -> v.getProductImageList() != null &&
                                            v.getProductImageList().stream().anyMatch(ProductImage::isMainImage))
                                    .findFirst()
                                    .orElse(product.getProductVariantList().get(0));

                            rp.setPrice(mainVariant.getPrice() != null ? mainVariant.getPrice() : BigDecimal.ZERO);

                            if (mainVariant.getProductImageList() != null) {
                                mainVariant.getProductImageList().stream()
                                        .filter(ProductImage::isMainImage)
                                        .findFirst()
                                        .ifPresent(img -> {
                                            if (img.getImage() != null) {
                                                rp.setMainImageUrl(img.getImage().getPublicId());
                                            }
                                        });
                            }
                        }
                    }

                    enrichedProducts.add(rp);
                }
            }

            dto.setProducts(enrichedProducts);
            return dto;
        } catch (Exception e) {
            logger.error("Failed to parse recommendation response: {}", e.getMessage());
            return fallbackResponse();
        }
    }

    /**
     * Fallback: return best-sellers from DB when Python service is unavailable.
     */
    private RecommendationResponseDTO fallbackResponse() {
        RecommendationResponseDTO dto = new RecommendationResponseDTO();
        dto.setStrategy("fallback_bestsellers");
        dto.setColdStart(false);

        List<Product> bestSellers = productRepository.findBestSellers(PageRequest.of(0, 10));
        List<RecommendationResponseDTO.RecommendedProduct> products = new ArrayList<>();

        for (int i = 0; i < bestSellers.size(); i++) {
            Product p = bestSellers.get(i);
            RecommendationResponseDTO.RecommendedProduct rp = new RecommendationResponseDTO.RecommendedProduct();
            rp.setProductId(p.getId());
            rp.setName(p.getName());
            rp.setBrand(p.getBrand() != null ? p.getBrand().getName() : null);
            rp.setCategory(p.getCategory() != null ? p.getCategory().getName() : null);
            rp.setFinalScore(1.0 - (i * 0.05));
            rp.setRank(i + 1);

            if (p.getProductVariantList() != null && !p.getProductVariantList().isEmpty()) {
                rp.setPrice(p.getProductVariantList().get(0).getPrice());
            }

            products.add(rp);
        }

        dto.setProducts(products);
        dto.setCount(products.size());
        return dto;
    }
}
