import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProducts } from "../api/productApi";
import ProductCard from "./ProductCard";

const BestSellers = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const data = await getProducts();
                setProducts(data.filter((product) => product.bestSeller).slice(0, 4));
            } catch (error) {
                console.error("Failed to load best sellers:", error);
            }
        };

        fetchBestSellers();
    }, []);

    if (products.length === 0) return null;

    return (
        <section className="py-24 px-5 md:px-20 bg-cream">
            <div className="max-w-2xl mx-auto text-center mb-14">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <p className="eyebrow mb-4">
                        Loved by 1200+ families
                    </p>

                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-dark">
                        Our Best Sellers
                    </h2>
                </motion.div>
            </div>

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                {products.map((product, index) => (
                    <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default BestSellers;