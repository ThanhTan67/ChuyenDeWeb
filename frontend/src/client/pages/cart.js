
import React from 'react';
import Layout from '../components/layout/layout';
import CartTable from "../components/cart/cartitem";

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
import '../../assets/css/voucher-modal.css';

const CartPage = () => {
    return (
        <Layout>
            {/*<Breadcrumb title="Giỏ hàng" subtitle="Trang chủ"/>*/}
            <CartTable/>
        </Layout>
    );
};

export default CartPage;
