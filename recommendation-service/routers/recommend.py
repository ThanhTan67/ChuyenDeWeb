"""
Recommendation API endpoints.

IMPORTANT: Static routes (/trending, /top-selling, /top-rated, /similar/{id},
/category/{id}) MUST be declared BEFORE the dynamic /{user_id} route.
Otherwise FastAPI matches "trending" as user_id and returns 422.
"""
import logging
from typing import Optional
from fastapi import APIRouter, Query

from model_registry import registry
from data.data_loader import load_products, load_user_behavior
from data.preprocessor import normalize_scores

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/recommend", tags=["Recommendations"])


# ── Shared helpers ──────────────────────────────────────────────

def _get_all_product_ids() -> list:
    """Get all product IDs from DB."""
    products = load_products()
    if products.empty:
        return []
    return products["product_id"].tolist()


def _get_out_of_stock_ids() -> set:
    """Get product IDs with no stock (all variants qty=0)."""
    from sqlalchemy import text
    from database import SessionLocal

    query = """
        SELECT p.id AS product_id
        FROM product p
        WHERE NOT EXISTS (
            SELECT 1 FROM productvariant pv
            WHERE pv.product_id = p.id AND pv.quantity > 0
        )
    """
    try:
        with SessionLocal() as session:
            result = session.execute(text(query))
            return {int(row[0]) for row in result.fetchall()}
    except Exception:
        return set()


# ══════════════════════════════════════════════════════════════════
# STATIC ROUTES — must come before /{user_id}
# ══════════════════════════════════════════════════════════════════

@router.get("/trending")
async def get_trending(
    top_n: int = Query(10, ge=1, le=50),
    days: int = Query(7, ge=1, le=90),
):
    """Trending products based on recent orders."""
    items = registry.rule.get_top_trending(n=top_n, days=days)
    out_of_stock = _get_out_of_stock_ids()

    products = []
    for pid, score in items:
        if pid in out_of_stock:
            continue
        if len(products) >= top_n:
            break
        products.append({
            "product_id": pid,
            "final_score": round(score, 4),
            "rank": len(products) + 1,
        })

    return {
        "strategy": "trending",
        "count": len(products),
        "products": products,
    }


@router.get("/top-selling")
async def get_top_selling(
    top_n: int = Query(10, ge=1, le=50),
):
    """All-time best-selling products."""
    items = registry.rule.get_top_selling(n=top_n)
    out_of_stock = _get_out_of_stock_ids()

    products = []
    for pid, score in items:
        if pid in out_of_stock:
            continue
        if len(products) >= top_n:
            break
        products.append({
            "product_id": pid,
            "final_score": round(score, 4),
            "rank": len(products) + 1,
        })

    return {
        "strategy": "top_selling",
        "count": len(products),
        "products": products,
    }


@router.get("/top-rated")
async def get_top_rated(
    top_n: int = Query(10, ge=1, le=50),
    min_reviews: int = Query(2, ge=1),
):
    """Top-rated products (Bayesian average)."""
    items = registry.rule.get_top_rated(n=top_n, min_reviews=min_reviews)
    out_of_stock = _get_out_of_stock_ids()

    products = []
    for pid, score in items:
        if pid in out_of_stock:
            continue
        if len(products) >= top_n:
            break
        products.append({
            "product_id": pid,
            "final_score": round(score, 4),
            "rank": len(products) + 1,
        })

    return {
        "strategy": "top_rated",
        "count": len(products),
        "products": products,
    }


@router.get("/similar/{product_id}")
async def get_similar_products(
    product_id: int,
    top_n: int = Query(10, ge=1, le=50),
):
    """Content-based similar products."""
    if not registry.content.trained:
        return {"strategy": "content", "count": 0, "products": []}

    out_of_stock = _get_out_of_stock_ids()
    similar = registry.content.get_similar(product_id, n=top_n + len(out_of_stock))

    products = []
    for pid, score in similar:
        if pid in out_of_stock:
            continue
        if len(products) >= top_n:
            break
        products.append({
            "product_id": pid,
            "final_score": round(score, 4),
            "rank": len(products) + 1,
        })

    return {
        "strategy": "content_similarity",
        "count": len(products),
        "products": products,
    }


@router.get("/category/{category_id}")
async def get_category_recommendations(
    category_id: int,
    top_n: int = Query(10, ge=1, le=50),
):
    """Recommendations within a specific category."""
    from sqlalchemy import text
    from database import SessionLocal

    # Get products in this category
    query = f"SELECT id FROM product WHERE category_id = {category_id}"
    with SessionLocal() as session:
        result = session.execute(text(query))
        category_pids = [int(row[0]) for row in result.fetchall()]

    if not category_pids:
        return {"strategy": "category", "count": 0, "products": []}

    # Use rule-based scoring within category
    rule_scores = registry.rule.get_combined_scores(category_pids)
    out_of_stock = _get_out_of_stock_ids()

    sorted_items = sorted(rule_scores.items(), key=lambda x: x[1], reverse=True)
    products = []
    for pid, score in sorted_items:
        if pid in out_of_stock:
            continue
        if len(products) >= top_n:
            break
        products.append({
            "product_id": pid,
            "final_score": round(score, 4),
            "rank": len(products) + 1,
        })

    return {
        "strategy": "category",
        "category_id": category_id,
        "count": len(products),
        "products": products,
    }


# ══════════════════════════════════════════════════════════════════
# DYNAMIC ROUTE — must come LAST to avoid shadowing static routes
# ══════════════════════════════════════════════════════════════════

@router.get("/{user_id}")
async def get_personalized_recommendations(
    user_id: int,
    top_n: int = Query(10, ge=1, le=50),
    diversity: float = Query(0.3, ge=0.0, le=1.0),
):
    """
    Personalized hybrid recommendations for a user.
    Combines SVD + NCF + Content + Behavior + Rule scores.
    """
    all_product_ids = _get_all_product_ids()
    if not all_product_ids:
        return {"strategy": "empty", "cold_start": True, "count": 0, "products": []}

    # Load user behavior data
    user_behavior = load_user_behavior(user_id)
    purchased_ids = user_behavior["purchased_ids"]
    out_of_stock_ids = _get_out_of_stock_ids()

    # Count user interactions for cold-start detection
    n_interactions = (
        len(purchased_ids)
        + len(user_behavior["wishlist_ids"])
        + len(user_behavior["cart_ids"])
    )

    # ── Score with each model ────────────────────────────────────────
    # 1. SVD scores
    svd_scores = {}
    if registry.svd.trained:
        svd_scores = registry.svd.get_all_scores(user_id, all_product_ids)

    # 2. NCF scores
    ncf_scores = {}
    if registry.ncf.trained:
        ncf_scores = registry.ncf.get_all_scores(user_id, all_product_ids)

    # 3. Content-based scores (user profile from purchases)
    content_scores = {}
    if registry.content.trained:
        content_scores = registry.content.get_all_scores(
            list(purchased_ids | user_behavior["wishlist_ids"]),
            all_product_ids,
        )

    # 4. Behavior scores (VIEW, CLICK, ADD_TO_CART, PURCHASE, SEARCH)
    behavior_scores = registry.behavior.get_scores(user_id, all_product_ids)

    # 5. Rule scores (trending, top-selling, Bayesian)
    rule_scores = registry.rule.get_combined_scores(all_product_ids)

    # ── Fuse ─────────────────────────────────────────────────────────
    fused = registry.fusion.fuse(
        svd_scores=svd_scores,
        ncf_scores=ncf_scores,
        content_scores=content_scores,
        behavior_scores=behavior_scores,
        rule_scores=rule_scores,
        n_interactions=n_interactions,
        purchased_ids=purchased_ids,
        out_of_stock_ids=out_of_stock_ids,
    )

    # ── MMR Reranking for diversity ──────────────────────────────────
    def similarity_fn(pid_a, pid_b):
        if registry.content.trained:
            similar = registry.content.get_similar(pid_a, n=100)
            sim_dict = dict(similar)
            return sim_dict.get(pid_b, 0.0)
        return 0.0

    if diversity > 0 and registry.content.trained:
        registry.fusion.mmr_lambda = 1.0 - diversity
        fused = registry.fusion.mmr_rerank(fused, similarity_fn, top_n=top_n)
    else:
        fused = fused[:top_n]

    # ── Build response ───────────────────────────────────────────────
    is_cold_start = n_interactions < registry.fusion.COLD_START_THRESHOLD
    strategy = "cold_start" if is_cold_start else "hybrid"

    products = []
    for rank, (pid, score, breakdown) in enumerate(fused, 1):
        products.append({
            "product_id": pid,
            "final_score": round(score, 4),
            "rank": rank,
            "scores": breakdown,
        })

    return {
        "strategy": strategy,
        "cold_start": is_cold_start,
        "count": len(products),
        "products": products,
    }
