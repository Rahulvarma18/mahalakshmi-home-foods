import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    FaStar,
    FaMinus,
    FaPlus,
    FaArrowLeft,
} from "react-icons/fa";
import { toast } from "sonner";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
    getProduct,
    getReviewEligibility,
    submitReview,
} from "../api/productApi";

function Product() {

    const { id } = useParams();

    const navigate = useNavigate();

    const { add } = useCart();

    const { user } = useAuth();

    const [product, setProduct] = useState(null);

    const [loading, setLoading] = useState(true);

    const [qty, setQty] = useState(1);

    const [selectedImage, setSelectedImage] = useState("");

    const [selectedWeight, setSelectedWeight] = useState("");

    const [reviewSort, setReviewSort] = useState("helpful");

    // If the customer switches to a variant with less stock than their
    // current quantity, pull the quantity back down to what's available.
    // Placed here (before the loading/not-found early returns below) so
    // hook order stays consistent across renders.
    useEffect(() => {
        const variant = product?.variants?.find(
            (v) => v.weight === selectedWeight
        );

        const variantStock = variant?.stock ?? 0;

        setQty((q) => (variantStock > 0 ? Math.min(q, variantStock) : 1));
    }, [product, selectedWeight]);

    const [eligibility, setEligibility] = useState(null);

    const [loadingEligibility, setLoadingEligibility] = useState(false);

    const [reviewForm, setReviewForm] = useState({
        rating: 0,
        title: "",
        comment: "",
    });

    const [submittingReview, setSubmittingReview] = useState(false);

    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {

        const fetchProduct = async () => {

            try {

                const data = await getProduct(id);

                setProduct(data);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        fetchProduct();

    }, [id]);

    useEffect(() => {

        if (!user || !product) {
            setEligibility(null);
            return;
        }

        const fetchEligibility = async () => {

            try {

                setLoadingEligibility(true);

                const data = await getReviewEligibility(product.id);

                setEligibility(data);

            } catch (error) {

                console.error(error);

            } finally {

                setLoadingEligibility(false);

            }

        };

        fetchEligibility();

    }, [user, product?.id]);

    const handleSubmitReview = async () => {

        if (reviewForm.rating < 1) {

            toast.error("Please select a star rating");

            return;

        }

        try {

            setSubmittingReview(true);

            const updatedProduct = await submitReview(product.id, reviewForm);

            setProduct(updatedProduct);

            setEligibility((prev) => ({ ...prev, alreadyReviewed: true }));

            setReviewForm({ rating: 0, title: "", comment: "" });

            toast.success("Thanks for your review!");

        } catch (error) {

            toast.error(
                error?.response?.data?.message || "Failed to submit review"
            );

        } finally {

            setSubmittingReview(false);

        }

    };

    // Initialize selected image & weight
    useEffect(() => {

        if (!product) return;

        setSelectedImage(
            product.gallery?.[0] || product.image
        );

        if (product.variants?.length > 0) {

            setSelectedWeight(product.variants[0].weight);

        }

    }, [product]);

    if (loading) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <h1 className="text-3xl font-semibold text-brand-dark">

                    Loading Product...

                </h1>

            </div>

        );

    }

    if (!product) {

        return (

            <div className="py-32 text-center">

                <h1 className="font-serif text-4xl mb-4">

                    Product Not Found

                </h1>

                <Link
                    to="/shop"
                    className="text-brand-maroon underline"
                >
                    Back to Shop
                </Link>

            </div>

        );

    }

    const currentVariant =
        product.variants?.find(
            (v) => v.weight === selectedWeight
        ) || product.variants?.[0];

    const currentPrice =
        currentVariant?.price || 0;

    const oldPrice =
        currentVariant?.oldPrice || null;

    const stock = currentVariant?.stock ?? 0;
    const outOfStock = stock <= 0;
    const lowStock = !outOfStock && stock <= 5;

    const sortedReviews = [...(product.reviews || [])].sort(
        (a, b) => {

            if (reviewSort === "recent") {

                return (
                    new Date(b.date) -
                    new Date(a.date)
                );

            }

            if (reviewSort === "rating") {

                return b.rating - a.rating;

            }

            return (
                (b.helpful || 0) -
                (a.helpful || 0)
            );

        }
    );

    const ratingBreakdown =
        product.reviews?.reduce((acc, review) => {

            acc[review.rating] =
                (acc[review.rating] || 0) + 1;

            return acc;

        }, {}) || {};

    const avgRating =
        product.reviews?.length > 0
            ? (
                product.reviews.reduce(
                    (sum, r) => sum + r.rating,
                    0
                ) / product.reviews.length
            ).toFixed(1)
            : product.rating;

    return (<section className="max-w-[1400px] mx-auto px-5 md:px-20 py-12 md:py-16">

        {/* Back Button */}

        <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-maroon mb-8"
        >
            <FaArrowLeft />
            Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-14">

            {/* LEFT SIDE */}

            <div>

                {/* Main Image */}

                <div className="overflow-hidden rounded-xl bg-muted aspect-[4/5]">

                    <img
                        src={selectedImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition duration-500 hover:scale-125 cursor-zoom-in"
                    />

                </div>

                {/* Gallery */}

                {product.gallery?.length > 0 && (

                    <div className="grid grid-cols-4 gap-4 mt-5">

                        {product.gallery.map((image) => (

                            <button
                                key={image}
                                onClick={() => setSelectedImage(image)}
                                className={`rounded-lg overflow-hidden border-2 transition ${selectedImage === image
                                    ? "border-brand-maroon"
                                    : "border-transparent"
                                    }`}
                            >

                                <img
                                    src={image}
                                    alt=""
                                    className="aspect-square object-cover w-full h-full"
                                />

                            </button>

                        ))}

                    </div>

                )}

            </div>

            {/* RIGHT SIDE */}

            <div>

                <p className="eyebrow mb-3">

                    {product.category}

                </p>

                <h1 className="font-serif text-5xl text-brand-dark mb-5">

                    {product.name}

                </h1>

                {outOfStock ? (

                    <span className="inline-block mb-5 rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700">
                        Out of Stock
                    </span>

                ) : lowStock ? (

                    <span className="inline-block mb-5 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-brand-orange">
                        Only {stock} left
                    </span>

                ) : null}

                {/* Rating */}

                <div className="flex items-center gap-3 mb-6">

                    <div className="flex gap-1 text-brand-orange">

                        {Array.from({ length: 5 }).map((_, i) => (

                            <FaStar
                                key={i}
                                className={
                                    i < Math.round(avgRating)
                                        ? ""
                                        : "opacity-30"
                                }
                            />

                        ))}

                    </div>

                    <span className="text-brand-muted">

                        {avgRating} • {product.reviews?.length || 0} Reviews

                    </span>

                </div>

                {/* Price */}

                <div className="flex items-end gap-4 mb-8">

                    <span className="text-4xl font-bold text-brand-dark">

                        ₹{currentPrice}

                    </span>

                    {oldPrice && (

                        <span className="text-2xl line-through text-brand-muted">

                            ₹{oldPrice}

                        </span>

                    )}

                </div>

                {/* Description */}

                <p className="leading-8 text-brand-muted mb-8">

                    {product.description}

                </p>

                {/* Weight Variants */}

                <div className="mb-8">

                    <h3 className="font-semibold text-brand-dark mb-4">

                        Select Weight

                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                        {(product.variants || []).map((variant) => (

                            <button
                                key={variant.weight}
                                onClick={() =>
                                    setSelectedWeight(variant.weight)
                                }
                                className={`rounded-lg border p-4 transition ${selectedWeight === variant.weight
                                    ? "bg-brand-maroon text-white border-brand-maroon"
                                    : "border-brand-border hover:border-brand-maroon"
                                    }`}
                            >

                                <div className="font-semibold">

                                    {variant.weight}

                                </div>

                                <div className="text-sm">

                                    ₹{variant.price}

                                </div>

                            </button>

                        ))}

                    </div>

                </div>

                {/* Quantity */}

                <div className="flex items-center gap-5 mb-8">

                    <div className="flex border rounded-lg overflow-hidden">

                        <button
                            onClick={() =>
                                setQty((q) => Math.max(1, q - 1))
                            }
                            disabled={outOfStock}
                            className="px-4 py-3 hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <FaMinus />
                        </button>

                        <div className="w-14 flex items-center justify-center">

                            {qty}

                        </div>

                        <button
                            onClick={() =>
                                setQty((q) => Math.min(stock, q + 1))
                            }
                            disabled={outOfStock || qty >= stock}
                            className="px-4 py-3 hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <FaPlus />
                        </button>

                    </div>

                    <button
                        className="btn-primary flex-1 justify-center disabled:opacity-60"
                        disabled={addingToCart || outOfStock}
                        onClick={async () => {

                            try {

                                setAddingToCart(true);

                                await add(product._id, qty, selectedWeight);

                                toast.success(
                                    `${qty} × ${product.name} (${selectedWeight}) added to cart`
                                );

                            } catch (error) {

                                toast.error("Could not add item to cart");

                            } finally {

                                setAddingToCart(false);

                            }

                        }}
                    >

                        {outOfStock ? "Out of Stock" : "Add To Cart"}

                    </button>

                </div>

                {/* Buy Now */}

                <button
                    className="btn-outline w-full justify-center disabled:opacity-60"
                    disabled={outOfStock}
                    onClick={() => {

                        // Doesn't touch the cart at all — Checkout reads
                        // this single item straight from route state.
                        navigate("/checkout", {
                            state: {
                                buyNow: {
                                    productId: product._id,
                                    weight: selectedWeight,
                                    qty,
                                },
                            },
                        });

                    }}
                >

                    {outOfStock ? "Currently Unavailable" : "Buy Now →"}

                </button>

                {/* Product Information */}

                <div className="mt-10 space-y-5 border-t pt-8">

                    <div>

                        <h3 className="font-semibold text-brand-dark mb-2">

                            Ingredients

                        </h3>

                        <p className="text-brand-muted">

                            {product.ingredients.join(", ")}

                        </p>

                    </div>

                    <div>

                        <h3 className="font-semibold text-brand-dark mb-2">

                            Shelf Life

                        </h3>

                        <p className="text-brand-muted">

                            {product.shelfLife}

                        </p>

                    </div>

                    <div>

                        <h3 className="font-semibold text-brand-dark mb-2">

                            Storage

                        </h3>

                        <p className="text-brand-muted">

                            {product.storage}

                        </p>

                    </div>

                    <div>

                        <h3 className="font-semibold text-brand-dark mb-2">

                            Delivery

                        </h3>

                        <p className="text-brand-muted">

                            {product.delivery}

                        </p>

                    </div>

                </div>

            </div>

        </div>
        {/* Nutrition */}

        {product.nutrition && (

            <div className="mt-12">

                <h2 className="font-serif text-3xl text-brand-dark mb-6">
                    Nutrition Facts
                </h2>

                <div className="overflow-hidden rounded-xl border border-brand-border">

                    <table className="w-full">

                        <tbody>

                            <tr className="border-b border-brand-border">
                                <td className="p-4 font-medium">Calories</td>
                                <td className="p-4">{product.nutrition.calories}</td>
                            </tr>

                            <tr className="border-b border-brand-border">
                                <td className="p-4 font-medium">Protein</td>
                                <td className="p-4">{product.nutrition.protein}</td>
                            </tr>

                            <tr className="border-b border-brand-border">
                                <td className="p-4 font-medium">Carbohydrates</td>
                                <td className="p-4">{product.nutrition.carbs}</td>
                            </tr>

                            <tr className="border-b border-brand-border">
                                <td className="p-4 font-medium">Fat</td>
                                <td className="p-4">{product.nutrition.fat}</td>
                            </tr>

                            <tr className="border-b border-brand-border">
                                <td className="p-4 font-medium">Sugar</td>
                                <td className="p-4">{product.nutrition.sugar}</td>
                            </tr>

                            <tr>
                                <td className="p-4 font-medium">Fiber</td>
                                <td className="p-4">{product.nutrition.fiber}</td>
                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        )}

        {/* Reviews */}

        <div className="mt-20 border-t border-brand-border pt-14">

            <div className="flex flex-col md:flex-row justify-between items-center mb-10">

                <h2 className="font-serif text-4xl text-brand-dark">

                    Customer Reviews

                </h2>

                {product.reviews?.length > 0 && (

                    <select
                        value={reviewSort}
                        onChange={(e) => setReviewSort(e.target.value)}
                        className="mt-4 md:mt-0 rounded-lg border border-brand-border px-4 py-2"
                    >
                        <option value="helpful">Most Helpful</option>
                        <option value="recent">Most Recent</option>
                        <option value="rating">Highest Rating</option>
                    </select>

                )}

            </div>

            {/* Rating Summary */}

            <div className="grid lg:grid-cols-3 gap-10">

                <div className="rounded-xl bg-cream p-8">

                    <h3 className="text-6xl font-bold text-brand-dark">

                        {avgRating}

                    </h3>

                    <div className="flex gap-1 text-brand-orange my-4">

                        {Array.from({ length: 5 }).map((_, i) => (

                            <FaStar
                                key={i}
                                className={
                                    i < Math.round(avgRating)
                                        ? ""
                                        : "opacity-30"
                                }
                            />

                        ))}

                    </div>

                    <p className="text-brand-muted mb-6">

                        Based on {product.reviews?.length || 0} Reviews

                    </p>

                    {[5, 4, 3, 2, 1].map((rating) => (

                        <div
                            key={rating}
                            className="flex items-center gap-3 mb-3"
                        >

                            <span className="w-5">

                                {rating}

                            </span>

                            <FaStar className="text-brand-orange text-sm" />

                            <div className="flex-1 h-2 rounded-full bg-brand-border overflow-hidden">

                                <div
                                    className="bg-brand-orange h-full"
                                    style={{
                                        width: `${((ratingBreakdown[rating] || 0) / (product.reviews?.length || 1)) * 100}%`,
                                    }}
                                />

                            </div>

                            <span className="w-8 text-sm">

                                {ratingBreakdown[rating] || 0}

                            </span>

                        </div>

                    ))}

                </div>

                {/* Reviews + Write a Review */}

                <div className="lg:col-span-2 space-y-8">

                    {/* Write a Review */}

                    <div className="rounded-xl border border-brand-border p-6">

                        {!user ? (

                            <p className="text-brand-muted">
                                <Link to="/auth" className="text-brand-maroon underline">
                                    Sign in
                                </Link>{" "}
                                to write a review.
                            </p>

                        ) : loadingEligibility ? (

                            <p className="text-brand-muted">Checking your order history…</p>

                        ) : eligibility?.alreadyReviewed ? (

                            <p className="text-brand-muted">
                                You've already reviewed this product. Thanks for sharing your feedback!
                            </p>

                        ) : eligibility?.canReview ? (

                            <>
                                <h3 className="font-serif text-2xl text-brand-dark mb-4">
                                    Write a Review
                                </h3>

                                <div className="flex gap-1 text-brand-orange text-2xl mb-4">

                                    {Array.from({ length: 5 }).map((_, i) => (

                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() =>
                                                setReviewForm({
                                                    ...reviewForm,
                                                    rating: i + 1,
                                                })
                                            }
                                            className="focus:outline-none"
                                        >
                                            <FaStar
                                                className={
                                                    i < reviewForm.rating
                                                        ? ""
                                                        : "opacity-30"
                                                }
                                            />
                                        </button>

                                    ))}

                                </div>

                                <input
                                    value={reviewForm.title}
                                    onChange={(e) =>
                                        setReviewForm({
                                            ...reviewForm,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="Review title (optional)"
                                    className="w-full rounded-md border border-brand-border px-4 py-3 mb-3"
                                />

                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) =>
                                        setReviewForm({
                                            ...reviewForm,
                                            comment: e.target.value,
                                        })
                                    }
                                    rows="4"
                                    placeholder="Share your experience with this product…"
                                    className="w-full rounded-md border border-brand-border px-4 py-3 mb-4"
                                />

                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submittingReview}
                                    className="btn-primary disabled:opacity-60"
                                >
                                    {submittingReview ? "Submitting…" : "Submit Review"}
                                </button>
                            </>

                        ) : (

                            <p className="text-brand-muted">
                                Reviews can be written once your order for this product has been delivered.
                            </p>

                        )}

                    </div>

                    {sortedReviews.length === 0 ? (

                        <p className="text-brand-muted">
                            No reviews yet — be the first to share your experience!
                        </p>

                    ) : (

                        sortedReviews.map((review, index) => (

                            <div
                                key={index}
                                className="border-b border-brand-border pb-8"
                            >

                                <div className="flex justify-between mb-3">

                                    <div>

                                        <h4 className="font-semibold text-lg">

                                            {review.name}

                                        </h4>

                                        <p className="text-sm text-brand-muted">

                                            {new Date(review.date).toLocaleDateString("en-IN")}

                                        </p>

                                    </div>

                                    <div className="flex gap-1 text-brand-orange">

                                        {Array.from({ length: 5 }).map((_, i) => (

                                            <FaStar
                                                key={i}
                                                className={
                                                    i < review.rating
                                                        ? ""
                                                        : "opacity-30"
                                                }
                                            />

                                        ))}

                                    </div>

                                </div>

                                <h5 className="font-semibold text-brand-dark mb-2">

                                    {review.title}

                                </h5>

                                <p className="text-brand-muted leading-7">

                                    {review.comment}

                                </p>

                                <button className="mt-4 text-sm text-brand-maroon hover:underline">

                                    👍 Helpful ({review.helpful})

                                </button>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>

    </section>

    );

}

export default Product;