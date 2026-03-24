import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function DashboardContent() {
    const [bestSellers, setBestSellers] = useState([]);
    const [totalSales, setTotalSales] = useState({ totalSales: 0, growthPercentage: 0 });
    const [salesByCategory, setSalesByCategory] = useState([]);
    const [loading, setLoading] = useState({ bestSellers: true, totalSales: true, salesByCategory: true });
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';
    const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dp2jfvmlh/image/upload/';

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/products/bestsellers?size=10`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}: Lỗi khi lấy danh sách sản phẩm bán chạy`);
                const data = await response.json();
                setBestSellers(data.products || []);
            } catch (err) {
                console.error('Lỗi khi lấy sản phẩm bán chạy:', err);
                toast.error('Không thể tải danh sách sản phẩm bán chạy.');
            } finally {
                setLoading(prev => ({ ...prev, bestSellers: false }));
            }
        };
        fetchBestSellers();
    }, [API_BASE_URL]);

    useEffect(() => {
        const fetchTotalSales = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/total-sales`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}: Lỗi khi lấy tổng doanh số`);
                const data = await response.json();
                setTotalSales(data.data || { totalSales: 0, growthPercentage: 0 });
            } catch (err) {
                console.error('Lỗi khi lấy tổng doanh số:', err);
                toast.error('Không thể tải tổng doanh số.');
            } finally {
                setLoading(prev => ({ ...prev, totalSales: false }));
            }
        };
        fetchTotalSales();
    }, [API_BASE_URL]);

    useEffect(() => {
        const fetchSalesByCategory = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/sales-by-category`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}: Lỗi khi lấy doanh số theo danh mục`);
                const data = await response.json();
                setSalesByCategory(data.data || []);
            } catch (err) {
                console.error('Lỗi khi lấy doanh số theo danh mục:', err);
                toast.error('Không thể tải doanh số theo danh mục.');
            } finally {
                setLoading(prev => ({ ...prev, salesByCategory: false }));
            }
        };
        fetchSalesByCategory();
    }, [API_BASE_URL]);

    return (
        <div className="content-body container-xxl flex-grow-1 container-p-y">
            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body text-center">
                            <h5 className="card-title fw-bold mb-3" style={{ fontSize: '1.5rem' }}>
                                Tổng doanh số bán được
                            </h5>
                            {loading.totalSales ? (
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                            ) : (
                                <>
                                    <h3 className="card-title mb-2 text-primary" style={{ fontSize: '2.5rem' }}>
                                        ${Number(totalSales.totalSales).toLocaleString()}
                                    </h3>
                                    <small className="text-success fw-semibold">
                                        <i className="bx bx-up-arrow-alt"></i> +{totalSales.growthPercentage}%
                                    </small>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header d-flex align-items-center justify-content-between pb-0">
                            <div className="card-title mb-0">
                                <h5 className="m-0 me-2 fw-bold" style={{ fontSize: '1.25rem' }}>
                                    Thống kê doanh số bán theo loại
                                </h5>
                                <small className="text-muted">Tổng: ${Number(totalSales.totalSales).toLocaleString()}</small>
                            </div>
                        </div>
                        <div className="card-body">
                            {loading.salesByCategory ? (
                                <div className="text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                </div>
                            ) : (
                                <ul className="p-0 m-0">
                                    {salesByCategory.length > 0 ? (
                                        salesByCategory.map((item, index) => (
                                            <li className="d-flex mb-3 pb-1" key={index}>
                                                <div className="avatar flex-shrink-0 me-3">
                                                    <img
                                                        src={`/assetsAdmin/img/icons/unicons/${
                                                            item.category.toLowerCase().includes('electronic')
                                                                ? 'paypal'
                                                                : item.category.toLowerCase().includes('fashion')
                                                                    ? 'cc-primary'
                                                                    : item.category.toLowerCase().includes('decor')
                                                                        ? 'wallet'
                                                                        : 'cc-warning'
                                                        }.png`}
                                                        alt={item.category}
                                                        className="rounded"
                                                    />
                                                </div>
                                                <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                                                    <div className="me-2">
                                                        <h6 className="mb-1 fw-semibold">{item.category}</h6>
                                                        <small className="text-muted">
                                                            {item.category.includes('Electronic') && 'Mobile, Earbuds, TV'}
                                                            {item.category.includes('Fashion') && 'T-shirt, Jeans, Shoes'}
                                                            {item.category.includes('Decor') && 'Fine Art, Dining'}
                                                            {item.category.includes('Sports') && 'Football, Cricket Kit'}
                                                        </small>
                                                    </div>
                                                    <div className="user-progress">
                                                        <small className="fw-semibold">${Number(item.sales).toLocaleString()}</small>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-center">Không có dữ liệu doanh số</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-8 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header pb-0">
                            <h5 className="m-0 me-2 fw-bold" style={{ fontSize: '1.25rem' }}>
                                10 sản phẩm bán chạy nhất
                            </h5>
                        </div>
                        <div className="card-body">
                            {loading.bestSellers ? (
                                <div className="text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered">
                                        <thead className="table-dark">
                                        <tr>
                                            <th style={{ width: '10%' }}>ID</th>
                                            <th style={{ width: '30%' }}>Tên sản phẩm</th>
                                            <th style={{ width: '20%' }}>Danh mục</th>
                                            <th style={{ width: '15%' }}>Giá</th>
                                            <th style={{ width: '15%' }}>Tồn kho</th>
                                            <th style={{ width: '10%' }}>Hình ảnh</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {bestSellers.length > 0 ? (
                                            bestSellers.map((product, index) => (
                                                <tr key={product.id || index}>
                                                    <td>{product.id}</td>
                                                    <td>{product.name}</td>
                                                    <td>{product.category || 'N/A'}</td>
                                                    <td>
                                                        {product.price.toLocaleString('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                        })}
                                                    </td>
                                                    <td>{product.stock || 0}</td>
                                                    <td>
                                                        {product.mainImageUrl ? (
                                                            <img
                                                                src={`${CLOUDINARY_BASE_URL}${product.mainImageUrl}.jpg`}
                                                                alt={product.name}
                                                                width="50"
                                                                className="me-2 mb-1 rounded"
                                                            />
                                                        ) : (
                                                            'Không có hình ảnh'
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    Không có sản phẩm nào
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="content-backdrop fade" />
        </div>
    );
}