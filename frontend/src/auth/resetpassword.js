import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const ResetPassword = () => {
    const navigate = useNavigate();
    const token = new URLSearchParams(window.location.search).get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notify, setNotify] = useState("");
    const [success, setSuccess] = useState("");

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotify("");
        setSuccess("");

        if (!password || !confirmPassword) {
            setNotify("Vui lòng nhập đầy đủ mật khẩu.");
            return;
        }

        if (password !== confirmPassword) {
            setNotify("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const message = await res.text();

            if (res.ok) {
                setSuccess("Đặt lại mật khẩu thành công. Đang chuyển hướng...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setNotify(message);
            }
        } catch (error) {
            console.error("Reset error:", error);
            setNotify("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
    };

    return (
        <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{ maxWidth: "400px", width: "100%" }}>
                <div className="card-body">
                    <h4 className="card-title text-center mb-3">Đặt lại mật khẩu</h4>
                    <p className="text-center text-muted mb-4">
                        Nhập mật khẩu mới để tiếp tục
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Mật khẩu mới</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-lock-alt"></i>
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-lock-alt"></i>
                                </span>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Xác nhận mật khẩu"
                                    className="form-control"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {notify && <div className="alert alert-danger" role="alert">{notify}</div>}
                        {success && <div className="alert alert-success" role="alert">{success}</div>}

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                            >
                                Đặt lại mật khẩu
                            </button>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
