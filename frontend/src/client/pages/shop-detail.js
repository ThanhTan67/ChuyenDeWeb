import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '../components/layout/breadcrumb';
import ProductImage from '../components/shop-detail/productimage';
import ProductInfo from '../components/shop-detail/productinfor';
import Layout from '../components/layout/layout';
import BestSellers from "../components/home/bestsellers";
import ProductReview from "../components/shop-detail/review";

import '../../assets/css/style.css';
import '../../assets/css/product-info.css';
import '../../assets/css/success.css';
import '../../assets/css/productreview.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';

const ShopDetail = () => {
    const { t } = useTranslation();
    const { productId } = useParams();
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Fetch product details
    useEffect(() => {
        const numericProductId = Number(productId);
        if (isNaN(numericProductId) || numericProductId <= 0) return;

        const fetchProductDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/products/${numericProductId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                    },
                });
                if (!response.ok) throw new Error('Failed to fetch product');
                const data = await response.json();
                if (!data || !data.variants) throw new Error('Invalid product data');

                setProduct(data);
                const defaultVariant = data.variants.find(variant =>
                    variant.images.some(img => img.main)
                ) || data.variants[0];
                setSelectedVariant(defaultVariant);
                const mainImage = defaultVariant.images.find(img => img.main)?.publicId || defaultVariant.images[0]?.publicId;
                setSelectedImage(mainImage);
            } catch (err) {
                console.error('Error fetching product:', err);
            }
        };

        fetchProductDetails();
    }, [productId]);

    const handleVariantChange = useCallback((variant) => {
        if (variant?.id !== selectedVariant?.id) {
            setSelectedVariant(variant);
            const mainImage = variant.images.find(img => img.main)?.publicId || variant.images[0]?.publicId;
            setSelectedImage(mainImage);
        }
    }, [selectedVariant?.id]);

    const handleImageClick = useCallback((image) => {
        setSelectedImage(image.publicId);
        // Chỉ thay đổi variant nếu hình ảnh thuộc variant khác
        if (image.variantId !== selectedVariant?.id) {
            const newVariant = product.variants.find(v => v.id === image.variantId);
            if (newVariant) {
                setSelectedVariant(newVariant);
            }
        }
    }, [product, selectedVariant?.id]);

    if (!product) return null;

    return (
        <Layout>
            <Breadcrumb
                title={t('product_detail_title')}
                subtitle={t('home_subtitle')}
            />
            <div className="product_image_area section_padding">
                <div className="container">
                    <div className="row s_product_inner">
                        <div className="col-lg-7 col-xl-7">
                            <ProductImage
                                product={product}
                                variant={selectedVariant}
                                selectedImage={selectedImage}
                                onImageClick={handleImageClick}
                            />
                        </div>
                        <div className="col-lg-5 col-xl-4">
                            <ProductInfo
                                product={product} // Truyền product thay vì productId
                                selectedVariant={selectedVariant}
                                onVariantChange={handleVariantChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <ProductReview productId={Number(productId)} />
            <BestSellers />
        </Layout>
    );
};

export default ShopDetail;