import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaTrash,
    FaEdit,
    FaPlus,
    FaArrowUp,
    FaArrowDown,
} from "react-icons/fa";
import { toast } from "sonner";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

import { useAuth } from "../context/AuthContext";

import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    deleteProductImage,
} from "../api/productApi";

import {
    getAllOrders,
    updateOrderStatus,
    getSalesStats,
} from "../api/orderApi";

const CATEGORIES = [
    "Vegetable Pickles",
    "Non-Veg Pickles",
    "Sweets",
    "Snacks",
    "Future Products",
];

const STATUS_COLORS = {
    "Pending Approval": "#b45309",
    Placed: "#8b1e24",
    Pending: "#e58a2d",
    Processing: "#d9a353",
    Shipped: "#64554d",
    Delivered: "#3f8f5f",
};

const STATUS_COLORS_FALLBACK = ["#8b1e24", "#e58a2d", "#d9a353", "#64554d", "#3f8f5f"];

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
        gallery: p?.gallery || [],
        description: p?.description || "",
        variants: p?.variants?.length
            ? p.variants.map((v) => ({
                weight: v.weight || "",
                price: v.price ?? "",
                oldPrice: v.oldPrice ?? "",
                stock: v.stock ?? 0,
            }))
            : [{ weight: "250g", price: "", oldPrice: "", stock: 0 }],
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
        gallery: f.gallery.filter(Boolean),
        description: f.description,
        variants: f.variants
            .filter((v) => v.weight && Number(v.price) > 0)
            .map((v) => ({
                weight: v.weight,
                price: Number(v.price),
                stock: Number(v.stock) || 0,
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
        sku: f.sku || undefined,
        tags: splitList(f.tagsText),
        bestSeller: !!f.bestSeller,
    };
}

// Compact number formatting for chart axes, e.g. 800, 12.5k, 3.2L.
function formatCompactINR(value) {
    const n = Number(value) || 0;
    const abs = Math.abs(n);

    if (abs >= 10000000) return `${(n / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
    if (abs >= 100000) return `${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    if (abs >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;

    return `${n}`;
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

    const [uploadingImage, setUploadingImage] = useState(false);

    const [uploadingGallery, setUploadingGallery] = useState(false);

    const [tab, setTab] = useState("dashboard");

    const [editing, setEditing] = useState(null);

    const [orders, setOrders] = useState([]);

    const [loadingOrders, setLoadingOrders] = useState(true);

    const [stats, setStats] = useState(null);

    const [loadingStats, setLoadingStats] = useState(true);

    const [statsRange, setStatsRange] = useState(7);

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

    const refreshStats = async (days = statsRange) => {
        try {
            setLoadingStats(true);

            const data = await getSalesStats(days);

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
        refreshStats(statsRange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user, statsRange]);

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

    const uploadOne = async (file) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return null;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} is over 5MB`);
            return null;
        }

        const { url } = await uploadProductImage(file);
        return url;
    };

    const handleImageUpload = async (file) => {
        if (!file) return;

        const previousUrl = editing.image;

        try {
            setUploadingImage(true);

            const url = await uploadOne(file);

            if (url) {
                setEditing((prev) => ({ ...prev, image: url }));
                toast.success("Image uploaded");

                // Clean up the image it's replacing, if there was one.
                if (previousUrl) {
                    deleteProductImage(previousUrl).catch(() => {
                        // Non-critical — the new image is already set either way.
                    });
                }
            }
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to upload image"
            );
        } finally {
            setUploadingImage(false);
        }
    };

    const handleGalleryUpload = async (fileList) => {
        const files = Array.from(fileList || []);

        if (files.length === 0) return;

        try {
            setUploadingGallery(true);

            const urls = [];

            for (const file of files) {
                const url = await uploadOne(file);
                if (url) urls.push(url);
            }

            if (urls.length) {
                setEditing((prev) => ({
                    ...prev,
                    gallery: [...prev.gallery, ...urls],
                }));

                toast.success(
                    urls.length > 1
                        ? `${urls.length} images uploaded`
                        : "Image uploaded"
                );
            }
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to upload image"
            );
        } finally {
            setUploadingGallery(false);
        }
    };

    const removeGalleryImage = (index) => {
        const url = editing.gallery[index];

        setEditing((prev) => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index),
        }));

        if (url) {
            deleteProductImage(url).catch(() => {
                // Non-critical — it's already gone from the form either way.
            });
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
            variants: [...prev.variants, { weight: "", price: "", oldPrice: "", stock: 0 }],
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
                                trend={stats.salesTrend}
                                trendLabel={`vs. previous ${statsRange} days`}
                            />

                            <StatCard
                                label="Total Orders"
                                value={stats.totalOrders}
                                trend={stats.ordersTrend}
                                trendLabel={`vs. previous ${statsRange} days`}
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

                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                                    <h3 className="font-serif text-xl text-brand-dark">
                                        Sales — Last {statsRange} Days
                                    </h3>

                                    <div className="flex gap-1 rounded-md border border-brand-border p-1">
                                        {[7, 14, 30, 90].map((range) => (
                                            <button
                                                key={range}
                                                onClick={() => setStatsRange(range)}
                                                className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${statsRange === range
                                                    ? "bg-brand-maroon text-white"
                                                    : "text-brand-muted hover:bg-brand-border/40"
                                                    }`}
                                            >
                                                {range}D
                                            </button>
                                        ))}
                                    </div>

                                </div>

                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={stats.salesByRange} margin={{ left: 0, right: 10 }}>
                                        <defs>
                                            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8b1e24" stopOpacity={0.35} />
                                                <stop offset="100%" stopColor="#8b1e24" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid strokeDasharray="3 3" stroke="#e6ddd2" vertical={false} />

                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(d) =>
                                                statsRange <= 14
                                                    ? new Date(d).toLocaleDateString(undefined, { weekday: "short" })
                                                    : new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" })
                                            }
                                            interval={statsRange > 30 ? Math.ceil(statsRange / 10) : statsRange > 14 ? 2 : 0}
                                            tick={{ fontSize: 12, fill: "#64554d" }}
                                            axisLine={{ stroke: "#e6ddd2" }}
                                            tickLine={false}
                                        />

                                        <YAxis
                                            tickFormatter={(value) => `₹${formatCompactINR(value)}`}
                                            tick={{ fontSize: 12, fill: "#64554d" }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={64}
                                        />

                                        <Tooltip
                                            formatter={(value, name) =>
                                                name === "total"
                                                    ? [`₹${value.toLocaleString("en-IN")}`, "Sales"]
                                                    : [value, "Orders"]
                                            }
                                            labelFormatter={(d) =>
                                                new Date(d).toLocaleDateString(undefined, {
                                                    weekday: "long",
                                                    day: "numeric",
                                                    month: "short",
                                                })
                                            }
                                            contentStyle={{
                                                borderRadius: 8,
                                                border: "1px solid #e6ddd2",
                                                fontSize: 13,
                                            }}
                                        />

                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#8b1e24"
                                            strokeWidth={2}
                                            fill="url(#salesFill)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>

                            </div>

                            <div className="rounded-lg border border-brand-border bg-white p-6">

                                <h3 className="mb-4 font-serif text-xl text-brand-dark">
                                    Orders by Status
                                </h3>

                                {Object.keys(stats.ordersByStatus).length === 0 ? (

                                    <p className="text-sm text-brand-muted">
                                        No orders yet.
                                    </p>

                                ) : (

                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(stats.ordersByStatus).map(
                                                    ([status, count]) => ({ name: status, value: count })
                                                )}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={2}
                                            >
                                                {Object.keys(stats.ordersByStatus).map((status, i) => (
                                                    <Cell
                                                        key={status}
                                                        fill={
                                                            STATUS_COLORS[status] ||
                                                            STATUS_COLORS_FALLBACK[i % STATUS_COLORS_FALLBACK.length]
                                                        }
                                                    />
                                                ))}
                                            </Pie>

                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: 8,
                                                    border: "1px solid #e6ddd2",
                                                    fontSize: 13,
                                                }}
                                            />

                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                wrapperStyle={{ fontSize: 12 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                )}

                            </div>

                        </div>

                        <div className="rounded-lg border border-brand-border bg-white p-6">

                            <h3 className="mb-4 font-serif text-xl text-brand-dark">
                                Top Selling Products
                            </h3>

                            {!stats.topProducts || stats.topProducts.length === 0 ? (

                                <p className="text-sm text-brand-muted">
                                    No sales yet.
                                </p>

                            ) : (

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-brand-border text-brand-muted">
                                                <th className="pb-3 pr-4 font-medium">Product</th>
                                                <th className="pb-3 pr-4 font-medium">Units Sold</th>
                                                <th className="pb-3 font-medium">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.topProducts.map((p, i) => (
                                                <tr
                                                    key={p.name + i}
                                                    className="border-b border-brand-border last:border-0"
                                                >
                                                    <td className="py-3 pr-4">
                                                        <div className="flex items-center gap-3">
                                                            {p.image && (
                                                                <img
                                                                    src={p.image}
                                                                    alt={p.name}
                                                                    className="h-10 w-10 rounded-md object-cover"
                                                                />
                                                            )}
                                                            <span className="text-brand-dark">{p.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-4 text-brand-muted">{p.qty}</td>
                                                    <td className="py-3 font-semibold text-brand-dark">
                                                        ₹{p.revenue.toLocaleString("en-IN")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                            )}

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
                                                        src={product.image}
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
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleString()
                                                : ""}
                                        </p>

                                    </div>

                                    <div className="flex items-center gap-3">

                                        <span className="font-semibold">
                                            ₹{order.total.toLocaleString("en-IN")}
                                        </span>

                                        <select
                                            value={order.status}
                                            onChange={(e) =>
                                                updateStatus(order.id, e.target.value)
                                            }
                                            className={`rounded-md border px-3 py-1.5 text-sm ${order.status === "Pending Approval"
                                                ? "border-amber-500 bg-amber-50 font-semibold text-amber-800"
                                                : "border-brand-border"
                                                }`}
                                        >
                                            <option value="Pending Approval">
                                                Pending Approval
                                            </option>

                                            <option value="Placed">
                                                Placed
                                            </option>

                                            <option value="Pending">
                                                Pending
                                            </option>

                                            <option value="Processing">
                                                Processing
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

                            <div className="block">

                                <span className="mb-2 block text-sm text-brand-muted">
                                    Product Image
                                </span>

                                <div className="flex items-center gap-4">

                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-brand-border bg-cream">
                                        {editing.image ? (
                                            <img
                                                src={editing.image}
                                                alt="Product preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-[10px] text-brand-muted">
                                                No image
                                            </span>
                                        )}
                                    </div>

                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-cream">
                                        {uploadingImage ? "Uploading…" : editing.image ? "Replace Image" : "Choose Image"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={uploadingImage}
                                            onChange={(e) => {
                                                handleImageUpload(e.target.files?.[0]);
                                                e.target.value = "";
                                            }}
                                        />
                                    </label>

                                </div>

                            </div>

                            <div className="block">

                                <span className="mb-2 block text-sm text-brand-muted">
                                    Gallery Images
                                </span>

                                <div className="flex flex-wrap gap-3">

                                    {editing.gallery.map((url, i) => (
                                        <div
                                            key={url + i}
                                            className="group relative h-20 w-20 overflow-hidden rounded-md border border-brand-border"
                                        >
                                            <img
                                                src={url}
                                                alt={`Gallery ${i + 1}`}
                                                className="h-full w-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(i)}
                                                className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white group-hover:flex"
                                                title="Remove"
                                            >
                                                <FaTrash size={9} />
                                            </button>
                                        </div>
                                    ))}

                                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-brand-border bg-cream text-brand-muted hover:bg-white">
                                        <FaPlus size={14} />
                                        <span className="text-[10px]">
                                            {uploadingGallery ? "Uploading…" : "Add"}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            disabled={uploadingGallery}
                                            onChange={(e) => {
                                                handleGalleryUpload(e.target.files);
                                                e.target.value = "";
                                            }}
                                        />
                                    </label>

                                </div>

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

                                            <div className="flex-1">
                                                <span className="mb-1 block text-xs text-brand-muted">Stock</span>
                                                <input
                                                    value={variant.stock}
                                                    onChange={(e) => updateVariant(i, "stock", e.target.value)}
                                                    placeholder="0"
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

                            <F
                                label="SKU"
                                value={editing.sku}
                                onChange={(v) => setEditing({ ...editing, sku: v })}
                            />

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
                                disabled={saving || uploadingImage || uploadingGallery}
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

function StatCard({ label, value, trend, trendLabel }) {
    const showTrend = typeof trend === "number";
    const isUp = trend > 0;
    const isFlat = trend === 0;

    return (
        <div className="rounded-lg border border-brand-border bg-white p-6">

            <p className="mb-2 text-sm text-brand-muted">
                {label}
            </p>

            <div className="flex items-end justify-between gap-2">

                <p className="font-serif text-3xl text-brand-dark">
                    {value}
                </p>

                {showTrend && (
                    <span
                        className={`mb-1 flex items-center gap-1 text-xs font-semibold ${isFlat
                            ? "text-brand-muted"
                            : isUp
                                ? "text-green-700"
                                : "text-red-600"
                            }`}
                    >
                        {!isFlat && (isUp ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />)}
                        {Math.abs(trend).toFixed(0)}%
                    </span>
                )}

            </div>

            {showTrend && (
                <p className="mt-1 text-[11px] text-brand-muted">
                    {trendLabel || "vs. previous period"}
                </p>
            )}

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