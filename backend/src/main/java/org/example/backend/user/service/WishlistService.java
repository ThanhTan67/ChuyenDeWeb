package org.example.backend.user.service;

import org.example.backend.user.dto.WishlistItemDTO;
import org.example.backend.user.entity.Product;
import org.example.backend.user.entity.User;
import org.example.backend.user.entity.WishlistItem;
import org.example.backend.user.repository.ProductRepository;
import org.example.backend.user.repository.UserRepository;
import org.example.backend.user.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private static final Logger LOGGER = Logger.getLogger(WishlistService.class.getName());

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<WishlistItemDTO> getWishlistByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        List<WishlistItem> items = wishlistRepository.findByUser(user);
        return items.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public WishlistItemDTO addToWishlist(Long userId, Long productId) {
        LOGGER.info("Adding product ID " + productId + " to wishlist for user ID " + userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        if (wishlistRepository.findByUserAndProduct(user, product).isPresent()) {
            throw new RuntimeException("Product already in wishlist");
        }

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);
        WishlistItem savedItem = wishlistRepository.save(item);
        return mapToDTO(savedItem);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        LOGGER.info("Attempting to remove product ID " + productId + " from wishlist for user ID " + userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        if (wishlistRepository.findByUserAndProduct(user, product).isEmpty()) {
            LOGGER.warning("Wishlist item not found for user ID " + userId + " and product ID " + productId);
            throw new RuntimeException("Wishlist item not found for user ID " + userId + " and product ID " + productId);
        }

        wishlistRepository.deleteByUserAndProduct(user, product);
        LOGGER.info("Successfully removed product ID " + productId + " from wishlist for user ID " + userId);
    }

    private WishlistItemDTO mapToDTO(WishlistItem item) {
        WishlistItemDTO dto = new WishlistItemDTO();
        dto.setId(item.getId());
        Product product = item.getProduct();
        dto.setProductId(product.getId());
        dto.setProductName(product.getName());
        dto.setBrandName(product.getBrand() != null ? product.getBrand().getName() : "N/A");
        dto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : "N/A");

        if (!product.getProductVariantList().isEmpty()) {
            product.getProductVariantList().stream()
                    .filter(v -> v.getProductImageList().stream().anyMatch(img -> img.isMainImage()))
                    .findFirst()
                    .ifPresent(variant -> {
                        dto.setPrice(variant.getPrice() != null ? variant.getPrice().doubleValue() : 0.0);
                        dto.setStock(variant.getQuantity());
                        variant.getProductImageList().stream()
                                .filter(img -> img.isMainImage())
                                .findFirst()
                                .ifPresent(img -> dto.setMainImageUrl(img.getImage().getPublicId()));
                    });
        }
        return dto;
    }
}