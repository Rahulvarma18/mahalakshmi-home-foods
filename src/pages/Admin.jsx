import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaTrash,
    FaEdit,
    FaPlus,
} from "react-icons/fa";
import { toast } from "sonner";
import { cldUrl } from "../lib/cloudinary";

import { useAuth } from "../context/AuthContext";

import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    uploadProductGalleryImages,
} from "../api/productApi";

import {
    getAllOrders,
    updateOrderStatus,
    getSalesStats,
} from "../api/orderApi";

const CATEGORIES = [
    "Traditional Sweets",
    "Traditional Snacks",
    "Healthy Sweets",
    "Future Products",
];

function splitList(text) {
    return (text || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

// Converts a raw backend product (or nothing, for a new product) into the
// flat shape the form inputs work with. Arrays like ingredients/tags/gallery
// are edited as comma-separated text and split back into arrays on save.
function productToForm(p) {
    return {
        id: p?.id || `product-${Date.now()}`,
        name: p?.name || "",
        category: p?.category || CATEGORIES[0],
        image: p?.image || "",
        galleryText: (p?.gallery || []).join(", "),
        description: p?.description || "",
        variants: p?.variants?.length
            ? p.variants.map((v) => ({
                weight: v.weight || "",
                price: v.price ?? "",
                oldPrice: v.oldPrice ?? "",
            }))
            : [{ weight: "250g", price: "", oldPrice: "" }],
        rating: p?.rating ?? 4.5,
        ingredientsText: (p?.ingredients || []).join(", "),
        nutrition: {
            calories: p?.nutrition?.calories ?? "",
            protein: p?.nutrition?.protein ?? "",
            carbs: p?.nutrition?.carbs ?? "",
            fat: p?.nutrition?.fat ?? "",
            sugar: p?.nutrition?.sugar ?? "",
            fiber: p?.nutrition?.fiber ?? "",
        },
        shelfLife: p?.shelfLife || "",
        storage: p?.storage || "",
        delivery: p?.delivery || "",
        stock: p?.stock ?? 0,
        sku: p?.sku || "",
        tagsText: (p?.tags || []).join(", "),
        bestSeller: p?.bestSeller || false,
    };
}

// Converts the form's flat shape back into the payload the backend
// Product schema expects.
function formToPayload(f) {
    return {
        id: f.id.trim(),
        name: f.name.trim(),
        category: f.category,
        image: f.image.trim(),
        gallery: splitList(f.galleryText),
        description: f.description,
        variants: f.variants
            .filter((v) => v.weight && Number(v.price) > 0)
            .map((v) => ({
                weight: v.weight,
                price: Number(v.price),
                ...(v.oldPrice ? { oldPrice: Number(v.oldPrice) } : {}),
            })),
        rating: Number(f.rating) || 4.5,
        ingredients: splitList(f.ingredientsText),
        nutrition: {
            calories: f.nutrition.calories ? Number(f.nutrition.calories) : undefined,
            protein: f.nutrition.protein || undefined,
            carbs: f.nutrition.carbs || undefined,
            fat: f.nutrition.fat || undefined,
            sugar: f.nutrition.sugar || undefined,
            fiber: f.nutrition.fiber || undefined,
        },
        shelfLife: f.shelfLife || undefined,
        storage: f.storage || undefined,
        delivery: f.delivery || undefined,
        stock: Number(f.stock) || 0,
        sku: f.sku || undefined,
        tags: splitList(f.tagsText),
        bestSeller: !!f.bestSeller,
    };
}

function priceRange(product) {
    const prices = (product.variants || []).map((v) => v.price).filter((n) => typeof n === "number");

    if (prices.length === 0) return "—";

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
}

function Admin() {
    const { user, loading: authLoading } = useAuth();

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);

    const [loadingProducts, setLoadingProducts] = useState(true);

    const [saving, setSaving] = useState(false);

    const [tab, setTab] = useState("dashboard");

    const [editing, setEditing] = useState(null);

    // Tracks whether the main image / gallery images are currently being
    // uploaded to Cloudinary, so the form can show a spinner and disable
    // Save until the resulting URLs are actually available.
    const [uploadingImage, setUploadingImage] = useState(false);

    const [uploadingGallery, setUploadingGallery] = useState(false);

    const [orders, setOrders] = useState([]);

    const [loadingOrders, setLoadingOrders] = useState(true);

    const [stats, setStats] = useState(null);

    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== "admin") {
            navigate("/auth");
        }
    }, [user, authLoading, navigate]);

    const refreshProducts = async () => {
        try {
            setLoadingProducts(true);

            const data = await getProducts();

            setProducts(data);
        } catch (err) {
            toast.error("Failed to load products");
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== "admin") return;

        refreshProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user]);

    const refreshOrders = async () => {
        try {
            setLoadingOrders(true);

            const data = await getAllOrders();

            setOrders(data);
        } catch (err) {
            toast.error("Failed to load orders");
        } finally {
            setLoadingOrders(false);
        }
    };

    const refreshStats = async () => {
        try {
            setLoadingStats(true);

            const data = await getSalesStats();

            setStats(data);
        } catch (err) {
            toast.error("Failed to load sales dashboard");
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== "admin") return;

        refreshOrders();
        refreshStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user]);

    if (!user || user.role !== "admin") {
        return null;
    }

    const removeProduct = async (id) => {
        try {
            await deleteProduct(id);

            await refreshProducts();

            toast.success("Product removed");
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to delete product"
            );
        }
    };

    // Fires when the admin picks a file for the main product image. Uploads
    // it straight to Cloudinary and stores the returned URL in the form —
    // nothing is saved to the product until "Save" is clicked.
    const handleImageFileChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        try {
            setUploadingImage(true);

            const { url } = await uploadProductImage(file);

            setEditing((prev) => ({ ...prev, image: url }));

            toast.success("Image uploaded");
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Image upload failed"
            );
        } finally {
            setUploadingImage(false);

            // Allow re-selecting the same file later.
            e.target.value = "";
        }
    };

    // Same idea for the gallery: uploads up to 6 files, and appends the
    // resulting URLs to whatever's already in galleryText.
    const handleGalleryFileChange = async (e) => {
        const files = e.target.files;

        if (!files || files.length === 0) return;

        try {
            setUploadingGallery(true);

            const { images } = await uploadProductGalleryImages(files);

            const newUrls = images.map((img) => img.url);

            setEditing((prev) => {
                const existing = splitList(prev.galleryText);

                return {
                    ...prev,
                    galleryText: [...existing, ...newUrls].join(", "),
                };
            });

            toast.success(
                `${newUrls.length} gallery image${newUrls.length === 1 ? "" : "s"} uploaded`
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Gallery upload failed"
            );
        } finally {
            setUploadingGallery(false);

            e.target.value = "";
        }
    };

    const saveProduct = async (form) => {
        if (!form.name || !form.id) {
            toast.error("Please fill product name and ID");

            return;
        }

        const payload = formToPayload(form);

        if (payload.variants.length === 0) {
            toast.error("Add at least one weight variant with a price");

            return;
        }

        const exists = products.some((p) => p.id === payload.id);

        try {
            setSaving(true);

            if (exists) {
                await updateProduct(payload.id, payload);
            } else {
                await createProduct(payload);
            }

            await refreshProducts();

            setEditing(null);

            toast.success(exists ? "Product updated" : "Product added");
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to save product"
            );
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await updateOrderStatus(id, status);

            await refreshOrders();

            refreshStats();
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to update order status"
            );
        }
    };

    const updateVariant = (index, field, value) => {
        setEditing((prev) => {
            const variants = [...prev.variants];

            variants[index] = { ...variants[index], [field]: value };

            return { ...prev, variants };
        });
    };

    const addVariant = () => {
        setEditing((prev) => ({
            ...prev,
            variants: [...prev.variants, { weight: "", price: "", oldPrice: "" }],
        }));
    };

    const removeVariant = (index) => {
        setEditing((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="max-w-[1400px] mx-auto px-5 md:px-20 py-16">

            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">

                <div>

                    <p className="eyebrow mb-3">
                        Admin Panel
                    </p>

                    <h1 className="font-serif text-4xl md:text-5xl text-brand-dark">
                        Dashboard
                    </h1>

                </div>

            </div>

            <div className="flex gap-2 mb-8 border-b border-brand-border">

                {["dashboard", "products", "orders"].map((t) => (

                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition ${tab === t
                            ? "border-brand-maroon text-brand-maroon"
                            : "border-transparent text-brand-muted hover:text-brand-dark"
                            }`}
                    >
                        {t}
                        {t === "products" && ` (${products.length})`}
                        {t === "orders" && ` (${orders.length})`}
                    </button>

                ))}

            </div>
            {tab === "dashboard" ? (

                loadingStats || !stats ? (

                    <p className="text-brand-muted">Loading dashboard…</p>

                ) : (

                    <div className="space-y-8">

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <StatCard
                                label="Total Sales"
                                value={`₹${stats.totalSales.toLocaleString("en-IN")}`}
                            />

                            <StatCard
                                label="Total Orders"
                                value={stats.totalOrders}
                            />

                            <StatCard
                                label="Avg. Order Value"
                                value={`₹${Math.round(stats.avgOrderValue).toLocaleString("en-IN")}`}
                            />

                            <StatCard
                                label="Products Listed"
                                value={products.length}
                            />

                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                            <div className="rounded-lg border border-brand-border bg-white p-6">

                                <h3 className="mb-4 font-serif text-xl text-brand-dark">
                                    Sales — Last 7 Days
                                </h3>

                                <div className="flex items-end gap-3" style={{ height: 160 }}>

                                    {stats.salesLast7Days.map((day) => {

                                        const max = Math.max(
                                            ...stats.salesLast7Days.map((d) => d.total),
                                            1
                                        );

                                        const heightPct = (day.total / max) * 100;

                                        return (
                                            <div
                                                key={day.date}
                                                className="flex flex-1 flex-col items-center gap-2"
                                            >
                                                <div className="flex h-[120px] w-full items-end">
                                                    <div
                                                        className="w-full rounded-t-md bg-brand-maroon transition-all"
                                                        style={{
                                                            height: `${Math.max(heightPct, 2)}%`,
                                                        }}
                                                        title={`₹${day.total}`}
                                                    />
                                                </div>

                                                <span className="text-[10px] text-brand-muted">
                                                    {new Date(day.date).toLocaleDateString(undefined, {
                                                        weekday: "short",
                                                    })}
                                                </span>
                                            </div>
                                        );

                                    })}

                                </div>

                            </div>

                            <div className="rounded-lg border border-brand-border bg-white p-6">

                                <h3 className="mb-4 font-serif text-xl text-brand-dark">
                                    Orders by Status
                                </h3>

                                <div className="space-y-3">

                                    {Object.keys(stats.ordersByStatus).length === 0 ? (

                                        <p className="text-sm text-brand-muted">
                                            No orders yet.
                                        </p>

                                    ) : (

                                        Object.entries(stats.ordersByStatus).map(
                                            ([status, count]) => (

                                                <div
                                                    key={status}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <span className="text-brand-dark">
                                                        {status}
                                                    </span>

                                                    <span className="font-semibold">
                                                        {count}
                                                    </span>
                                                </div>

                                            )
                                        )

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                )

            ) : tab === "products" ? (
                <>
                    <button
                        onClick={() => setEditing(productToForm(null))}
                        className="btn-primary mb-6"
                    >
                        <FaPlus className="mr-2" />
                        Add Product
                    </button>

                    {loadingProducts ? (

                        <p className="text-brand-muted">Loading products…</p>

                    ) : (

                        <div className="overflow-hidden rounded-lg border border-brand-border bg-white">

                            <table className="w-full text-sm">

                                <thead className="bg-cream">

                                    <tr>

                                        <th className="p-4 text-left">
                                            Product
                                        </th>

                                        <th className="hidden p-4 text-left md:table-cell">
                                            Category
                                        </th>

                                        <th className="p-4 text-left">
                                            Price
                                        </th>

                                        <th className="p-4 text-right">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {products.map((product) => (

                                        <tr
                                            key={product.id}
                                            className="border-t border-brand-border"
                                        >

                                            <td className="p-4">

                                                <div className="flex items-center gap-3">

                                                    <img
                                                        src={cldUrl(product.image, { width: 150 })}
                                                        alt={product.name}
                                                        className="h-14 w-14 rounded-md object-cover"
                                                    />

                                                    <div>

                                                        <h3 className="font-medium">
                                                            {product.name}
                                                        </h3>

                                                        <p className="text-xs text-brand-muted">
                                                            {product.id}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            <td className="hidden p-4 md:table-cell">
                                                {product.category}
                                            </td>

                                            <td className="p-4">
                                                {priceRange(product)}
                                            </td>

                                            <td className="p-4">

                                                <div className="flex justify-end gap-4">

                                                    <button
                                                        onClick={() =>
                                                            setEditing(productToForm(product))
                                                        }
                                                        className="text-brand-muted transition hover:text-brand-maroon"
                                                    >
                                                        <FaEdit />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            removeProduct(product.id)
                                                        }
                                                        className="text-brand-muted transition hover:text-red-600"
                                                    >
                                                        <FaTrash />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}
                </>
            ) : (
                <div className="space-y-4">

                    {loadingOrders ? (

                        <p className="text-brand-muted">Loading orders…</p>

                    ) : orders.length === 0 ? (

                        <p className="text-brand-muted">No orders yet.</p>

                    ) : (

                        orders.map((order) => (

                            <div
                                key={order.id}
                                className="rounded-lg border border-brand-border bg-white p-5"
                            >

                                <div className="flex flex-wrap justify-between gap-3 mb-3">

                                    <div>

                                        <p className="font-medium">
                                            Order #{order.id}
                                        </p>

                                        <p className="text-xs text-brand-muted">
                                            {order.date}
                                        </p>

                                    </div>

                                    <div className="flex items-center gap-3">

                                        <span className="font-semibold">
                                            ₹{order.total}
                                        </span>

                                        <select
                                            value={order.status}
                                            onChange={(e) =>
                                                updateStatus(order.id, e.target.value)
                                            }
                                            className="rounded-md border border-brand-border px-3 py-1.5 text-sm"
                                        >
                                            <option value="Pending">
                                                Pending
                                            </option>

                                            <option value="Placed">
                                                Placed
                                            </option>

                                            <option value="Shipped">
                                                Shipped
                                            </option>

                                            <option value="Delivered">
                                                Delivered
                                            </option>

                                        </select>

                                    </div>

                                </div>

                                <p className="text-sm text-brand-muted">

                                    {order.items
                                        .map(
                                            (item) =>
                                                `${item.name} × ${item.qty}`
                                        )
                                        .join(", ")}

                                </p>

                                <p className="mt-2 text-sm text-brand-muted">

                                    {order.address.name},{" "}
                                    {order.address.line1},{" "}
                                    {order.address.city} —{" "}
                                    {order.address.pincode}

                                    {" • "}

                                    {order.payment}

                                </p>

                            </div>

                        ))

                    )}

                </div>
            )}
            {editing && (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
                    onClick={() => setEditing(null)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 md:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-6 font-serif text-2xl">
                            {products.some((p) => p.id === editing.id) ? "Edit Product" : "Add Product"}
                        </h2>

                        <div className="space-y-4">

                            <F
                                label="Product ID (Slug)"
                                value={editing.id}
                                onChange={(v) =>
                                    setEditing({
                                        ...editing,
                                        id: v,
                                    })
                                }
                            />

                            <F
                                label="Product Name"
                                value={editing.name}
                                onChange={(v) =>
                                    setEditing({
                                        ...editing,
                                        name: v,
                                    })
                                }
                            />

                            <label className="block">
                                <span className="mb-2 block text-sm text-brand-muted">
                                    Category
                                </span>

                                <select
                                    value={editing.category}
                                    onChange={(e) =>
                                        setEditing({
                                            ...editing,
                                            category: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-brand-border bg-cream px-4 py-3"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </label>

                            <div className="space-y-2">
                                <F
                                    label="Image URL"
                                    value={editing.image}
                                    onChange={(v) =>
                                        setEditing({
                                            ...editing,
                                            image: v,
                                        })
                                    }
                                />

                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer rounded-md border border-brand-border bg-cream px-3 py-2 text-sm text-brand-muted hover:bg-brand-border/20">
                                        {uploadingImage
                                            ? "Uploading..."
                                            : "Upload image to Cloudinary"}

                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={handleImageFileChange}
                                            disabled={uploadingImage}
                                            className="hidden"
                                        />
                                    </label>

                                    {editing.image && (
                                        <img
                                            src={cldUrl(editing.image, { width: 100 })}
                                            alt="Preview"
                                            className="h-12 w-12 rounded object-cover"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <F
                                    label="Gallery Image URLs (comma separated)"
                                    value={editing.galleryText}
                                    onChange={(v) =>
                                        setEditing({
                                            ...editing,
                                            galleryText: v,
                                        })
                                    }
                                />

                                <label className="inline-block cursor-pointer rounded-md border border-brand-border bg-cream px-3 py-2 text-sm text-brand-muted hover:bg-brand-border/20">
                                    {uploadingGallery
                                        ? "Uploading..."
                                        : "Upload gallery images to Cloudinary (up to 6)"}

                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        multiple
                                        onChange={handleGalleryFileChange}
                                        disabled={uploadingGallery}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <label className="block">

                                <span className="mb-2 block text-sm text-brand-muted">
                                    Description
                                </span>

                                <textarea
                                    rows="4"
                                    value={editing.description}
                                    onChange={(e) =>
                                        setEditing({
                                            ...editing,
                                            description:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-brand-border bg-cream px-4 py-3"
                                />

                            </label>

                            {/* Weight variants */}

                            <div>

                                <span className="mb-2 block text-sm text-brand-muted">
                                    Weight Variants &amp; Pricing
                                </span>

                                <div className="space-y-3">

                                    {editing.variants.map((variant, i) => (

                                        <div key={i} className="flex items-end gap-2">

                                            <div className="flex-1">
                                                <span className="mb-1 block text-xs text-brand-muted">Weight</span>
                                                <input
                                                    value={variant.weight}
                                                    onChange={(e) => updateVariant(i, "weight", e.target.value)}
                                                    placeholder="250g"
                                                    className="w-full rounded-md border border-brand-border bg-cream px-3 py-2 text-sm"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <span className="mb-1 block text-xs text-brand-muted">Price</span>
                                                <input
                                                    value={variant.price}
                                                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                                                    placeholder="249"
                                                    className="w-full rounded-md border border-brand-border bg-cream px-3 py-2 text-sm"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <span className="mb-1 block text-xs text-brand-muted">Old Price</span>
                                                <input
                                                    value={variant.oldPrice}
                                                    onChange={(e) => updateVariant(i, "oldPrice", e.target.value)}
                                                    placeholder="optional"
                                                    className="w-full rounded-md border border-brand-border bg-cream px-3 py-2 text-sm"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeVariant(i)}
                                                disabled={editing.variants.length === 1}
                                                className="mb-1 px-2 py-2 text-brand-muted hover:text-red-600 disabled:opacity-30"
                                            >
                                                <FaTrash />
                                            </button>

                                        </div>

                                    ))}

                                </div>

                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="mt-2 text-sm text-brand-maroon underline"
                                >
                                    + Add another weight
                                </button>

                            </div>

                            <F
                                label="Rating (1-5)"
                                value={editing.rating}
                                onChange={(v) =>
                                    setEditing({
                                        ...editing,
                                        rating: v,
                                    })
                                }
                            />

                            <F
                                label="Ingredients (comma separated)"
                                value={editing.ingredientsText}
                                onChange={(v) =>
                                    setEditing({
                                        ...editing,
                                        ingredientsText: v,
                                    })
                                }
                            />

                            {/* Nutrition facts */}

                            <div>

                                <span className="mb-2 block text-sm text-brand-muted">
                                    Nutrition Facts
                                </span>

                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">

                                    {["calories", "protein", "carbs", "fat", "sugar", "fiber"].map((field) => (

                                        <div key={field}>
                                            <span className="mb-1 block text-xs capitalize text-brand-muted">{field}</span>
                                            <input
                                                value={editing.nutrition[field]}
                                                onChange={(e) =>
                                                    setEditing({
                                                        ...editing,
                                                        nutrition: {
                                                            ...editing.nutrition,
                                                            [field]: e.target.value,
                                                        },
                                                    })
                                                }
                                                className="w-full rounded-md border border-brand-border bg-cream px-3 py-2 text-sm"
                                            />
                                        </div>

                                    ))}

                                </div>

                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                <F
                                    label="Shelf Life"
                                    value={editing.shelfLife}
                                    onChange={(v) => setEditing({ ...editing, shelfLife: v })}
                                />

                                <F
                                    label="Storage"
                                    value={editing.storage}
                                    onChange={(v) => setEditing({ ...editing, storage: v })}
                                />

                            </div>

                            <F
                                label="Delivery"
                                value={editing.delivery}
                                onChange={(v) => setEditing({ ...editing, delivery: v })}
                            />

                            <div className="grid grid-cols-2 gap-4">

                                <F
                                    label="Stock"
                                    value={editing.stock}
                                    onChange={(v) => setEditing({ ...editing, stock: v })}
                                />

                                <F
                                    label="SKU"
                                    value={editing.sku}
                                    onChange={(v) => setEditing({ ...editing, sku: v })}
                                />

                            </div>

                            <F
                                label="Tags (comma separated)"
                                value={editing.tagsText}
                                onChange={(v) => setEditing({ ...editing, tagsText: v })}
                            />

                            <label className="flex items-center gap-3">

                                <input
                                    type="checkbox"
                                    checked={editing.bestSeller || false}
                                    onChange={(e) =>
                                        setEditing({
                                            ...editing,
                                            bestSeller:
                                                e.target.checked,
                                        })
                                    }
                                />

                                <span className="text-sm">
                                    Best Seller
                                </span>

                            </label>

                        </div>

                        <div className="mt-8 flex gap-4">

                            <button
                                onClick={() => saveProduct(editing)}
                                disabled={saving}
                                className="btn-primary flex-1 justify-center disabled:opacity-60"
                            >
                                {saving ? "Saving…" : "Save Product"}
                            </button>

                            <button
                                onClick={() =>
                                    setEditing(null)
                                }
                                className="btn-outline flex-1 justify-center"
                            >
                                Cancel
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="rounded-lg border border-brand-border bg-white p-6">

            <p className="mb-2 text-sm text-brand-muted">
                {label}
            </p>

            <p className="font-sans font-semibold text-3xl text-brand-dark tabular-nums">
                {value}
            </p>

        </div>
    );
}

function F({
    label,
    value,
    onChange,
}) {
    return (
        <label className="block">

            <span className="mb-2 block text-sm text-brand-muted">
                {label}
            </span>

            <input
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                className="w-full rounded-md border border-brand-border bg-cream px-4 py-3 focus:border-brand-maroon focus:outline-none"
            />

        </label>
    );
}

export default Admin;