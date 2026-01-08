import React from "react";

const Banner = () => {
    return (
        <section className="banner-section">
            <div className="banner-container">
                {/* BANNER TRÁI */}
                <div className="banner-left">
                    <div className="slide-content">
                        <div className="slide-text">
                            <p className="subtitle">100% Tự Nhiên</p>
                            <h1 className="title">Mỹ Phẩm Dưỡng Da Cao Cấp</h1>
                            <p className="description">
                                Khám phá các sản phẩm chăm sóc da từ thiên nhiên, an toàn và hiệu quả cho mọi loại da.
                            </p>
                            <button className="shop-button">MUA NGAY</button>
                        </div>
                        <div className="slide-img">
                            <img src="/img/product_image/kemduong_2.png" alt="Mỹ phẩm dưỡng da" />
                        </div>
                    </div>
                </div>

                {/* BANNER PHẢI */}
                <div className="banner-right">
                    <div className="offer-card green-card">
                        <div className="text">
                            <p className="percent">Giảm 20%</p>
                            <span className="label">KHUYẾN MÃI</span>
                            <h3 className="name">Sữa rửa mặt thiên nhiên</h3>
                            <a className="nav-link" href="#">Khám phá ngay →</a>
                        </div>
                        <img src="/img/product_image/suaruamat_2.png" alt="Sữa rửa mặt" />
                    </div>

                    <div className="offer-card pink-card">
                        <div className="text">
                            <p className="percent">Giảm 15%</p>
                            <span className="label">KHUYẾN MÃI</span>
                            <h3 className="name">Mặt nạ dưỡng ẩm</h3>
                            <a className="nav-link" href="#">Khám phá ngay →</a>
                        </div>
                        <img src="/img/product_image/matna_3.png" alt="Mặt nạ" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;
