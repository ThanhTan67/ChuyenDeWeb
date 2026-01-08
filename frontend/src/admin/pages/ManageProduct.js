import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../auth/authcontext";
import { toast } from "react-toastify";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const ManageProduct = () => {
    const { user, isLoggedIn, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        brand: "",
        category: "",
        variants: [{ attribute: "", variant: "", price: "", quantity: "", images: [] }],
    });
    const [formError, setFormError] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:8443";
    const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dp2jfvmlh/image/upload/";

    // Bảo vệ route admin + tránh logout khi reload
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

    // Fetch brands & categories
    useEffect(() => {
        if (authLoading || !isLoggedIn) return;

        const fetchBrandsAndCategories = async () => {
            try {
                const [brandsRes, categoriesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/admin/brands`, { credentials: "include" }),
                    fetch(`${API_BASE_URL}/api/admin/categories`, { credentials: "include" }),
                ]);

                if (brandsRes.status === 401 || categoriesRes.status === 401) {
                    navigate('/login');
                    return;
                }

                if (!brandsRes.ok || !categoriesRes.ok) throw new Error('Lỗi tải dữ liệu');

                const brandsData = await brandsRes.json();
                const categoriesData = await categoriesRes.json();
                setBrands(brandsData || []);
                setCategories(categoriesData || []);
            } catch (err) {
                toast.error("Không thể tải thương hiệu hoặc danh mục.");
            }
        };

        fetchBrandsAndCategories();
    }, [API_BASE_URL, authLoading, isLoggedIn, navigate]);

    // Fetch products
    useEffect(() => {
        if (authLoading || !isLoggedIn) return;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/products?page=${currentPage}&size=6`, {
                    credentials: "include",
                });

                if (res.status === 401) {
                    navigate('/login');
                    return;
                }
                if (!res.ok) throw new Error('Lỗi tải sản phẩm');

                const data = await res.json();
                setProducts(data.products || []);
                setTotalPages(data.totalPages || 0);
                setError(null);
            } catch (err) {
                setError("Không thể tải danh sách sản phẩm.");
                toast.error("Lỗi tải sản phẩm.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [API_BASE_URL, currentPage, authLoading, isLoggedIn, navigate]);

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) setCurrentPage(page);
    };

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        if (name.startsWith("variants")) {
            const updated = [...newProduct.variants];
            const field = name.split(".")[1];
            updated[index][field] = value;
            setNewProduct({ ...newProduct, variants: updated });
        } else {
            setNewProduct({ ...newProduct, [name]: value });
        }
    };

    const handleImageChange = (e, index) => {
        const files = Array.from(e.target.files);
        const updated = [...newProduct.variants];
        updated[index].images = files;
        setNewProduct({ ...newProduct, variants: updated });
    };

    const handleAddVariant = () => {
        setNewProduct({
            ...newProduct,
            variants: [...newProduct.variants, { attribute: "", variant: "", price: "", quantity: "", images: [] }],
        });
    };

    const handleRemoveVariant = (index) => {
        setNewProduct({
            ...newProduct,
            variants: newProduct.variants.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        const formData = new FormData();
        formData.append("name", newProduct.name);
        formData.append("description", newProduct.description);
        formData.append("brand", newProduct.brand);
        formData.append("category", newProduct.category);

        newProduct.variants.forEach((v, i) => {
            formData.append(`variants[${i}].attribute`, v.attribute);
            formData.append(`variants[${i}].variant`, v.variant);
            formData.append(`variants[${i}].price`, v.price);
            formData.append(`variants[${i}].quantity`, v.quantity);
            v.images.forEach(img => formData.append(`variants[${i}].images`, img));
        });

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (res.status === 401) {
                navigate('/login');
                return;
            }
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Lỗi thêm sản phẩm');
            }

            toast.success("Thêm sản phẩm thành công!");
            setShowModal(false);
            setNewProduct({
                name: "", description: "", brand: "", category: "",
                variants: [{ attribute: "", variant: "", price: "", quantity: "", images: [] }],
            });

            // Refresh list
            const refreshRes = await fetch(`${API_BASE_URL}/api/admin/products?page=${currentPage}&size=6`, { credentials: "include" });
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                setProducts(data.products || []);
                setTotalPages(data.totalPages || 0);
            }
        } catch (err) {
            setFormError(err.message);
            toast.error(err.message);
        }
    };

    const variantRows = products.flatMap(p =>
        p.variants?.length > 0 ? p.variants.map(v => ({ product: p, variant: v })) : [{ product: p, variant: null }]
    );

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
                            <h4 className="fw-bold py-3 mb-4">Quản lý Sản phẩm</h4>
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="card-title">Danh sách Sản phẩm</h5>
                                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                        Thêm sản phẩm
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
                                                    <th>Tên</th>
                                                    <th>Mô tả</th>
                                                    <th>Thương hiệu</th>
                                                    <th>Danh mục</th>
                                                    <th>Thuộc tính</th>
                                                    <th>Định lượng</th>
                                                    <th>Giá</th>
                                                    <th>Tồn kho</th>
                                                    <th>Hình ảnh</th>
                                                    <th>Hành động</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {variantRows.length > 0 ? (
                                                    variantRows.map(({ product, variant }, i) => (
                                                        <tr key={`${product.id}-${variant?.id || 'no'}-${i}`}>
                                                            <td>{product.id}</td>
                                                            <td>{product.name}</td>
                                                            <td>{product.description || "Không có"}</td>
                                                            <td>{product.brand}</td>
                                                            <td>{product.category}</td>
                                                            <td>{variant?.attribute || "Không có"}</td>
                                                            <td>{variant?.variant || "Không có"}</td>
                                                            <td>{variant ? variant.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "Không có"}</td>
                                                            <td>{variant?.quantity || "Không có"}</td>
                                                            <td>
                                                                {variant?.images?.length > 0 ? (
                                                                    <div className="d-flex flex-wrap">
                                                                        {variant.images.map((img, idx) => (
                                                                            <img
                                                                                key={idx}
                                                                                src={`${CLOUDINARY_BASE_URL}${img.publicId}.png`}
                                                                                alt="product"
                                                                                width="50"
                                                                                className="me-2 mb-2"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                ) : "Không có"}
                                                            </td>
                                                            <td>
                                                                <button className="btn btn-sm btn-primary me-2">Sửa</button>
                                                                <button className="btn btn-sm btn-danger">Xóa</button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="11" className="text-center">Không có sản phẩm</td>
                                                    </tr>
                                                )}
                                                </tbody>
                                            </table>
                                            <nav>
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

            {/* Modal thêm sản phẩm */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Thêm sản phẩm mới</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {formError && <div className="alert alert-danger">{formError}</div>}
                                    <div className="mb-3">
                                        <label className="form-label">Tên sản phẩm</label>
                                        <input type="text" className="form-control" name="name" value={newProduct.name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Mô tả</label>
                                        <textarea className="form-control" name="description" value={newProduct.description} onChange={handleInputChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Thương hiệu</label>
                                        <select className="form-select" name="brand" value={newProduct.brand} onChange={handleInputChange} required>
                                            <option value="">Chọn thương hiệu</option>
                                            {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Danh mục</label>
                                        <select className="form-select" name="category" value={newProduct.category} onChange={handleInputChange} required>
                                            <option value="">Chọn danh mục</option>
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <h6>Biến thể</h6>
                                    {newProduct.variants.map((v, i) => (
                                        <div key={i} className="border p-3 mb-3">
                                            <div className="mb-2">
                                                <label className="form-label">Thuộc tính</label>
                                                <input type="text" className="form-control" name={`variants[${i}].attribute`} value={v.attribute} onChange={(e) => handleInputChange(e, i)} required />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Định lượng</label>
                                                <input type="text" className="form-control" name={`variants[${i}].variant`} value={v.variant} onChange={(e) => handleInputChange(e, i)} required />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Giá</label>
                                                <input type="number" className="form-control" name={`variants[${i}].price`} value={v.price} onChange={(e) => handleInputChange(e, i)} required min="0" />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Tồn kho</label>
                                                <input type="number" className="form-control" name={`variants[${i}].quantity`} value={v.quantity} onChange={(e) => handleInputChange(e, i)} required min="0" />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Hình ảnh</label>
                                                <input type="file" className="form-control" multiple onChange={(e) => handleImageChange(e, i)} accept="image/*" />
                                            </div>
                                            {newProduct.variants.length > 1 && (
                                                <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemoveVariant(i)}>
                                                    Xóa biến thể
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" className="btn btn-sm btn-secondary" onClick={handleAddVariant}>
                                        Thêm biến thể
                                    </button>
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

export default ManageProduct;