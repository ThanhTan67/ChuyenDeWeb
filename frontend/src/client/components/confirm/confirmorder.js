import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../auth/authcontext";

const PAYMENT_API_URL = `${process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443'}/api/payment`;
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dp2jfvmlh/image/upload/';

const Confirmation = () => {
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                if (authLoading) return;
                if (!user) {
                    navigate('/login', { state: { from: location.pathname } });
                    return;
                }

                let data;
                const txnRef = searchParams.get('txnRef');

                if (txnRef) {
                    const response = await axios.get(`${PAYMENT_API_URL}/order-details`, {
                        params: { txnRef: txnRef },
                        withCredentials: true
                    });

                    if (!response.data.success) {
                        throw new Error(response.data.message);
                    }

                    data = response.data.data;
                    setTransactionStatus({
                        success: response.data.data.order.orderStatus === 'CONFIRMED',
                        message: response.data.data.order.orderStatus === 'CONFIRMED'
                            ? 'Giao dịch thành công!'
                            : 'Giao dịch đang chờ xác nhận.'
                    });
                    setShowModal(true);
                    setTimeout(() => setShowModal(false), 5000);
                } else if (location.state?.order) {
                    data = {
                        order: location.state.order,
                        orderDateTime: location.state.orderDateTime,
                        selectedCartItems: location.state.selectedCartItems
                    };
                } else {
                    throw new Error("Không tìm thấy thông tin đơn hàng");
                }

                setOrderData(data);
            } catch (error) {
                setError(error.response?.data?.message || error.message);
                setTransactionStatus({
                    success: false,
                    message: error.response?.data?.message || 'Không thể tải thông tin đơn hàng'
                });
                setShowModal(true);
                setTimeout(() => setShowModal(false), 5000);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [user, authLoading, location.state, searchParams, navigate, location.pathname]);

    useEffect(() => {
        if (showModal) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [showModal]);

    if (authLoading) {
        return (
            <section className="confirmation_part padding_top" style={{ paddingTop: '80px' }}>
                <div className="container">
                    <div className="text-center">
                        <h2>Đang kiểm tra trạng thái đăng nhập...</h2>
                    </div>
                </div>
            </section>
        );
    }

    if (!user) return null;

    if (loading) {
        return (
            <section className="confirmation_part padding_top" style={{ paddingTop: '80px' }}>
                <div className="container">
                    <div className="text-center">
                        <h2>Đang tải thông tin đơn hàng...</h2>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !orderData) {
        return (
            <section className="confirmation_part padding_top" style={{ paddingTop: '80px' }}>
                <div className="container">
                    <div className="text-center">
                        <h2>Không thể tải thông tin đơn hàng</h2>
                        <p>{error || "Vui lòng thử lại sau"}</p>
                    </div>
                </div>
            </section>
        );
    }

    const { order, orderDateTime, selectedCartItems } = orderData;
    const discountValue = order.discountValue || order.discountAmount || 0;

    const calculateSubtotal = () => {
        return selectedCartItems.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );
    };

    return (
        <>
            {showModal && transactionStatus && (
                <div className="modal-overlay">
                    <div className="modal-contents">
                        <h2>
                            {transactionStatus.success ? 'Giao dịch thành công!' : 'Giao dịch thất bại'}
                        </h2>
                        <p>{transactionStatus.message}</p>
                        <div className="progress-bar-containers">
                            <div className="progress-bars"></div>
                        </div>
                    </div>
                </div>
            )}

            <section className="confirmation_part padding_top" style={{ paddingTop: '80px' }}>
                <div className="container" style={{ border: '1px solid #e8e8e8', borderRadius: '12px', padding: '20px' }}>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="confirmation_tittle">
                                <span>
                                    {order.orderStatus === 'CONFIRMED'
                                        ? 'Cảm ơn bạn đã đặt hàng. Đơn hàng đã được xác nhận!'
                                        : order.orderStatus === 'PENDING'
                                            ? 'Đơn hàng đang chờ xác nhận thanh toán.'
                                            : 'Cảm ơn bạn đã đặt hàng.'}
                                </span>
                            </div>
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
                                            {new Date(orderDateTime).toLocaleString('vi-VN')}
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
                                                order.orderStatus === 'PENDING' ? 'orange' : '#000',
                                            fontWeight: '600'
                                        }}>
                                            {order.orderStatus === 'CONFIRMED' ? 'Đã xác nhận' :
                                                order.orderStatus === 'PENDING' ? 'Đang chờ xác nhận' :
                                                    order.orderStatus}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bảng chi tiết sản phẩm */}
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="order_details_iner">
                                <table className="table table-borderless">
                                    <thead>
                                    <tr>
                                        <th scope="col" colSpan="2" style={{ textAlign: 'center', color: 'black', fontSize: '15px', fontWeight: '500',  textTransform: 'none' }}>
                                            Sản phẩm
                                        </th>
                                        <th scope="col" style={{ textAlign: 'center', color: 'black', fontSize: '15px', fontWeight: '500',  textTransform: 'none' }}>
                                            Số lượng
                                        </th>
                                        <th scope="col" style={{ textAlign: 'right', color: 'black', fontSize: '15px', fontWeight: '500',  textTransform: 'none' }}>
                                            Tổng
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {selectedCartItems.map((item) => (
                                        <tr key={item.productVariantId}>
                                            <td colSpan="2" style={{
                                                verticalAlign: 'middle',
                                                padding: '12px 8px',
                                                color: 'black',
                                                fontSize: '15px',
                                                textTransform: 'none'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <img
                                                        src={
                                                            item.mainImage
                                                                ? `${CLOUDINARY_BASE_URL}${item.mainImageUrl ||
                                                                item.imageUrl ||
                                                                item.additionalImageUrls?.[0]}.png`
                                                                : '/img/product/default.png'
                                                        }
                                                        alt={item.productName || 'Sản phẩm'}
                                                        style={{
                                                            width: '56px',
                                                            height: '56px',
                                                            objectFit: 'cover',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '500', lineHeight: '1.4', marginBottom: '4px' }}>
                                                            {item.productName}
                                                        </div>
                                                        {item.variant && (
                                                            <small style={{ display: 'block', color: '#666', fontSize: '13px' }}>
                                                                {item.attribute} {item.attribute && item.variant && '•'} {item.variant}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={{
                                                verticalAlign: 'middle',
                                                textAlign: 'center',
                                                color: '#505050',
                                                fontSize: '15px',
                                                fontWeight: 'bold',
                                                
                                                padding: '12px 8px'
                                            }}>
                                                x{item.quantity}
                                            </td>

                                            <td style={{
                                                verticalAlign: 'middle',
                                                textAlign: 'right',
                                                padding: '12px 8px'
                                            }}>
                                                    <span style={{
                                                        color: '#505050',
                                                        fontSize: '15px',
                                                        fontWeight: '500',
                                                        fontFamily: 'Poppins, sans-serif'
                                                    }}>
                                                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}

                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'right', color: 'black', fontSize: '15px', fontWeight: '500',  textTransform: 'none' }}>
                                            Tạm tính
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                                <span style={{ color: 'red', fontSize: '15px', fontWeight: 'bold',  textTransform: 'none' }}>
                                                    {calculateSubtotal().toLocaleString('vi-VN')}₫
                                                </span>
                                        </td>
                                    </tr>

                                    {discountValue > 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'right', color: 'black', fontSize: '15px', fontWeight: '500',  textTransform: 'none' }}>
                                                Giảm giá
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                    <span style={{ color: '#ff3900', fontSize: '15px', fontWeight: 'bold',  textTransform: 'none' }}>
                                                        -{discountValue.toLocaleString('vi-VN')}₫
                                                    </span>
                                            </td>
                                        </tr>
                                    )}

                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'right', color: 'black', fontSize: '15px', fontWeight: '500',  textTransform: 'none' }}>
                                            Phí vận chuyển
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                                <span style={{ color: 'red', fontSize: '15px', fontWeight: 'bold',  textTransform: 'none' }}>
                                                    {order.ship.toLocaleString('vi-VN')}₫
                                                </span>
                                        </td>
                                    </tr>
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'right', color: 'black', fontSize: '15px', fontWeight: '500',  textTransform: 'none' }}>
                                            Tổng tiền
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                                <span style={{ color: 'red', fontSize: '15px', fontWeight: 'bold',  textTransform: 'none' }}>
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
            </section>
        </>
    );
};

export default Confirmation;
