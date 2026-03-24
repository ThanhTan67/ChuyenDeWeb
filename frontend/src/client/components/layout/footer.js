import React, { useEffect } from 'react';
import Header from "./header";

const Footer = () => {
    // Tải và khởi tạo TuDongChat
    // useEffect(() => {
    //     const loadTuDongChatScript = () => {
    //         // Kiểm tra xem TuDongChat đã được tải chưa
    //         if (!window.TuDongChat) {
    //             const script = document.createElement("script");
    //             script.src = "https://app.tudongchat.com/js/chatbox.js";
    //             script.async = true;
    //             script.onload = () => {
    //                 // Khởi tạo TuDongChat sau khi script được tải
    //                 if (window.TuDongChat) {
    //                     const tudong_chatbox = new window.TuDongChat('uji6UjKEV-IRGqmCxmIpn');
    //                     tudong_chatbox.initial();
    //                 }
    //             };
    //             document.body.appendChild(script);
    //         } else {
    //             // Nếu TuDongChat đã được tải, khởi tạo ngay
    //             const tudong_chatbox = new window.TuDongChat('uji6UjKEV-IRGqmCxmIpn');
    //             tudong_chatbox.initial();
    //         }
    //     };
    //
    //     loadTuDongChatScript();
    //
    //     // Dọn dẹp script khi component bị hủy
    //     return () => {
    //         const scripts = document.querySelectorAll('script[src*="tudongchat.com"]');
    //         scripts.forEach(script => script.remove());
    //     };
    // }, []);

    return (
        <footer className="footer_part">
            <div className="container">
                <div className="row justify-content-around">
                    <div className="col-sm-6 col-lg-2">
                        <div className="single_footer_part">
                            <h4>Top Products</h4>
                            <ul className="list-unstyled">
                                <li>
                                    <a href="">Managed Website</a>
                                </li>
                                <li>
                                    <a href="">Manage Reputation</a>
                                </li>
                                <li>
                                    <a href="">Power Tools</a>
                                </li>
                                <li>
                                    <a href="">Marketing Service</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-2">
                        <div className="single_footer_part">
                            <h4>Quick Links</h4>
                            <ul className="list-unstyled">
                                <li>
                                    <a href="">Jobs</a>
                                </li>
                                <li>
                                    <a href="">Brand Assets</a>
                                </li>
                                <li>
                                    <a href="">Investor Relations</a>
                                </li>
                                <li>
                                    <a href="">Terms of Service</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-2">
                        <div className="single_footer_part">
                            <h4>Features</h4>
                            <ul className="list-unstyled">
                                <li>
                                    <a href="">Jobs</a>
                                </li>
                                <li>
                                    <a href="">Brand Assets</a>
                                </li>
                                <li>
                                    <a href="">Investor Relations</a>
                                </li>
                                <li>
                                    <a href="">Terms of Service</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-2">
                        <div className="single_footer_part">
                            <h4>Resources</h4>
                            <ul className="list-unstyled">
                                <li>
                                    <a href="">Guides</a>
                                </li>
                                <li>
                                    <a href="">Research</a>
                                </li>
                                <li>
                                    <a href="">Experts</a>
                                </li>
                                <li>
                                    <a href="">Agencies</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-4">
                        <div className="single_footer_part">
                            <h4>Newsletter</h4>
                            <p>Heaven fruitful doesn't over lesser in days. Appear creeping</p>
                            <div id="mc_embed_signup">
                                <form
                                    target="_blank"
                                    action="https://spondonit.us12.list-manage.com/subscribe/post?u=1462626880ade1ac87bd9c93a&id=92a4423d01"
                                    method="get"
                                    className="subscribe_form relative mail_part"
                                >
                                    <input
                                        type="email"
                                        name="email"
                                        id="newsletter-form-email"
                                        placeholder="Email Address"
                                        className="placeholder hide-on-focus"
                                        onFocus="this.placeholder = ''"
                                        onBlur="this.placeholder = ' Email Address '"
                                    />
                                    <button
                                        type="submit"
                                        name="submit"
                                        id="newsletter-submit"
                                        className="email_icon newsletter-submit button-contactForm"
                                    >
                                        subscribe
                                    </button>
                                    <div className="mt-10 info"/>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="copyright_part">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="copyright_text">
                                <p>
                                    {/* Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. */}
                                    Copyright © All rights reserved | This template is made with{" "}
                                    <i className="ti-heart" aria-hidden="true"/> by{" "}
                                    <a href="https://colorlib.com" target="_blank">
                                        Colorlib
                                    </a>
                                    {/* Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. */}
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="footer_icon social_icon">
                                <ul className="list-unstyled">
                                    <li>
                                        <a href="#" className="single_social_icon">
                                            <i className="fab fa-facebook-f"/>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="single_social_icon">
                                            <i className="fab fa-twitter"/>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="single_social_icon">
                                            <i className="fas fa-globe"/>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="single_social_icon">
                                            <i className="fab fa-behance"/>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;