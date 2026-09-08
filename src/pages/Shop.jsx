import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";

import { getProducts } from "../api/productApi";
import ProductCard from "../Components/ProductCard";

const CATEGORIES = [
    "All",
    "Vegetable Pickles",
    "Non-Veg Pickles",
    "Sweets",
    "Snacks",
    "Future Products",
];

function Shop() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();

    const category = searchParams.get("category");

    const [search, setSearch] = useState("");

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const data = await getProducts();

                setProducts(data);

            } catch (error) {

                console.error("Error fetching products:", error);

            } finally {

                setLoading(false);

            }

        };

        fetchProducts();

    }, []);

    const filteredProducts = products.filter((product) => {

        const matchesCategory =
            !category || product.category === category;

        const matchesSearch =
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.category.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;

    });

    const activeCategory = category || "All";

    if (loading) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <h1 className="text-3xl font-semibold text-brand-dark">

                    Loading Products...

                </h1>

            </div>

        );

    }

    return (

        <section className="relative overflow-hidden bg-gradient-to-b from-cream via-white to-cream min-h-screen">

            {/* Background Blur */}

            <div className="absolute top-20 -left-20 h-80 w-80 rounded-full bg-brand-orange/10 blur-3xl"></div>

            <div className="absolute bottom-0 -right-20 h-96 w-96 rounded-full bg-brand-maroon/10 blur-3xl"></div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-5 md:px-20 py-16 md:py-24">

                {/* Heading */}

                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-12"
                >

                    <p className="eyebrow mb-4">

                        Our Collection

                    </p>

                    <h1 className="font-serif text-5xl md:text-6xl text-brand-dark">

                        Shop All Products

                    </h1>

                    <p className="mt-5 text-brand-muted max-w-2xl mx-auto">

                        Discover authentic Godavari pickles, homemade with sun-dried
                        vegetables, hand-ground spices and cold-pressed oil.

                    </p>

                </motion.div>

                {/* Search */}

                <motion.div
                    initial={{ opacity: 0, scale: .95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: .2 }}
                    className="max-w-xl mx-auto mb-10"
                >

                    <div className="relative">

                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-muted" />

                        <input
                            type="text"
                            placeholder="Search pickles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-full border border-brand-border bg-white py-4 pl-14 pr-5 shadow-sm outline-none transition-all focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/20"
                        />

                    </div>

                </motion.div>

                {/* Categories */}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: .4 }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >

                    {CATEGORIES.map((cat) => (

                        <Link
                            key={cat}
                            to={
                                cat === "All"
                                    ? "/shop"
                                    : `/shop?category=${encodeURIComponent(cat)}`
                            }
                            className={`rounded-full px-6 py-3 text-sm font-medium border transition-all duration-300 ${activeCategory === cat
                                ? "bg-brand-maroon text-white border-brand-maroon shadow-lg"
                                : "bg-white border-brand-border text-brand-dark hover:border-brand-maroon hover:text-brand-maroon hover:shadow-md"
                                }`}
                        >
                            {cat}
                        </Link>

                    ))}

                </motion.div>

                {/* Product Count */}

                <div className="flex items-center gap-5 mb-12">

                    <div className="flex-1 h-px bg-brand-border"></div>

                    <p className="text-brand-muted whitespace-nowrap">

                        Showing

                        <span className="mx-2 font-semibold text-brand-dark">

                            {filteredProducts.length}

                        </span>

                        Products

                    </p>

                    <div className="flex-1 h-px bg-brand-border"></div>

                </div>
                {/* Products */}

                {filteredProducts.length === 0 ? (

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-24 text-center"
                    >

                        <h2 className="text-3xl font-semibold text-brand-dark mb-4">

                            No Products Found

                        </h2>

                        <p className="text-brand-muted">

                            Try searching with another keyword.

                        </p>

                    </motion.div>

                ) : (

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

                        {filteredProducts.map((product, index) => (

                            <motion.div
                                key={product.id}
                                layout
                                initial={{
                                    opacity: 0,
                                    y: 60,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    duration: 0.45,
                                    delay: index * 0.08,
                                }}
                                whileHover={{
                                    y: -8,
                                }}
                            >

                                <ProductCard product={product} />

                            </motion.div>

                        ))}

                    </div>

                )}

            </div>

        </section>

    );

}

export default Shop;