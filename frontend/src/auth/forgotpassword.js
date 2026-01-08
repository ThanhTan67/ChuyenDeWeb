import React, { useState } from "react";
import "./auth.css";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [notify, setNotify] = useState("");
    const [success, setSuccess] = useState("");

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotify("");
        setSuccess("");

        if (!email.trim()) {
            setNotify("Vui lòng nhập email của bạn.");
            return;
        }

        if (!isValidEmail(email)) {
            setNotify("Email không đúng định dạng.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    frontendUrl: window.location.origin, // gửi đường dẫn FE
                }),
            });

            const data = await res.text();

            if (res.ok) {
                setSuccess(data || "Đã gửi email đặt lại mật khẩu.");
            } else {
                setNotify(data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setNotify("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
        }
    };

    return (
        <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{ maxWidth: '450px', width: '100%',borderRadius:'8px',boxShadow:'0 0 10px 1px rgb(192, 192, 192)' }}>
                <div className="card-body">
                    <h4 className="card-title text-center mb-3">Quên mật khẩu</h4>
                    <p className="text-center text-muted mb-4">
                        Vui lòng nhập email để đặt lại mật khẩu
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-envelope"></i>
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {notify && <div className="alert alert-danger" role="alert">{notify}</div>}
                        {success && <div className="alert alert-success" role="alert">{success}</div>}

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary w-100" style={{background:'#3472ac',border:'none'}}
                            >
                                Gửi liên kết
                            </button>
                            <Link
                                to="/login"
                                className="btn btn-outline-secondary w-100"
                            >
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;