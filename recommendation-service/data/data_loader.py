"""
Load raw data from MySQL → pandas DataFrames.
Builds multi-signal user-item interaction matrices.
"""
import logging
import pandas as pd
from sqlalchemy import text
from database import SessionLocal

logger = logging.getLogger(__name__)


def _exec(query: str) -> pd.DataFrame:
    """Execute raw SQL and return a DataFrame."""
    with SessionLocal() as session:
        result = session.execute(text(query))
        rows = result.fetchall()
        if not rows:
            return pd.DataFrame()
        return pd.DataFrame(rows, columns=result.keys())


def load_products() -> pd.DataFrame:
    """Load product info with brand and category names."""
    query = """
        SELECT p.id          AS product_id,
               p.name        AS product_name,
               p.description AS description,
               b.name        AS brand_name,
               c.name        AS category_name,
               c.id          AS category_id,
               p.view_count  AS view_count
        FROM product p
        LEFT JOIN brand b    ON p.brand_id = b.id
        LEFT JOIN category c ON p.category_id = c.id
    """
    df = _exec(query)
    logger.info("Loaded %d products", len(df))
    return df


def load_order_interactions() -> pd.DataFrame:
    """
    Load user-product interactions from delivered/confirmed orders.
    Each (user_id, product_id) pair gets an implicit rating = 5.0.
    """
    query = """
        SELECT o.user_id                          AS user_id,
               pv.product_id                      AS product_id,
               5.0                                AS rating,
               SUM(od.quantity)                   AS total_qty,
               MAX(o.booking_date)                AS last_date,
               'purchase'                         AS source
        FROM orders o
        JOIN orderdetails od  ON od.order_id = o.id
        JOIN productvariant pv ON od.product_variant_id = pv.id
        WHERE o.order_status IN ('DELIVERED', 'CONFIRMED', 'ON_DELIVERY')
          AND o.user_id IS NOT NULL
        GROUP BY o.user_id, pv.product_id
    """
    df = _exec(query)
    logger.info("Loaded %d order interactions", len(df))
    return df


def load_review_interactions() -> pd.DataFrame:
    """
    Load explicit ratings from reviews.
    Reviews tie to product_id directly.
    We use phonenumber_commenter or commenter_name to fuzzy-match users;
    since Review has no direct user_id FK in this schema, we try to join
    through orders for the same product.
    Fallback: assign a hash-based pseudo user-id.
    """
    query = """
        SELECT r.id           AS review_id,
               r.product_id   AS product_id,
               r.rating       AS rating,
               r.date_created AS last_date,
               'review'       AS source,
               r.commenter_name AS commenter_name,
               r.phonenumber_commenter AS phone
        FROM review r
        WHERE r.is_accept = 1 OR r.is_accept IS NULL
    """
    df = _exec(query)
    logger.info("Loaded %d reviews", len(df))
    return df


def load_wishlist_interactions() -> pd.DataFrame:
    """Wishlist items → implicit rating = 3.5."""
    query = """
        SELECT w.user_id     AS user_id,
               w.product_id  AS product_id,
               3.5           AS rating,
               'wishlist'    AS source
        FROM wishlist_item w
    """
    df = _exec(query)
    logger.info("Loaded %d wishlist interactions", len(df))
    return df


def load_cart_interactions() -> pd.DataFrame:
    """Cart items → implicit rating = 3.0."""
    query = """
        SELECT c.user_id        AS user_id,
               pv.product_id    AS product_id,
               3.0              AS rating,
               'cart'           AS source
        FROM cart c
        JOIN cartitem ci         ON ci.cart_id = c.id
        JOIN productvariant pv   ON ci.product_variant_id = pv.id
        WHERE c.user_id IS NOT NULL
    """
    df = _exec(query)
    logger.info("Loaded %d cart interactions", len(df))
    return df


def load_all_interactions() -> pd.DataFrame:
    """
    Combine all interaction sources into a single DataFrame.
    Columns: user_id, product_id, rating, source
    For duplicate (user_id, product_id), keep the highest rating.
    """
    orders = load_order_interactions()
    wishlists = load_wishlist_interactions()
    carts = load_cart_interactions()

    frames = []
    for df in [orders, wishlists, carts]:
        if not df.empty:
            frames.append(df[["user_id", "product_id", "rating", "source"]])

    if not frames:
        logger.warning("No interaction data found!")
        return pd.DataFrame(columns=["user_id", "product_id", "rating", "source"])

    combined = pd.concat(frames, ignore_index=True)

    # Deduplicate: keep highest rating per (user, product)
    combined = combined.sort_values("rating", ascending=False)
    combined = combined.drop_duplicates(subset=["user_id", "product_id"], keep="first")

    combined["user_id"] = combined["user_id"].astype(int)
    combined["product_id"] = combined["product_id"].astype(int)
    combined["rating"] = combined["rating"].astype(float)

    logger.info(
        "Combined interactions: %d rows, %d users, %d products",
        len(combined),
        combined["user_id"].nunique(),
        combined["product_id"].nunique(),
    )
    return combined


def load_order_history() -> pd.DataFrame:
    """Aggregated sales data for rule-based scoring."""
    query = """
        SELECT pv.product_id                      AS product_id,
               SUM(od.quantity)                    AS total_sold,
               COUNT(DISTINCT o.id)                AS order_count,
               MAX(o.booking_date)                 AS last_order_date
        FROM orders o
        JOIN orderdetails od  ON od.order_id = o.id
        JOIN productvariant pv ON od.product_variant_id = pv.id
        WHERE o.order_status IN ('DELIVERED', 'CONFIRMED', 'ON_DELIVERY')
        GROUP BY pv.product_id
    """
    df = _exec(query)
    logger.info("Loaded sales history for %d products", len(df))
    return df


def load_review_stats() -> pd.DataFrame:
    """Aggregated review stats for Bayesian rating."""
    query = """
        SELECT r.product_id            AS product_id,
               COUNT(*)                AS review_count,
               AVG(r.rating)           AS avg_rating,
               SUM(r.rating)           AS sum_rating
        FROM review r
        WHERE r.is_accept = 1 OR r.is_accept IS NULL
        GROUP BY r.product_id
    """
    df = _exec(query)
    logger.info("Loaded review stats for %d products", len(df))
    return df


def load_recent_orders(days: int = 7) -> pd.DataFrame:
    """Orders in last N days for trending calculation."""
    query = f"""
        SELECT pv.product_id                      AS product_id,
               SUM(od.quantity)                    AS recent_sold,
               COUNT(DISTINCT o.id)                AS recent_orders
        FROM orders o
        JOIN orderdetails od  ON od.order_id = o.id
        JOIN productvariant pv ON od.product_variant_id = pv.id
        WHERE o.order_status IN ('DELIVERED', 'CONFIRMED', 'ON_DELIVERY')
          AND o.booking_date >= DATE_SUB(NOW(), INTERVAL {days} DAY)
        GROUP BY pv.product_id
    """
    df = _exec(query)
    logger.info("Loaded trending data: %d products in last %d days", len(df), days)
    return df


def load_user_behavior(user_id: int) -> dict:
    """
    Load all behavior signals for a specific user.
    Returns dict with keys: purchased_ids, wishlist_ids, cart_ids, viewed_products.
    """
    purchased = _exec(f"""
        SELECT DISTINCT pv.product_id AS product_id
        FROM orders o
        JOIN orderdetails od  ON od.order_id = o.id
        JOIN productvariant pv ON od.product_variant_id = pv.id
        WHERE o.user_id = {user_id}
          AND o.order_status IN ('DELIVERED', 'CONFIRMED', 'ON_DELIVERY')
    """)

    wishlisted = _exec(f"""
        SELECT product_id FROM wishlist_item WHERE user_id = {user_id}
    """)

    carted = _exec(f"""
        SELECT DISTINCT pv.product_id AS product_id
        FROM cart c
        JOIN cartitem ci ON ci.cart_id = c.id
        JOIN productvariant pv ON ci.product_variant_id = pv.id
        WHERE c.user_id = {user_id}
    """)

    return {
        "purchased_ids": set(purchased["product_id"].tolist()) if not purchased.empty else set(),
        "wishlist_ids": set(wishlisted["product_id"].tolist()) if not wishlisted.empty else set(),
        "cart_ids": set(carted["product_id"].tolist()) if not carted.empty else set(),
    }
