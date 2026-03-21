import React from 'react';

const Socialicons = () => {
    return (
        <div className="footer_icon social_icon">
            <ul className="list-unstyled">
                <li>
                    <a href="#" className="single_social_icon">
                        <i className="fab fa-facebook-f" />
                    </a>
                </li>
                <li>
                    <a href="#" className="single_social_icon">
                        <i className="fab fa-twitter" />
                    </a>
                </li>
                <li>
                    <a href="#" className="single_social_icon">
                        <i className="fas fa-globe" />
                    </a>
                </li>
                <li>
                    <a href="#" className="single_social_icon">
                        <i className="fab fa-behance" />
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default Socialicons;