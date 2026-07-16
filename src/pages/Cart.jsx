import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { toast } from "sonner";
import { cldUrl } from "../lib/cloudinary";

import { useCart } from "../context/CartContext";
import { getProducts } from "../api/productApi";

function Cart() {

    const {
        items,
        remove,
        setQty,
        loading: cartLoading,
    } = useCart();

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const handleRemove = async (productId, weight) => {
        try {
            await remove(productId, weight);
        } catch (error) {
            toast.error("Could not remove item");
        }
    };

    const handleSetQty = async (productId, weight, qty) => {
        try {
            await setQty(productId, weight, qty);
        } catch (error) {
            toast.error("Could not update quantity");
        }
    };

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const data = await getProducts();

                setProducts(data);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        fetchProducts();

    }, []);

    const rows = useMemo(() => {

        return items
            .map((item) => {

                const product = products.find(
                    (p) => p._id === item.productId
                );

                if (!product) return null;

                const variant =
                    product.variants?.find(
                        (v) => v.weight === item.weight
                    ) ||
                    product.variants?.[0];

                if (!variant) return null;

                return {
                    ...item,
                    product,
                    variant,
                };

            })
            .filter(Boolean);

    }, [items, products]);

    const subtotal = useMemo(() => {

        return rows.reduce(

            (sum, row) =>

                sum + row.variant.price * row.qty,

            0

        );

    }, [rows]);

    const shipping =
        subtotal >= 999 || subtotal === 0
            ? 0
            : 60;

    const total = subtotal + shipping;

    if (loading || cartLoading) {

        return (

            <section className="max-w-[1400px] mx-auto px-5 md:px-20 py-20">

                <h2 className="text-2xl font-semibold">

                    Loading Cart...

                </h2>

            </section>

        );

    }

    return (<section className="max-w-[1400px] mx-auto px-5 md:px-20 py-16 md:py-20">

        <h1 className="font-serif text-4xl md:text-5xl text-brand-dark mb-10">
            Your Cart
        </h1>

        {rows.length === 0 ? (

            <div className="py-20 text-center">

                <p className="mb-6 text-lg text-brand-muted">
                    Your cart is empty.
                </p>

                <Link
                    to="/shop"
                    className="btn-primary"
                >
                    Continue Shopping
                </Link>

            </div>

        ) : (

            <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

                {/* Cart Items */}

                <div className="space-y-5">

                    {rows.map((row) => (

                        <div
                            key={`${row.productId}-${row.weight}`}
                            className="flex gap-5 rounded-xl border border-brand-border bg-white p-5 shadow-sm"
                        >

                            {/* Product Image */}

                            <img
                                src={cldUrl(row.product.image, { width: 200 })}
                                alt={row.product.name}
                                className="h-28 w-28 rounded-lg object-cover"
                            />

                            {/* Product Info */}

                            <div className="flex flex-1 flex-col">

                                <div className="flex justify-between">

                                    <div>

                                        <p className="mb-1 text-xs uppercase tracking-widest text-brand-orange">

                                            {row.product.category}

                                        </p>

                                        <h2 className="font-serif text-2xl text-brand-dark">

                                            {row.product.name}

                                        </h2>

                                        <p className="mt-2 text-sm text-brand-muted">

                                            Weight :
                                            <span className="ml-2 font-medium text-brand-dark">

                                                {row.variant.weight}

                                            </span>

                                        </p>

                                        {row.variant.oldPrice && (

                                            <div className="mt-2 flex items-center gap-3">

                                                <span className="text-2xl font-bold text-brand-dark">

                                                    ₹{row.variant.price}

                                                </span>

                                                <span className="line-through text-brand-muted">

                                                    ₹{row.variant.oldPrice}

                                                </span>

                                            </div>

                                        )}

                                        {!row.variant.oldPrice && (

                                            <div className="mt-2">

                                                <span className="text-2xl font-bold text-brand-dark">

                                                    ₹{row.variant.price}

                                                </span>

                                            </div>

                                        )}

                                    </div>

                                    <button
                                        onClick={() =>
                                            handleRemove(
                                                row.productId,
                                                row.weight
                                            )
                                        }
                                        className="text-brand-muted hover:text-red-600 transition"
                                    >

                                        <FaTrash />

                                    </button>

                                </div>

                                {/* Quantity */}

                                <div className="mt-auto flex items-center justify-between pt-6">

                                    <div className="flex items-center rounded-lg border border-brand-border overflow-hidden">

                                        <button
                                            onClick={() =>
                                                handleSetQty(
                                                    row.productId,
                                                    row.weight,
                                                    row.qty - 1
                                                )
                                            }
                                            className="px-4 py-3 hover:bg-cream"
                                        >

                                            <FaMinus className="text-xs" />

                                        </button>

                                        <span className="w-12 text-center font-medium">

                                            {row.qty}

                                        </span>

                                        <button
                                            onClick={() =>
                                                handleSetQty(
                                                    row.productId,
                                                    row.weight,
                                                    row.qty + 1
                                                )
                                            }
                                            className="px-4 py-3 hover:bg-cream"
                                        >

                                            <FaPlus className="text-xs" />

                                        </button>

                                    </div>

                                    <div className="text-2xl font-bold text-brand-dark">

                                        ₹{row.variant.price * row.qty}

                                    </div>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>
                {/* Order Summary */}

                <aside className="sticky top-24 h-fit rounded-xl border border-brand-border bg-white p-6 shadow-sm">

                    <h2 className="mb-6 font-serif text-2xl text-brand-dark">

                        Order Summary

                    </h2>

                    <div className="space-y-5">

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

                        {subtotal > 0 && subtotal < 999 && (

                            <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">

                                <p className="text-sm text-brand-orange">

                                    Add

                                    <span className="font-semibold mx-1">

                                        ₹{999 - subtotal}

                                    </span>

                                    more for FREE shipping.

                                </p>

                            </div>

                        )}

                        <div className="border-t border-brand-border pt-5 flex justify-between text-2xl font-bold text-brand-dark">

                            <span>Total</span>

                            <span>₹{total}</span>

                        </div>

                    </div>

                    <Link
                        to="/checkout"
                        className="btn-primary mt-8 w-full justify-center"
                    >

                        Proceed To Checkout →

                    </Link>

                    <Link
                        to="/shop"
                        className="mt-5 block text-center text-sm text-brand-muted hover:text-brand-maroon transition"
                    >

                        Continue Shopping

                    </Link>

                </aside>

            </div>

        )}

    </section>

    );

}

export default Cart;