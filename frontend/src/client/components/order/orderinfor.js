import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/authcontext";

const ORDER_API_URL = `${process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443'}/api/orders`;
const PAYMENT_API_URL = `${process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443'}/api/payment`;

const OrderInfo = () => {
    const { user, refreshToken, isLoggedIn } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const selectedCartItems = location.state?.selectedCartItems || [];
    const appliedVoucher = location.state?.appliedVoucher || null;
    const discountAmount = location.state?.discountAmount || 0;

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [shippingFee, setShippingFee] = useState(0);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [formData, setFormData] = useState({
        name: "",
        number: "",
        address: "",
        message: "",
    });
    const [errors, setErrors] = useState({});

    const [showAllProducts, setShowAllProducts] = useState(false);

    const calculateTotalWeight = () => {
        return selectedCartItems.reduce((total, item) => {
            const match = item.variant?.match(/(\d+)\s*(ml|g|kg|mg)/i);
            if (match) {
                const [, value, unit] = match;
                const numValue = parseFloat(value);
                switch (unit.toLowerCase()) {
                    case 'kg': return total + numValue * item.quantity;
                    case 'g': return total + (numValue / 1000) * item.quantity;
                    case 'mg': return total + (numValue / 1000000) * item.quantity;
                    case 'ml': return total + (numValue / 1000) * item.quantity;
                    default: return total;
                }
            }
            return total;
        }, 0);
    };

    const calculateSubtotal = () => {
        return selectedCartItems.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );
    };

    const calculateTotal = () => {
        return calculateSubtotal() + shippingFee - (appliedVoucher ? discountAmount : 0);
    };

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch("https://provinces.open-api.vn/api/p/");
                if (!response.ok) throw new Error("Không thể tải danh sách tỉnh/thành phố");
                const data = await response.json();
                setProvinces(data);
            } catch (error) {
                setErrors(prev => ({ ...prev, api: error.message }));
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            const fetchDistricts = async () => {
                try {
                    const response = await fetch(
                        `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
                    );
                    if (!response.ok) throw new Error("Không thể tải danh sách quận/huyện");
                    const data = await response.json();
                    setDistricts(data.districts);
                    setWards([]);
                    setSelectedDistrict("");
                    setSelectedWard("");
                } catch (error) {
                    setErrors(prev => ({ ...prev, api: error.message }));
                }
            };
            fetchDistricts();
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            const fetchWards = async () => {
                try {
                    const response = await fetch(
                        `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
                    );
                    if (!response.ok) throw new Error("Không thể tải danh sách phường/xã");
                    const data = await response.json();
                    setWards(data.wards);
                    setSelectedWard("");
                } catch (error) {
                    setErrors(prev => ({ ...prev, api: error.message }));
                }
            };
            fetchWards();
        }
    }, [selectedDistrict]);

    useEffect(() => {
        const calculateShipping = async () => {
            if (selectedProvince && selectedDistrict && selectedWard && formData.address) {
                setIsCalculatingShipping(true);
                setShippingFee(0);
                try {
                    const provinceName = provinces.find(p => p.code === parseInt(selectedProvince))?.name;
                    const districtName = districts.find(d => d.code === parseInt(selectedDistrict))?.name;
                    const wardName = wards.find(w => w.code === parseInt(selectedWard))?.name;

                    if (provinceName && districtName && wardName) {
                        const response = await fetch(
                            `${process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443'}/api/shipping/fee`,
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({
                                    city: provinceName,
                                    district: districtName,
                                    ward: wardName,
                                    address: formData.address,
                                    weight: calculateTotalWeight() * 1000,
                                    value: calculateSubtotal()
                                })
                            }
                        );
                        if (!response.ok) throw new Error("Không thể tính phí vận chuyển");
                        const data = await response.json();
                        setShippingFee(data.shipping_fee || 0);
                    }
                } catch (error) {
                    setErrors(prev => ({
                        ...prev,
                        shipping: error.message || 'Không thể tính phí vận chuyển.'
                    }));
                    setShippingFee(0);
                } finally {
                    setIsCalculatingShipping(false);
                }
            } else {
                setShippingFee(0);
            }
        };
        calculateShipping();
    }, [selectedProvince, selectedDistrict, selectedWard, formData.address, provinces, districts, wards]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Vui lòng nhập tên người nhận";
        if (!formData.number) newErrors.number = "Vui lòng nhập số điện thoại";
        if (!/^[0-9]{10,11}$/.test(formData.number)) {
            newErrors.number = "Số điện thoại phải có 10 hoặc 11 chữ số";
        }
        if (!selectedProvince) newErrors.province = "Vui lòng chọn tỉnh/thành phố";
        if (!selectedDistrict) newErrors.district = "Vui lòng chọn quận/huyện";
        if (!selectedWard) newErrors.ward = "Vui lòng chọn phường/xã";
        if (!formData.address) newErrors.address = "Vui lòng nhập địa chỉ nhà";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login', { state: { from: '/order-confirm' } });
            return;
        }

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            await refreshToken(); // Làm mới token trước khi gửi yêu cầu

            const provinceName = provinces.find(p => p.code === parseInt(selectedProvince))?.name;
            const districtName = districts.find(d => d.code === parseInt(selectedDistrict))?.name;
            const wardName = wards.find(w => w.code === parseInt(selectedWard))?.name;

            const orderData = {
                consigneeName: formData.name,
                consigneePhone: formData.number,
                address: `${formData.address}, ${wardName}, ${districtName}, ${provinceName}`,
                orderNotes: formData.message,
                ship: shippingFee,
                discountValue: appliedVoucher ? discountAmount : 0,
                paymentId: paymentMethod === 'COD' ? 1 : paymentMethod === 'VNPAY' ? 2 : 3,
                voucherId: appliedVoucher ? appliedVoucher.id : null,
                orderDetails: selectedCartItems.map(item => ({
                    productVariantId: item.productVariantId || item.id,
                    quantity: item.quantity
                }))
            };

            if (paymentMethod === 'VNPAY') {
                const response = await fetch(`${PAYMENT_API_URL}/create-vnpay`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        amount: calculateTotal(),
                        orderId: Date.now().toString(),
                        orderData: orderData
                    })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Không thể tạo thanh toán VNPay');
                if (data.success) {
                    window.location.href = data.data.paymentUrl;
                } else {
                    setErrors(prev => ({
                        ...prev,
                        submit: data.message || 'Không thể tạo thanh toán VNPay.'
                    }));
                }
            } else {
                const response = await fetch(ORDER_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(orderData)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Đặt hàng thất bại');
                navigate('/confirm-order', {
                    state: {
                        order: data.data,
                        orderDateTime: new Date().toISOString(),
                        selectedCartItems
                    }
                });
            }
        } catch (error) {
            if (error.message.includes('401')) {
                navigate('/login', { state: { from: '/checkout' } });
            } else {
                setErrors(prev => ({
                    ...prev,
                    submit: error.message || 'Đặt hàng thất bại. Vui lòng thử lại.'
                }));
            }
        }
    };

    const MAX_DISPLAY = 4;
    const displayedItems = showAllProducts ? selectedCartItems : selectedCartItems.slice(0, MAX_DISPLAY);

    return (
        <section className="checkout_area padding_top" style={{ paddingTop: "80px" }}>
            <div className="container">
                <div className="billing_details">
                    <div className="row">
                        <div className="col-lg-7">
                            <h3>Thông tin đặt hàng</h3>
                            <form className="row contact_form" onSubmit={handleSubmit} noValidate>
                                <div className="col-md-6 form-group p_star">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Tên người nhận"
                                    />
                                    {errors.name && <span className="error">{errors.name}</span>}
                                </div>
                                <div className="col-md-6 form-group p_star">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="number"
                                        name="number"
                                        value={formData.number}
                                        onChange={handleInputChange}
                                        placeholder="Số điện thoại"
                                    />
                                    {errors.number && <span className="error">{errors.number}</span>}
                                </div>
                                <div className="col-md-12 form-group p_star">
                                    <select
                                        className="form-control country_select"
                                        value={selectedProvince}
                                        onChange={(e) => setSelectedProvince(e.target.value)}
                                    >
                                        <option value="">Chọn tỉnh/thành phố</option>
                                        {provinces.map((province) => (
                                            <option key={province.code} value={province.code}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.province && <span className="error">{errors.province}</span>}
                                </div>
                                <div className="col-md-12 form-group p_star">
                                    <select
                                        className="form-control country_select"
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        disabled={!selectedProvince}
                                    >
                                        <option value="">Chọn quận/huyện</option>
                                        {districts.map((district) => (
                                            <option key={district.code} value={district.code}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.district && <span className="error">{errors.district}</span>}
                                </div>
                                <div className="col-md-12 form-group p_star">
                                    <select
                                        className="form-control country_select"
                                        value={selectedWard}
                                        onChange={(e) => setSelectedWard(e.target.value)}
                                        disabled={!selectedDistrict}
                                    >
                                        <option value="">Chọn phường/xã</option>
                                        {wards.map((ward) => (
                                            <option key={ward.code} value={ward.code}>
                                                {ward.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.ward && <span className="error">{errors.ward}</span>}
                                </div>
                                <div className="col-md-12 form-group p_star">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Địa chỉ nhà"
                                    />
                                    {errors.address && <span className="error">{errors.address}</span>}
                                </div>
                                <div className="col-md-12 form-group">
                                    <h3>Ghi chú cho đơn hàng</h3>
                                    <textarea
                                        className="form-control"
                                        name="message"
                                        id="message"
                                        rows="4"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Ghi chú (nếu có)"
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="col-lg-5">
                            <div className="order_box">
                                <h2>Đơn hàng của bạn</h2>
                                <ul className="list">
                                    <li>
                                        <span href="#">
                                            Sản phẩm<span style={{marginLeft:'260px'}}>Tổng</span>
                                        </span>
                                    </li>
                                    {displayedItems.map((item) => (
                                        <li key={item.productVariantId || item.id}>
                                            <a href="#">
                                                {item.productName || item.name}
                                                {item.variant && (
                                                    <small style={{ display: 'block', color: '#666' }}>
                                                        {item.attribute} - {item.variant}
                                                    </small>
                                                )}
                                                <span className="middle">x {item.quantity}</span>
                                                <span className="last">
                                                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                    {selectedCartItems.length > MAX_DISPLAY && (
                                        <li style={{textAlign:'center', border:'none', background:'none', padding:0}}>
                                            <button
                                                type="button"
                                                className="btn btn-link"
                                                style={{fontWeight: 500, fontSize: 15, color: '#007bff', cursor: 'pointer'}}
                                                onClick={() => setShowAllProducts((s) => !s)}
                                            >
                                                {showAllProducts
                                                    ? <>Thu gọn <i className="ti-angle-up" style={{marginLeft: 5}}></i></>
                                                    : <>Xem thêm {selectedCartItems.length - MAX_DISPLAY} sản phẩm <i className="ti-angle-down" style={{marginLeft: 5}}></i></>
                                                }
                                            </button>
                                        </li>
                                    )}
                                </ul>
                                <ul className="list list_2">
                                    <li>
                                        <a href="#">
                                            Tổng khối lượng
                                            <span>{calculateTotalWeight().toFixed(3)} kg</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            Tạm tính
                                            <span>{calculateSubtotal().toLocaleString('vi-VN')}₫</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            Phí vận chuyển
                                            <span>
                                                {isCalculatingShipping
                                                    ? 'Đang tính...'
                                                    : shippingFee > 0
                                                        ? `${shippingFee.toLocaleString('vi-VN')}₫`
                                                        : 'Vui lòng nhập đầy đủ địa chỉ'}
                                            </span>
                                        </a>
                                        {errors.shipping && (
                                            <span className="error-message text-danger">
                                                {errors.shipping}
                                            </span>
                                        )}
                                    </li>
                                    {appliedVoucher && discountAmount > 0 && (
                                        <li>
                                            <a href="#">
                                                Giảm giá
                                                <span style={{ fontWeight: 'bold', color: '#ff3900' }}>
                                                    -{discountAmount.toLocaleString('vi-VN')}₫
                                                </span>
                                            </a>
                                        </li>
                                    )}
                                    <li>
                                        <a href="#">
                                            <strong>Tổng tiền</strong>
                                            <span className="total-amount">
                                                {calculateTotal().toLocaleString('vi-VN')}₫
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                                <div className="payment_item">
                                    <div className="radion_btn">
                                        <input
                                            type="radio"
                                            id="f-option4"
                                            name="payment"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="f-option4">Thanh toán khi nhận hàng (COD)</label>
                                        <div className="check"></div>
                                    </div>
                                    <div className="radion_btn">
                                        <input
                                            type="radio"
                                            id="f-option5"
                                            name="payment"
                                            value="VNPAY"
                                            checked={paymentMethod === 'VNPAY'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="f-option5">VN Pay</label>
                                        <div className="check"></div>
                                    </div>
                                    <div className="radion_btn">
                                        <input
                                            type="radio"
                                            id="f-option6"
                                            name="payment"
                                            value="Paypal"
                                            checked={paymentMethod === 'Paypal'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="f-option6">Paypal</label>
                                        <img src="img/product/single-product/card.jpg" alt="Paypal" />
                                        <div className="check"></div>
                                    </div>
                                </div>
                                <button
                                    className="btn_3"
                                    onClick={handleSubmit}
                                    disabled={isCalculatingShipping}
                                    style={{
                                        width: '100%',
                                        marginTop: '20px',
                                        opacity: isCalculatingShipping ? 0.7 : 1
                                    }}
                                >
                                    {isCalculatingShipping ? 'Đang xử lý...' : 'Thanh toán'}
                                </button>
                                {errors.submit && (
                                    <div className="error-message text-danger mt-3">
                                        {errors.submit}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OrderInfo;