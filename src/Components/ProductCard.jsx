import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { useState } from "react";
import { cldUrl } from "../lib/cloudinary";

const ProductCard = ({ product }) => {

    const { add } = useCart();

    const [adding, setAdding] = useState(false);

    // First variant (250g by default)
    const variant = product.variants?.[0];

    const price = variant?.price ?? 0;
    const oldPrice = variant?.oldPrice;
    const weight = variant?.weight ?? "";

    // Calculate discount automatically
    const discount =
        oldPrice && oldPrice > price
            ? `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`
            : null;

    return (
        <div className="group flex flex-col h-full transition-transform duration-300 hover:-translate-y-2">

            {/* Product Image */}

            <Link
                to={`/shop/${product.id}`}
                className="relative block overflow-hidden rounded-md aspect-[4/5] bg-muted"
            >

                {product.bestSeller && (
                    <span className="absolute top-3 left-3 z-10 bg-brand-maroon text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full">
                        BEST SELLER
                    </span>
                )}

                {discount && (
                    <span className="absolute top-3 right-3 z-10 bg-brand-orange text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {discount}
                    </span>
                )}

                <img
                    src={cldUrl(product.image, { width: 500 })}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

            </Link>

            {/* Details */}

            <div className="flex flex-col flex-1 gap-2 pt-5">

                <p className="text-xs uppercase tracking-[0.2em] text-brand-orange">
                    {product.category}
                </p>

                <Link
                    to={`/shop/${product.id}`}
                    className="font-serif text-2xl leading-tight text-brand-dark hover:text-brand-maroon"
                >
                    {product.name}
                </Link>

                <div className="flex items-center gap-2 text-sm text-brand-muted">

                    <FaStar className="text-brand-orange" />

                    <span>{product.rating}</span>

                    <span className="text-brand-border">•</span>

                    <span>from {weight}</span>

                </div>

                <div className="flex items-center justify-between mt-auto pt-3">

                    <div className="flex items-baseline gap-2">

                        <span className="text-xl font-semibold text-brand-dark">
                            ₹{price}
                        </span>

                        {oldPrice && (
                            <span className="text-sm line-through text-brand-muted">
                                ₹{oldPrice}
                            </span>
                        )}

                    </div>

                    <button
                        disabled={adding}
                        onClick={async () => {
                            try {
                                setAdding(true);
                                await add(
                                    product._id,
                                    1,
                                    product.variants?.[0]?.weight || null
                                );
                                toast.success(`${product.name} added to cart`);
                            } catch (error) {
                                toast.error("Could not add item to cart");
                            } finally {
                                setAdding(false);
                            }
                        }}
                        className="text-sm font-medium text-brand-maroon hover:text-brand-dark transition disabled:opacity-60"
                    >
                        Add +
                    </button>

                </div>

            </div>

        </div>
    );
};

export default ProductCard;