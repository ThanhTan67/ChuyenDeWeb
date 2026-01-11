import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../auth/authcontext";

const ORDER_API_URL = `${process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443'}/api/orders`;
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dp2jfvmlh/image/upload/';

const OrderHistory = () => {
    const { user, isLoggedIn, loading: authLoading } = useAuth();
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

                                    {/* Thông tin đặt hàng */}
                                    <div className="col-lg-6 col-xl-4">
                                        <div className="single_confirmation_details">
                                            <h4>Thông tin đặt hàng</h4>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                                                    <p style={{ margin: 0, width: '140px', fontWeight: '500', color: '#333' }}>Mã đơn hàng</p>
                                                    <span style={{ flex: 1, textAlign: 'right', color: '#000' }}>{order.id}</span>
                                                </li>
                                                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                                                    <p style={{ margin: 0, width: '140px', fontWeight: '500', color: '#333' }}>Ngày đặt</p>
                                                    <span style={{ flex: 1, textAlign: 'right', color: '#000' }}>
                                                        {new Date(order.bookingDate).toLocaleString('vi-VN')}
                                                    </span>
                                                </li>
                                                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                                                    <p style={{ margin: 0, width: '140px', fontWeight: '500', color: '#333' }}>Tổng thanh toán</p>
                                                    <span style={{ flex: 1, textAlign: 'right', color: '#e74c3c', fontWeight: '600' }}>
                                                        {order.totalMoney.toLocaleString('vi-VN')}₫
                                                    </span>
                                                </li>
                                                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <p style={{ margin: 0, width: '140px', fontWeight: '500', color: '#333' }}>Phương thức thanh toán</p>
                                                    <span style={{ flex: 1, textAlign: 'right', color: '#000' }}>{order.paymentMethod}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Địa chỉ giao hàng */}
                                    <div className="col-lg-6 col-xl-4">
                                        <div className="single_confirmation_details">
                                            <h4>Địa chỉ giao hàng</h4>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                                                    <p style={{ margin: 0, width: '140px', fontWeight: '500', color: '#333' }}>Người nhận</p>
                                                    <span style={{ flex: 1, textAlign: 'right', color: '#000' }}>{order.consigneeName}</span>
                                                </li>
                                                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                                                    <p style={{ margin: 0, width: '140px', fontWeight: '500', color: '#333' }}>Số điện thoại</p>
                                                    <span style={{ flex: 1, textAlign: 'right', color: '#000' }}>{order.consigneePhone}</span>
                                                </li>
                                                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <p style={{ margin: 0, width: '140px', fontWeight: '500', color: '#333' }}>Địa chỉ</p>
                                                    <span style={{ flex: 1, textAlign: 'right', color: '#000' }}>{order.address}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Thông tin bổ sung */}
                                    <div className="col-lg-6 col-xl-4">
                                        <div className="single_confirmation_details">
                                            <h4>Thông tin bổ sung</h4>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                                                    <p style={{ margin: 0, width: '140px', fontWeight: '500', color: '#333' }}>Ghi chú giao hàng</p>
                                                    <span style={{ flex: 1, textAlign: 'right', color: '#000' }}>{order.orderNotes || 'Không có'}</span>
                                                </li>
                                                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <p style={{ margin: 0, width: '140px', fontWeight: '500', color: '#333' }}>Trạng thái đơn hàng</p>
                                                    <span style={{
                                                        flex: 1,
                                                        textAlign: 'right',
                                                        color: order.orderStatus === 'CONFIRMED' ? 'green' :
                                                            order.orderStatus === 'PENDING' ? 'orange' :
                                                                order.orderStatus === 'ON_DELIVERY' ? 'blue' :
                                                                    order.orderStatus === 'DELIVERED' ? 'darkgreen' :
                                                                        order.orderStatus === 'CANCELLED' ? 'red' : '#000',
                                                        fontWeight: '600'
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
                                                    <th scope="col" colSpan="2" style={{ textAlign: 'center', color: 'black', fontSize: '15px', fontWeight: '500', , textTransform: 'none' }}>
                                                        Sản phẩm
                                                    </th>
                                                    <th scope="col" style={{ textAlign: 'center', color: 'black', fontSize: '15px', fontWeight: '500', , textTransform: 'none' }}>
                                                        Số lượng
                                                    </th>
                                                    <th scope="col" style={{ textAlign: 'right', color: 'black', fontSize: '15px', fontWeight: '500', , textTransform: 'none' }}>
                                                        Tổng
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {orderDetails[order.id]?.map((item) => (
                                                    <tr key={item.id}>
                                                        {/* Cột sản phẩm: ảnh + tên + variant */}
                                                        <td colSpan="2" style={{
                                                            verticalAlign: 'middle',
                                                            padding: '12px 8px',
                                                            color: 'black',
                                                            fontSize: '15px',
                                                            textTransform: 'none'
                                                        }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px'  // khoảng cách giữa ảnh và text
                                                            }}>
                                                                {/* Ảnh sản phẩm */}
                                                                <img
                                                                    src={
                                                                        item.mainImage
                                                                            ? `${CLOUDINARY_BASE_URL}${item.mainImage}.png`
                                                                            : '/img/product/default.png'
                                                                    }
                                                                    alt={item.productName || 'Sản phẩm'}
                                                                    style={{
                                                                        width: '56px',          // tăng nhẹ kích thước cho đẹp
                                                                        height: '56px',
                                                                        objectFit: 'cover',     // giữ tỷ lệ, không bị méo
                                                                        flexShrink: 0
                                                                    }}
                                                                />

                                                                {/* Tên sản phẩm + variant */}
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{
                                                                        fontWeight: '500',
                                                                        lineHeight: '1.4',
                                                                        marginBottom: '4px'
                                                                    }}>
                                                                        {item.productName}
                                                                    </div>

                                                                    {(item.variantAttribute || item.variantName) && (
                                                                        <small style={{
                                                                            display: 'block',
                                                                            color: '#666',
                                                                            fontSize: '13px'
                                                                        }}>
                                                                            {item.variantAttribute} {item.variantAttribute && item.variantName && '•'} {item.variantName}
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Số lượng */}
                                                        <td style={{
                                                            verticalAlign: 'middle',
                                                            textAlign: 'center',
                                                            color: '#505050',
                                                            fontSize: '15px',
                                                            fontWeight: 'bold',
                                                            ,
                                                            padding: '12px 8px'
                                                        }}>
                                                            x{item.quantity}
                                                        </td>

                                                        {/* Thành tiền */}
                                                        <td style={{
                                                            verticalAlign: 'middle',
                                                            textAlign: 'right',
                                                            padding: '12px 8px'
                                                        }}>
                                                                <span style={{
                                                                    color: '#505050',
                                                                    fontSize: '15px',
                                                                    fontWeight: '500',
                                                                    
                                                                }}>
                                                                    {(item.productPrice * item.quantity).toLocaleString('vi-VN')}₫
                                                                </span>
                                                        </td>
                                                    </tr>
                                                ))}

                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'right', color: 'black', fontSize: '15px', fontWeight: '500', , textTransform: 'none' }}>
                                                        Tạm tính
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                            <span style={{ color: 'red', fontSize: '15px', fontWeight: 'bold', , textTransform: 'none' }}>
                                                                {calculateSubtotal(orderDetails[order.id] || []).toLocaleString('vi-VN')}₫
                                                            </span>
                                                    </td>
                                                </tr>

                                                {getDiscountValue(order) > 0 && (
                                                    <tr>
                                                        <td colSpan="3" style={{ textAlign: 'right', color: 'black', fontSize: '15px', fontWeight: '500', , textTransform: 'none' }}>
                                                            Giảm giá
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                                <span style={{ color: '#ff3900', fontSize: '15px', fontWeight: 'bold', , textTransform: 'none' }}>
                                                                    -{getDiscountValue(order).toLocaleString('vi-VN')}₫
                                                                </span>
                                                        </td>
                                                    </tr>
                                                )}

                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'right', color: 'black', fontSize: '15px', fontWeight: '500', , textTransform: 'none' }}>
                                                        Phí vận chuyển
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                            <span style={{ color: 'red', fontSize: '15px', fontWeight: 'bold', , textTransform: 'none' }}>
                                                                {order.ship.toLocaleString('vi-VN')}₫
                                                            </span>
                                                    </td>
                                                </tr>
                                                </tbody>
                                                <tfoot>
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'right', color: 'black', fontSize: '15px', fontWeight: '500', , textTransform: 'none' }}>
                                                        Tổng tiền
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                            <span style={{ color: 'red', fontSize: '15px', fontWeight: 'bold', , textTransform: 'none' }}>
                                                                {order.totalMoney.toLocaleString('vi-VN')}₫
                                                            </span>
                                                    </td>
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



