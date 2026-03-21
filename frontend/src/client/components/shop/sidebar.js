import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
const Sidebar = ({ onFilterChange }) => {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');

    const categories = [
        'Tẩy trang',
        'Sữa rửa mặt',
        'Toner',
        'Kem chống nắng',
        'Kem dưỡng',
        'Mặt nạ',
        'Serum',
    ];

    const brands = [
        'CeraVe',
        'Bioderma',
        'La Roche-Posay',
        'Cetaphil',
        'SVR',
        'Loreal',
        'Eucerin',
        'cocoon',
        'Good Skin',
        'klairs',
    ];

    const handleCategoryClick = (category) => {
        const newCategory = selectedCategory === category ? '' : category;
        setSelectedCategory(newCategory);
        onFilterChange({ category: newCategory, brand: selectedBrand });
    };

    const handleBrandClick = (brand) => {
        const newBrand = selectedBrand === brand ? '' : brand;
        setSelectedBrand(newBrand);
        onFilterChange({ category: selectedCategory, brand: newBrand });
    };

    return (
        <div className="left_sidebar_area">
            <aside className="left_widgets p_filter_widgets">
                <div className="l_w_title">
                    <h3>{t('category')}</h3>
                </div>
                <div className="widgets_inner">
                    <ul className="list">
                        {categories.map((category) => (
                            <li
                                key={category}
                                className={selectedCategory === category ? 'active' : ''}
                                onClick={() => handleCategoryClick(category)}
                            >
                                <span>{category}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            <aside className="left_widgets p_filter_widgets">
                <div className="l_w_title">
                    <h3>{t('brand')}</h3>
                </div>
                <div className="widgets_inner">
                    <ul className="list">
                        {brands.map((brand) => (
                            <li
                                key={brand}
                                className={selectedBrand === brand ? 'active' : ''}
                                onClick={() => handleBrandClick(brand)}
                            >
                                <span>{brand}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </div>
    );
};

export default Sidebar;