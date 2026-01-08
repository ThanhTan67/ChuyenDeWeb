import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authcontext';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import DashboardContent from '../components/DashboardContent';
import Footer from '../components/layout/Footer';

export default function Dashboard() {
    const { user, isLoggedIn, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;                // Đợi auth restore xong
        if (!isLoggedIn || !user) {
            navigate('/login');
            return;
        }
        const role = user.role || user.roleName;
        if (role !== 'ROLE_ADMIN' && role !== 'ADMIN') {
            navigate('/home');
        }
    }, [authLoading, isLoggedIn, user, navigate]);

    if (authLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-wrapper layout-content-navbar">
            <div className="layout-container">
                <Sidebar />
                <div className="layout-page">
                    <Navbar />
                    <div className="content-wrapper">
                        <DashboardContent />
                        <Footer />
                        <div className="content-backdrop fade" />
                    </div>
                </div>
            </div>
        </div>
    );
}