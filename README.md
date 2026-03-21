# Skin Shopping E-commerce Website

![Java](https://img.shields.io/badge/Java-Backend-orange)
![Spring Boot](https://img.shields.io/badge/SpringBoot-Framework-green)
![React](https://img.shields.io/badge/React-Frontend-blue)
![MySQL](https://img.shields.io/badge/MySQL-Database-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

## Overview

The **Skin Shopping Website** is a full-stack e-commerce platform designed to provide a complete online shopping experience for cosmetic and skincare products.  
The system supports the entire shopping workflow including **user authentication, product browsing, cart management, order processing, payment integration, voucher usage, product reviews, and administrative management**.

The platform was developed as part of an academic project and focuses on building a **scalable web architecture using modern backend and frontend technologies**. The system follows a **RESTful API architecture with a separated frontend and backend**, enabling flexible development and deployment.

The application emphasizes:

- Secure authentication and authorization
- Modular and maintainable backend architecture
- Responsive user interface
- Integration with external payment and shipping services
- Administrative tools for managing store operations

---

## Project Information

| Category | Details |
|--------|--------|
| Project Name | Skin Shopping E-commerce Website |
| Duration | Feb 2025 – Jun 2025 |
| Team Size | 2 Members |
| Role | Project Lead, Full-Stack Developer, Database Designer |
| Final Grade | **8.6 / 10** |

---

## Key Features

### User Features

The platform provides a full online shopping workflow:

- User registration and login
- Secure authentication using JWT
- Product browsing and search
- Shopping cart management
- Checkout and order processing
- Voucher and discount system
- Product review and rating system
- Multiple payment methods
- Real-time shipping fee calculation

---

### Authentication & Authorization

The system implements secure access control using **Spring Security** and **JWT**.

Features include:

- User registration and login
- Token-based authentication
- Role-based authorization
- Protected API endpoints
- Sessionless authentication mechanism

User roles include:

- **Customer** – can browse products, place orders and submit reviews
- **Admin** – manages products, orders, vouchers, and reviews

---

### Shopping Cart & Checkout

The cart system allows users to:

- Add products to cart
- Update product quantities
- Remove products
- Apply vouchers during checkout
- View total price and discount

The checkout workflow includes:

1. Cart validation
2. Voucher validation
3. Shipping fee calculation
4. Payment method selection
5. Order creation

---

### Payment Integration

The system supports two payment methods:

**Cash on Delivery (COD)**  
Customers pay directly when the order is delivered.

**VNPay Online Payment**

Integration with the Vietnamese payment gateway allows users to:

- Pay using banking apps
- Redirect securely to VNPay payment gateway
- Receive payment confirmation

---

### Shipping Fee Calculation

Shipping fees are calculated using the **GHTK API (Giao Hang Tiet Kiem)**.

This integration provides:

- Real-time shipping fee estimation
- Location-based shipping cost
- Accurate delivery price calculation during checkout

---

### Voucher System

The platform includes a flexible discount voucher system.

Features include:

- Percentage or fixed discount vouchers
- Minimum order value requirement
- Expiration date validation
- Voucher usage limitation

Voucher validation is performed during checkout to ensure correct discount calculation.

---

### Product Reviews

Customers can leave feedback on purchased products.

Features include:

- Star rating
- Written reviews
- Review moderation by administrators

This helps improve product transparency and customer trust.

---

### Admin Dashboard

The admin panel provides tools for managing store operations.

Admin capabilities include:

- Order management
- Voucher management
- Review moderation
- Monitoring order statuses
- Viewing system data

This dashboard allows administrators to control and maintain the platform effectively.

---

## System Architecture

The application follows a **modern full-stack architecture** consisting of three main layers:

```

Client (React)
↓
REST API (Spring Boot)
↓
Database (MySQL)

```

### Frontend

Built with **React**, providing a responsive user interface and communicating with the backend through REST APIs.

### Backend

The backend is developed using **Spring Boot** following the **MVC architecture pattern**.

Layers include:

- Controller layer (REST APIs)
- Service layer (business logic)
- Repository layer (data access)

### Database

The system uses **MySQL** as the relational database for storing:

- Users
- Products
- Orders
- Vouchers
- Reviews

Database interaction is implemented using **JPA (Java Persistence API)**.

---

## Technology Stack

### Backend

- Java
- Spring Boot
- Spring Security
- JWT Authentication
- JPA (Hibernate)
- RESTful API

### Frontend

- React
- Bootstrap
- i18next (Internationalization)

### Database

- MySQL

### External Services

- VNPay Payment Gateway
- GHTK Shipping API

---

# Project Structure

```

skin-shopping-website
│
├── backend
│   ├── src
│   │   └── main
│   │       ├── java
│   │       │   └── com
│   │       │       └── ecommerce
│   │       │           ├── config
│   │       │           │   ├── SecurityConfig.java
│   │       │           │   └── JwtFilter.java
│   │       │           │
│   │       │           ├── controller
│   │       │           │   ├── AuthController.java
│   │       │           │   ├── ProductController.java
│   │       │           │   ├── OrderController.java
│   │       │           │   └── VoucherController.java
│   │       │           │
│   │       │           ├── service
│   │       │           │   ├── AuthService.java
│   │       │           │   ├── OrderService.java
│   │       │           │   └── ProductService.java
│   │       │           │
│   │       │           ├── repository
│   │       │           │   ├── UserRepository.java
│   │       │           │   ├── ProductRepository.java
│   │       │           │   └── OrderRepository.java
│   │       │           │
│   │       │           ├── model
│   │       │           │   ├── User.java
│   │       │           │   ├── Product.java
│   │       │           │   ├── Order.java
│   │       │           │   └── Voucher.java
│   │       │           │
│   │       │           └── security
│   │       │               ├── JwtTokenProvider.java
│   │       │               └── UserDetailsServiceImpl.java
│   │       │
│   │       └── resources
│   │           ├── application.properties
│   │           └── schema.sql
│   │
│   └── pom.xml
│
├── frontend
│   ├── public
│   │   └── index.html
│   │
│   ├── src
│   │   ├── assets
│   │   │   ├── images
│   │   │   └── styles
│   │   │
│   │   ├── components
│   │   │   ├── Navbar
│   │   │   ├── ProductCard
│   │   │   ├── Cart
│   │   │   └── Review
│   │   │
│   │   ├── pages
│   │   │   ├── Home
│   │   │   ├── ProductDetail
│   │   │   ├── CartPage
│   │   │   ├── Checkout
│   │   │   └── AdminDashboard
│   │   │
│   │   ├── services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── orderService.js
│   │   │
│   │   ├── i18n
│   │   │   ├── en.json
│   │   │   └── vi.json
│   │   │
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── .env
│   └── package.json
│
└── README.md

````

---

# Installation Guide

<<<<<<< HEAD
## 1. Clone Repository
=======
## Clone Repository
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15

```bash
git clone https://github.com/ThanhTan67/ChuyenDeWeb.git
````

---

# Backend Setup

## Requirements

* Java 17+
* Maven
* MySQL

---

## Configure Database

Create database:

```sql
CREATE DATABASE skinshop;
```

Update `application.properties`:

```
spring.application.name=backend
server.port=8080

spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
spring.datasource.url=jdbc:mysql://localhost:3306/skinshop
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.enable_lazy_load_no_trans=false
```

---

## Run Backend

Navigate to backend folder:

```
cd backend
```

Run project:

```
mvn spring-boot:run
```

Server will run at:

```
http://localhost:8080
```

---

# Frontend Setup

Navigate to frontend folder:

```
cd frontend
```

Install dependencies:

```
npm install
```

---

# Environment Variables

Create `.env` file in **frontend root directory**.

```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_VNPAY_URL=https://sandbox.vnpayment.vn
```

Example:

```
frontend
│
├── .env
├── package.json
└── src
```

---

# Run Frontend

Start development server:

```
npm start
```

Frontend will run at:

```
http://localhost:3000
```

---

# API Overview

Example endpoints:

```
POST /api/auth/login
POST /api/auth/register

GET /api/products/grid
GET /api/products/{id}

POST /api/cart

POST /api/orders
```

---

## Learning Outcomes

Through this project, several important skills were developed:

- Full-stack web application development
- Designing scalable backend architecture
- Implementing secure authentication systems
- Integrating third-party payment and shipping APIs
- Building maintainable RESTful services
- Collaborative software development in a small team

---

<<<<<<< HEAD
## Screenshots

```

/screenshots

```
=======
## Interface

### Customer Pages

<p align="center">
  <img src="screenshots/skin-home.png" width="45%">
  <img src="screenshots/skin-shop.png" width="45%">
</p>

<p align="center">
  <img src="screenshots/skin-cart.png" width="45%">
  <img src="screenshots/skin-checkout.png" width="45%">
</p>

<p align="center">
  <img src="screenshots/skin-orders-history.png" width="45%">
  <img src="screenshots/skin-voucher.png" width="45%">
</p>

---

### Authentication

<p align="center">
  <img src="screenshots/skin-login.png" width="45%">
  <img src="screenshots/skin-register.png" width="45%">
</p>

---

### Admin Dashboard

<p align="center">
  <img src="screenshots/skin-admin-dashboard.png" width="45%">
  <img src="screenshots/skin-admin-product.png" width="45%">
</p>

<p align="center">
  <img src="screenshots/skin-admin-oder.png" width="45%">
  <img src="screenshots/skin-admin-user.png" width="45%">
</p>

<p align="center">
  <img src="screenshots/skin-admin-review.png" width="45%">
  <img src="screenshots/skin-admin-voucher.png" width="45%">
</p>

---
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15

Example screenshots may include:

- Login page
- Product listing page
- Shopping cart
- Checkout page
- Admin dashboard

---

## Future Improvements

Potential improvements for future development include:

- Product recommendation system
- Advanced product search and filtering
- Order tracking system
- Performance optimization
- Microservices architecture migration
- Cloud deployment and containerization

---

## Author

**Cao Thanh Tan - Project Lead / Full-Stack Developer**

Responsible for system architecture, backend development, database design, and core feature implementation.

---

## License

This project is developed for educational purposes.
