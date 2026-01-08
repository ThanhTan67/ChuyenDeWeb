import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../auth/authcontext";

const MAX_QUANTITY = 100;

const SavedVoucherList = () => {
    const { user, isLoggedIn, loading: authLoading } = useAuth();

    const [savedVouchers, setSavedVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");

    const prevQuantities = useRef({});

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:8443";

    // Fetch vouchers khi auth sẵn sàng
    useEffect(() => {
        if (authLoading) return;
        if (!isLoggedIn || !user) {
            setError("Vui lòng đăng nhập để xem voucher đã lưu!");
            toast.error("Vui lòng đăng nhập để xem voucher đã lưu!");
            setLoading(false);
            return;
        }

        const fetchSavedVouchers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/e-vouchers/user`, {
                    method: "GET",
                    credentials: "include",
                });

                if (res.status === 401) {
                    setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                    toast.error("Phiên đăng nhập hết hạn.");
                    return;
                }
                if (!res.ok) throw new Error("Lỗi khi lấy danh sách voucher đã lưu");

                const data = await res.json();
                if (data.status === "success") {
                    setSavedVouchers(data.data || []);
                } else {
                    throw new Error(data.message || "Lỗi dữ liệu");
                }
            } catch (err) {
                setError(`Lỗi: ${err.message}`);
                toast.error(`Lỗi: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedVouchers();
    }, [API_BASE_URL, authLoading, isLoggedIn, user]);

    useEffect(() => {
        const q = {};
        savedVouchers.forEach(v => (q[v.id] = v.quantity));
        prevQuantities.current = q;
    }, [savedVouchers]);

    const getRemainPercent = (quantity) => {
        let percent = (quantity / MAX_QUANTITY) * 100;
        if (percent < 0) percent = 0;
        if (percent > 100) percent = 100;
        return percent;
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.length !== 10) return dateStr;
        return dateStr.split('-').reverse().join('/');
    };

    if (authLoading || loading) {
        return (
            <div className="voucher-container">
                <div className="voucher-loading">
                    <div className="voucher-spinner"></div>
                    <span>Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="voucher-container">
            <ToastContainer />
            {alertMessage && (
                <div style={{
                    background: "#fffae6",
                    border: "1px solid #ffe58f",
                    color: "#ad6800",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "16px",
                    textAlign: "center",
                    fontWeight: 500,
                }}>
                    {alertMessage}
                    <button
                        onClick={() => setAlertMessage("")}
                        style={{
                            background: "none",
                            border: "none",
                            marginLeft: "12px",
                            color: "#ad6800",
                            cursor: "pointer",
                            fontSize: "16px",
                        }}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>
            )}
            {error ? (
                <p className="voucher-empty">{error}</p>
            ) : savedVouchers.length > 0 ? (
                <div className="voucher-group">
                    <div className="voucher-grid">
                        {savedVouchers.map(voucher => {
                            const remainPercent = getRemainPercent(voucher.quantity ?? 0);
                            return (
                                <div key={voucher.id} className="voucher-image2-card">
                                    <div className="voucher-image2-row voucher-image2-top">
                                        <div className="voucher-image2-discount">
                                            Giảm {(voucher.discountPercentage || 0).toFixed(2)}%
                                        </div>
                                        <div className="voucher-image2-type">
                                            <i className="fa fa-tags" style={{ marginRight: 3 }} />
                                            {voucher.category?.name || voucher.productVariantDTO?.variant || "Toàn shop"}
                                        </div>
                                    </div>
                                    <div className="voucher-image2-code">{voucher.code}</div>
                                    <div className="voucher-image2-desc">
                                        Giảm tối đa: {voucher.maximumDiscount?.toLocaleString("vi-VN")} đ
                                    </div>
                                    <div className="voucher-image2-desc">
                                        Đơn tối thiểu: {voucher.minimumOrderValue?.toLocaleString("vi-VN")} đ
                                    </div>
                                    <div className="voucher-image2-desc">
                                        Có hiệu lực từ {formatDate(voucher.startDate)}
                                    </div>
                                    <div className="voucher-image2-desc">
                                        Đến hết {formatDate(voucher.endDate)}
                                    </div>
                                    <div style={{
                                        width: "90%",
                                        margin: "8px 0 0 0",
                                        height: "20px",
                                        position: "relative",
                                        overflow: "hidden",
                                        borderRadius: "12px",
                                        background: "#ededed",
                                        border: "1px solid #e0e0e0",
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
                                            left: 0,
                                            top: 0,
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            zIndex: 2,
                                            pointerEvents: "none"
                                        }}>
                                            <span style={{
                                                fontSize: "12px",
                                                color: "#555",
                                                fontWeight: 600,
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
                                            background: "#ededed",
                                            transition: "width 0.7s cubic-bezier(.77,0,.18,1)",
                                            zIndex: 0
                                        }} />
                                    </div>
                                    <button disabled className="voucher-image2-btn disabled" style={{ marginTop: 10 }}>
                                        Đã lưu
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <p className="voucher-empty">Không có voucher nào đã lưu.</p>
            )}
        </div>
    );
};

export default SavedVoucherList;