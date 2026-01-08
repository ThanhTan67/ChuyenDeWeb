import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../auth/authcontext";

const PAYMENT_API_URL = `${process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443'}/api/payment`;

const Confirmation = () => {
    const { user, isLoggedIn } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                if (!user) {
                    navigate('/login', { state: { from: location.pathname } });
                    return;
                }

                const txnRef = searchParams.get('txnRef');
                let data;

                if (txnRef) {
                    // Gọi API để lấy thông tin đơn hàng từ VNPay
                    const response = await axios.get(`${PAYMENT_API_URL}/vnpay-return`, {
                        params: { vnp_TxnRef: txnRef },
                        withCredentials: true
                    });
                    if (!response.data.success) {
                        throw new Error(response.data.message || `Không thể xử lý mã giao dịch ${txnRef}`);
                    }
                    data = response.data.data;
                    // Kiểm tra dữ liệu trả về
                    if (!data.order || !data.selectedCartItems) {
                        throw new Error("Dữ liệu đơn hàng không đầy đủ");
                    }
                } else if (location.state?.order) {
                    // Xử lý đơn hàng COD từ location state
                    data = {
                        order: location.state.order,
                        orderDateTime: location.state.orderDateTime || new Date().toISOString(),
                        selectedCartItems: location.state.selectedCartItems || []
                    };
                    if (!data.order || !data.selectedCartItems.length) {
                        throw new Error("Dữ liệu đơn hàng COD không hợp lệ");
                    }
                } else {
                    throw new Error("Không tìm thấy thông tin đơn hàng");
                }

                setOrderData(data);
            } catch (error) {
                console.error('Error fetching order data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [user, location.state, searchParams, navigate, location.pathname]);

    if (!user) {
        return null; // Sẽ chuyển hướng trong useEffect
    }

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
                        <button className="btn_1" onClick={() => navigate('/checkout')}>
                            Quay lại đặt hàng
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    const { order, orderDateTime, selectedCartItems } = orderData;

    const calculateSubtotal = () => {
        return selectedCartItems.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );
    };

    return (
        <section className="confirmation_part padding_top" style={{ paddingTop: '80px' }}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="confirmation_tittle">
                            <span>
                                {order.orderStatus === 'CONFIRMED'
                                    ? 'Cảm ơn bạn đã đặt hàng. Đơn hàng đã được xác nhận!'
                                    : order.orderStatus === 'PENDING'
                                        ? 'Đơn hàng đang chờ xác nhận thanh toán.'
                                        : order.orderStatus === 'FAILED'
                                            ? 'Thanh toán không thành công. Vui lòng thử lại.'
                                            : 'Cảm ơn bạn đã đặt hàng.'}
                            </span>
                        </div>
                    </div>

                    {/* Order Information */}
                    <div className="col-lg-6 col-lx-4">
                        <div className="single_confirmation_details">
                            <h4>Thông tin đặt hàng</h4>
                            <ul>
                                <li>
                                    <p>Mã đơn hàng</p>
                                    <span>{order.id || 'N/A'}</span>
                                </li>
                                <li>
                                    <p>Ngày đặt</p>
                                    <span>{new Date(orderDateTime).toLocaleString('vi-VN')}</span>
                                </li>
                                <li>
                                    <p>Tổng thanh toán</p>
                                    <span>{order.totalMoney?.toLocaleString('vi-VN') || '0'}₫</span>
                                </li>
                                <li>
                                    <p>Phương thức thanh toán</p>
                                    <span>{order.paymentMethod || 'Không xác định'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="col-lg-6 col-lx-4">
                        <div className="single_confirmation_details">
                            <h4>Địa chỉ giao hàng</h4>
                            <ul>
                                <li>
                                    <p>Người nhận</p>
                                    <span>{order.consigneeName || 'N/A'}</span>
                                </li>
                                <li>
                                    <p>Số điện thoại</p>
                                    <span>{order.consigneePhone || 'N/A'}</span>
                                </li>
                                <li>
                                    <p>Địa chỉ</p>
                                    <span>{order.address || 'N/A'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Additional Information */}
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
                                                order.orderStatus === 'FAILED' ? 'red' : 'inherit'
                                    }}>
                                        {order.orderStatus === 'CONFIRMED' ? 'Đã xác nhận' :
                                            order.orderStatus === 'PENDING' ? 'Đang chờ xác nhận' :
                                                order.orderStatus === 'FAILED' ? 'Thanh toán thất bại' :
                                                    order.orderStatus}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Order Details Table */}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="order_details_iner">
                            <h3>Sản phẩm đã đặt</h3>
                            <table className="table table-borderless">
                                <thead>
                                <tr>
                                    <th scope="col" colSpan="2">Sản phẩm</th>
                                    <th scope="col">Số lượng</th>
                                    <th scope="col">Tổng</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedCartItems.length > 0 ? (
                                    selectedCartItems.map((item) => (
                                        <tr key={item.productVariantId}>
                                            <th colSpan="2">
                                                <span>
                                                    {item.productName || 'N/A'}
                                                    {item.variant && (
                                                        <small style={{ display: 'block', color: '#666' }}>
                                                            {item.attribute} - {item.variant}
                                                        </small>
                                                    )}
                                                </span>
                                            </th>
                                            <th style={{color:'#212529', fontWeight:'bold', textTransform:'none'}}>
                                                x{item.quantity || 0}
                                            </th>
                                            <th>
                                                <span>{(item.price * (item.quantity || 0)).toLocaleString('vi-VN')}₫</span>
                                            </th>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center' }}>
                                            Không có sản phẩm nào trong đơn hàng
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <th colSpan="3" style={{color:'#212529', fontWeight:'bold', textTransform:'none'}}>
                                        Tạm tính
                                    </th>
                                    <th>
                                        <span>{calculateSubtotal().toLocaleString('vi-VN')}₫</span>
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan="3" style={{color:'#212529', fontWeight:'bold', textTransform:'none'}}>
                                        Phí vận chuyển
                                    </th>
                                    <th>
                                        <span>{order.ship?.toLocaleString('vi-VN') || '0'}₫</span>
                                    </th>
                                </tr>
                                </tbody>
                                <tfoot>
                                <tr>
                                    <th scope="col" colSpan="3" style={{color:'#212529', fontWeight:'bold', textTransform:'none'}}>
                                        Tổng tiền
                                    </th>
                                    <th scope="col" style={{color:'red'}}>
                                        {order.totalMoney?.toLocaleString('vi-VN') || '0'}₫
                                    </th>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Confirmation;