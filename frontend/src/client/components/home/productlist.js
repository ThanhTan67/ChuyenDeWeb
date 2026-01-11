import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/cartcontext';
import { useAuth } from '../../../auth/authcontext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Sử dụng biến môi trường (fallback localhost cho dev)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dp2jfvmlh/image/upload/';

// Các endpoint dùng biến chung
const PRODUCTS_API = `${API_BASE_URL}/api/products`;
const CART_API = `${API_BASE_URL}/api/cart`;

const ProductList = ({ searchTerm = '', sortBy = 'name', sortOrder = 'asc', category = '', brand = '' }) => {
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
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = `${PRODUCTS_API}/grid?page=0&size=12`;

                if (searchTerm.trim()) {
                    url = `${PRODUCTS_API}/search?keyword=${encodeURIComponent(searchTerm)}&page=0&size=12`;
                }
                if (sortBy !== 'name' || sortOrder !== 'asc') {
                    url = `${PRODUCTS_API}/sorted?keyword=${encodeURIComponent(searchTerm || '')}&page=0&size=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;
                }
                if (category || brand) {
                    url = `${PRODUCTS_API}/filter?keyword=${encodeURIComponent(searchTerm || '')}&category=${encodeURIComponent(category || '')}&brand=${encodeURIComponent(brand || '')}&page=0&size=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;
                }

                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                setProducts(data.products || []);
            } catch (err) {
                setError(`${t('error_loading_product')}: ${err.message}`);
                console.error(t('error_loading_product'), err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchTerm, sortBy, sortOrder, category, brand, t]);

    const fetchProductDetails = async (productId) => {
        setLoading(true);
        try {
            const response = await fetch(`${PRODUCTS_API}/${productId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                },
                credentials: 'include',
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            if (!data?.variants?.length) throw new Error(t('error_no_variants'));

            const defaultVariant = data.variants.find(v => v.images?.some(img => img.mainImage)) || data.variants[0];

            setSelectedProduct(data);
            setSelectedVariant(defaultVariant);
            setSelectedImage(defaultVariant.images?.find(img => img.mainImage)?.publicId || defaultVariant.images?.[0]?.publicId);
            setQuantity(1);
            setModalOpen(true);
        } catch (err) {
            setError(`${t('error_loading_product')}: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        if (!user) {
            toast.warn(t('please_login_to_add_cart'), {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }
        fetchProductDetails(product.id);
    };

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
        setSelectedImage(variant.images?.find(img => img.mainImage)?.publicId || variant.images?.[0]?.publicId);
        setQuantity(1);
    };

    const handleAddToCartFromModal = async () => {
        if (!user) {
            setModalOpen(false);
            toast.warn(t('please_login_to_add_cart'), { position: "top-center", autoClose: 3000 });
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

            if (!response.ok) throw new Error(t('add_to_cart_failed'));

            await response.json();
            setModalOpen(false);
            setSuccessModalOpen(true);
            fetchCart();
            setTimeout(() => setSuccessModalOpen(false), 1500);
        } catch (err) {
            toast.error(err.message || t('add_to_cart_failed'));
        }
    };

    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
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

    return (
        <div className="product-grid-container" style={{ margin: '80px 300px' }}>
            <ToastContainer />

            {loading && <div className="loading">{t('loading')}...</div>}
            {error && <div className="error">{error}</div>}
            {!loading && !error && products.length === 0 && (
                <p>{t('no_products')}</p>
            )}

            <div className="product-grid">
                {products.map((product) => (
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
                            {product.price ? `${product.price.toLocaleString()}₫` : t('contact_price')}
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
                                    {t('add_to_cart')}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

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
                                <h2 className="modal-title">{selectedProduct.name}</h2>
                                <p className="modal-category">{t('product_category')}: {selectedProduct.category}</p>
                                <p className="modal-brand">{t('product_brand')}: {selectedProduct.brand}</p>
                                <p className="modal-description">{selectedProduct.description}</p>
                                <p className="modal-price modal-price-highlight" style={{ color: "red", fontWeight: '600' }}>
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
                                            {t('add_to_cart')}
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
                            <p className="success-text">{t('success_add_to_cart')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ProductList;

