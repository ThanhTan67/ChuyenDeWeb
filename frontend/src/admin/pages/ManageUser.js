import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { toast } from "react-toastify";
import { useAuth } from "../../auth/authcontext";
import { useNavigate } from "react-router-dom";

const ManageUser = () => {
    const { user, isLoggedIn, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        roleName: 'ROLE_CLIENT'
    });
    const [formError, setFormError] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:8443";

    // Bảo vệ route + tránh logout khi reload
    useEffect(() => {
        if (authLoading) return;
        if (!isLoggedIn || !user) {
            navigate('/login');
            return;
        }
        const role = user.role || user.roleName;
        if (role !== 'ROLE_ADMIN' && role !== 'ADMIN') {
            navigate('/home');
        }
    }, [authLoading, isLoggedIn, user, navigate]);

    // Fetch users khi auth sẵn sàng
    useEffect(() => {
        if (authLoading || !isLoggedIn) return;

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/list`, { credentials: "include" });

                if (res.status === 401) {
                    navigate('/login');
                    return;
                }
                if (!res.ok) throw new Error('Lỗi tải người dùng');

                const data = await res.json();
                setUsers(data || []);
                setError(null);
            } catch (err) {
                setError("Không thể tải danh sách người dùng");
                toast.error("Lỗi tải người dùng");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [API_BASE_URL, authLoading, isLoggedIn, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newUser),
            });

            if (res.status === 401) {
                navigate('/login');
                return;
            }
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Lỗi thêm người dùng");
            }

            toast.success("Thêm người dùng thành công!");
            setShowModal(false);
            setNewUser({ username: '', email: '', password: '', phoneNumber: '', roleName: 'ROLE_CLIENT' });

            // Refresh danh sách
            const refreshRes = await fetch(`${API_BASE_URL}/api/admin/list`, { credentials: "include" });
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                setUsers(data || []);
            }
        } catch (err) {
            setFormError(err.message);
            toast.error(err.message);
        }
    };

    const handleDelete = async (userId, username) => {
        if (!window.confirm(`Bạn có chắc muốn xóa người dùng ${username}?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.status === 401) {
                navigate('/login');
                return;
            }
            if (!res.ok) throw new Error('Lỗi xóa người dùng');

            toast.success("Xóa người dùng thành công!");
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch {
            toast.error("Lỗi xóa người dùng");
        }
    };

    if (authLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-wrapper layout-content-navbar">
            <div className="layout-container">
                <Sidebar />
                <div className="layout-page">
                    <Navbar />
                    <div className="content-wrapper">
                        <div className="container-xxl flex-grow-1 container-p-y">
                            <h4 className="fw-bold py-3 mb-4">Quản lý Người dùng</h4>
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="card-title">Danh sách Người dùng</h5>
                                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                        Thêm người dùng
                                    </button>
                                </div>
                                <div className="card-body">
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    {loading ? (
                                        <div className="text-center">
                                            <div className="spinner-border" role="status">
                                                <span className="visually-hidden">Đang tải...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-striped table-bordered">
                                                <thead className="table-dark">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Tên người dùng</th>
                                                    <th>Email</th>
                                                    <th>Số điện thoại</th>
                                                    <th>Vai trò</th>
                                                    <th>Số lần đăng nhập thất bại</th>
                                                    <th>Khóa</th>
                                                    <th>Thời gian khóa</th>
                                                    <th style={{ width: '150px' }}>Hành động</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {users.length > 0 ? users.map(user => (
                                                    <tr key={user.id}>
                                                        <td>{user.id}</td>
                                                        <td>{user.username}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.phone || 'N/A'}</td>
                                                        <td>{user.role?.roleName || "N/A"}</td>
                                                        <td>{user.failed ?? 0}</td>
                                                        <td>{user.locked ? "Có" : "Không"}</td>
                                                        <td>{user.lockTime ? new Date(user.lockTime).toLocaleString("vi-VN") : "N/A"}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-primary me-2">Sửa</button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id, user.username)}>
                                                                Xóa
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="9" className="text-center">Không có người dùng nào</td>
                                                    </tr>
                                                )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Footer />
                        <div className="content-backdrop fade"></div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Thêm người dùng mới</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {formError && <div className="alert alert-danger">{formError}</div>}
                                    <div className="mb-3">
                                        <label className="form-label">Tên người dùng</label>
                                        <input type="text" className="form-control" name="username" value={newUser.username} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" name="email" value={newUser.email} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Số điện thoại</label>
                                        <input type="tel" className="form-control" name="phoneNumber" value={newUser.phoneNumber} onChange={handleInputChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Mật khẩu</label>
                                        <input type="password" className="form-control" name="password" value={newUser.password} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Vai trò</label>
                                        <select className="form-select" name="roleName" value={newUser.roleName} onChange={handleInputChange}>
                                            <option value="ROLE_CLIENT">Client</option>
                                            <option value="ROLE_ADMIN">Admin</option>
                                            <option value="ROLE_MANAGE_USER">Manage User</option>
                                            <option value="ROLE_MANAGE_ORDER">Manage Order</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn btn-primary">Thêm</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUser;