import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { toast } from "sonner";
import { cldUrl } from "../lib/cloudinary";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../api/orderApi";
import { getReviewEligibility, submitReview } from "../api/productApi";

function Orders() {
    const { user, loading: authLoading } = useAuth();

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    // Keyed by product slug. openReviewSlug tracks which item's form is
    // expanded; eligibilityMap/formsMap/submittingMap hold per-item state
    // since a single order can contain several reviewable items.
    const [openReviewSlug, setOpenReviewSlug] = useState(null);

    const [eligibilityMap, setEligibilityMap] = useState({});

    const [formsMap, setFormsMap] = useState({});

    const [submittingMap, setSubmittingMap] = useState({});

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate("/auth?redirect=/orders");
            return;
        }

        const refresh = async () => {
            try {
                setLoading(true);

                const userOrders = await getMyOrders();

                setOrders(userOrders);
            } catch (error) {
                console.error("Failed to load orders:", error);
            } finally {
                setLoading(false);
            }
        };

        refresh();
    }, [user, authLoading, navigate]);

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <section className="max-w-[1200px] mx-auto px-5 md:px-20 py-16 md:py-20">
                <p className="text-brand-muted">Loading your orders…</p>
            </section>
        );
    }

    const toggleReview = async (item) => {
        if (openReviewSlug === item.productId) {
            setOpenReviewSlug(null);
            return;
        }

        setOpenReviewSlug(item.productId);

        if (!eligibilityMap[item.productId]) {
            try {
                const data = await getReviewEligibility(item.productId);

                setEligibilityMap((prev) => ({ ...prev, [item.productId]: data }));

                setFormsMap((prev) => ({
                    ...prev,
                    [item.productId]: prev[item.productId] || { rating: 0, title: "", comment: "" },
                }));
            } catch (error) {
                toast.error("Could not check review status");
            }
        }
    };

    const updateForm = (key, field, value) => {
        setFormsMap((prev) => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }));
    };

    const handleSubmitReview = async (item) => {
        const form = formsMap[item.productId];

        if (!form || form.rating < 1) {
            toast.error("Please select a star rating");
            return;
        }

        try {
            setSubmittingMap((prev) => ({ ...prev, [item.productId]: true }));

            await submitReview(item.productId, form);

            setEligibilityMap((prev) => ({
                ...prev,
                [item.productId]: { ...prev[item.productId], alreadyReviewed: true },
            }));

            setOpenReviewSlug(null);

            toast.success("Thanks for your review!");
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Failed to submit review"
            );
        } finally {
            setSubmittingMap((prev) => ({ ...prev, [item.productId]: false }));
        }
    };

    return (
        <section className="max-w-[1200px] mx-auto px-5 md:px-20 py-16 md:py-20">

            <h1 className="font-serif text-4xl md:text-5xl text-brand-dark mb-10">
                My Orders
            </h1>

            {orders.length === 0 ? (

                <div className="rounded-lg border border-brand-border bg-white py-20 text-center">

                    <p className="mb-6 text-brand-muted">
                        You haven't placed any orders yet.
                    </p>

                    <Link
                        to="/shop"
                        className="btn-primary"
                    >
                        Start Shopping
                    </Link>

                </div>

            ) : (

                <div className="space-y-6">

                    {orders.map((order) => (

                        <div
                            key={order.id}
                            className="overflow-hidden rounded-lg border border-brand-border bg-white"
                        >

                            {/* Header */}

                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border bg-cream px-6 py-4">

                                <div>

                                    <p className="text-xs uppercase tracking-widest text-brand-muted">
                                        Order #{order.id}
                                    </p>

                                    <p className="text-sm text-brand-dark">
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleString()}
                                    </p>

                                </div>

                                <div className="flex items-center gap-4">

                                    <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange">

                                        {order.status}

                                    </span>

                                    <span className="text-lg font-semibold">

                                        ₹{order.total}

                                    </span>

                                </div>

                            </div>

                            {/* Items */}

                            <div className="space-y-4 p-6">

                                {order.items.map((item) => (

                                    <div
                                        key={item.productId}
                                        className="border-b border-brand-border pb-4 last:border-b-0 last:pb-0"
                                    >

                                        <div className="flex items-center gap-4">

                                            <img
                                                src={cldUrl(item.image, { width: 150 })}
                                                alt={item.name}
                                                className="h-16 w-16 rounded-md object-cover"
                                            />

                                            <div className="flex-1">

                                                <h3 className="font-medium text-brand-dark">
                                                    {item.name}
                                                </h3>

                                                <p className="text-sm text-brand-muted">

                                                    Qty {item.qty} • ₹{item.price}

                                                </p>

                                            </div>

                                            <div className="font-semibold">

                                                ₹{item.qty * item.price}

                                            </div>

                                        </div>

                                        {order.status === "Delivered" && (

                                            <div className="mt-3 pl-20">

                                                {eligibilityMap[item.productId]?.alreadyReviewed ? (

                                                    <p className="text-sm text-brand-muted">
                                                        ✓ You reviewed this product
                                                    </p>

                                                ) : (

                                                    <button
                                                        onClick={() => toggleReview(item)}
                                                        className="text-sm font-medium text-brand-maroon hover:underline"
                                                    >
                                                        {openReviewSlug === item.productId
                                                            ? "Cancel"
                                                            : "Write a Review"}
                                                    </button>

                                                )}

                                                {openReviewSlug === item.productId &&
                                                    !eligibilityMap[item.productId]?.alreadyReviewed && (

                                                        <div className="mt-3 max-w-md rounded-lg border border-brand-border p-4">

                                                            <div className="flex gap-1 text-brand-orange text-xl mb-3">

                                                                {Array.from({ length: 5 }).map((_, i) => (

                                                                    <button
                                                                        key={i}
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateForm(item.productId, "rating", i + 1)
                                                                        }
                                                                        className="focus:outline-none"
                                                                    >
                                                                        <FaStar
                                                                            className={
                                                                                i < (formsMap[item.productId]?.rating || 0)
                                                                                    ? ""
                                                                                    : "opacity-30"
                                                                            }
                                                                        />
                                                                    </button>

                                                                ))}

                                                            </div>

                                                            <input
                                                                value={formsMap[item.productId]?.title || ""}
                                                                onChange={(e) =>
                                                                    updateForm(item.productId, "title", e.target.value)
                                                                }
                                                                placeholder="Review title (optional)"
                                                                className="w-full rounded-md border border-brand-border px-3 py-2 mb-2 text-sm"
                                                            />

                                                            <textarea
                                                                value={formsMap[item.productId]?.comment || ""}
                                                                onChange={(e) =>
                                                                    updateForm(item.productId, "comment", e.target.value)
                                                                }
                                                                rows="3"
                                                                placeholder="Share your experience with this product…"
                                                                className="w-full rounded-md border border-brand-border px-3 py-2 mb-3 text-sm"
                                                            />

                                                            <button
                                                                onClick={() => handleSubmitReview(item)}
                                                                disabled={submittingMap[item.productId]}
                                                                className="btn-primary text-sm disabled:opacity-60"
                                                            >
                                                                {submittingMap[item.productId]
                                                                    ? "Submitting…"
                                                                    : "Submit Review"}
                                                            </button>

                                                        </div>

                                                    )}

                                            </div>

                                        )}

                                    </div>

                                ))}

                                <div className="border-t border-brand-border pt-4 text-sm text-brand-muted">

                                    Deliver To:

                                    <br />

                                    {order.address.name},

                                    {" "}

                                    {order.address.line1},

                                    {" "}

                                    {order.address.city}

                                    {" - "}

                                    {order.address.pincode}

                                    {" • "}

                                    {order.payment}

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </section>
    );
}

export default Orders;