import React from 'react';
import Layout from '../components/layout/layout';
import Breadcrumb from '../components/layout/breadcrumb';
import OrderInfo from "../components/order/orderinfor";

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
import '../../assets/css/modal.css';

const OrderPage = () => {
    return (
        <Layout>
            <Breadcrumb title="Đặt hàng" subtitle="Đặt hàng - Trang chủ"/>
            <OrderInfo/>
        </Layout>
    );
};

export default OrderPage;
