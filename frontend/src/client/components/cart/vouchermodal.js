import React, { useEffect, useState, useRef } from 'react';

// Format date to dd/mm/yy
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

// Helper: true nếu voucher đã hết hạn (endDate < hôm nay)
function isVoucherExpired(voucher) {
    if (!voucher.endDate) return false;
    const end = new Date(voucher.endDate);
    end.setHours(23,59,59,999);
    return new Date() > end;
}

// Helper: true nếu voucher chưa tới ngày có hiệu lực (startDate > hôm nay)
function isVoucherNotStarted(voucher) {
    if (!voucher.startDate) return false;
    const start = new Date(voucher.startDate);
    const now = new Date();
    start.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    return start > now;
}

const VoucherModal = ({
                          show,
                          onClose,
                          vouchers,
                          cartItems,
                          onApply,
                          loading,
                          error,
                          selectedCartItems = [], // Mảng sản phẩm được chọn (radio)
                      }) => {
    const [searchCode, setSearchCode] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [filteredVouchers, setFilteredVouchers] = useState([]);
    const [selectedVoucherId, setSelectedVoucherId] = useState(null);

    const contentRef = useRef(null);

    // Click outside to close modal
    useEffect(() => {
        if (!show) return;
        const handleClickOutside = (event) => {
            if (
                contentRef.current &&
                !contentRef.current.contains(event.target)
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [show, onClose]);

    // Hide body scroll when modal show
    useEffect(() => {
        if (show) {
            const original = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = original;
            };
        }
    }, [show]);

    // Lọc voucher theo search và loại bỏ voucher hết hạn
    useEffect(() => {
        let result = (Array.isArray(vouchers) ? vouchers : []).filter(v => !isVoucherExpired(v));
        if (searchCode.trim() !== '') {
            result = result.filter((v) =>
                v.code.toLowerCase().includes(searchCode.trim().toLowerCase())
            );
        }
        if (searchType !== 'all') {
            result = result.filter(
                (v) =>
                    (searchType === 'category' && v.category) ||
                    (searchType === 'product' && v.productVariantDTO)
            );
        }
        setFilteredVouchers(result);
    }, [vouchers, searchCode, searchType]);

    // Chỉ xét đến sản phẩm đang được chọn (radio), truyền từ selectedCartItems
    const cartProductIds = selectedCartItems.map((item) => item.productId);
    const cartCategoryNames = selectedCartItems.map((item) => item.categoryName);
    const noSelected = !selectedCartItems || selectedCartItems.length === 0;

    // Disable: chưa tới ngày hiệu lực, không có sp phù hợp, voucher ko active hoặc chưa chọn sản phẩm
    const checkVoucherDisabled = (voucher) => {
        if (noSelected) return true;
        if (isVoucherNotStarted(voucher)) return true;
        if (!voucher.isActive) return true;
        if (voucher.category) {
            const catName = voucher.category.name;
            return !cartCategoryNames.includes(catName);
        }
        if (voucher.productVariantDTO) {
            const pid =
                voucher.productVariantDTO.id || voucher.productVariantDTO.productId;
            return !cartProductIds.includes(pid);
        }
        return false;
    };

    const handleSearch = (e) => {
        e.preventDefault();
    };

    const handleRadioChange = (vid) => {
        setSelectedVoucherId(vid);
    };

    const handleApply = () => {
        const selectedVoucher = filteredVouchers.find((v) => v.id === selectedVoucherId);
        if (selectedVoucher && !checkVoucherDisabled(selectedVoucher)) {
            onApply(selectedVoucher);
        }
    };

    if (!show) return null;

    return (
        <div className="voucher-modal-overlay">
            <div className="voucher-modal-content-arz" ref={contentRef}>
                <div className="voucher-modal-header-arz">
                    <span className="voucher-modal-title-arz">
                        Chọn voucher của bạn
                    </span>
                    <button className="voucher-modal-close-arz" onClick={onClose}>
                        <i className="fa fa-times"></i>
                    </button>
                </div>
                <form className="voucher-modal-search-arz" onSubmit={handleSearch}>
                    <div className="voucher-modal-search-wrap-arz">
                        <input
                            type="text"
                            className="voucher-modal-search-input-arz"
                            placeholder="Nhập mã voucher hoặc tìm kiếm..."
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                        />
                        <select
                            className="voucher-modal-search-select-arz"
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                        >
                            <option value="all">Tất cả loại</option>
                            <option value="category">Theo danh mục</option>
                            <option value="product">Theo sản phẩm</option>
                        </select>
                        <button type="submit" className="voucher-modal-search-btn-arz">
                            <i className="fa fa-search"></i>
                            <span style={{ marginLeft: 6 }}>Tìm kiếm</span>
                        </button>
                    </div>
                </form>
                <div className="voucher-list-arz">
                    {loading ? (
                        <div className="voucher-loading-arz">
                            <div className="voucher-spinner-arz"></div>
                            <span style={{ marginLeft: 8 }}>Đang tải voucher...</span>
                        </div>
                    ) : error ? (
                        <div className="voucher-modal-error-arz">{error}</div>
                    ) : filteredVouchers.length === 0 ? (
                        <div className="voucher-empty-arz">
                            <div>Không có voucher phù hợp</div>
                        </div>
                    ) : (
                        filteredVouchers.map((v) => {
                            const isDisabled = checkVoucherDisabled(v);
                            return (
                                <label
                                    key={v.id}
                                    className={`voucher-row-arz${isDisabled ? ' voucher-disabled-arz' : ''} ${selectedVoucherId === v.id ? 'voucher-selected-arz' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="selectedVoucher"
                                        disabled={isDisabled}
                                        checked={selectedVoucherId === v.id}
                                        onChange={() => handleRadioChange(v.id)}
                                    />
                                    <div className="voucher-info-arz">
                                        <div className="voucher-code-header-arz">
                                            <span className="voucher-discount-visual-arz">
                                               Giảm {v.discountPercentage}%
                                            </span>
                                            <span className="voucher-code-arz">
                                                <span style={{color:'#ffab00',fontWeight:'bold'}}>{v.code}</span>
                                            </span>
                                            <span className="voucher-type-arz">
                                                {v.productVariantDTO
                                                    ? <><i className="fa fa-box"></i> Sản phẩm</>
                                                    : v.category
                                                        ? <><i className="fa fa-list"></i> Danh mục</>
                                                        : <><i className="fa fa-store"></i> Toàn shop</>}
                                            </span>
                                            {isVoucherNotStarted(v) && (
                                                <span className="voucher-status-expired-arz" style={{ background: "#faf6e9", color: "#bfa437" }}>
                                                    <i className="fa fa-clock"></i> Chưa hiệu lực
                                                </span>
                                            )}
                                        </div>
                                        <div className="voucher-desc-arz">
                                            <span>
                                                <i className="fa fa-minus-circle" style={{ color: "#666", marginRight: 4 }} />
                                                Giảm tối đa <span>{Number(v.maximumDiscount).toLocaleString('vi-VN')}₫</span>
                                            </span>
                                            <span style={{ marginLeft: 15 }}>
                                                <i className="fa fa-shopping-bag" style={{ color: "#666", marginRight: 4 }} />
                                                Đơn tối thiểu <span>{Number(v.minimumOrderValue).toLocaleString('vi-VN')}₫</span>
                                            </span>
                                        </div>
                                        <div className="voucher-meta-arz">
                                            {v.category && (
                                                <span className="voucher-tag-arz">
                                                    <i className="fa fa-tags" style={{ marginRight: 3 }} /> {v.category.name}
                                                </span>
                                            )}
                                            {v.productVariantDTO && (
                                                <span className="voucher-tag-arz">
                                                    <i className="fa fa-barcode" style={{ marginRight: 3 }} />
                                                    {v.productVariantDTO.attribute} {v.productVariantDTO.variant}
                                                </span>
                                            )}
                                        </div>
                                        <div className="voucher-date-arz">
                                            <span>
                                                <i className="fa fa-calendar-check" style={{ marginRight: 4, color: '#a0a0a0' }} />
                                                {formatDate(v.startDate)}
                                            </span>
                                            <span style={{ margin: "0 5px" }}>-</span>
                                            <span>
                                                <i className="fa fa-calendar-times" style={{ marginRight: 4, color: '#a0a0a0' }} />
                                                {formatDate(v.endDate)}
                                            </span>
                                        </div>
                                    </div>
                                    {isDisabled && noSelected && (
                                        <div className="voucher-disabled-msg-arz">
                                            <i className="fa fa-info-circle"></i> Vui lòng chọn sản phẩm để áp dụng voucher
                                        </div>
                                    )}
                                    {isDisabled && !noSelected && !isVoucherNotStarted(v) && (
                                        <div className="voucher-disabled-msg-arz">
                                            <i className="fa fa-info-circle"></i> Không áp dụng với sản phẩm đang chọn
                                        </div>
                                    )}
                                    {isDisabled && isVoucherNotStarted(v) && (
                                        <div className="voucher-disabled-msg-arz" style={{ color: '#bfa437' }}>
                                            <i className="fa fa-info-circle"></i> Chưa tới ngày sử dụng
                                        </div>
                                    )}
                                </label>
                            );
                        })
                    )}
                </div>
                <div className="voucher-modal-footer-arz">
                    <button
                        className="voucher-modal-apply-btn-arz"
                        disabled={
                            !selectedVoucherId ||
                            checkVoucherDisabled(
                                filteredVouchers.find((v) => v.id === selectedVoucherId)
                            )
                        }
                        onClick={handleApply}
                    >
                        <i className="fa fa-check-circle" style={{ marginRight: 7 }}></i>
                        Áp dụng voucher
                    </button>
                </div>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
        </div>
    );
};

export default VoucherModal;