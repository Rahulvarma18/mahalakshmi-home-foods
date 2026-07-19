import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getProducts } from "../api/productApi";
import { createOrder } from "../api/orderApi";
import { openWhatsAppOrder } from "../lib/whatsapp";

function Checkout() {
    const { user } = useAuth();

    const { items, clear, loading: cartLoading } = useCart();

    const [products, setProducts] = useState([]);

    const [loadingProducts, setLoadingProducts] = useState(true);

    const navigate = useNavigate();

    const location = useLocation();

    // If we got here via a product page's "Buy Now" button, this holds
    // just that one item — checkout works off it instead of the saved
    // cart, and the cart is never touched in this flow.
    const buyNowItem = location.state?.buyNow || null;

    const [form, setForm] = useState({
        name: user?.name || "",
        phone: "",
        line1: "",
        city: "",
        pincode: "",
        payment: "COD",
    });

    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, []);

    const rows = useMemo(() => {
        const sourceItems = buyNowItem ? [buyNowItem] : items;

        return sourceItems
            .map((item) => {
                const product = products.find((p) => p._id === item.productId);

                if (!product) return null;

                const variant =
                    product.variants?.find((v) => v.weight === item.weight) ||
                    product.variants?.[0];

                if (!variant) return null;

                return {
                    ...item,
                    product,
                    variant,
                };
            })
            .filter(Boolean);
    }, [items, products, buyNowItem]);

    const subtotal = rows.reduce(
        (sum, row) => sum + row.variant.price * row.qty,
        0
    );

    const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 60;

    const total = subtotal + shipping;

    const canPlace =
        form.name &&
        form.phone.length >= 10 &&
        form.line1 &&
        form.city &&
        form.pincode.length >= 6;

    const placeOrder = async (whatsappWindow) => {
        if (placingOrder) return;

        if (!user) {
            toast.error("Please sign in first");

            navigate("/auth?redirect=/checkout");

            whatsappWindow?.close();

            return;
        }

        if (!canPlace) {
            toast.error("Please fill all delivery details");

            whatsappWindow?.close();

            return;
        }

        setPlacingOrder(true);

        const orderPayload = {
            items: rows.map((row) => ({
                productId: row.productId,
                slug: row.product.id,
                weight: row.weight,
                name: row.product.name,
                qty: row.qty,
                price: row.variant.price,
                image: row.product.image,
            })),

            total,

            address: {
                name: form.name,
                phone: form.phone,
                line1: form.line1,
                city: form.city,
                pincode: form.pincode,
            },

            payment: form.payment,
        };

        try {
            await createOrder(orderPayload);
        } catch (error) {
            console.error("Failed to place order:", error);

            toast.error(
                error?.response?.data?.message || "Failed to place order"
            );

            setPlacingOrder(false);

            whatsappWindow?.close();

            return;
        }

        if (!buyNowItem) {
            try {
                await clear();
            } catch (error) {
                console.error("Failed to clear cart after order:", error);
            }
        }

        // Redirect the already-open tab to the wa.me link — the order
        // stays "Pending Approval" in the customer's account until an
        // admin reviews this message and marks it "Placed".
        openWhatsAppOrder(whatsappWindow, {
            rows,
            address: orderPayload.address,
            subtotal,
            shipping,
            total,
            payment: form.payment,
        });

        toast.success(
            "Order request sent! We'll confirm it on WhatsApp shortly."
        );

        navigate("/orders");
    };

    if (loadingProducts || cartLoading) {
        return (
            <div className="px-5 py-32 text-center">
                <h1 className="mb-3 font-serif text-4xl">Loading Checkout...</h1>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="px-5 py-32 text-center">

                <h1 className="mb-3 font-serif text-4xl">
                    Your Cart is Empty
                </h1>

                <Link
                    to="/shop"
                    className="btn-primary mt-5"
                >
                    Shop Now
                </Link>

            </div>
        );
    }

    return (
        <section className="max-w-[1400px] mx-auto px-5 md:px-20 py-16 md:py-20">

            <h1 className="mb-10 font-serif text-4xl md:text-5xl text-brand-dark">
                Checkout
            </h1>

            <div className="grid gap-10 lg:grid-cols-[1fr_400px]">

                {/* Left */}

                <div className="space-y-8">

                    <section className="rounded-lg border border-brand-border bg-white p-6 md:p-8">

                        <h2 className="mb-6 font-serif text-2xl">
                            Delivery Details
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2">

                            <Field
                                label="Full Name"
                                value={form.name}
                                onChange={(v) =>
                                    setForm({
                                        ...form,
                                        name: v,
                                    })
                                }
                            />

                            <Field
                                label="Phone"
                                value={form.phone}
                                onChange={(v) =>
                                    setForm({
                                        ...form,
                                        phone: v,
                                    })
                                }
                            />

                            <div className="md:col-span-2">

                                <Field
                                    label="Address"
                                    value={form.line1}
                                    onChange={(v) =>
                                        setForm({
                                            ...form,
                                            line1: v,
                                        })
                                    }
                                />

                            </div>

                            <Field
                                label="City"
                                value={form.city}
                                onChange={(v) =>
                                    setForm({
                                        ...form,
                                        city: v,
                                    })
                                }
                            />

                            <Field
                                label="Pincode"
                                value={form.pincode}
                                onChange={(v) =>
                                    setForm({
                                        ...form,
                                        pincode: v,
                                    })
                                }
                            />

                        </div>

                    </section>

                    {/* Payment */}

                    <section className="rounded-lg border border-brand-border bg-white p-6 md:p-8">

                        <h2 className="mb-6 font-serif text-2xl">
                            Payment Method
                        </h2>

                        <div className="space-y-3">

                            {["COD", "Online"].map(
                                (payment) => {

                                    const disabled = payment === "Online";

                                    return (

                                        <label
                                            key={payment}
                                            className={`flex items-center gap-4 rounded-md border p-4 transition ${disabled
                                                ? "cursor-not-allowed border-brand-border opacity-50"
                                                : form.payment === payment
                                                    ? "cursor-pointer border-brand-maroon bg-cream"
                                                    : "cursor-pointer border-brand-border"
                                                }`}
                                        >

                                            <input
                                                type="radio"
                                                disabled={disabled}
                                                checked={
                                                    form.payment ===
                                                    payment
                                                }
                                                onChange={() =>
                                                    setForm({
                                                        ...form,
                                                        payment,
                                                    })
                                                }
                                            />

                                            <div>

                                                <h3 className="flex items-center gap-2 font-medium">

                                                    {payment === "COD"
                                                        ? "Cash on Delivery"
                                                        : "Online Payment"}

                                                    {disabled && (
                                                        <span className="rounded-full bg-brand-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                                                            Coming Soon
                                                        </span>
                                                    )}

                                                </h3>

                                                <p className="text-sm text-brand-muted">

                                                    {payment === "COD"
                                                        ? "Pay after delivery."
                                                        : "Online payment isn't available yet — please use Cash on Delivery for now."}

                                                </p>

                                            </div>

                                        </label>

                                    );

                                }
                            )}

                        </div>

                    </section>

                </div>

                {/* Right */}

                <aside className="sticky top-24 h-fit rounded-lg border border-brand-border bg-white p-6">

                    <h2 className="mb-5 font-serif text-2xl">
                        Order Summary
                    </h2>

                    <div className="mb-5 space-y-3">

                        {rows.map((row) => (

                            <div
                                key={`${row.productId}-${row.weight}`}
                                className="flex justify-between text-sm"
                            >

                                <span className="text-brand-muted">

                                    {row.product.name} ({row.variant.weight}) × {row.qty}

                                </span>

                                <span>

                                    ₹{row.variant.price * row.qty}

                                </span>

                            </div>

                        ))}

                    </div>

                    <div className="space-y-3 border-t border-brand-border pt-4">

                        <div className="flex justify-between text-brand-muted">

                            <span>Subtotal</span>

                            <span>₹{subtotal}</span>

                        </div>

                        <div className="flex justify-between text-brand-muted">

                            <span>Shipping</span>

                            <span>

                                {shipping === 0
                                    ? "Free"
                                    : `₹${shipping}`}

                            </span>

                        </div>

                        <div className="flex justify-between border-t border-brand-border pt-3 text-lg font-semibold">

                            <span>Total</span>

                            <span>₹{total}</span>

                        </div>

                    </div>

                    <button
                        onClick={() => {
                            // Must open synchronously, inside the click handler,
                            // before any await — otherwise the browser's popup
                            // blocker silently kills it and the tab sits blank.
                            const whatsappWindow = window.open("", "_blank");

                            placeOrder(whatsappWindow);
                        }}
                        disabled={placingOrder}
                        className="btn-primary mt-6 w-full justify-center disabled:opacity-60"
                    >
                        {placingOrder ? "Placing Order…" : "Place Order on WhatsApp →"}
                    </button>

                </aside>

            </div>

        </section>
    );
}

function Field({
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

export default Checkout;