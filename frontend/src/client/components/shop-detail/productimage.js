import React, { memo } from 'react';
import PropTypes from 'prop-types';

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dp2jfvmlh/image/upload/';

const ProductImage = ({ product, variant, selectedImage, onImageClick }) => {
    // Tạo danh sách tất cả hình ảnh từ các variant, loại bỏ trùng lặp dựa trên publicId
    const allImages = Array.from(
        new Map(
            product?.variants?.flatMap(variant =>
                variant.images?.map(image => ({
                    publicId: image.publicId,
                    mainImage: image.main,
                    variantId: variant.id,
                })) || []
            ).map(image => [image.publicId, image])
        ).values()
    );

    if (!product || !allImages.length) {
        return (
            <div className="modal-image">
                <img
                    src="/img/product/default.png"
                    alt="Default"
                    className="product-image"
                />
            </div>
        );
    }

    const mainImageUrl = selectedImage
        ? `${CLOUDINARY_BASE_URL}${selectedImage}.png`
        : `${CLOUDINARY_BASE_URL}${allImages[0].publicId}.png`;

    return (
        <div className="modal-image">
            <img
                style={{ height: '460px', width: '460px', transition: 'opacity 0.3s ease', borderRadius:'30px',border:'1px solid #f5f5f5' }}
                src={mainImageUrl}
                alt="Product"
                className="product-image"
            />
            <div className="thumbnail-container" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                {allImages.map((image, index) => (
                    <img
                        style={{
                            width: '80px',
                            height: '80px',
                            border: selectedImage === image.publicId ? '1px solid #4ce9d1' : '1px solid #ddd',
                            cursor: 'pointer',
                            transition: 'border 0.2s ease',
                        }}
                        key={`${image.publicId}-${index}`}
                        src={`${CLOUDINARY_BASE_URL}${image.publicId}.png`}
                        alt={`Thumbnail ${index + 1}`}
                        className="thumbnail"
                        onClick={() => onImageClick(image)}
                    />
                ))}
            </div>
        </div>
    );
};

ProductImage.propTypes = {
    product: PropTypes.shape({
        variants: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                images: PropTypes.arrayOf(
                    PropTypes.shape({
                        publicId: PropTypes.string,
                        main: PropTypes.bool,
                    })
                ),
            })
        ),
    }).isRequired,
    variant: PropTypes.shape({
        id: PropTypes.number,
        images: PropTypes.arrayOf(
            PropTypes.shape({
                publicId: PropTypes.string,
                main: PropTypes.bool,
            })
        ),
    }),
    selectedImage: PropTypes.string,
    onImageClick: PropTypes.func.isRequired,
};

export default memo(ProductImage, (prevProps, nextProps) => {
    return (
        prevProps.product === nextProps.product &&
        prevProps.variant?.id === nextProps.variant?.id &&
        prevProps.selectedImage === nextProps.selectedImage
    );
});