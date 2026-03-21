import React from 'react';

const CategoryCard = ({ image, quality, title }) => {
    return (
        <div className="single_feature_post_text">
            <p>{quality}</p>
            <h3>{title}</h3>
            <a href="#" className="feature_btn">
                EXPLORE NOW <i className="fas fa-play" />
            </a>
            <img src={image} alt={title} />
        </div>
    );
};

export default CategoryCard;