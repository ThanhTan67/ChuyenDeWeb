import React from 'react';
import Layout from '../components/layout/layout';
import Breadcrumb from '../components/layout/breadcrumb';
import Confirmation from "../components/confirm/confirmorder";

// Import CSS
import '../../assets/css/bootstrap.min.css';
import '../../assets/css/animate.css';
import '../../assets/css/owl.carousel.min.css';
import '../../assets/css/all.css';
import '../../assets/css/nice-select.css';
import '../../assets/css/flaticon.css';
import '../../assets/css/themify-icons.css';
import '../../assets/css/magnific-popup.css';
import '../../assets/css/slick.css';
import '../../assets/css/price_rangs.css';
import '../../assets/css/style.css';

const ConfirmPage = () => {
    return (
        <Layout>
            <Breadcrumb title="Xác nhận đặt hàng" subtitle="Trang chủ"/>
            <Confirmation/>
        </Layout>
    );
};

export default ConfirmPage;
