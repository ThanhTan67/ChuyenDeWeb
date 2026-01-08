import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../../assets/css/voucher.css";
import { toast } from "react-toastify";
import { useAuth } from "../../auth/authcontext";
import { useNavigate } from "react-router-dom";

const ManageVoucher = () => {
    const { user, isLoggedIn, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [vouchers, setVouchers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [productVariants, setProductVariants] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:8443";

    const [newVoucher, setNewVoucher] = useState({
        code: "",
        discountType: { id: 1, type: "All" },
        discountPercentage: "",
        productVariantDTO: null,
        category: null,
        quantity: "",
        startDate: "",
        endDate: "",
        minimumOrderValue: "",
        maximumDiscount: "",
        isActive: true,
    });

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

    // Fetch categories & product variants
    useEffect(() => {
        if (authLoading || !isLoggedIn) return;

        const fetchDropdownData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/admin/category`, { credentials: "include" }),
                    fetch(`${API_BASE_URL}/api/admin/product-variants`, { credentials: "include" }),
                ]);

                if (catRes.status === 401 || prodRes.status === 401) {
                    navigate('/login');
                    return;
                }

                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData.status === "success" ? catData.data || [] : []);
                }
                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    setProductVariants(prodData.status === "success" ? prodData.data || [] : []);
                }
            } catch {
                toast.error("Lỗi tải danh mục hoặc sản phẩm");
            }
        };

        fetchDropdownData();
    }, [API_BASE_URL, authLoading, isLoggedIn, navigate]);

    // Fetch vouchers
    useEffect(() => {
        if (authLoading || !isLoggedIn) return;

        const fetchVouchers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/vouchers?page=${currentPage}&size=${pageSize}`, {
                    credentials: "include",
                });

                if (res.status === 401) {
                    navigate('/login');
                    return;
                }
                if (!res.ok) throw new Error("Lỗi tải voucher");

                const data = await res.json();
                if (data.status === "success") {
                    setVouchers(data.data.vouchers || []);
                    setTotalPages(data.data.totalPages || 0);
                    setError(null);
                }
            } catch {
                setError("Không thể tải danh sách voucher");
                toast.error("Lỗi tải voucher");
            } finally {
                setLoading(false);
            }
        };

        fetchVouchers();
    }, [API_BASE_URL, currentPage, authLoading, isLoggedIn, navigate]);

    const validateForm = () => {
        const errors = {};
        if (!newVoucher.code.trim()) errors.code = "Mã voucher không được để trống";

        const perc = parseFloat(newVoucher.discountPercentage);
        if (!perc || perc <= 0 || perc > 100) errors.discountPercentage = "Phần trăm giảm giá phải từ 0.01 đến 100";
        if (perc % 5 !== 0) errors.discountPercentage = "Phần trăm giảm giá phải là bội số của 5";

        const qty = parseInt(newVoucher.quantity);
        if (!qty || qty < 1) errors.quantity = "Số lượng phải lớn hơn 0";
        if (qty % 10 !== 0) errors.quantity = "Số lượng phải là bội số của 10";

        if (!newVoucher.startDate) errors.startDate = "Ngày bắt đầu là bắt buộc";
        if (!newVoucher.endDate) errors.endDate = "Ngày kết thúc là bắt buộc";
        if (newVoucher.endDate < newVoucher.startDate) errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";

        const minVal = parseFloat(newVoucher.minimumOrderValue);
        if (isNaN(minVal) || minVal < 0) errors.minimumOrderValue = "Giá trị tối thiểu phải ≥ 0";
        if (minVal % 20000 !== 0) errors.minimumOrderValue = "Giá trị tối thiểu phải là bội số của 20,000";

        const maxDisc = parseFloat(newVoucher.maximumDiscount);
        if (!maxDisc || maxDisc <= 0) errors.maximumDiscount = "Giảm tối đa phải lớn hơn 0";
        if (maxDisc % 20000 !== 0) errors.maximumDiscount = "Giảm tối đa phải là bội số của 20,000";

        if (newVoucher.discountType.id === 2 && !newVoucher.category) errors.category = "Vui lòng chọn danh mục";
        if (newVoucher.discountType.id === 3 && !newVoucher.productVariantDTO) errors.productVariantDTO = "Vui lòng chọn sản phẩm";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewVoucher(prev => {
            if (name === "discountType") {
                const id = parseInt(value);
                return {
                    ...prev,
                    discountType: { id, type: id === 1 ? "All" : id === 2 ? "Category" : "Product" },
                    category: id !== 2 ? null : prev.category,
                    productVariantDTO: id !== 3 ? null : prev.productVariantDTO,
                };
            }
            if (name === "isActive") return { ...prev, isActive: value === "true" };
            if (name === "category") {
                const cat = categories.find(c => c.id === parseInt(value));
                return { ...prev, category: cat ? { id: cat.id, name: cat.name } : null };
            }
            if (name === "productVariantDTO") {
                const prod = productVariants.find(p => p.id === parseInt(value));
                return {
                    ...prev,
                    productVariantDTO: prod ? {
                        id: prod.id,
                        productName: prod.productName,
                        attribute: prod.attribute,
                        variant: prod.variant,
                        price: prod.price,
                        quantity: prod.quantity,
                    } : null,
                };
            }
            return { ...prev, [name]: value };
        });
        setFormErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleNumericBlur = (e) => {
        const { name, value } = e.target;
        if (!value) return;
        let val = parseFloat(value);
        if (isNaN(val)) return;

        switch (name) {
            case "discountPercentage":
                val = Math.round(val / 5) * 5;
                if (val > 100) val = 100;
                if (val < 5) val = 5;
                break;
            case "quantity":
                val = Math.round(val / 10) * 10;
                if (val < 10) val = 10;
                break;
            case "minimumOrderValue":
                val = Math.round(val / 20000) * 20000;
                break;
            case "maximumDiscount":
                val = Math.round(val / 20000) * 20000;
                if (val < 20000) val = 20000;
                break;
            default:
                return;
        }
        setNewVoucher(prev => ({ ...prev, [name]: val.toString() }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/vouchers/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...newVoucher,
                    discountPercentage: parseFloat(newVoucher.discountPercentage),
                    quantity: parseInt(newVoucher.quantity),
                    minimumOrderValue: parseFloat(newVoucher.minimumOrderValue),
                    maximumDiscount: parseFloat(newVoucher.maximumDiscount),
                }),
            });

            if (res.status === 401) {
                navigate('/login');
                return;
            }
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Lỗi tạo voucher");
            }

            const data = await res.json();
            if (data.status === "success") {
                toast.success("Tạo voucher thành công!");
                setShowModal(false);
                resetForm();
                setVouchers(prev => [data.data, ...prev]);
            }
        } catch (err) {
            setFormErrors({ general: err.message });
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setNewVoucher({
            code: "",
            discountType: { id: 1, type: "All" },
            discountPercentage: "",
            productVariantDTO: null,
            category: null,
            quantity: "",
            startDate: "",
            endDate: "",
            minimumOrderValue: "",
            maximumDiscount: "",
            isActive: true,
        });
        setFormErrors({});
    };

    const handleCloseModal = (e) => {
        if (e.target.classList.contains("voucher-modal")) setShowModal(false);
    };

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) setCurrentPage(page);
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
                            <h4 className="fw-bold py-3 mb-4">Quản lý Voucher</h4>
                            <div className="voucher-card">
                                <div className="voucher-card-header">
                                    <h5 className="voucher-card-title">Danh sách Voucher</h5>
                                    <button className="voucher-btn voucher-btn-primary" onClick={() => setShowModal(true)}>
                                        Thêm Voucher
                                    </button>
                                </div>
                                <div className="voucher-card-body">
                                    {error && <div className="voucher-alert voucher-alert-danger">{error}</div>}
                                    {loading ? (
                                        <div className="voucher-loading">
                                            <div className="voucher-spinner"></div>
                                            <span>Đang tải...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="voucher-table-responsive">
                                                <table className="voucher-table table-striped table-bordered">
                                                    <thead className="table-dark">
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Mã</th>
                                                        <th>Loại Giảm Giá</th>
                                                        <th>Sản Phẩm/Loại</th>
                                                        <th>Phần Trăm Giảm</th>
                                                        <th>Số Lượng</th>
                                                        <th>Ngày Bắt Đầu</th>
                                                        <th>Ngày Kết Thúc</th>
                                                        <th>Giá Trị Tối Thiểu</th>
                                                        <th>Giảm Tối Đa</th>
                                                        <th>Trạng Thái</th>
                                                        <th>Hành Động</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {vouchers.length > 0 ? vouchers.map(voucher => {
                                                        const productVariant = voucher.discountType.id === 3 && voucher.productVariantDTO
                                                            ? productVariants.find(p => p.id === voucher.productVariantDTO.id)
                                                            : null;
                                                        return (
                                                            <tr key={voucher.id}>
                                                                <td>{voucher.id}</td>
                                                                <td>{voucher.code}</td>
                                                                <td>{voucher.discountType.type}</td>
                                                                <td>
                                                                    {voucher.discountType.id === 3 && productVariant
                                                                        ? `${productVariant.productName} - ${voucher.productVariantDTO.variant} (${voucher.productVariantDTO.attribute})`
                                                                        : voucher.discountType.id === 2 && voucher.category
                                                                            ? voucher.category.name
                                                                            : "N/A"}
                                                                </td>
                                                                <td>{voucher.discountPercentage}%</td>
                                                                <td>{voucher.quantity}</td>
                                                                <td>{voucher.startDate}</td>
                                                                <td>{voucher.endDate}</td>
                                                                <td>{voucher.minimumOrderValue.toLocaleString("vi-VN")} VNĐ</td>
                                                                <td>{voucher.maximumDiscount.toLocaleString("vi-VN")} VNĐ</td>
                                                                <td>{voucher.isActive ? "Hoạt động" : "Không hoạt động"}</td>
                                                                <td className="voucher-action-cell">
                                                                    <button className="voucher-btn voucher-btn-small voucher-btn-primary">Sửa</button>
                                                                    <button className="voucher-btn voucher-btn-small voucher-btn-danger">Xóa</button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }) : (
                                                        <tr>
                                                            <td colSpan="12" className="voucher-table-empty">Không có voucher nào</td>
                                                        </tr>
                                                    )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {totalPages > 1 && (
                                                <nav aria-label="Page navigation">
                                                    <ul className="pagination justify-content-center mt-3">
                                                        <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
                                                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Trước</button>
                                                        </li>
                                                        {[...Array(totalPages).keys()].map(p => (
                                                            <li key={p} className={`page-item ${currentPage === p ? "active" : ""}`}>
                                                                <button className="page-link" onClick={() => handlePageChange(p)}>{p + 1}</button>
                                                            </li>
                                                        ))}
                                                        <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
                                                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Sau</button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            )}
                                        </>
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
                <div className="voucher-modal" onClick={handleCloseModal}>
                    <div className="voucher-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="voucher-modal-header">
                            <h5 className="voucher-modal-title">Thêm Voucher Mới</h5>
                            <button className="voucher-modal-close" onClick={() => setShowModal(false)} disabled={isSubmitting}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="voucher-modal-body">
                                {formErrors.general && <div className="voucher-alert voucher-alert-danger">{formErrors.general}</div>}
                                <div className="voucher-form-grid">
                                    <div className="voucher-form-group">
                                        <label className="voucher-form-label">Mã Voucher <span className="voucher-required">*</span></label>
                                        <input type="text" className={`voucher-form-input ${formErrors.code ? "voucher-form-error" : ""}`} name="code" value={newVoucher.code} onChange={handleInputChange} placeholder="VD: SALE2025" disabled={isSubmitting} />
                                        {formErrors.code && <p className="voucher-form-error-text">{formErrors.code}</p>}
                                    </div>

                                    <div className="voucher-form-group">
                                        <label className="voucher-form-label">Loại Giảm Giá <span className="voucher-required">*</span></label>
                                        <select className="voucher-form-input" name="discountType" value={newVoucher.discountType.id} onChange={handleInputChange} disabled={isSubmitting}>
                                            <option value="1">Tất cả</option>
                                            <option value="2">Danh mục</option>
                                            <option value="3">Sản phẩm</option>
                                        </select>
                                    </div>

                                    {newVoucher.discountType.id === 2 && (
                                        <div className="voucher-form-group">
                                            <label className="voucher-form-label">Danh Mục <span className="voucher-required">*</span></label>
                                            <select className={`voucher-form-input ${formErrors.category ? "voucher-form-error" : ""}`} name="category" value={newVoucher.category?.id || ""} onChange={handleInputChange} disabled={isSubmitting}>
                                                <option value="">Chọn danh mục</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                            {formErrors.category && <p className="voucher-form-error-text">{formErrors.category}</p>}
                                        </div>
                                    )}

                                    {newVoucher.discountType.id === 3 && (
                                        <div className="voucher-form-group">
                                            <label className="voucher-form-label">Sản Phẩm <span className="voucher-required">*</span></label>
                                            <select className={`voucher-form-input ${formErrors.productVariantDTO ? "voucher-form-error" : ""}`} name="productVariantDTO" value={newVoucher.productVariantDTO?.id || ""} onChange={handleInputChange} disabled={isSubmitting}>
                                                <option value="">Chọn sản phẩm</option>
                                                {productVariants.map(prod => (
                                                    <option key={prod.id} value={prod.id}>
                                                        {prod.productName} - {prod.variant} ({prod.attribute})
                                                    </option>
                                                ))}
                                            </select>
                                            {formErrors.productVariantDTO && <p className="voucher-form-error-text">{formErrors.productVariantDTO}</p>}
                                        </div>
                                    )}

                                    <div className="voucher-form-group">
                                        <label className="voucher-form-label">Phần Trăm Giảm (%) <span className="voucher-required">*</span></label>
                                        <input type="number" className={`voucher-form-input ${formErrors.discountPercentage ? "voucher-form-error" : ""}`} name="discountPercentage" value={newVoucher.discountPercentage} onChange={handleInputChange} onBlur={handleNumericBlur} min="5" max="100" step="5" disabled={isSubmitting} />
                                        {formErrors.discountPercentage && <p className="voucher-form-error-text">{formErrors.discountPercentage}</p>}
                                    </div>

                                    <div className="voucher-form-group">
                                        <label className="voucher-form-label">Số Lượng <span className="voucher-required">*</span></label>
                                        <input type="number" className={`voucher-form-input ${formErrors.quantity ? "voucher-form-error" : ""}`} name="quantity" value={newVoucher.quantity} onChange={handleInputChange} onBlur={handleNumericBlur} min="10" step="10" disabled={isSubmitting} />
                                        {formErrors.quantity && <p className="voucher-form-error-text">{formErrors.quantity}</p>}
                                    </div>

                                    <div className="voucher-form-group">
                                        <label className="voucher-form-label">Ngày Bắt Đầu <span className="voucher-required">*</span></label>
                                        <input type="date" className={`voucher-form-input ${formErrors.startDate ? "voucher-form-error" : ""}`} name="startDate" value={newVoucher.startDate} onChange={handleInputChange} min={new Date().toISOString().split("T")[0]} disabled={isSubmitting} />
                                        {formErrors.startDate && <p className="voucher-form-error-text">{formErrors.startDate}</p>}
                                    </div>

                                    <div className="voucher-form-group">
                                        <label className="voucher-form-label">Ngày Kết Thúc <span className="voucher-required">*</span></label>
                                        <input type="date" className={`voucher-form-input ${formErrors.endDate ? "voucher-form-error" : ""}`} name="endDate" value={newVoucher.endDate} onChange={handleInputChange} min={newVoucher.startDate} disabled={isSubmitting} />
                                        {formErrors.endDate && <p className="voucher-form-error-text">{formErrors.endDate}</p>}
                                    </div>

                                    <div className="voucher-form-group">
                                        <label className="voucher-form-label">Giá Trị Tối Thiểu (VNĐ)</label>
                                        <input type="number" className={`voucher-form-input ${formErrors.minimumOrderValue ? "voucher-form-error" : ""}`} name="minimumOrderValue" value={newVoucher.minimumOrderValue} onChange={handleInputChange} onBlur={handleNumericBlur} min="0" step="20000" disabled={isSubmitting} />
                                        {formErrors.minimumOrderValue && <p className="voucher-form-error-text">{formErrors.minimumOrderValue}</p>}
                                    </div>

                                    <div className="voucher-form-group">
                                        <label className="voucher-form-label">Giảm Tối Đa (VNĐ) <span className="voucher-required">*</span></label>
                                        <input type="number" className={`voucher-form-input ${formErrors.maximumDiscount ? "voucher-form-error" : ""}`} name="maximumDiscount" value={newVoucher.maximumDiscount} onChange={handleInputChange} onBlur={handleNumericBlur} min="20000" step="20000" disabled={isSubmitting} />
                                        {formErrors.maximumDiscount && <p className="voucher-form-error-text">{formErrors.maximumDiscount}</p>}
                                    </div>

                                    <div className="voucher-form-group">
                                        <label className="voucher-form-label">Trạng Thái</label>
                                        <select className="voucher-form-input" name="isActive" value={newVoucher.isActive.toString()} onChange={handleInputChange} disabled={isSubmitting}>
                                            <option value="true">Hoạt động</option>
                                            <option value="false">Không hoạt động</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="voucher-modal-footer">
                                <button type="button" className="voucher-btn voucher-btn-secondary" onClick={resetForm} disabled={isSubmitting}>Xóa Form</button>
                                <div className="voucher-btn-group">
                                    <button type="button" className="voucher-btn voucher-btn-cancel" onClick={() => setShowModal(false)} disabled={isSubmitting}>Hủy</button>
                                    <button type="submit" className="voucher-btn voucher-btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? "Đang tạo..." : "Thêm"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageVoucher;