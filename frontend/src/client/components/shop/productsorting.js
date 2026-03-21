import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ProductSorting = ({ onSearch, onSort }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('name-asc');

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            onSearch(searchTerm);
        }
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        setSortOption(value);
        const [sortBy, sortOrder] = value.split('-');
        onSort(sortBy, sortOrder);
    };

    return (
        <div className="product_top_bar d-flex justify-content-between align-items-center">
            <div className="sort-menu">
                <h5>{t('sort_by')}</h5>
                <select value={sortOption} onChange={handleSortChange}>
                    <option value="name-asc">{t('name_asc')}</option>
                    <option value="name-desc">{t('name_desc')}</option>
                    <option value="price-asc">{t('price_asc')}</option>
                    <option value="price-desc">{t('price_desc')}</option>
                </select>
            </div>
            <div className="single_product_menu d-flex">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder={t('search_placeholder')}
                        aria-describedby="inputGroupPrepend"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyPress={handleSearchSubmit}
                    />
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="inputGroupPrepend">
                            <i className="ti-search" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductSorting;