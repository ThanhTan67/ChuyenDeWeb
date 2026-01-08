import React from 'react';
import SubscriptionForm from '../common/subscriptionform';

const WeeklyOffer = () => {
    return (
        <section className="our_offer section_padding">
            <div className="container">
                <div className="row align-items-center justify-content-between">
                    <div className="col-lg-6 col-md-6">
                        <div className="offer_img">
                            <img src="/img/product_image/suaruamat_1.png" alt="" />
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                        <div className="offer_text">
                            <h2>Weekly Sale on 60% Off All Products</h2>
                            <div className="date_countdown">
                                <div id="timer">
                                    <div id="days" className="date" />
                                    <div id="hours" className="date" />
                                    <div id="minutes" className="date" />
                                    <div id="seconds" className="date" />
                                </div>
                            </div>
                            <SubscriptionForm buttonText="book now" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WeeklyOffer;