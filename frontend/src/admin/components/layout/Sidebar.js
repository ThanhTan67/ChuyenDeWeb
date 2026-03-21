import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
            <div className="app-brand demo">
                <Link to="/" className="app-brand-link">
          <span className="app-brand-logo demo">
            <img src="/assetsAdmin/img/favicon/favicon.ico" alt="Skins Shop" />
          </span>
                    <span className="app-brand-text demo menu-text fw-bolder ms-2">Aranoz.</span>
                </Link>
                <a href="#" className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
                    <i className="bx bx-chevron-left bx-sm align-middle"></i>
                </a>
            </div>
            <div className="menu-inner-shadow"></div>
            <ul className="menu-inner py-1">
                <li className="menu-item">
                    <Link to="/admin" className="menu-link">Dashboard</Link>
                </li>
                <li className="menu-item">
                    <Link to="/admin/pages/manage-user" className="menu-link">Manage User</Link>
                </li>
                <li className="menu-item">
                    <Link to="/admin/pages/manage-product" className="menu-link">Manage Product</Link>
                </li>
                <li className="menu-item">
                    <Link to="/admin/pages/manage-order" className="menu-link">Manage Order</Link>
                </li>
                <li className="menu-item">
                    <Link to="/admin/pages/manage-voucher" className="menu-link">Manage Voucher</Link>
                </li>
                <li className="menu-item">
                    <Link to="/admin/pages/manage-review" className="menu-link">Manage Review</Link>
                </li>
                {/*<li className={`menu-item ${isOpen ? 'active open' : ''}`}>*/}
                {/*    <a href="#" className="menu-link" onClick={toggleMenu}>*/}
                {/*        <i className="menu-icon tf-icons bx bx-home-circle"></i>*/}
                {/*        <div>Dashboard</div>*/}
                {/*        <i className={`bx bx-chevron-${isOpen ? 'up' : 'down'} ms-auto`}></i>*/}
                {/*    </a>*/}
                {/*    <ul className="menu-sub" style={{ display: isOpen ? 'block' : 'none' }}>*/}
                {/*        <li className="menu-item">*/}
                {/*            <Link to="/admin/pages/manage-user" className="menu-link">Manage User</Link>*/}
                {/*        </li>*/}
                {/*        <li className="menu-item">*/}
                {/*            <Link to="/admin/pages/manage-product" className="menu-link">Manage Product</Link>*/}
                {/*        </li>*/}
                {/*        <li className="menu-item">*/}
                {/*            <Link to="/admin/pages/manage-cart" className="menu-link">Manage Cart</Link>*/}
                {/*        </li>*/}
                {/*    </ul>*/}
                {/*</li>*/}
            </ul>
        </aside>
    );
}