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
                        message: response.data.data.order.orderStatus === 'CONFIRMED' ? 'Giao dịch thành công!' : 'Giao dịch đang chờ xác nhận.'
                    });
                    setShowModal(true);
                    setTimeout(() => {
                        setShowModal(false);
                    }, 5000);
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
                setTimeout(() => {
                    setShowModal(false);
                }, 5000);
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
        return () => {
            document.body.classList.remove('no-scroll');
        };
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

    if (!user) {
        return null;
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
                        <p>Vui lòng kiểm tra lại thông tin đơn hàng</p>
                        <div className="progress-bar-containers">
                            <div className="progress-bars"></div>
                        </div>
                    </div>
                </div>
            )}
            <section className="confirmation_part padding_top" style={{ paddingTop: '80px' }}>
                <div className="container" style={{border:'1px solid #e8e8e8', borderRadius:'12px', padding:'12px'}}>
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
                                        <span>{new Date(orderDateTime).toLocaleString('vi-VN')}</span>
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
                                                order.orderStatus === 'PENDING' ? 'orange' : 'inherit'
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

                    <div className="row">
                        <div className="col-lg-12">
                            <div className="order_details_iner">
                                <table className="table table-borderless">
                                    <thead>
                                    <tr>
                                        <th scope="col" colSpan="2" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none',}}>Sản phẩm</th>
                                        <th scope="col" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>Số lượng</th>
                                        <th scope="col" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>Tổng</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {selectedCartItems.map((item) => (
                                        <tr key={item.productVariantId}>
                                            <th colSpan="2" style={{color:'black',fontSize:'15px', textTransform:'none'}}>
                                                <span>
                                                    {item.productName}
                                                    {item.variant && (
                                                        <small style={{ display: 'block', color: '#666' }}>
                                                            {item.attribute} - {item.variant}
                                                        </small>
                                                    )}
                                                </span>
                                            </th>
                                            <th style={{color:'#505050',fontSize:'15px', fontWeight:'bold',fontFamily:'Poppins, sans-serif', textTransform:'none', }}>
                                                x{item.quantity}
                                            </th>
                                            <th>
                                                <span style={{color:'#505050',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                                            </th>
                                        </tr>
                                    ))}
                                    <tr>
                                        <th colSpan="3" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>
                                            Tạm tính
                                        </th>
                                        <th>
                                            <span style={{color:'red',fontSize:'15px', fontWeight:'bold',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>{calculateSubtotal().toLocaleString('vi-VN')}₫</span>
                                        </th>
                                    </tr>
                                    {discountValue > 0 && (
                                        <tr>
                                            <th colSpan="3" style={{color:'black',fontSize:'15px', fontWeight:'500',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>
                                                Giảm giá
                                            </th>
                                            <th>
                                                <span style={{color:'#ff3900',fontSize:'15px', fontWeight:'bold',fontFamily:'Poppins, sans-serif', textTransform:'none'}}>
                                                    -{discountValue.toLocaleString('vi-VN')}₫
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
            </section>
        </>
    );
};

export default Confirmation;