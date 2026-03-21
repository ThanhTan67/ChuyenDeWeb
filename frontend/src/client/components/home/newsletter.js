import React from 'react';
import SubscriptionForm from '../common/subscriptionform';

const Newsletter = () => {
    return (
        <section className="subscribe_area section_padding">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-7">
                        <div className="subscribe_area_text text-center">
                            <h5>Join Our Newsletter</h5>
                            <h2>Subscribe to get Updated with new offers</h2>
                            <SubscriptionForm />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;