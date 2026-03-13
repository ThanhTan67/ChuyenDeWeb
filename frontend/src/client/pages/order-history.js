import React from 'react';
import Layout from '../components/layout/layout';
import Breadcrumb from '../components/layout/breadcrumb';
import OrderHistory from "../components/orderhistory/orderhistory-info";

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
import '../../assets/css/orderhistory.css';

const OrderHist = () => {
    return (
        <Layout>
            <Breadcrumb title="Đơn đã đặt" subtitle="Trang chủ"/>
            <OrderHistory/>
        </Layout>
    );
};

export default OrderHist;

