package org.example.backend.user.service;

import org.example.backend.user.dto.CartItemDTO;
import org.example.backend.user.entity.Cart;
import org.example.backend.user.entity.CartItem;
import org.example.backend.user.entity.ProductVariant;
import org.example.backend.user.repository.CartItemRepository;
import org.example.backend.user.repository.CartRepository;
import org.example.backend.user.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Transactional
    public List<CartItem> getCartItemsByUserId(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    return cartRepository.save(newCart);
                });
        List<CartItem> items = cartItemRepository.findByCartIdWithImages(cart.getId());
        // Sắp xếp ID giảm dần → item mới thêm (ID lớn nhất) lên trên cùng
        items.sort((a, b) -> b.getId().compareTo(a.getId()));
        return items;
    }

    @Transactional
    public CartItem addCartItem(Long userId, Long productVariantId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    return cartRepository.save(newCart);
                });

        ProductVariant productVariant = productVariantRepository.findById(productVariantId)
                .orElseThrow(() -> new IllegalArgumentException("Product variant not found"));

        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(productVariantId))
                .findFirst();

        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProductVariant(productVariant);
            cartItem.setQuantity(quantity);
            cart.getCartItems().add(cartItem);
        }
        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public List<CartItem> updateCart(Long userId, List<CartItemDTO> cartItemDTOs) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        // Clear existing items without replacing the collection
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getCartItems().clear();

        // Add new items
        List<CartItem> updatedItems = cartItemDTOs.stream()
                .map(dto -> {
                    ProductVariant productVariant = productVariantRepository.findById(dto.getProductVariantId())
                            .orElseThrow(() -> new IllegalArgumentException("Product variant not found"));

                    CartItem cartItem = new CartItem();
                    cartItem.setCart(cart);
                    cartItem.setProductVariant(productVariant);
                    cartItem.setQuantity(dto.getQuantity());
                    cart.getCartItems().add(cartItem);
                    return cartItem;
                })
                .collect(Collectors.toList());

        cartRepository.save(cart);
        return cartItemRepository.saveAll(updatedItems);
    }

    @Transactional
    public void removeCartItem(Long userId, Long productVariantId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        CartItem itemToRemove = cart.getCartItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(productVariantId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        cart.getCartItems().remove(itemToRemove);
        cartItemRepository.delete(itemToRemove);
        cartRepository.save(cart);
    }

    @Transactional
    public CartItem updateCartItemQuantity(Long userId, Long productVariantId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(productVariantId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (quantity == 0) {
            cart.getCartItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
            cartRepository.save(cart);
            return cartItem;
        }

        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }
}