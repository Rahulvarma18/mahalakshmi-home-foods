import { motion } from "framer-motion";
import { Award, Leaf, ChefHat, Factory, PackageCheck } from "lucide-react";

const features = [
    {
        icon: Award,
        title: "Authentic Godavari Recipe",
        description: "Inspired by traditional regional flavours.",
    },
    {
        icon: Leaf,
        title: "Premium Ingredients",
        description: "Carefully selected vegetables, meats and spices.",
    },
    {
        icon: ChefHat,
        title: "Traditional Taste",
        description: "Prepared with the character of home-style pickling.",
    },
    {
        icon: Factory,
        title: "Small-Batch Craftsmanship",
        description: "Focused on flavour, freshness and consistency.",
    },
    {
        icon: PackageCheck,
        title: "Packed with Care",
        description: "Hygienic packaging designed for safe delivery.",
    },
];

const WhyUs = () => {
    return (
        <section className="bg-cream border-y border-brand-border py-14 px-5 md:px-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-10">
                    <span className="h-px w-10 bg-brand-orange/40" />
                    <h2 className="text-center text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-brand-maroon">
                        Why Maharuchulu?
                    </h2>
                    <span className="h-px w-10 bg-brand-orange/40" />
                </div>

                <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.4 }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className="flex flex-col items-center text-center px-2"
                            >
                                <div className="mb-4 grid size-14 place-items-center rounded-full border border-brand-orange/30 bg-white text-brand-maroon shadow-soft">
                                    <Icon className="size-6" strokeWidth={1.75} />
                                </div>
                                <h3 className="font-serif text-lg text-brand-dark mb-1.5">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WhyUs;