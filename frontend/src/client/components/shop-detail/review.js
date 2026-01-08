import React, { useState, useEffect } from "react";

const STAR_COUNT = 5;
const ratingLabels = ["Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dp2jfvmlh/image/upload/';
const ITEMS_PER_PAGE = 3; // Số lượng review trên mỗi trang

const ProductReview = ({ productId }) => {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';

    // Validate productId
    const numericProductId = Number(productId);
    const isValidProductId = !isNaN(numericProductId) && numericProductId > 0;

    // Fetch reviews for the product
    useEffect(() => {
        if (!isValidProductId) {
            setError("ID sản phẩm không hợp lệ.");
            return;
        }

        const fetchReviews = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/review/product/${numericProductId}`);
                if (!response.ok) {
                    throw new Error("Không thể tải danh sách đánh giá.");
                }
                const data = await response.json();
                // Chỉ hiển thị các review có isAccept = true
                setReviews(data.filter(review => review.isAccept));
                setCurrentPage(1); // Reset về trang 1 khi tải lại dữ liệu
            } catch (err) {
                setError("Không thể tải danh sách đánh giá.");
            }
        };
        fetchReviews();
    }, [numericProductId, isValidProductId]);

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidProductId) {
            setError("ID sản phẩm không hợp lệ.");
            return;
        }
        if (rating === 0 || !name.trim() || !phone.trim() || !comment.trim()) {
            setError("Vui lòng điền đầy đủ thông tin và chọn số sao.");
            return;
        }

        const formData = new FormData();
        const reviewDTO = {
            commenterName: name,
            phonenumberCommenter: phone,
            productId: numericProductId,
            rating,
            comment,
        };
        formData.append("review", new Blob([JSON.stringify(reviewDTO)], { type: "application/json" }));
        images.forEach((image) => formData.append("images", image));

        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/api/review`, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Lỗi khi gửi đánh giá.");
            }
            setSubmitted(true);
            setTimeout(async () => {
                setName("");
                setPhone("");
                setComment("");
                setRating(0);
                setImages([]);
                setSubmitted(false);
                // Refresh reviews
                const refreshResponse = await fetch(`${API_BASE_URL}/api/review/product/${numericProductId}`);
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setReviews(data.filter(review => review.isAccept));
                    setCurrentPage(1); // Reset về trang 1 sau khi submit
                }
            }, 1800);
        } catch (err) {
            setError("Lỗi khi gửi đánh giá: " + err.message);
        }
    };

    // --- New Section: Rating Stats ---
    const stats = Array(STAR_COUNT)
        .fill(0)
        .map((_, idx) => reviews.filter(r => r.rating === idx + 1).length);

    const count = reviews.length;
    const avg =
        count === 0
            ? 0
            : (
                reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count
            ).toFixed(1);

    // Logic phân trang
    const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="pro-review-flex-container">
            <div className="pro-review-list-area">
                {/* Stats */}
                <div className="pro-review-stats">
                    <div className="pro-review-avg">
                        <div className="pro-review-avg-score">{avg}</div>
                        <div className="pro-review-avg-stars">
                            {[...Array(STAR_COUNT)].map((_, i) => (
                                <svg
                                    key={i}
                                    height="22"
                                    width="22"
                                    viewBox="0 0 24 24"
                                    className="pro-review-star"
                                >
                                    <path
                                        d="M12 17.75L6.16 21l1.12-6.54-4.77-4.65 6.58-.95L12 3.5l2.91 5.36 6.58.95-4.77 4.65 1.12 6.54z"
                                        fill={i < Math.round(avg) ? "#FFB800" : "#E1E1E1"}
                                        stroke={i < Math.round(avg) ? "#FFB800" : "#C6C6C6"}
                                        strokeWidth="1"
                                    />
                                </svg>
                            ))}
                        </div>
                        <div className="pro-review-avg-label">
                            {count} đánh giá
                        </div>
                    </div>
                    <div className="pro-review-breakdown">
                        {[...Array(STAR_COUNT)].map((_, i) => (
                            <div className="pro-review-breakdown-row" key={STAR_COUNT - i}>
                                <span className="pro-break-star-label">{STAR_COUNT - i} <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 17.75L6.16 21l1.12-6.54-4.77-4.65 6.58-.95L12 3.5l2.91 5.36 6.58.95-4.77 4.65 1.12 6.54z" fill="#FFB800" stroke="#FFB800" strokeWidth="1" /></svg></span>
                                <div className="pro-break-bar-outer">
                                    <div
                                        className="pro-break-bar-inner"
                                        style={{
                                            width: count ? `${(stats[STAR_COUNT - i - 1] / count) * 100}%` : "0%",
                                            background: "#ffb800",
                                        }}
                                    />
                                </div>
                                <span className="pro-break-bar-count">{stats[STAR_COUNT - i - 1]}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Review List */}
                <div className="pro-review-list">
                    <h4>Danh sách đánh giá</h4>
                    {reviews.length === 0 ? (
                        <p>Chưa có đánh giá nào được duyệt cho sản phẩm này.</p>
                    ) : (
                        paginatedReviews.map((review) => (
                            <div key={review.id} className="pro-review-item">
                                <div className="pro-review-item-header">
                                    <span className="pro-review-item-name">{review.commenterName}</span>
                                    <span className="pro-review-item-rating">
                                        {[...Array(STAR_COUNT)].map((_, i) => (
                                            <svg
                                                key={i}
                                                height="20"
                                                width="20"
                                                viewBox="0 0 24 24"
                                                className="pro-review-star"
                                            >
                                                <path
                                                    d="M12 17.75L6.16 21l1.12-6.54-4.77-4.65 6.58-.95L12 3.5l2.91 5.36 6.58.95-4.77 4.65 1.12 6.54z"
                                                    fill={i < review.rating ? "#FFB800" : "#E1E1E1"}
                                                    stroke={i < review.rating ? "#FFB800" : "#C6C6C6"}
                                                    strokeWidth="1"
                                                />
                                            </svg>
                                        ))}
                                    </span>
                                </div>
                                <p className="pro-review-item-comment">{review.comment}</p>
                                {review.imageIds && review.imageIds.length > 0 && (
                                    <div className="pro-review-item-images">
                                        {review.imageIds.map((imageId, index) => (
                                            <img
                                                key={index}
                                                src={`${CLOUDINARY_BASE_URL}${imageId}`}
                                                alt={`Review image ${index + 1}`}
                                                className="pro-review-image"
                                            />
                                        ))}
                                    </div>
                                )}
                                {review.response && (
                                    <p className="pro-review-item-response">
                                        <strong>Phản hồi:</strong> {review.response}
                                    </p>
                                )}
                                <span className="pro-review-item-date">
                                    {new Date(review.dateCreated).toLocaleDateString("vi-VN")}
                                </span>
                            </div>
                        ))
                    )}
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pro-review-pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={currentPage === page ? "active" : ""}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="pro-review-form-area">
                <div className="pro-review-header">
                    <h3>Đánh giá sản phẩm</h3>
                    <span className="pro-review-desc">
                        Hãy chia sẻ trải nghiệm của bạn về sản phẩm này
                    </span>
                </div>
                {/* Review Form */}
                <form className="pro-review-form" onSubmit={handleSubmit}>
                    <div className="pro-review-stars">
                        {[...Array(STAR_COUNT)].map((_, i) => (
                            <span
                                key={i}
                                className={"pro-star" + (i < (hovered || rating) ? " filled" : "")}
                                onMouseEnter={() => setHovered(i + 1)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setRating(i + 1)}
                                tabIndex={0}
                                aria-label={`Chọn ${i + 1} sao`}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter" || e.key === " ") setRating(i + 1);
                                }}
                            >
                                <svg height="32" width="32" viewBox="0 0 24 24">
                                    <path
                                        d="M12 17.75L6.16 21l1.12-6.54-4.77-4.65 6.58-.95L12 3.5l2.91 5.36 6.58.95-4.77 4.65 1.12 6.54z"
                                        fill={i < (hovered || rating) ? "#FFB800" : "#E1E1E1"}
                                        stroke={i < (hovered || rating) ? "#FFB800" : "#C6C6C6"}
                                        strokeWidth="1"
                                    />
                                </svg>
                            </span>
                        ))}
                    </div>
                    <h5 className="pro-review-rating-text">
                        {rating > 0 && <span>{ratingLabels[rating - 1]}</span>}
                    </h5>
                    <div className="pro-review-fields">
                        <input
                            type="text"
                            placeholder="Tên của bạn"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pro-review-input"
                            maxLength={30}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Số điện thoại"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pro-review-input"
                            pattern="\d{10,15}"
                            required
                        />
                        <textarea
                            placeholder="Nhận xét của bạn về sản phẩm..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="pro-review-textarea"
                            rows={5}
                            minLength={10}
                            maxLength={500}
                            required
                        />
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="pro-review-input"
                        />
                    </div>
                    {error && <div className="pro-review-error">{error}</div>}
                    <button
                        type="submit"
                        className="pro-review-submit"
                        disabled={rating === 0 || !name.trim() || !phone.trim() || !comment.trim() || submitted || !isValidProductId}
                    >
                        {submitted ? "Cảm ơn bạn đã đánh giá!" : "Gửi đánh giá"}
                    </button>
                </form>
                {submitted && (
                    <div className="pro-review-thank">
                        <svg width="44" height="44" viewBox="0 0 44 44">
                            <circle cx="22" cy="22" r="22" fill="#14b8a6" opacity="0.12" />
                            <path
                                d="M14 23.2l5 5.2 11-11.2"
                                stroke="#14b8a6"
                                strokeWidth="2.5"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </svg>
                        <span>Đánh giá của bạn đã được ghi nhận và chờ phê duyệt!</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReview;