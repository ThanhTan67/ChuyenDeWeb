import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './auth/authcontext';
import { CartProvider } from "./client/contexts/cartcontext";
import Home from './client/pages/home';
import Shop from './client/pages/shop';
import ShopDetail from './client/pages/shop-detail';
import Login from './auth/login';
import Signup from './auth/signup';
import ForgotPassword from './auth/forgotpassword';
import CartPage from './client/pages/cart';
import ResetPassword from './auth/resetpassword';
import AccountInfo from "./auth/accountinfor";
import OrderPage from "./client/pages/order";
import ConfirmOrder from "./client/pages/confirm-order";
import OrderHist from "./client/pages/order-history";
import Voucher from "./client/pages/voucher";
import EVoucher from "./client/pages/evoucher";
import Dashboard from './admin/pages/Dashboard';
import ManageUser from './admin/pages/ManageUser';
import ManageProduct from './admin/pages/ManageProduct';
import ManageOrder from './admin/pages/ManageOrder';
import ManageVoucher from './admin/pages/ManageVoucher';
import Wishlist from "./client/components/home/Wishlist";
import ManageReview from "./admin/pages/ManageReview";
import i18n from "./i18n";

function App() {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID;

  useEffect(() => {
    if (!FACEBOOK_APP_ID) {
      console.error("Facebook App ID is not configured");
      return;
    }

    window.fbAsyncInit = function() {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      window.FB.AppEvents.logPageView();
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/vi_VN/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  if (!GOOGLE_CLIENT_ID) {
    console.error("Google Client ID is not configured");
    return <div>Error: Google Client ID is missing</div>;
  }

  return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <SpeedInsights />
              <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/shop" element={<Shop/>}/>
                <Route path="/shop-detail/:productId" element={<ShopDetail/>}/>
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/home" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/forgotpassword" element={<ForgotPassword/>}/>
                <Route path="/reset-password" element={<ResetPassword/>}/>
                <Route path="/cart" element={<CartPage/>}/>
                <Route path="/order" element={<OrderPage/>}/>
                <Route path="/confirm-order" element={<ConfirmOrder/>}/>
                <Route path="/order-history" element={<OrderHist/>}/>
                <Route path="/update-profile" element={<AccountInfo/>}/>
                <Route path="/voucher" element={<Voucher/>}/>
                <Route path="/evoucher" element={<EVoucher/>}/>
                <Route path="/admin" element={<Dashboard/>}/>
                <Route path="/admin/pages/manage-user" element={<ManageUser/>}/>
                <Route path="/admin/pages/manage-product" element={<ManageProduct/>}/>
                <Route path="/admin/pages/manage-order" element={<ManageOrder/>}/>
                <Route path="/admin/pages/manage-voucher" element={<ManageVoucher/>}/>
                <Route path="/admin/pages/manage-review" element={<ManageReview/>}/>
              </Routes>
            </Router>
          </CartProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
  );
}

export default App;