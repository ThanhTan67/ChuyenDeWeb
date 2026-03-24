import React from 'react';

const SubscriptionForm = ({ buttonText = "subscribe now", placeholder = "enter email address" }) => {
    return (
        <div className="input-group">
            <input
                type="text"
                className="form-control"
                placeholder={placeholder}
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
            />
            <div className="input-group-append">
                <a
                    href="#"
                    className="input-group-text btn_2"
                    id="basic-addon2"
                >
                    {buttonText}
                </a>
            </div>
        </div>
    );
};

export default SubscriptionForm;