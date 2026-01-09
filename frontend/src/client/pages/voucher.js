import React from 'react';
import Layout from '../components/layout/layout';
import Breadcrumb from '../components/layout/breadcrumb';
import VoucherList from '../components/voucher/listvoucher';

// Import CSS
import '../../assets/css/bootstrap.min.css';
import '../../assets/css/animate.css';
import '../../assets/css/owl.carousel.min.css';
import '../../assets/css/all.css';
import '../../assets/css/flaticon.css';
import '../../assets/css/themify-icons.css';
import '../../assets/css/magnific-popup.css';
import '../../assets/css/slick.css';
import '../../assets/css/style.css';
import '../../assets/css/uvoucher.css';

const Voucher = () => {
    return (
        <Layout>
            <Breadcrumb title="Voucher" subtitle="Trang chủ" />
            <VoucherList />
        </Layout>
    );
};


export default Voucher;
