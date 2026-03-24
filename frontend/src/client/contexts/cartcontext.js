import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../../auth/authcontext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const { user } = useAuth();

    const CART_API_URL = `${process.env.REACT_APP_API_BASE_URL || "https://localhost:8443"}/api/cart`;

    const fetchCart = useCallback(async () => {
        if (!user) {
            setCartCount(0);
            return;
        }

        try {
            const response = await fetch(CART_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const validItems = Array.isArray(data)
                ? data.filter(item =>
                    item?.productVariantId &&
                    typeof item.quantity === 'number' &&
                    item.quantity >= 0
                )
                : [];

            setCartCount(validItems.length);
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);
            setCartCount(0);
        }
    }, [user]);

    return (
        <CartContext.Provider value={{ cartCount, fetchCart, setCartCount }}>
        {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};