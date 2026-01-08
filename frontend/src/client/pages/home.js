import React from 'react';
import Layout from '../components/layout/layout';
import Banner from '../components/home/banner';
import ProductList from '../components/home/productlist';
import WeeklyOffer from '../components/home/weeklyoffer';
import BestSellers from '../components/home/bestsellers';
import Newsletter from '../components/home/newsletter';
import ClientLogos from '../components/home/clientlogos';
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

const Home = () => {
    // const { t } = useTranslation();

    return (
        <Layout>
            <Banner />
            <ProductList />
            <WeeklyOffer />
            <BestSellers />
            <Newsletter />
            <ClientLogos />
        </Layout>
    );
};

export default Home;