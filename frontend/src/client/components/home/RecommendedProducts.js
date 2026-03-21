import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/authcontext';
import { useCart } from '../../contexts/cartcontext';
import { trackBehavior } from '../utils/behaviorTracking';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../assets/css/recommendation.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dp2jfvmlh/image/upload/';

const SKELETON_COUNT = 5;

const STRATEGY_CONFIG = {
    hybrid:      { icon: '✨', label: 'Gợi ý cho bạn',  cls: 'strategy--hybrid',   title: 'Dành cho bạn',       sub: 'Được AI lựa chọn dựa trên sở thích của bạn' },
    trending:    { icon: '🔥', label: 'Đang hot',        cls: 'strategy--trending',  title: 'Đang thịnh hành',    sub: 'Sản phẩm được nhiều người yêu thích nhất' },
    top_selling: { icon: '📦', label: 'Bán chạy',        cls: 'strategy--selling',   title: 'Bán chạy nhất',      sub: 'Những sản phẩm mọi người đang chọn mua nhiều nhất' },
    top_rated:   { icon: '⭐', label: 'Đánh giá cao',   cls: 'strategy--rated',     title: 'Được yêu thích',     sub: 'Sản phẩm nhận được đánh giá từ khách hàng tốt nhất' },
    cold_start:  { icon: '💎', label: 'Nổi bật',         cls: 'strategy--cold',      title: 'Nổi bật hôm nay',    sub: 'Khám phá những sản phẩm chất lượng được lựa chọn kỹ càng' },
};

/* ─── Skeleton placeholder ──────────────────────────────────── */
const SkeletonCard = () => (
    <div className="rec-card rec-skeleton-card">
        <div className="rec-skeleton-img" />
        <div className="rec-skeleton-body">
            <div className="rec-skeleton-line long" />
            <div className="rec-skeleton-line medium" />
            <div className="rec-skeleton-line short" />
        </div>
    </div>
);

/* ─── AI match-score bar ────────────────────────────────────── */
const MatchScoreBar = ({ score }) => {
    const pct = Math.min(Math.round(score * 100), 100);
    return (
        <div className="rec-match-bar" title={`Độ phù hợp AI: ${pct}%`}>
            <div className="rec-match-label">
                <span className="rec-match-label__text">✦ Độ phù hợp</span>
                <span className="rec-match-label__pct">{pct}%</span>
            </div>
            <div className="rec-match-track">
                <div className="rec-match-fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════ */
const RecommendedProducts = () => {
    const { user } = useAuth();
    const { fetchCart } = useCart();
    const navigate = useNavigate();

    /* ── Data ───────────────────────────────────────────────── */
    const [products, setProducts]   = useState([]);
    const [recMeta, setRecMeta]     = useState([]);   // { finalScore } per product
    const [loading, setLoading]     = useState(true);
    const [strategy, setStrategy]   = useState('trending');

    /* ── Carousel ───────────────────────────────────────────── */
    const trackRef              = useRef(null);
    const [canLeft, setCanLeft]   = useState(false);
    const [canRight, setCanRight] = useState(false);

    /* ── Section fade-in on scroll ──────────────────────────── */
    const sectionRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (loading || products.length === 0) return;
        const el = sectionRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [loading, products.length]);

    /* ── Cart modal state ───────────────────────────────────── */
    const [modalOpen, setModalOpen]             = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedImage, setSelectedImage]     = useState(null);
    const [quantity, setQuantity]               = useState(1);
    const [successOpen, setSuccessOpen]         = useState(false);

    useEffect(() => {
        document.body.classList.toggle('modal-active', modalOpen || successOpen);
        return () => document.body.classList.remove('modal-active');
    }, [modalOpen, successOpen]);

    useEffect(() => {
        if (!selectedVariant?.images?.length) return;
        const main = selectedVariant.images.find(i => i.mainImage);
        setSelectedImage(main?.publicId || selectedVariant.images[0].publicId);
    }, [selectedVariant]);

    /* ─── Fetch recommendations ─────────────────────────────── */
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                let data = null;

                /* 1. Personalised (logged-in) */
                if (user?.id) {
                    const res = await fetch(
                        `${API_BASE_URL}/api/recommendations/personal?userId=${user.id}&topN=10&diversity=0.3`,
                        { credentials: 'include' }
                    );
                    if (res.ok) data = await res.json();
                }

                /* 2. Fallback chain */
                const fallbacks = ['trending?topN=10&days=7', 'top-selling?topN=10', 'top-rated?topN=10'];
                for (const fb of fallbacks) {
                    if (data?.products?.length) break;
                    const r = await fetch(`${API_BASE_URL}/api/recommendations/${fb}`, { credentials: 'include' });
                    if (r.ok) data = await r.json();
                }

                if (!data?.products?.length) { setProducts([]); return; }

                const resolvedStrategy = data.strategy || 'trending';
                setStrategy(resolvedStrategy);

                /* Capture AI scores before fetching product details */
                const sliced = data.products.slice(0, 10);
                const meta = sliced.map(p => ({
                    // Java DTO uses camelCase (finalScore); Python returns snake_case (final_score)
                    finalScore: p.finalScore ?? p.final_score ?? null,
                    productId:  p.productId  ?? p.product_id  ?? null,
                }));

                /* Fetch full product details in parallel */
                const settled = await Promise.allSettled(
                    meta.map(m =>
                        fetch(`${API_BASE_URL}/api/products/${m.productId}`, { credentials: 'include' })
                            .then(r => r.ok ? r.json() : null)
                    )
                );

                const resolvedProducts = [];
                const resolvedMeta = [];
                settled.forEach((r, i) => {
                    if (r.status === 'fulfilled' && r.value) {
                        resolvedProducts.push(r.value);
                        resolvedMeta.push(meta[i]);
                    }
                });

                setProducts(resolvedProducts);
                setRecMeta(resolvedMeta);
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [user?.id]);

    /* ─── Carousel scroll management ────────────────────────── */
    const updateArrows = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 4);
        setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }, []);

    useEffect(() => {
        // Delay to let DOM paint cards first
        const t = setTimeout(updateArrows, 50);
        return () => clearTimeout(t);
    }, [products, updateArrows]);

    useEffect(() => {
        window.addEventListener('resize', updateArrows);
        return () => window.removeEventListener('resize', updateArrows);
    }, [updateArrows]);

    const scrollByCards = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        const card = el.querySelector('.rec-card');
        const step = card ? card.offsetWidth + 20 : 240;
        el.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
        setTimeout(updateArrows, 350);
    };

    /* ─── Add-to-cart ────────────────────────────────────────── */
    const openCartModal = async (product) => {
        if (!user) {
            toast.warn('Vui lòng đăng nhập để thêm vào giỏ hàng!', { position: 'top-center', autoClose: 3000 });
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}` },
                credentials: 'include',
            });
            if (!res.ok) throw new Error();
            const detail = await res.json();
            if (!detail?.variants?.length) throw new Error('No variants');
            const defaultV = detail.variants.find(v => v.images?.some(i => i.mainImage)) || detail.variants[0];
            setSelectedProduct(detail);
            setSelectedVariant(defaultV);
            setQuantity(1);
            setModalOpen(true);
        } catch {
            toast.error('Không thể tải chi tiết sản phẩm');
        }
    };

    const confirmAddToCart = async () => {
        if (!user) { setModalOpen(false); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/api/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                },
                body: JSON.stringify({ productVariantId: selectedVariant.id, quantity }),
                credentials: 'include',
            });
            if (!res.ok) throw new Error();
            trackBehavior(user?.id, selectedProduct?.id, 'ADD_TO_CART');
            setModalOpen(false);
            setSuccessOpen(true);
            fetchCart();
            setTimeout(() => setSuccessOpen(false), 1600);
        } catch {
            toast.error('Lỗi khi thêm vào giỏ hàng');
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedProduct(null);
        setSelectedVariant(null);
        setSelectedImage(null);
        setQuantity(1);
    };

    /* ─── Helpers ────────────────────────────────────────────── */
    const getPrice = (product) => {
        const prices = product?.variants?.map(v => v.price).filter(Boolean) || [];
        return prices.length ? Math.min(...prices) : null;
    };

    const getImage = (product) => {
        for (const v of (product?.variants || [])) {
            const m = v.images?.find(i => i.mainImage);
            if (m) return m.publicId;
            if (v.images?.[0]) return v.images[0].publicId;
        }
        return null;
    };

    const allImages = selectedProduct?.variants?.flatMap(v =>
        (v.images || []).map(img => ({ publicId: img.publicId, mainImage: img.mainImage, variantId: v.id }))
    ) || [];

    /* ─── Guard ──────────────────────────────────────────────── */
    if (!loading && products.length === 0) return null;

    const cfg = STRATEGY_CONFIG[strategy] || STRATEGY_CONFIG.trending;
    const isPersonalised = !!user?.id && strategy === 'hybrid';

    return (
        <section className="rec_section" ref={sectionRef}>
            <div className="container">

                {/* ── HEADER ──────────────────────────────────── */}
                <div className="rec-header">
                    <div className={`rec-header__badge ${cfg.cls}`}>
                        <span>{cfg.icon}</span> {cfg.label}
                    </div>
                    <h2 className="rec-header__title">
                        {cfg.title} <span className="rec-header__underline" />
                    </h2>
                    <p className="rec-header__sub">{cfg.sub}</p>
                </div>

                <ToastContainer />

                {/* ── CAROUSEL ────────────────────────────────── */}
                <div className="rec-carousel-wrap">
                    {/* Left arrow */}
                    <button
                        className={`rec-arrow rec-arrow--left ${canLeft ? 'rec-arrow--visible' : ''}`}
                        onClick={() => scrollByCards(-1)}
                        aria-label="Cuộn trái"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    <div
                        className="rec-track"
                        ref={trackRef}
                        onScroll={updateArrows}
                    >
                        {loading
                            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)
                            : products.map((product, idx) => {
                                const price  = getPrice(product);
                                const imgId  = getImage(product);
                                const score  = recMeta[idx]?.finalScore ?? null;

                                return (
                                    <div
                                        key={product.id}
                                        className={`rec-card ${visible ? 'rec-card--in' : ''}`}
                                        style={{ animationDelay: `${idx * 0.07}s` }}
                                    >
                                        {/* Strategy chip */}
                                        <span className={`rec-chip ${cfg.cls}`}>
                                            {cfg.icon} {cfg.label}
                                        </span>

                                        {/* Rank badge */}
                                        <span className="rec-rank">#{idx + 1}</span>

                                        {/* Image + overlay */}
                                        <div className="rec-card__img-wrap">
                                            <img
                                                src={imgId ? `${CLOUDINARY_BASE_URL}${imgId}.png` : '/img/product/default.png'}
                                                alt={product.name}
                                                className="rec-card__img"
                                                loading="lazy"
                                            />
                                            <div className="rec-card__overlay">
                                                <button
                                                    className="rec-overlay-btn"
                                                    onClick={() => {
                                                        trackBehavior(user?.id, product.id, 'CLICK');
                                                        navigate(`/shop-detail/${product.id}`);
                                                    }}
                                                >
                                                    Xem chi tiết
                                                </button>
                                                <button
                                                    className="rec-overlay-btn rec-overlay-btn--cart"
                                                    onClick={(e) => { e.stopPropagation(); openCartModal(product); }}
                                                >
                                                    🛒 Thêm vào giỏ
                                                </button>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div
                                            className="rec-card__body"
                                            onClick={() => {
                                                trackBehavior(user?.id, product.id, 'CLICK');
                                                navigate(`/shop-detail/${product.id}`);
                                            }}
                                        >
                                            <p className="rec-card__brand">{product.brand}</p>
                                            <h3 className="rec-card__name">{product.name}</h3>
                                            <div className="rec-card__price">
                                                {price ? `${price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                            </div>

                                            {/* AI score — shown when personalised AND score exists */}
                                            {isPersonalised && score !== null && (
                                                <MatchScoreBar score={score} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>

                    {/* Right arrow */}
                    <button
                        className={`rec-arrow rec-arrow--right ${canRight ? 'rec-arrow--visible' : ''}`}
                        onClick={() => scrollByCards(1)}
                        aria-label="Cuộn phải"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                {/* ── ADD-TO-CART MODAL ────────────────────────── */}
                {modalOpen && selectedProduct && selectedVariant && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeModal}>×</button>
                            <div className="modal-body">
                                <div className="modal-image">
                                    <img
                                        src={selectedImage
                                            ? `${CLOUDINARY_BASE_URL}${selectedImage}.png`
                                            : selectedVariant.images?.[0]
                                                ? `${CLOUDINARY_BASE_URL}${selectedVariant.images[0].publicId}.png`
                                                : '/img/product/default.png'}
                                        alt={selectedProduct.name}
                                        className="product-image"
                                    />
                                    <div className="thumbnail-container">
                                        {allImages.map((img, i) => (
                                            <img
                                                key={i}
                                                src={`${CLOUDINARY_BASE_URL}${img.publicId}.png`}
                                                alt={`Thumbnail ${i + 1}`}
                                                className={`thumbnail ${selectedImage === img.publicId ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSelectedImage(img.publicId);
                                                    const v = selectedProduct.variants.find(x => x.id === img.variantId);
                                                    if (v) { setSelectedVariant(v); setQuantity(1); }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-details">
                                    <h2 className="modal-title">{selectedProduct.name}</h2>
                                    <p className="modal-category">Danh mục: {selectedProduct.category}</p>
                                    <p className="modal-brand">Thương hiệu: {selectedProduct.brand}</p>
                                    <p className="modal-description">{selectedProduct.description}</p>
                                    <p className="modal-price modal-price-highlight" style={{ color: 'red', fontWeight: 600 }}>
                                        {selectedVariant.price ? `${selectedVariant.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                    </p>
                                    <div className="modal-variants">
                                        <h3>Phân loại</h3>
                                        <div className="variant-list">
                                            {selectedProduct.variants.map(v => (
                                                <label key={v.id} className="variant-item">
                                                    <input
                                                        type="radio" name="rec-variant"
                                                        checked={selectedVariant?.id === v.id}
                                                        onChange={() => { setSelectedVariant(v); setQuantity(1); }}
                                                    />
                                                    <span className="variant-label">{v.attribute} - {v.variant}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {selectedVariant?.quantity > 0 && (
                                        <div className="quantity-cart">
                                            <div className="quantity-controls">
                                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                                <span>{quantity}</span>
                                                <button onClick={() => setQuantity(q => q + 1)}>+</button>
                                            </div>
                                            <button className="add-to-cart" onClick={confirmAddToCart}>
                                                Thêm vào giỏ
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SUCCESS OVERLAY ──────────────────────────── */}
                {successOpen && (
                    <div className="success-overlay active" onClick={() => setSuccessOpen(false)}>
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

export default RecommendedProducts;
