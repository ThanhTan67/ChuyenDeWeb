import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/cartcontext';
import { useAuth } from '../../../auth/authcontext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';
const CART_API_URL = `${API_BASE_URL}/api/cart`;
const WISHLIST_API_URL = `${API_BASE_URL}/api/wishlist`;

const ProductInfo = ({ product, selectedVariant: externalVariant, onVariantChange }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { fetchCart } = useCart();
    const [selectedVariant, setSelectedVariant] = useState(externalVariant);
    const [quantity, setQuantity] = useState(1);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // Đồng bộ selectedVariant với externalVariant
    useEffect(() => {
        if (externalVariant && externalVariant.id !== selectedVariant?.id) {
            setSelectedVariant(externalVariant);
            setQuantity(1);
        }
    }, [externalVariant, selectedVariant?.id]);

    // Kiểm tra wishlist
    useEffect(() => {
        const checkWishlist = async () => {
            if (user && product?.id) {
                try {
                    const response = await fetch(`${WISHLIST_API_URL}/${user.id}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                        },
                        credentials: 'include',
                    });
                    if (response.ok) {
                        const wishlist = await response.json();
                        setIsInWishlist(wishlist.some(item => item.productId === product.id));
                    }
                } catch (err) {
                    // Silent fail
                }
            }
        };

        checkWishlist();
    }, [user, product?.id]);

    const handleVariantChange = useCallback((variant) => {
        if (variant?.id !== selectedVariant?.id) {
            setSelectedVariant(variant);
            setQuantity(1);
            if (onVariantChange) {
                onVariantChange(variant);
            }
        }
    }, [selectedVariant?.id, onVariantChange]);

    const handleQuantityChange = (delta) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };

    const handleAddToCart = async () => {
        if (!user) {
            toast.warn('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        try {
            const cartItem = {
                productVariantId: selectedVariant.id,
                quantity: quantity,
            };
            const response = await fetch(CART_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                },
                body: JSON.stringify(cartItem),
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(t('error_loading_product'));
            }
            await response.json();
            setSuccessModalOpen(true);
            fetchCart();
            setTimeout(() => setSuccessModalOpen(false), 1500);
        } catch (err) {
            console.error(t('error_loading_product'), err);
            toast.error(err.message);
        }
    };

    const handleWishlistToggle = async () => {
        if (!user) {
            toast.warn('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        setWishlistLoading(true);
        try {
            const numericProductId = product.id;
            if (isInWishlist) {
                const response = await fetch(`${WISHLIST_API_URL}/${user.id}/${numericProductId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                    },
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Failed to remove from wishlist');
                }
                setIsInWishlist(false);
            } else {
                const response = await fetch(`${WISHLIST_API_URL}/${user.id}/${numericProductId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                    },
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Failed to add to wishlist');
                }
                setIsInWishlist(true);
            }
        } catch (err) {
            toast.error(`${t('wishlist_error')}: ${err.message}`);
        } finally {
            setWishlistLoading(false);
        }
    };

    const closeSuccessModal = () => setSuccessModalOpen(false);

    if (!product || !selectedVariant) return null;

    return (
        <div className="product-info bg-white p-6 rounded-lg max-w-lg mx-auto" style={{borderRadius:'14px'}}>
            <ToastContainer />
            <div className="flex items-center mb-2">
                <h3 className="product-title text-2xl font-semibold text-gray-800">{product.name}</h3>
                <button
                    className={`ml-3 wishlist-btn align-middle ${isInWishlist ? 'active' : ''}`}
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    title={isInWishlist ? t('remove_wishlist') : t('add_wishlist')}
                    style={{ background: 'none', border: 'none', outline: 'none', padding: 0, cursor: 'pointer' }}
                >
                    <i className={`${isInWishlist ? 'fas fa-heart' : 'far fa-heart'} text-xl text-red-500`} />
                </button>
            </div>
            <p className="product-category text-sm text-gray-500 mb-4">{t('product_category')}: {product.category}</p>
            <p className="product-category text-sm text-gray-500 mb-4">{t('brand')}: {product.brand}</p>
            <h2 className="product-price text-xl font-bold text-teal-600 mb-4">
                {selectedVariant.price ? `${selectedVariant.price.toLocaleString()}₫` : t('contact_price')}
            </h2>
            <p className="product-description text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
            <div className="variant-selector mb-6">
                <h4 className="variant-title text-base font-medium text-gray-700 mb-3">
                    {t('variant_title')}
                </h4>
                {product.variants.length > 0 ? (
                    <div className="variant-list">
                        {product.variants.map((variant) => (
                            <label key={variant.id} className="variant-item">
                                <input
                                    type="radio"
                                    name="variant"
                                    checked={selectedVariant?.id === variant.id}
                                    onChange={() => handleVariantChange(variant)}
                                />
                                <span className="variant-label">
            {variant.attribute} - {variant.variant}
          </span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">{t('no_variants')}</p>
                )}
            </div>
            {selectedVariant.quantity > 0 && (
                <div className="quantity-cart">
                    <div className="quantity-controls">
                        <button onClick={() => handleQuantityChange(-1)}>-</button>
                        <span>{quantity}</span>
                        <button onClick={() => handleQuantityChange(1)}>+</button>
                    </div>
                    <button className="add-to-cart" onClick={handleAddToCart}>
                        {t('add_to_cart')}
                    </button>
                </div>
            )}
            {successModalOpen && (
                <div className={`success-overlay ${successModalOpen ? 'active' : ''}`} onClick={closeSuccessModal}>
                    <div className="success-container" onClick={(e) => e.stopPropagation()}>
                        <div className="success-body">
                            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                            <p className="success-text">{t('success_add_to_cart')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductInfo;