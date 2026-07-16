import API from "./api";

export const getProducts = async () => {

    const res = await API.get("/products");

    return res.data;

};

export const getProduct = async (id) => {

    const res = await API.get(`/products/${id}`);

    return res.data;

};

// Admin-only. Requires an admin JWT (attached automatically by the
// interceptor in ./api.js as long as the logged-in user has role "admin").

export const createProduct = async (product) => {

    const res = await API.post("/products", product);

    return res.data;

};

export const updateProduct = async (id, product) => {

    const res = await API.put(`/products/${id}`, product);

    return res.data;

};

export const deleteProduct = async (id) => {

    const res = await API.delete(`/products/${id}`);

    return res.data;

};

// Admin-only. Uploads a single image file to Cloudinary and returns
// { url, publicId }. Use the returned url as the product's `image` field.
export const uploadProductImage = async (file) => {

    const formData = new FormData();
    formData.append("image", file);

    const res = await API.post("/products/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;

};

// Admin-only. Uploads up to 6 image files to Cloudinary and returns
// { images: [{ url, publicId }, ...] }.
export const uploadProductGalleryImages = async (files) => {

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    const res = await API.post("/products/upload-gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;

};

// Any logged-in user. Tells the UI whether to show a "Write a Review"
// form: they must have a Delivered order for this product and must
// not have already reviewed it.
export const getReviewEligibility = async (id) => {

    const res = await API.get(`/products/${id}/review-eligibility`);

    return res.data;

};

// Any logged-in user who is eligible (see above). payload: { rating, title, comment }
export const submitReview = async (id, payload) => {

    const res = await API.post(`/products/${id}/reviews`, payload);

    return res.data;

};