import React from 'react';

const ProductCard = ({ title, price, image }) => {
    return (
        <div className="product-card">
            <div className="discount-badge">-30%</div>
            <div className="wishlist-icon">♡</div>
            <img src={image} alt={title} className="product-image" />
            <h3 className="product-name">{title}</h3>
            <div className="unit-rating">
                <span>1 UNIT</span>
                <span className="star">⭐ 4.5</span>
            </div>
            <div className="product-price">${price}</div>
            <div className="quantity-cart">
                <button>-</button>
                <span>1</span>
                <button>+</button>
                <span className="add-to-cart">Add to Cart</span>
            </div>
        </div>
    );
};

export default ProductCard;
