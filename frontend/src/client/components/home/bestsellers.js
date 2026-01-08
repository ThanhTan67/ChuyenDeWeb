import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/cartcontext';
import { useAuth } from '../../../auth/authcontext';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Biến môi trường chung (fallback về localhost khi dev)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dp2jfvmlh/image/upload/';

// Các endpoint dùng biến chung
const BESTSELLERS_API = `${API_BASE_URL}/api/products/bestsellers`;
const PRODUCT_DETAIL_API = `${API_BASE_URL}/api/products/`;
const CART_API = `${API_BASE_URL}/api/cart`;

const BestSellers = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { fetchCart } = useCart();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    useEffect(() => {
        const fetchBestSellers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BESTSELLERS_API}?size=5`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setProducts(data.products || []);
            } catch (err) {
                setError(`Không tải được sản phẩm bán chạy: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchBestSellers();
    }, []);

    useEffect(() => {
        if (modalOpen || successModalOpen) {
            document.body.classList.add('modal-active');
        } else {
            document.body.classList.remove('modal-active');
        }
        return () => document.body.classList.remove('modal-active');
    }, [modalOpen, successModalOpen]);

    useEffect(() => {
        if (selectedVariant?.images?.length > 0) {
            const mainImg = selectedVariant.images.find(img => img.mainImage);
            setSelectedImage(mainImg?.publicId || selectedVariant.images[0].publicId);
        }
    }, [selectedVariant]);

    const fetchProductDetails = async (productId) => {
        setLoading(true);
        try {
            const response = await fetch(`${PRODUCT_DETAIL_API}${productId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (!data?.variants?.length) throw new Error('Sản phẩm không có biến thể');

            const defaultVariant = data.variants.find(v => v.images?.some(img => img.mainImage)) || data.variants[0];
            setSelectedProduct(data);
            setSelectedVariant(defaultVariant);
            setQuantity(1);
            setModalOpen(true);
        } catch (err) {
            setError(`Lỗi tải chi tiết: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        if (!user) {
            toast.warn('Vui lòng đăng nhập để thêm vào giỏ hàng!', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        fetchProductDetails(product.id);
    };

    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
        setQuantity(1);
    };

    const handleAddToCartFromModal = async () => {
        if (!user) {
            setModalOpen(false);
            toast.warn('Vui lòng đăng nhập để thêm vào giỏ hàng!', {
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
            const response = await fetch(CART_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                },
                body: JSON.stringify(cartItem),
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Thêm vào giỏ hàng thất bại');
            await response.json();
            setModalOpen(false);
            setSuccessModalOpen(true);
            fetchCart();
            setTimeout(() => setSuccessModalOpen(false), 1500);
        } catch (err) {
            toast.error(err.message || 'Lỗi khi thêm vào giỏ hàng');
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedProduct(null);
        setSelectedVariant(null);
        setSelectedImage(null);
        setQuantity(1);
    };

    const closeSuccessModal = () => setSuccessModalOpen(false);

    const allImages = selectedProduct?.variants?.flatMap(variant =>
        variant.images?.map(image => ({
            publicId: image.publicId,
            mainImage: image.mainImage,
            variantId: variant.id
        })) || []
    ) || [];

    const handleImageClick = (image) => {
        setSelectedImage(image.publicId);
        const variant = selectedProduct.variants.find(v => v.id === image.variantId);
        if (variant) {
            setSelectedVariant(variant);
            setQuantity(1);
        }
    };

    if (!loading && !error && products.length === 0) return null;

    return (
        <section className="product_list best_seller section_padding">
            <div className="container">
                <h2 className="section-title" style={{ textAlign: 'center' }}>
                    Sản phẩm bán chạy<span></span>
                </h2>

                <ToastContainer />

                {loading && <div className="loading">Đang tải...</div>}
                {error && <div className="error">Lỗi: {error}</div>}

                {!loading && !error && products.length > 0 && (
                    <div className="product-grid">
                        {products.map(product => (
                            <div
                                className="product-card"
                                key={product.id}
                                onClick={() => navigate(`/shop-detail/${product.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img
                                    src={product.mainImageUrl
                                        ? `${CLOUDINARY_BASE_URL}${product.mainImageUrl}.png`
                                        : '/img/product/default.png'}
                                    alt={product.name}
                                    className="product-image"
                                />
                                <div className="product-price">
                                    {product.price ? `${product.price.toLocaleString()}₫` : 'Liên hệ'}
                                </div>
                                <h3 className="product-name">{product.brand}</h3>
                                <p className="product-brand">{product.name}</p>
                                {product.stock > 0 && (
                                    <div className="quantity-cart">
                                        <button
                                            className="add-to-cart"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(product);
                                            }}
                                        >
                                            Thêm vào giỏ
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {modalOpen && selectedProduct && selectedVariant && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeModal}>×</button>
                            <div className="modal-body">
                                <div className="modal-image">
                                    <img
                                        src={
                                            selectedImage
                                                ? `${CLOUDINARY_BASE_URL}${selectedImage}.png`
                                                : selectedVariant.images?.length > 0
                                                    ? `${CLOUDINARY_BASE_URL}${selectedVariant.images[0].publicId}.png`
                                                    : '/img/product/default.png'
                                        }
                                        alt={selectedProduct.name}
                                        className="product-image"
                                    />
                                    <div className="thumbnail-container">
                                        {allImages.map((image, index) => (
                                            <img
                                                key={index}
                                                src={`${CLOUDINARY_BASE_URL}${image.publicId}.png`}
                                                alt={`${selectedProduct.name} thumbnail ${index + 1}`}
                                                className={`thumbnail ${selectedImage === image.publicId ? 'active' : ''}`}
                                                onClick={() => handleImageClick(image)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-details">
                                    <h2 className="modal-title">
                                        {selectedProduct.name}
                                    </h2>
                                    <p className="modal-category">{t('product_category')}: {selectedProduct.category}</p>
                                    <p className="modal-brand">{t('product_brand')}: {selectedProduct.brand}</p>
                                    <p className="modal-description">{selectedProduct.description}</p>
                                    <p className="modal-price modal-price-highlight" style={{color:'red', fontWeight:'600'}}>
                                        {selectedVariant.price ? `${selectedVariant.price.toLocaleString()}₫` : t('contact_price')}
                                    </p>
                                    <div className="modal-variants">
                                        <h3>{t('variants')}</h3>
                                        {selectedProduct.variants?.length > 0 ? (
                                            <div className="variant-list">
                                                {selectedProduct.variants.map((variant) => (
                                                    <label key={variant.id} className="variant-item">
                                                        <input
                                                            type="radio"
                                                            name="variant"
                                                            checked={selectedVariant?.id === variant.id}
                                                            onChange={() => handleVariantChange(variant)}
                                                        />
                                                        <span className="variant-label">{variant.attribute} - {variant.variant}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>{t('no_variants')}</p>
                                        )}
                                    </div>
                                    {selectedVariant?.quantity > 0 && (
                                        <div className="quantity-cart">
                                            <div className="quantity-controls">
                                                <button onClick={() => handleQuantityChange(-1)}>-</button>
                                                <span>{quantity}</span>
                                                <button onClick={() => handleQuantityChange(1)}>+</button>
                                            </div>
                                            <button className="add-to-cart" onClick={handleAddToCartFromModal}>
                                                Thêm vào giỏ
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {successModalOpen && (
                    <div className={`success-overlay ${successModalOpen ? 'active' : ''}`} onClick={closeSuccessModal}>
                        <div className="success-container" onClick={e => e.stopPropagation()}>
                            <div className="success-body">
                                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                    <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                    <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                </svg>
                                <p className="success-text">Sản phẩm đã được thêm vào giỏ hàng!</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default BestSellers;