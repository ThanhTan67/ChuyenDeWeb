import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from '../../../auth/authcontext';

const MAX_QUANTITY = 100;

const VoucherList = () => {
    const [vouchers, setVouchers] = useState([]);
    const [savedVouchers, setSavedVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isLoggedIn } = useAuth();
    const [alertMessage, setAlertMessage] = useState("");
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:8443";
    const prevQuantities = useRef({});

    useEffect(() => {
        const fetchVouchers = async () => {
            setLoading(true);
            try {
                const headers = {
                    "Content-Type": "application/json",
                    ...(isLoggedIn && { Authorization: `Bearer ${localStorage.getItem("token")}` }),
                };

                const voucherResponse = await fetch(`${API_BASE_URL}/api/vouchers/user`, {
                    method: "GET",
                    headers,
                    credentials: "include",
                });
                if (!voucherResponse.ok) throw new Error("Lỗi khi lấy danh sách voucher");
                const voucherData = await voucherResponse.json();
                if (voucherData.status === "success") {
                    const today = new Date().toISOString().split("T")[0];
                    const activeVouchers = (voucherData.data || []).filter(
                        (voucher) => voucher.endDate >= today && voucher.isActive
                    );
                    setVouchers(activeVouchers);
                }

                if (isLoggedIn) {
                    const savedResponse = await fetch(`${API_BASE_URL}/api/e-vouchers/user`, {
                        method: "GET",
                        headers,
                        credentials: "include",
                    });
                    if (!savedResponse.ok) throw new Error("Lỗi khi lấy danh sách voucher đã lưu");
                    const savedData = await savedResponse.json();
                    if (savedData.status === "success") {
                        setSavedVouchers(savedData.data || []);
                    }
                } else {
                    setSavedVouchers([]);
                }
            } catch (err) {
                setError(`Lỗi: ${err.message}`);
                setAlertMessage(`Lỗi: ${err.message}`);
                toast.error(`Lỗi: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchVouchers();
    }, [API_BASE_URL, isLoggedIn]);

    useEffect(() => {
        const q = {};
        vouchers.forEach(v => q[v.id] = v.quantity);
        prevQuantities.current = q;
    }, [vouchers]);

    const handleSaveVoucher = async (voucherId) => {
        if (!isLoggedIn) {
            setAlertMessage("Vui lòng đăng nhập để lưu voucher!");
            toast.warn("Vui lòng đăng nhập để lưu voucher!");
            return;
        }
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            };

            const checkResponse = await fetch(
                `${API_BASE_URL}/api/e-vouchers/check?voucherId=${voucherId}`,
                { method: "GET", headers, credentials: "include" }
            );
            const checkData = await checkResponse.json();
            if (checkData.status === "success" && checkData.data) {
                setAlertMessage("Bạn đã lưu voucher này rồi!");
                toast.warn("Bạn đã lưu voucher này rồi!");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/e-vouchers`, {
                method: "POST",
                headers,
                credentials: "include",
                body: JSON.stringify({ voucherId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Lỗi khi lưu voucher");
            }

            const data = await response.json();
            if (data.status === "success") {
                setAlertMessage("Lưu voucher thành công!");
                toast.success("Lưu voucher thành công!");

                const savedResponse = await fetch(`${API_BASE_URL}/api/e-vouchers/user`, {
                    method: "GET",
                    headers,
                    credentials: "include",
                });
                if (savedResponse.ok) {
                    const savedData = await savedResponse.json();
                    if (savedData.status === "success") {
                        setSavedVouchers(savedData.data || []);
                    }
                }

                setVouchers((prev) =>
                    prev.map((v) => (v.id === voucherId ? { ...v, quantity: v.quantity - 1 } : v))
                );
            }
        } catch (err) {
            setAlertMessage(`Lỗi: ${err.message}`);
            toast.error(`Lỗi: ${err.message}`);
        }
    };

    const allVoucherList = [
        ...vouchers.filter((voucher) => voucher.discountType?.id === 1),
        ...vouchers.filter((voucher) => voucher.discountType?.id === 2 && voucher.category),
        ...vouchers.filter((voucher) => voucher.discountType?.id === 3 && voucher.productVariantDTO)
    ];

    const getRemainPercent = (quantity) => {
        let percent = (quantity / MAX_QUANTITY) * 100;
        if (percent < 0) percent = 0;
        if (percent > 100) percent = 100;
        return percent;
    };

    // Lọc voucher: ẩn nếu đã lưu và usage_limit === 0
    const displayedVouchers = allVoucherList.filter((voucher) => {
        const saved = savedVouchers.find(sv => sv.id === voucher.id);
        if (saved && saved.usage_limit === 0) {
            return false;
        }
        return true;
    });

    return (
        <div className="voucher-container">
            <ToastContainer position="top-center" />
            {/*{alertMessage && (*/}
            {/*    <div*/}
            {/*        style={{*/}
            {/*            background: "#fffae6",*/}
            {/*            border: "1px solid #ffe58f",*/}
            {/*            color: "#ad6800",*/}
            {/*            padding: "10px",*/}
            {/*            borderRadius: "4px",*/}
            {/*            marginBottom: "16px",*/}
            {/*            textAlign: "center",*/}
            {/*            fontWeight: 500,*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        {alertMessage}*/}
            {/*        <button*/}
            {/*            onClick={() => setAlertMessage("")}*/}
            {/*            style={{*/}
            {/*                background: "none",*/}
            {/*                border: "none",*/}
            {/*                marginLeft: "12px",*/}
            {/*                color: "#ad6800",*/}
            {/*                cursor: "pointer",*/}
            {/*                fontSize: "16px"*/}
            {/*            }}*/}
            {/*            aria-label="Đóng"*/}
            {/*        >*/}
            {/*            ×*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*)}*/}

            {loading ? (
                <div className="voucher-loading">
                    <div className="voucher-spinner"></div>
                    <span>Đang tải...</span>
                </div>
            ) : (
                <>
                    <div className="voucher-group">
                        <div className="voucher-grid">
                            {displayedVouchers.map((voucher) => {
                                const isSaved = savedVouchers.some((sv) => sv.id === voucher.id);
                                const isOutOfStock = voucher.quantity <= 0;
                                const buttonText = isSaved ? "Đã lưu" : isOutOfStock ? "Đã hết mã" : "Lưu";
                                const isDisabled = isOutOfStock || isSaved;

                                let fromDate = voucher.startDate;
                                if (fromDate && fromDate.length === 10) {
                                    fromDate = fromDate.split('-').reverse().join('/');
                                }

                                const remainPercent = getRemainPercent(voucher.quantity);

                                return (
                                    <div key={voucher.id} className="voucher-image2-card">
                                        <div className="voucher-image2-row voucher-image2-top">
                                            <div className="voucher-image2-discount">
                                                Giảm {(voucher.discountPercentage || 0).toFixed(2)}%
                                            </div>
                                            <div className="voucher-image2-type">
                                                <i className="fa fa-tags" style={{ marginRight: 3 }} />
                                                {voucher.category?.name ||
                                                    voucher.productVariantDTO?.variant ||
                                                    "Toàn shop"}
                                            </div>
                                        </div>
                                        <div className="voucher-image2-code">
                                            {voucher.code}
                                        </div>
                                        <div className="voucher-image2-desc">
                                            Giảm tối đa: {voucher.maximumDiscount?.toLocaleString("vi-VN")} đ
                                        </div>
                                        <div className="voucher-image2-desc">
                                            Đơn tối thiểu: {voucher.minimumOrderValue?.toLocaleString("vi-VN")} đ
                                        </div>
                                        <div className="voucher-image2-desc">
                                            Có hiệu lực từ {fromDate}
                                        </div>

                                        <div style={{
                                            width: "90%",
                                            margin: "8px 0 0 0",
                                            height: "20px",
                                            position: "relative",
                                            overflow: "hidden",
                                            borderRadius: "12px",
                                            background: "#ededed",
                                            border: "1px solid rgb(240 240 240)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <div style={{
                                                position: "absolute",
                                                left: `${remainPercent}%`,
                                                top: 0,
                                                height: "100%",
                                                width: `${100 - remainPercent}%`,
                                                background: "#fff",
                                                transition: "width 0.7s cubic-bezier(.77,0,.18,1), left 0.7s cubic-bezier(.77,0,.18,1)",
                                                zIndex: 1
                                            }} />
                                            <div style={{
                                                width: "100%",
                                                textAlign: "center",
                                                position: "absolute",
                                                left: 0, top: 0, height: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                zIndex: 2,
                                                pointerEvents: "none"
                                            }}>
                                                <span style={{
                                                    fontSize: "12px",
                                                    color: "#989898",
                                                    fontWeight: 600,
                                                    background: "transparent",
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    Còn {voucher.quantity ?? 0}
                                                </span>
                                            </div>
                                            <div style={{
                                                position: "absolute",
                                                left: 0,
                                                top: 0,
                                                height: "100%",
                                                width: `${remainPercent}%`,
                                                background: "rgb(240 240 240)",
                                                transition: "width 0.7s cubic-bezier(.77,0,.18,1)",
                                                zIndex: 0
                                            }} />
                                        </div>

                                        <button
                                            onClick={() => handleSaveVoucher(voucher.id)}
                                            disabled={isDisabled}
                                            className={`voucher-image2-btn ${isDisabled ? "disabled" : ""}`}
                                            style={{ marginTop: 10 }}
                                        >
                                            {buttonText}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        {displayedVouchers.length === 0 && (
                            <p className="voucher-empty">Không có voucher nào đang hoạt động.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default VoucherList;