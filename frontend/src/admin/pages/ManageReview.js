import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/authcontext";
import { toast } from "react-toastify";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const ManageReview = () => {
    const { user, isLoggedIn, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [formError, setFormError] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:8443";
    const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dp2jfvmlh/image/upload/";

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

    // Fetch reviews khi auth sẵn sàng
    useEffect(() => {
        if (authLoading || !isLoggedIn) return;

        const fetchReviews = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/review`, { credentials: "include" });

                if (res.status === 401) {
                    navigate('/login');
                    return;
                }
                if (!res.ok) throw new Error('Lỗi tải review');

                const data = await res.json();
                setReviews(data || []);
                setError(null);
            } catch (err) {
                setError("Không thể tải danh sách review.");
                toast.error("Lỗi tải review.");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [API_BASE_URL, authLoading, isLoggedIn, navigate]);

    const handleAcceptReview = async (reviewId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/review/${reviewId}/accept`, {
                method: "PUT",
                credentials: "include",
            });

            if (res.status === 401) {
                navigate('/login');
                return;
            }
            if (!res.ok) throw new Error();

            const updated = await res.json();
            setReviews(prev => prev.map(r => r.id === reviewId ? updated : r));
            toast.success("Chấp nhận review thành công!");
        } catch {
            toast.error("Lỗi chấp nhận review.");
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        if (!replyText.trim()) {
            setFormError("Vui lòng nhập nội dung trả lời.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/review/${selectedReviewId}/reply`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(replyText),
            });

            if (res.status === 401) {
                navigate('/login');
                return;
            }
            if (!res.ok) throw new Error();

            const updated = await res.json();
            setReviews(prev => prev.map(r => r.id === selectedReviewId ? updated : r));
            toast.success("Trả lời review thành công!");
            setShowReplyModal(false);
            setReplyText("");
            setSelectedReviewId(null);
        } catch {
            setFormError("Lỗi trả lời review.");
            toast.error("Lỗi trả lời review.");
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
                            <h4 className="fw-bold py-3 mb-4">Quản lý Review</h4>
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title">Danh sách Review</h5>
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
                                                    <th>Tên người bình luận</th>
                                                    <th>SĐT</th>
                                                    <th>Sản phẩm ID</th>
                                                    <th>Điểm</th>
                                                    <th>Bình luận</th>
                                                    <th>Trả lời</th>
                                                    <th>Ngày tạo</th>
                                                    <th>Ngày trả lời</th>
                                                    <th>Trạng thái</th>
                                                    <th>Hình ảnh</th>
                                                    <th>Hành động</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {reviews.length > 0 ? reviews.map(review => (
                                                    <tr key={review.id}>
                                                        <td>{review.id}</td>
                                                        <td>{review.commenterName}</td>
                                                        <td>{review.phonenumberCommenter}</td>
                                                        <td>{review.productId}</td>
                                                        <td>{review.rating}</td>
                                                        <td>{review.comment}</td>
                                                        <td>{review.response || 'Chưa trả lời'}</td>
                                                        <td>{review.dateCreated ? new Date(review.dateCreated).toLocaleString("vi-VN") : 'N/A'}</td>
                                                        <td>{review.dateReply ? new Date(review.dateReply).toLocaleString("vi-VN") : 'N/A'}</td>
                                                        <td>{review.isAccept ? 'Đã chấp nhận' : 'Chưa chấp nhận'}</td>
                                                        <td>
                                                            {review.imageIds?.length > 0 ? review.imageIds.map((imgId, i) => (
                                                                <img key={i} src={`${CLOUDINARY_BASE_URL}${imgId}.png`} alt="Review" style={{ width: '50px', height: '50px', marginRight: '5px' }} />
                                                            )) : 'Không có'}
                                                        </td>
                                                        <td>
                                                            {!review.isAccept && (
                                                                <button className="btn btn-sm btn-success me-2 mb-2" onClick={() => handleAcceptReview(review.id)}>
                                                                    Chấp nhận
                                                                </button>
                                                            )}
                                                            <button className="btn btn-sm btn-primary" onClick={() => {
                                                                setSelectedReviewId(review.id);
                                                                setReplyText(review.response || "");
                                                                setShowReplyModal(true);
                                                            }}>
                                                                Trả lời
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="12" className="text-center">Không có review nào</td>
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

            {/* Modal trả lời */}
            {showReplyModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Trả lời Review</h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setShowReplyModal(false);
                                    setReplyText("");
                                    setSelectedReviewId(null);
                                }}></button>
                            </div>
                            <form onSubmit={handleReplySubmit}>
                                <div className="modal-body">
                                    {formError && <div className="alert alert-danger">{formError}</div>}
                                    <label className="form-label">Nội dung trả lời</label>
                                    <textarea className="form-control" rows="6" value={replyText} onChange={e => setReplyText(e.target.value)} required />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => {
                                        setShowReplyModal(false);
                                        setReplyText("");
                                        setSelectedReviewId(null);
                                    }}>Hủy</button>
                                    <button type="submit" className="btn btn-primary">Gửi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageReview;