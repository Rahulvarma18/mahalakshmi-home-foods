// There is currently no backend Orders API (no Order model/routes on the
// server), so order history is kept in localStorage, scoped per browser.
// If/when a real Orders endpoint is added, this module is the only place
// that needs to change — Checkout/Orders/Admin all go through it.

const ORDERS_KEY = "mhf-orders";

export function loadOrders() {
    try {
        const raw = localStorage.getItem(ORDERS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event("mhf-orders-changed"));
}
