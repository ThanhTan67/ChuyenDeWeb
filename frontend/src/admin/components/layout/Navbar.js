import React from 'react';
import { useAuth } from '../../../auth/authcontext';
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const success = await logout();
            if (success) {
                navigate("/home")
            }
        } catch (err) {
            console.error('err: ', err);
        }
    };

    return (
        <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar">
            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
                <a className="nav-item nav-link px-0 me-xl-4" href="#">
                    <i className="bx bx-menu bx-sm"></i>
                </a>
            </div>
            <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
                <div className="navbar-nav align-items-center">
                    <div className="nav-item d-flex align-items-center">
                        <i className="bx bx-search fs-4 lh-0"></i>
                        <input
                            type="text"
                            className="form-control border-0 shadow-none"
                            placeholder="Search..."
                            aria-label="Search..."
                        />
                    </div>
                </div>
                <ul className="navbar-nav flex-row align-items-center ms-auto">
                    <li className="menu-item">
                        <a href="/shop" className="menu-link">
                            <div>
                                {user ? (
                                <div className="user-dropdown">
                                        <span className="user-name" style={{color:'black',fontSize:'16px'}}>
                                            {user?.username || user?.email?.split('@')[0]}
                                        </span>
                                    <div className="dropdown-content">
                                        <a href="#" className="auth" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
                                    </div>
                                </div>
                            ) : (
                                <div className="log">
                                    <img src="/img/login.png" alt="Login" style={{ marginRight: '5px', color:'black' }} />
                                    <Link to="/login">Login</Link>
                                </div>
                            )}
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    );
}