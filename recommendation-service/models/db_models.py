"""
SQLAlchemy ORM models — mirrors of Spring Boot entities.
Read-only: used to load training data from the shared MySQL database.
"""
from sqlalchemy import (
    Column, Integer, BigInteger, String, Text, Numeric,
    ForeignKey, Boolean, DateTime, Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "user"
    id = Column(BigInteger, primary_key=True)
    username = Column(String(32), nullable=False)
    email = Column(String(255))


class Role(Base):
    __tablename__ = "role"
    id = Column(BigInteger, primary_key=True)
    name = Column(String(50))


class Brand(Base):
    __tablename__ = "brand"
    id = Column(BigInteger, primary_key=True)
    name = Column(String(100))


class Category(Base):
    __tablename__ = "category"
    id = Column(BigInteger, primary_key=True)
    name = Column(String(255))


class Product(Base):
    __tablename__ = "product"
    id = Column(BigInteger, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    brand_id = Column(BigInteger, ForeignKey("brand.id"))
    category_id = Column(BigInteger, ForeignKey("category.id"))
    view_count = Column(Integer, default=0)

    brand = relationship("Brand", lazy="joined")
    category = relationship("Category", lazy="joined")
    variants = relationship("ProductVariant", back_populates="product", lazy="joined")


class ProductVariant(Base):
    __tablename__ = "productvariant"
    id = Column(BigInteger, primary_key=True)
    product_id = Column(BigInteger, ForeignKey("product.id"), nullable=False)
    product_attribute = Column(String(255))
    variant = Column(String(100))
    price = Column(Numeric(10, 3))
    quantity = Column(Integer, default=0)

    product = relationship("Product", back_populates="variants")
    images = relationship("ProductImage", lazy="joined")


class Image(Base):
    __tablename__ = "image"
    id = Column(BigInteger, primary_key=True)
    public_id = Column(String(255))


class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(BigInteger, primary_key=True)
    product_variant_id = Column(BigInteger, ForeignKey("productvariant.id"))
    image_id = Column(BigInteger, ForeignKey("image.id"))
    main_image = Column(Boolean, default=False)

    image = relationship("Image", lazy="joined")


class Order(Base):
    __tablename__ = "orders"
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("user.id"))
    booking_date = Column(DateTime)
    delivery_date = Column(DateTime)
    order_status = Column(String(20))
    total_money = Column(Numeric(15, 3))

    details = relationship("OrderDetail", back_populates="order", lazy="joined")


class OrderDetail(Base):
    __tablename__ = "orderdetails"
    id = Column(BigInteger, primary_key=True)
    order_id = Column(BigInteger, ForeignKey("orders.id"))
    product_variant_id = Column(BigInteger, ForeignKey("productvariant.id"))
    quantity = Column(Integer, nullable=False)
    product_price = Column(Numeric(10, 3))
    price_with_quantity = Column(Numeric(10, 3))

    order = relationship("Order", back_populates="details")
    variant = relationship("ProductVariant", lazy="joined")


class Review(Base):
    __tablename__ = "review"
    id = Column(BigInteger, primary_key=True)
    product_id = Column(BigInteger, ForeignKey("product.id"))
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    commenter_name = Column(String(30))
    phonenumber_commenter = Column(String(15))
    date_created = Column(DateTime)
    is_accept = Column(Boolean)


class WishlistItem(Base):
    __tablename__ = "wishlist_item"
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("user.id"), nullable=False)
    product_id = Column(BigInteger, ForeignKey("product.id"), nullable=False)


class Cart(Base):
    __tablename__ = "cart"
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger)

    items = relationship("CartItem", back_populates="cart", lazy="joined")


class CartItem(Base):
    __tablename__ = "cartitem"
    id = Column(BigInteger, primary_key=True)
    cart_id = Column(BigInteger, ForeignKey("cart.id"))
    product_variant_id = Column(BigInteger, ForeignKey("productvariant.id"), nullable=False)
    quantity = Column(Integer, nullable=False)

    cart = relationship("Cart", back_populates="items")
    variant = relationship("ProductVariant", lazy="joined")


class UserBehaviorEvent(Base):
    """
    Tracks all user behavior signals: VIEW, CLICK, ADD_TO_CART, PURCHASE, SEARCH.
    This table will be created by Spring Boot (ddl-auto=update).
    """
    __tablename__ = "user_behavior_event"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("user.id"), nullable=False, index=True)
    product_id = Column(BigInteger, ForeignKey("product.id"), nullable=True)
    event_type = Column(String(20), nullable=False)  # VIEW, CLICK, ADD_TO_CART, PURCHASE, SEARCH
    search_query = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False)

