import API from "./api";

// All requests below automatically carry the JWT via the API
// interceptor (see api.js), so no token param is needed here.

// ==============================
// GET CART
// ==============================
export const getCart = async () => {
    const res = await API.get("/cart");
    return res.data;
};

// ==============================
// ADD ITEM
// ==============================
export const addToCart = async (productId, weight, qty = 1) => {
    const res = await API.post("/cart/add", { productId, weight, qty });
    return res.data;
};

// ==============================
// UPDATE QUANTITY
// ==============================
export const updateCart = async (productId, weight, qty) => {
    const res = await API.put("/cart/update", { productId, weight, qty });
    return res.data;
};

// ==============================
// REMOVE ITEM
// ==============================
export const removeCartItem = async (productId, weight) => {
    const res = await API.delete("/cart/remove", {
        data: { productId, weight },
    });
    return res.data;
};

// ==============================
// CLEAR CART
// ==============================
export const clearCart = async () => {
    const res = await API.delete("/cart/clear");
    return res.data;
};

// ==============================
// MERGE GUEST CART (called once, right after login/signup)
// ==============================
export const mergeGuestCart = async (items) => {
    const res = await API.post("/cart/merge", { items });
    return res.data;
};
