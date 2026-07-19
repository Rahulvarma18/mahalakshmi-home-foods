import API from "./api";

// Places an order for the logged-in user. payload: { items, total, address, payment }
export const createOrder = async (payload) => {

    const res = await API.post("/orders", payload);

    return res.data;

};

// Logged-in user's own order history.
export const getMyOrders = async () => {

    const res = await API.get("/orders/mine");

    return res.data;

};

// Admin only — every order across all customers.
export const getAllOrders = async () => {

    const res = await API.get("/orders");

    return res.data;

};

// Admin only.
export const updateOrderStatus = async (id, status) => {

    const res = await API.put(`/orders/${id}/status`, { status });

    return res.data;

};

// Admin only — dashboard totals for the Admin panel. days: 7 | 14 | 30 | 90
export const getSalesStats = async (days = 7) => {

    const res = await API.get("/orders/stats", { params: { days } });

    return res.data;

};