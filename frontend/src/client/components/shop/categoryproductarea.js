import React, { useState } from 'react';
import Sidebar from './sidebar';
import ProductSorting from './productsorting';
import ProductGrid from './productgrid';

const CategoryProductArea = () => {
    const [filters, setFilters] = useState({
        searchTerm: '',
        sortBy: 'name',
        sortOrder: 'asc',
        category: '',
        brand: '',
    });

    const handleSearch = (searchTerm) => {
        setFilters((prev) => ({ ...prev, searchTerm }));
    };

    const handleSort = (sortBy, sortOrder) => {
        setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    };

    const handleFilterChange = ({ category, brand }) => {
        setFilters((prev) => ({ ...prev, category, brand }));
    };

    return (
        <section className="cat_product_area section_padding">
            <div className="container">
                <div className="row">
                    <div className="col-lg-3">
                        <Sidebar onFilterChange={handleFilterChange} />
                    </div>
                    <div className="col-lg-9">
                        <div className="row">
                            <div className="col-lg-12">
                                <ProductSorting onSearch={handleSearch} onSort={handleSort} />
                            </div>
                        </div>
                        <ProductGrid
                            searchTerm={filters.searchTerm}
                            sortBy={filters.sortBy}
                            sortOrder={filters.sortOrder}
                            category={filters.category}
                            brand={filters.brand}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoryProductArea;