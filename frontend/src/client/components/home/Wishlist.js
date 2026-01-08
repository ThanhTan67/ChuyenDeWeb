import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/authcontext';
import { useCart } from '../../contexts/cartcontext';
import { useTranslation } from 'react-i18next';
import Layout from "../layout/layout";
import Breadcrumb from "../layout/breadcrumb";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dp2jfvmlh/image/upload/';

// Các endpoint dùng biến chung
const WISHLIST_API = `${API_BASE_URL}/api/wishlist`;
const PRODUCT_DETAIL_API = `${API_BASE_URL}/api/products/`;
const CART_API = `${API_BASE_URL}/api/cart`;

const Wishlist = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { fetchCart } = useCart();
    const navigate = useNavigate();

    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            fetchWishlist();
        }
    }, [user]);

    const fetchWishlist = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${WISHLIST_API}/${user.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setWishlistItems(data || []);
        } catch (err) {
            setError(t('wishlist_fetch_error'));
            console.error('Lỗi tải wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        if (!user) return;

        try {
            const response = await fetch(`${WISHLIST_API}/${user.id}/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Xóa thất bại');

            setWishlistItems(wishlistItems.filter(item => item.productId !== productId));
            setSuccessMessage(t('success_remove_wishlist'));
            setSuccessModalOpen(true);
            setTimeout(() => setSuccessModalOpen(false), 1500);
        } catch (err) {
            toast.error(t('wishlist_remove_error'));
        }
    };

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
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (!data?.variants?.length) throw new Error(t('error_no_variants'));

            const defaultVariant = data.variants.find(v => v.images?.some(img => img.mainImage)) || data.variants[0];

            setSelectedProduct(data);
            setSelectedVariant(defaultVariant);
            setSelectedImage(defaultVariant.images?.find(img => img.mainImage)?.publicId || defaultVariant.images?.[0]?.publicId);
            setQuantity(1);
            setModalOpen(true);
        } catch (err) {
            toast.error(`${t('error_loading_product')}: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (item) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        fetchProductDetails(item.productId);
    };

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
        setSelectedImage(variant.images?.find(img => img.mainImage)?.publicId || variant.images?.[0]?.publicId);
        setQuantity(1);
    };

    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleAddToCartFromModal = async () => {
        if (!user) {
            setModalOpen(false);
            setShowLoginModal(true);
            return;
        }

        try {
            const cartItem = { productVariantId: selectedVariant.id, quantity };
            const response = await fetch(CART_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                },
                body: JSON.stringify(cartItem),
                credentials: 'include',
            });
            if (!response.ok) throw new Error(t('error_adding_to_cart'));

            await response.json();
            setModalOpen(false);
            setSuccessMessage(t('success_add_to_cart'));
            setSuccessModalOpen(true);
            fetchCart();
            setTimeout(() => setSuccessModalOpen(false), 1500);
        } catch (err) {
            toast.error(t('error_adding_to_cart'));
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
    const closeLoginModal = () => setShowLoginModal(false);

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

    if (!user) {
        return (
            <Layout>
                <Breadcrumb title={t('wishlist_title')} subtitle={t('home_subtitle')} />
                <div className="container text-center py-5">
                    <p>{t('login_to_view_wishlist')}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>
                        {t('login')}
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Breadcrumb title={t('wishlist_title')} subtitle={t('wishlist_subtitle')} />
            <section className="product_list best_seller section_padding">
                <div className="container">
                    <ToastContainer />

                    {loading && <div className="loading">{t('loading')}...</div>}
                    {error && <div className="error">{error}</div>}

                    {!loading && !error && wishlistItems.length === 0 && (
                        <div className="text-center py-5">{t('wishlist_empty')}</div>
                    )}

                    {!loading && !error && wishlistItems.length > 0 && (
                        <div className="product-grid">
                            {wishlistItems.map((item) => (
                                <div
                                    className="product-card relative"
                                    key={item.id}
                                    onClick={() => navigate(`/shop-detail/${item.productId}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <button
                                        className="remove-x-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFromWishlist(item.productId);
                                        }}
                                        title={t('remove_wishlist')}
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 10,
                                            zIndex: 2,
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '1.8rem',
                                            color: '#e11d48',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ×
                                    </button>
                                    <img
                                        src={item.mainImageUrl
                                            ? `${CLOUDINARY_BASE_URL}${item.mainImageUrl}.png`
                                            : '/img/product/default.png'}
                                        alt={item.productName}
                                        className="product-image"
                                    />
                                    <div className="product-price">
                                        {item.price ? `${item.price.toLocaleString()}₫` : t('contact')}
                                    </div>
                                    <h3 className="product-name">{item.brandName}</h3>
                                    <p className="product-brand">{item.productName}</p>
                                    <div className="quantity-cart">
                                        <button
                                            className="add-to-cart bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(item);
                                            }}
                                        >
                                            {t('add_to_cart')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Modal chọn variant/quantity */}
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
                                                    : selectedVariant.images?.[0]?.publicId
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
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className={`thumbnail ${selectedImage === image.publicId ? 'active' : ''}`}
                                                    onClick={() => handleImageClick(image)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="modal-details">
                                        <h2 className="modal-title">
                                            <i>{selectedProduct.brand}</i> - {selectedProduct.name}
                                        </h2>
                                        <p className="modal-category">{t('product_category')}: {selectedProduct.category}</p>
                                        <p className="modal-description">{selectedProduct.description}</p>
                                        <p className="modal-price modal-price-highlight">
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
                                                            <span>{variant.attribute} - {variant.variant}</span>
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
                                                    {t('add_to_cart')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal yêu cầu đăng nhập */}
                    {showLoginModal && (
                        <div className="modal-overlay" onClick={closeLoginModal}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <button className="modal-close" onClick={closeLoginModal}>×</button>
                                <div className="modal-body text-center">
                                    <h2>{t('login_required')}</h2>
                                    <p>{t('login_prompt')}</p>
                                    <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>
                                        {t('login')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal thành công */}
                    {successModalOpen && (
                        <div className="success-overlay active" onClick={closeSuccessModal}>
                            <div className="success-container" onClick={e => e.stopPropagation()}>
                                <div className="success-body">
                                    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                        <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                        <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                    </svg>
                                    <p className="success-text">{successMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
};

export default Wishlist;