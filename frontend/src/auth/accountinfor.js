import { useAuth } from './authcontext';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./auth.css";

const AccountInfo = () => {
    const { user, loading, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
        phone: user?.phone || "",
    });
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:8443";

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                phone: user.phone || "",
            });
        }
    }, [user]);

    if (loading) return <div>Đang tải thông tin tài khoản...</div>;
    if (!user) return <div>Không có thông tin người dùng.</div>;

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);

        try {
            console.log("Gửi yêu cầu cập nhật với dữ liệu:", formData); // Debug
            const response = await fetch(`${API_BASE_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Gửi cookie chứa accessToken
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                console.log("Cập nhật thành công:", updatedUser); // Debug
                setUser({
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    role: updatedUser.role?.roleName || user.role,
                });
                setFormData({
                    username: updatedUser.username,
                    email: updatedUser.email,
                    phone: updatedUser.phone || "",
                });
                setIsEditing(false);
                toast.success("Cập nhật thông tin thành công!");
                navigate("/home");
            } else {
                const errorData = await response.json().catch(() => ({}));
                let errorMessage;

                switch (response.status) {
                    case 401:
                        errorMessage = "Không được phép: Vui lòng đăng nhập lại.";
                        break;
                    case 403:
                        errorMessage = errorData.message || "Không có quyền cập nhật thông tin.";
                        break;
                    case 409:
                        errorMessage = errorData.message || "Username hoặc email đã tồn tại.";
                        break;
                    case 400:
                        errorMessage = Object.values(errorData).join(", ") || "Dữ liệu không hợp lệ.";
                        break;
                    default:
                        errorMessage = errorData.message || "Lỗi không xác định.";
                }

                console.error("Cập nhật thất bại:", errorData, "Status:", response.status); // Debug
                toast.error(`Cập nhật thất bại: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật thông tin:", err);
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{ maxWidth: '450px', width: '100%',borderRadius:'8px',boxShadow:'0 0 10px 1px rgb(192, 192, 192)' }}>
                <div className="card-body">
                    <h4 className="card-title text-center mb-3">Thông tin tài khoản</h4>
                    <p className="text-center text-muted mb-4">
                        Xem và cập nhật thông tin cá nhân của bạn
                    </p>
                    {isEditing ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">Tên người dùng</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bx bx-user"></i>
                                    </span>
                                    <input
                                        id="username"
                                        type="text"
                                        name="username"
                                        placeholder="Nhập tên người dùng"
                                        className="form-control"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bx bx-envelope"></i>
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="Nhập email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="phone" className="form-label">Số điện thoại</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bx bx-phone"></i>
                                    </span>
                                    <input
                                        id="phone"
                                        type="text"
                                        name="phone"
                                        placeholder="Nhập số điện thoại"
                                        className="form-control"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={saving} style={{background:'#3472ac',border:'none'}}
                                >
                                    {saving ? "Đang lưu..." : "Lưu"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() => setIsEditing(false)}
                                    disabled={saving}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div className="mb-3">
                                <strong>Tên người dùng: </strong> {user.username}
                            </div>
                            <div className="mb-3">
                                <strong>Email: </strong> {user.email}
                            </div>
                            <div className="mb-3">
                                <strong>Số điện thoại: </strong> {user.phone || "Chưa cung cấp"}
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={() => setIsEditing(true)} style={{background:'#3472ac',border:'none'}}
                                >
                                    Cập nhật thông tin
                                </button>
                                <Link
                                    to="/home"
                                    className="btn btn-outline-secondary w-100"
                                >
                                    Trang chủ
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountInfo;