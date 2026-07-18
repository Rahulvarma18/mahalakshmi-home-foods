import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import cat1 from "../assets/category1.jpg";
import cat2 from "../assets/category2.jpg";
import cat3 from "../assets/category3.jpg";

const cats = [
    {
        title: "Traditional Sweets",
        subtitle: "GODAVARI HERITAGE",
        image: cat1,
        category: "Traditional Sweets",
    },
    {
        title: "Traditional Snacks",
        subtitle: "GODAVARI CRUNCH",
        image: cat2,
        category: "Traditional Snacks",
    },
    {
        title: "Healthy Sweets",
        subtitle: "WHOLESOME",
        image: cat3,
        category: "Healthy Sweets",
    },
];

const Categories = () => {
    return (
        <section className="py-24 px-5 md:px-20 bg-cream">
            <div className="max-w-[1400px] mx-auto flex flex-wrap items-end justify-between gap-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <p className="eyebrow mb-4">Explore</p>

                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-dark">
                        Shop by Category
                    </h2>
                </motion.div>

                <Link
                    to="/shop"
                    className="text-brand-maroon text-lg hover:underline"
                >
                    View all →
                </Link>
            </div>

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:[grid-template-columns:2fr_1fr_1fr]">
                {cats.map((category, index) => (
                    <motion.div
                        key={category.title}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.12 }}
                    >
                        <Link
                            to={`/shop?category=${encodeURIComponent(category.category)}`}
                            className={`group relative overflow-hidden rounded-md cursor-pointer h-[420px] md:h-[540px] block ${index === 0 ? "md:row-span-1" : ""
                                }`}
                        >
                            <img
                                src={category.image}
                                alt={category.title}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                <p className="text-brand-orange text-sm tracking-[0.2em] mb-2">
                                    {category.subtitle}
                                </p>

                                <h3 className="font-serif text-3xl md:text-4xl mb-3">
                                    {category.title}
                                </h3>

                                <span className="text-white/90">
                                    Shop now →
                                </span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Categories;