import React from 'react';
import SectionTitle from '../common/sectiontitle';
import CategoryCard from '../common/categorycard';

const FeaturedCategories = () => {
    return (
        <section className="feature_part padding_top">
            <div className="container">
                <SectionTitle title="Featured Category" />
                <div className="row align-items-center justify-content-between">
                    <div className="col-lg-7 col-sm-6">
                        <CategoryCard
                            quality="Premium Quality"
                            title="Latest foam Sofa"
                            image="/img/feature/feature_1.png"
                        />
                    </div>
                    <div className="col-lg-5 col-sm-6">
                        <CategoryCard
                            quality="Premium Quality"
                            title="Latest foam Sofa"
                            image="/img/feature/feature_2.png"
                        />
                    </div>
                    <div className="col-lg-5 col-sm-6">
                        <CategoryCard
                            quality="Premium Quality"
                            title="Latest foam Sofa"
                            image="/img/feature/feature_3.png"
                        />
                    </div>
                    <div className="col-lg-7 col-sm-6">
                        <CategoryCard
                            quality="Premium Quality"
                            title="Latest foam Sofa"
                            image="/img/feature/feature_4.png"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedCategories;
