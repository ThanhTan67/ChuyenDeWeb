"""
Behavior-Based Scoring — Full signal coverage.
Tracks: VIEW, CLICK, ADD_TO_CART, PURCHASE, SEARCH.

Combines behavior signals from:
1. user_behavior_event table (VIEW, CLICK, SEARCH)
2. orders/orderdetails (PURCHASE)
3. cartitem (ADD_TO_CART)
4. wishlist_item (WISHLIST)

Each signal has a weight and exponential time decay.
"""
import logging
import math
from datetime import datetime, timezone
from typing import Dict, List, Tuple

import pandas as pd
from sqlalchemy import text

from database import SessionLocal
from config import BEHAVIOR_DECAY_LAMBDA

logger = logging.getLogger(__name__)

# ── Signal Weights ───────────────────────────────────────────────────
SIGNAL_WEIGHTS = {
    "PURCHASE": 5.0,
    "ADD_TO_CART": 2.5,
    "WISHLIST": 2.0,
    "CLICK": 1.5,
    "VIEW": 1.0,
    "SEARCH": 0.8,
}


class BehaviorModel:
    """
    Behavior-based scoring with full signal coverage:
    VIEW, CLICK, ADD_TO_CART, PURCHASE, SEARCH, WISHLIST.
    """

    def __init__(self, decay_lambda: float = None):
        self.decay_lambda = decay_lambda or BEHAVIOR_DECAY_LAMBDA

    def _time_decay(self, days_ago: float) -> float:
        """Exponential time decay: exp(-lambda * days_ago)."""
        return math.exp(-self.decay_lambda * max(days_ago, 0))

    def _load_behavior_events(self, user_id: int) -> pd.DataFrame:
        """Load all behavior events for a user from user_behavior_event table."""
        query = f"""
            SELECT product_id, event_type, created_at
            FROM user_behavior_event
            WHERE user_id = {user_id}
              AND product_id IS NOT NULL
            ORDER BY created_at DESC
        """
        try:
            with SessionLocal() as session:
                result = session.execute(text(query))
                rows = result.fetchall()
                if not rows:
                    return pd.DataFrame(columns=["product_id", "event_type", "created_at"])
                return pd.DataFrame(rows, columns=result.keys())
        except Exception as e:
            logger.debug("user_behavior_event table may not exist yet: %s", e)
            return pd.DataFrame(columns=["product_id", "event_type", "created_at"])

    def _load_purchase_events(self, user_id: int) -> pd.DataFrame:
        """Load purchase events from orders."""
        query = f"""
            SELECT pv.product_id    AS product_id,
                   'PURCHASE'       AS event_type,
                   o.booking_date   AS created_at
            FROM orders o
            JOIN orderdetails od  ON od.order_id = o.id
            JOIN productvariant pv ON od.product_variant_id = pv.id
            WHERE o.user_id = {user_id}
              AND o.order_status IN ('DELIVERED', 'CONFIRMED', 'ON_DELIVERY')
        """
        try:
            with SessionLocal() as session:
                result = session.execute(text(query))
                rows = result.fetchall()
                if not rows:
                    return pd.DataFrame(columns=["product_id", "event_type", "created_at"])
                return pd.DataFrame(rows, columns=result.keys())
        except Exception:
            return pd.DataFrame(columns=["product_id", "event_type", "created_at"])

    def _load_cart_events(self, user_id: int) -> pd.DataFrame:
        """Load cart events (ADD_TO_CART)."""
        query = f"""
            SELECT pv.product_id    AS product_id,
                   'ADD_TO_CART'    AS event_type,
                   NOW()           AS created_at
            FROM cart c
            JOIN cartitem ci ON ci.cart_id = c.id
            JOIN productvariant pv ON ci.product_variant_id = pv.id
            WHERE c.user_id = {user_id}
        """
        try:
            with SessionLocal() as session:
                result = session.execute(text(query))
                rows = result.fetchall()
                if not rows:
                    return pd.DataFrame(columns=["product_id", "event_type", "created_at"])
                return pd.DataFrame(rows, columns=result.keys())
        except Exception:
            return pd.DataFrame(columns=["product_id", "event_type", "created_at"])

    def _load_wishlist_events(self, user_id: int) -> pd.DataFrame:
        """Load wishlist events."""
        query = f"""
            SELECT product_id,
                   'WISHLIST'      AS event_type,
                   NOW()           AS created_at
            FROM wishlist_item
            WHERE user_id = {user_id}
        """
        try:
            with SessionLocal() as session:
                result = session.execute(text(query))
                rows = result.fetchall()
                if not rows:
                    return pd.DataFrame(columns=["product_id", "event_type", "created_at"])
                return pd.DataFrame(rows, columns=result.keys())
        except Exception:
            return pd.DataFrame(columns=["product_id", "event_type", "created_at"])

    def get_scores(
        self,
        user_id: int,
        candidate_ids: List[int],
    ) -> Dict[int, float]:
        """
        Compute behavior scores for a user across all candidate products.
        Combines all 5+ signals with time decay.

        Signals covered:
        - VIEW (from user_behavior_event)
        - CLICK (from user_behavior_event)
        - SEARCH (from user_behavior_event — when user searches and views a product)
        - ADD_TO_CART (from cartitem + user_behavior_event)
        - PURCHASE (from orders)
        - WISHLIST (from wishlist_item)
        """
        now = datetime.now(timezone.utc)

        # Load all event sources
        behavior_events = self._load_behavior_events(user_id)  # VIEW, CLICK, SEARCH
        purchase_events = self._load_purchase_events(user_id)
        cart_events = self._load_cart_events(user_id)
        wishlist_events = self._load_wishlist_events(user_id)

        # Combine all events
        all_events = pd.concat(
            [behavior_events, purchase_events, cart_events, wishlist_events],
            ignore_index=True,
        )

        if all_events.empty:
            return {pid: 0.0 for pid in candidate_ids}

        # Calculate scores per product
        scores: Dict[int, float] = {}
        candidate_set = set(candidate_ids)

        for _, event in all_events.iterrows():
            pid = int(event["product_id"])
            if pid not in candidate_set:
                continue

            event_type = str(event["event_type"])
            weight = SIGNAL_WEIGHTS.get(event_type, 0.5)

            # Time decay
            created_at = event["created_at"]
            if created_at is not None and pd.notna(created_at):
                try:
                    if hasattr(created_at, "timestamp"):
                        event_time = created_at
                    else:
                        event_time = pd.Timestamp(created_at)
                    if event_time.tzinfo is None:
                        event_time = event_time.tz_localize("UTC")
                    days_ago = (now - event_time.to_pydatetime()).total_seconds() / 86400
                except Exception:
                    days_ago = 0.0
            else:
                days_ago = 0.0

            decay = self._time_decay(days_ago)
            score_contrib = weight * decay

            scores[pid] = scores.get(pid, 0.0) + score_contrib

        # Fill missing candidates with 0
        for pid in candidate_ids:
            if pid not in scores:
                scores[pid] = 0.0

        return scores

    def get_top_n(
        self,
        user_id: int,
        candidate_ids: List[int],
        n: int = 10,
    ) -> List[Tuple[int, float]]:
        """Top-N products by behavior score."""
        scores = self.get_scores(user_id, candidate_ids)
        sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_items[:n]
