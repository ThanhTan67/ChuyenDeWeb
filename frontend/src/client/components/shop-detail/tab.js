import React from 'react';
import ProductDescription from './productdescription';
import ProductSpecification from './productspecification';
import Comments from './comment';
import Reviews from './review';

const Tabs = () => {
    return (
        <section className="product_description_area">
            <div className="container">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item">
                        <a className="nav-link" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home"
                           aria-selected="true">Description</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile"
                           aria-selected="false">Specification</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" id="contact-tab" data-toggle="tab" href="#contact" role="tab" aria-controls="contact"
                           aria-selected="false">Comments</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link active" id="review-tab" data-toggle="tab" href="#review" role="tab" aria-controls="review"
                           aria-selected="false">Reviews</a>
                    </li>
                </ul>
                <div className="tab-content" id="myTabContent">
                    <ProductDescription />
                    <ProductSpecification />
                    <Comments />
                    <Reviews />
                </div>
            </div>
        </section>
    );
};

export default Tabs;