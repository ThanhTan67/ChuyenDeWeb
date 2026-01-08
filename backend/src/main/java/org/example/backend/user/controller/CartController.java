package org.example.backend.user.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.CartItemDTO;
import org.example.backend.user.entity.CartItem;
import org.example.backend.user.entity.ProductImage;
import org.example.backend.user.service.AuthService;
import org.example.backend.user.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart(HttpServletRequest request) {
        Long userId = authService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Trả về 401 thay vì chuyển hướng
        }

        List<CartItem> cartItems = cartService.getCartItemsByUserId(userId);
        List<CartItemDTO> cartItemDTOs = cartItems.stream().map(this::convertToCartItemDTO).collect(Collectors.toList());
        return ResponseEntity.ok(cartItemDTOs);
    }

    @PostMapping
    public ResponseEntity<CartItemDTO> addToCart(@RequestBody CartItemDTO cartItemDTO, HttpServletRequest request) {
        if (cartItemDTO == null || cartItemDTO.getProductVariantId() == null || cartItemDTO.getQuantity() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        Long userId = authService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Trả về 401
        }

        try {
            CartItem cartItem = cartService.addCartItem(userId, cartItemDTO.getProductVariantId(), cartItemDTO.getQuantity());
            CartItemDTO responseDTO = convertToCartItemDTO(cartItem);
            return ResponseEntity.ok(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping
    public ResponseEntity<List<CartItemDTO>> updateCart(@RequestBody List<CartItemDTO> cartItemDTOs, HttpServletRequest request) {
        Long userId = authService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Trả về 401
        }

        try {
            List<CartItem> updatedItems = cartService.updateCart(userId, cartItemDTOs);
            List<CartItemDTO> responseItems = updatedItems.stream()
                    .map(this::convertToCartItemDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseItems);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PatchMapping("/{productVariantId}/quantity")
    public ResponseEntity<CartItemDTO> updateCartItemQuantity(
            @PathVariable Long productVariantId,
            @RequestBody CartItemDTO cartItemDTO,
            HttpServletRequest request) {
        Long userId = authService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        if (cartItemDTO.getQuantity() < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        try {
            CartItem updatedItem = cartService.updateCartItemQuantity(userId, productVariantId, cartItemDTO.getQuantity());
            CartItemDTO responseDTO = convertToCartItemDTO(updatedItem);
            return ResponseEntity.ok(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping("/{productVariantId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long productVariantId, HttpServletRequest request) {
        Long userId = authService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // Trả về 401
        }

        try {
            cartService.removeCartItem(userId, productVariantId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    private CartItemDTO convertToCartItemDTO(CartItem cartItem) {
        CartItemDTO dto = new CartItemDTO();
        dto.setProductVariantId(cartItem.getProductVariant().getId());
        dto.setQuantity(cartItem.getQuantity());
        dto.setPrice(cartItem.getProductVariant().getPrice());
        dto.setAttribute(cartItem.getProductVariant().getProductAttribute());
        dto.setVariant(cartItem.getProductVariant().getVariant());
        dto.setProductId(cartItem.getProductVariant().getProduct().getId());
        dto.setProductName(cartItem.getProductVariant().getProduct().getName());
        dto.setBrandName(cartItem.getProductVariant().getProduct().getBrand().getName());
        dto.setCategoryName(cartItem.getProductVariant().getProduct().getCategory().getName());

        List<ProductImage> images = cartItem.getProductVariant().getProductImageList();
        images.stream()
                .filter(ProductImage::isMainImage)
                .findFirst()
                .ifPresent(mainImage -> {
                    if (mainImage.getImage() != null) {
                        dto.setMainImageUrl("https://res.cloudinary.com/dp2jfvmlh/image/upload/" + mainImage.getImage().getPublicId());
                    }
                });

        List<String> additionalImages = images.stream()
                .filter(img -> !img.isMainImage() && img.getImage() != null)
                .map(img -> "https://res.cloudinary.com/dp2jfvmlh/image/upload/" + img.getImage().getPublicId())
                .collect(Collectors.toList());
        dto.setAdditionalImageUrls(additionalImages);

        return dto;
    }
}