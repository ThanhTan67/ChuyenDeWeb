package org.example.backend.user.controller;

import org.example.backend.user.dto.WishlistItemDTO;
import org.example.backend.user.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<WishlistItemDTO>> getWishlist(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(wishlistService.getWishlistByUser(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{userId}/{productId}")
    public ResponseEntity<WishlistItemDTO> addToWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        try {
            WishlistItemDTO item = wishlistService.addToWishlist(userId, productId);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<Map<String, String>> removeFromWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        try {
            wishlistService.removeFromWishlist(userId, productId);
            return ResponseEntity.ok(Map.of("message", "Removed from wishlist"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}