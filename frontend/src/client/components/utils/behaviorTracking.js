/**
 * Centralized user behavior tracking utility.
 * Sends events to POST /api/behaviors for the AI recommendation engine.
 * Fire-and-forget: tracking errors never break UX.
 * Includes deduplication to prevent React StrictMode double-fires.
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8443';
const BEHAVIOR_API = `${API_BASE_URL}/api/behaviors`;

// Deduplication cache: prevents the same event from firing within DEDUP_MS
const DEDUP_MS = 2000; // 2 seconds
const recentEvents = new Map();

/**
 * Track a user behavior event.
 * @param {number|null} userId    - Logged-in user's ID (skip if null)
 * @param {number|null} productId - Related product ID (null for SEARCH events)
 * @param {string}      eventType - One of: VIEW, CLICK, ADD_TO_CART, PURCHASE, SEARCH
 * @param {string|null} searchQuery - Search query text (only for SEARCH events)
 */
export const trackBehavior = (userId, productId, eventType, searchQuery = null) => {
    // Skip tracking for anonymous users
    if (!userId) return;

    // Deduplication: skip if the same event was sent recently
    const dedupKey = `${userId}_${productId}_${eventType}_${searchQuery || ''}`;
    const now = Date.now();
    if (recentEvents.has(dedupKey) && (now - recentEvents.get(dedupKey)) < DEDUP_MS) {
        return; // Skip duplicate
    }
    recentEvents.set(dedupKey, now);

    // Clean old entries to prevent memory leak
    if (recentEvents.size > 100) {
        for (const [key, timestamp] of recentEvents) {
            if (now - timestamp > DEDUP_MS) recentEvents.delete(key);
        }
    }

    const payload = {
        userId,
        productId: productId || null,
        eventType,
        searchQuery: searchQuery || null,
    };

    // Fire-and-forget: non-blocking, silent error handling
    fetch(BEHAVIOR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    }).catch(() => {
        // Silently ignore tracking errors — never break UX
    });
};

export default trackBehavior;
