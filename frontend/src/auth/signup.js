import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        passw: "",
        repassw: "",
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState({
        passw: false,
        repassw: false,
    });

    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const validateForm = () => {
        const newErrors = {};

        const emailRegex = /^\w+@\w+(\.\w+)+$/;
        const phoneRegex = /^0\d{9}$/;
        const passwordRegex = {
            length: /.{8,}/,
            upper: /[A-Z]/,
            lower: /[a-z]/,
            digit: /[0-9]/,
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        };

        if (!formData.name.trim()) {
            newErrors.name = "Vui lòng nhập tên";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email không đúng định dạng";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Vui lòng nhập số điện thoại";
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = "Số điện thoại sai định dạng";
        }

        const pass = formData.passw;
        if (!pass) {
            newErrors.passw = "Vui lòng nhập mật khẩu";
        } else if (!passwordRegex.length.test(pass)) {
            newErrors.passw = "Mật khẩu phải chứa ít nhất 8 kí tự";
        } else if (!passwordRegex.upper.test(pass)) {
            newErrors.passw = "Mật khẩu phải chứa ít nhất 1 chữ in hoa";
        } else if (!passwordRegex.lower.test(pass)) {
            newErrors.passw = "Mật khẩu phải chứa ít nhất 1 chữ thường";
        } else if (!passwordRegex.digit.test(pass)) {
            newErrors.passw = "Mật khẩu phải chứa ít nhất 1 số";
        } else if (!passwordRegex.special.test(pass)) {
            newErrors.passw = "Mật khẩu phải chứa ít nhất 1 kí tự đặc biệt";
        }

        if (!formData.repassw.trim()) {
            newErrors.repassw = "Vui lòng xác nhận mật khẩu";
        } else if (formData.repassw !== formData.passw) {
            newErrors.repassw = "Mật khẩu không trùng khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: formData.name,
                        password: formData.passw,
                        email: formData.email,
                        phone: formData.phone,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    // Nếu backend trả về nhiều lỗi
                    if (data.errors) {
                        // setErrors sẽ cập nhật đúng cho từng trường
                        setErrors(prev => ({
                            ...prev,
                            // map lại key cho khớp với field của form
                            name: data.errors.username,
                            email: data.errors.email,
                            phone: data.errors.phone,
                        }));
                    } else if (data.error) {
                        // alert("Đăng ký thất bại: " + data.error);
                    } else {
                        // alert("Đăng ký thất bại: " + JSON.stringify(data));
                    }
                    return;
                }

                localStorage.setItem("accessToken", data.accessToken);
                // alert("Đăng ký thành công!");
                navigate("/login");
            } catch (error) {
                console.error("Lỗi đăng ký:", error);
                alert("Đăng ký thất bại: " + error.message);
            }
        }
    };

    return (
        <section className="login-page">
            <div className="login-form">
                <div className="form-content">
                    <header>Đăng ký</header>
                    <form onSubmit={handleSubmit}>
                        <div className="field input-field">
                            <input
                                name="name"
                                type="text"
                                placeholder="Tên"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <span className="notify">{errors.name}</span>
                        </div>

                        <div className="field input-field">
                            <input
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <span className="notify">{errors.email}</span>
                        </div>

                        <div className="field input-field">
                            <input
                                name="phone"
                                type="tel"
                                placeholder="Số điện thoại"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <span className="notify">{errors.phone}</span>
                        </div>

                        <div className="field input-field">
                            <input
                                name="passw"
                                type={showPassword.passw ? "text" : "password"}
                                placeholder="Mật khẩu"
                                value={formData.passw}
                                onChange={handleChange}
                            />
                            <i
                                className={`bx ${showPassword.passw ? "bx-show" : "bx-hide"} eye-icon`}
                                onClick={() => togglePasswordVisibility("passw")}
                                style={{ cursor: "pointer" }}
                            ></i>
                            <span className="notify">{errors.passw}</span>
                        </div>

                        <div className="field input-field">
                            <input
                                name="repassw"
                                type={showPassword.repassw ? "text" : "password"}
                                placeholder="Xác nhận mật khẩu"
                                value={formData.repassw}
                                onChange={handleChange}
                            />
                            <i
                                className={`bx ${showPassword.repassw ? "bx-show" : "bx-hide"} eye-icon`}
                                onClick={() => togglePasswordVisibility("repassw")}
                                style={{ cursor: "pointer" }}
                            ></i>
                            <span className="notify">{errors.repassw}</span>
                        </div>

                        <div className="field button-field">
                            <button type="submit">Đăng ký</button>
                        </div>
                    </form>

                    <div className="form-link">
                        <span>
                            Bạn đã có tài khoản?{" "}
                            <Link to="/login" className="link login-link">
                                Đăng nhập
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;