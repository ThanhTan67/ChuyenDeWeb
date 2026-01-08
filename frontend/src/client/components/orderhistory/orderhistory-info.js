import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../auth/authcontext";

const ORDER_API_URL = `${process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443'}/api/orders`;
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dp2jfvmlh/image/upload/';

const OrderHistory = () => {
    const { user, isLoggedIn,loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const [orderDetails, setOrderDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ordersPerPage = 5;

    const statusTabs = [
        { key: "ALL", label: "Tất cả" },
        { key: "PENDING", label: "Đang chờ xác nhận" },
        { key: "CONFIRMED", label: "Đã xác nhận" },
        { key: "ON_DELIVERY", label: "Đang giao" },
        { key: "DELIVERED", label: "Đã giao" },
        { key: "CANCELLED", label: "Đã hủy" },
    ];

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login', { state: { from: '/order-history' } });
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const endpoint = activeTab === "ALL"
                    ? `${ORDER_API_URL}`
                    : `${ORDER_API_URL}/status/${activeTab}`;

                const response = await axios.get(endpoint, {
                    withCredentials: true,
                    params: {
                        page: currentPage - 1,
                        size: ordersPerPage,
                    },
                });

                if (response.data.success) {
                    const data = response.data.data;
                    setOrders(data.content || []);
                    setTotalPages(data.totalPages || 1);

                    const detailsPromises = data.content.map(order =>
                        axios.get(`${ORDER_API_URL}/${order.id}/details`, {
                            withCredentials: true,
                        })
                    );
                    const detailsResponses = await Promise.all(detailsPromises);
                    const detailsMap = {};
                    detailsResponses.forEach((res, index) => {
                        if (res.data.success) {
                            detailsMap[data.content[index].id] = res.data.data;
                        }
                    });
                    setOrderDetails(detailsMap);
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                setError(error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, authLoading, navigate, activeTab, currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const calculateSubtotal = (items) => {
        return items.reduce(
            (total, item) => total + (item.productPrice * item.quantity),
            0
        );
    };

    const getDiscountValue = (order) => order.discountValue || order.discountAmount || 0;

    if (authLoading) {
        return (
            <section className="order_history_part padding_top" style={{ paddingTop: '80px' }}>
                <div className="container">
                    <div className="text-center">
                        <h2>Đang kiểm tra trạng thái đăng nhập...</h2>
                    </div>
                </div>
            </section>
        );
    }

    if (!user) {
        return null;
    }

    if (error) {
        return (
            <section className="order_history_part padding_top" style={{ paddingTop: '80px' }}>
                <div className="container">
                    <div className="text-center">
                        <h2>Không thể tải lịch sử đơn hàng</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="order_history_part padding_top" style={{ paddingTop: '80px' }}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="order_status_tabs">
                            <ul className="nav nav-tabs">
                                {statusTabs.map(tab => (
                                    <li className="nav-item" key={tab.key}>
                                        <button
                                            className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                                            onClick={() => {
                                                setActiveTab(tab.key);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center mt-4">
                        <h3>Không có đơn hàng nào trong trạng thái này</h3>
                    </div>
                ) : (
                    <>
                        {orders.map(order => (
                            <div key={order.id} className="order_section mt-4">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="confirmation_tittle"></div>
                                    </div>
                                    <div className="col-lg-6 col-lx-4">
                                        <div className="single_confirmation_details">
                                            <h4>Thông tin đặt hàng</h4>
                                            <ul>
                                                <li>
                                                    <p>Mã đơn hàng</p>
                                                    <span>{order.id}</span>
                                                </li>
                                                <li>
                                                    <p>Ngày đặt</p>
                                                    <span>{new Date(order.bookingDate).toLocaleString('vi-VN')}</span>
                                                </li>
                                                <li>
                                                    <p>Tổng thanh toán</p>
                                                    <span>{order.totalMoney.toLocaleString('vi-VN')}₫</span>
                                                </li>
                                                <li>
                                                    <p>Phương thức thanh toán</p>
                                                    <span>{order.paymentMethod}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="col-lg-6 col-lx-4">
                                        <div className="single_confirmation_details">
                                            <h4>Địa chỉ giao hàng</h4>
                                            <ul>
                                                <li>
                                                    <p>Người nhận</p>
                                                    <span>{order.consigneeName}</span>
                                                </li>
                                                <li>
                                                    <p>Số điện thoại</p>
                                                    <span>{order.consigneePhone}</span>
                                                </li>
                                                <li>
                                                    <p>Địa chỉ</p>
                                                    <span>{order.address}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="col-lg-6 col-lx-4">
                                        <div className="single_confirmation_details">
                                            <h4>Thông tin bổ sung</h4>
                                            <ul>
                                                <li>
                                                    <p>Ghi chú giao hàng</p>
                                                    <span>{order.orderNotes || 'Không có'}</span>
                                                </li>
                                                <li>
                                                    <p>Trạng thái đơn hàng</p>
                                                    <span style={{
                                                        color: order.orderStatus === 'CONFIRMED' ? 'green' :
                                                            order.orderStatus === 'PENDING' ? 'orange' :
                                                                order.orderStatus === 'ON_DELIVERY' ? 'blue' :
                                                                    order.orderStatus === 'DELIVERED' ? 'darkgreen' :
                                                                        order.orderStatus === 'CANCELLED' ? 'red' : 'inherit'
                                                    }}>
                                                        {order.orderStatus === 'CONFIRMED' ? 'Đã xác nhận' :
                                                            order.orderStatus === 'PENDING' ? 'Đang chờ xác nhận' :
                                                                order.orderStatus === 'ON_DELIVERY' ? 'Đang giao' :
                                                                    order.orderStatus === 'DELIVERED' ? 'Đã giao' :
                                                                        order.orderStatus === 'CANCELLED' ? 'Đã hủy' :
                                                                            order.orderStatus}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="order_details_iner">
                                            <table className="table table-borderless">
                                                <thead>
                                                <tr>
                                                    <th scope="col" colSpan="2" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>Sản phẩm</th>
                                                    <th scope="col" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>Số lượng</th>
                                                    <th scope="col" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>Tổng</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {orderDetails[order.id]?.map((item) => (
                                                    <tr key={item.id}>
                                                        <th colSpan="2" style={{color:'black',fontSize:'15px', textTransform:'none'}}>
                                                            <span>
                                                                {item.productName}
                                                                {(item.variantAttribute || item.variantName) && (
                                                                    <small style={{ display: 'block', color: '#666' }}>
                                                                        {item.variantAttribute} - {item.variantName}
                                                                    </small>
                                                                )}
                                                            </span>
                                                        </th>
                                                        <th style={{color:'#505050',fontSize:'15px', fontWeight:'bold',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>
                                                            x{item.quantity}
                                                        </th>
                                                        <th>
                                                            <span style={{color:'#505050',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>{(item.productPrice * item.quantity).toLocaleString('vi-VN')}₫</span>
                                                        </th>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <th colSpan="3" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>
                                                        Tạm tính
                                                    </th>
                                                    <th>
                                                        <span style={{color:'red',fontSize:'15px', fontWeight:'bold',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>{calculateSubtotal(orderDetails[order.id] || []).toLocaleString('vi-VN')}₫</span>
                                                    </th>
                                                </tr>
                                                {getDiscountValue(order) > 0 && (
                                                    <tr>
                                                        <th colSpan="3" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>
                                                            Giảm giá
                                                        </th>
                                                        <th>
                                                            <span style={{color:'#ff3900',fontSize:'15px', fontWeight:'bold',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>
                                                                -{getDiscountValue(order).toLocaleString('vi-VN')}₫
                                                            </span>
                                                        </th>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <th colSpan="3" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>
                                                        Phí vận chuyển
                                                    </th>
                                                    <th>
                                                        <span style={{color:'red',fontSize:'15px', fontWeight:'bold',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>{order.ship.toLocaleString('vi-VN')}₫</span>
                                                    </th>
                                                </tr>
                                                </tbody>
                                                <tfoot>
                                                <tr>
                                                    <th scope="col" colSpan="3" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>
                                                        Tổng tiền
                                                    </th>
                                                    <th scope="col" style={{color:'red',fontSize:'15px', fontWeight:'bold',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>
                                                        {order.totalMoney.toLocaleString('vi-VN')}₫
                                                    </th>
                                                </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <nav className="pagination">
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                        Trước
                                    </button>
                                </li>
                                {[...Array(totalPages).keys()].map(page => (
                                    <li key={page + 1} className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(page + 1)}>
                                            {page + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                        Sau
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </>
                )}
            </div>
        </section>
    );
};

export default OrderHistory;