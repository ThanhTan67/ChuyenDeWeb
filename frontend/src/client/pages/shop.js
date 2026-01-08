import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/layout/layout';
import BestSellers from '../components/home/bestsellers';
import Breadcrumb from '../components/layout/breadcrumb';
import CategoryProductArea from '../components/shop/categoryproductarea';

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
import '../../assets/css/productgrid.css';
import '../../assets/css/success.css';

const Shop = () => {
    const { t } = useTranslation();

    return (
        <Layout>
            <Breadcrumb title={t('shop_title')} subtitle={t('home_subtitle')} />
            <CategoryProductArea />
            <BestSellers />
        </Layout>
    );
};

export default Shop;