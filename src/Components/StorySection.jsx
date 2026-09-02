import cat1 from "../assets/story.jpg";
import { motion } from "framer-motion";

const StorySection = () => {
    return (
        <section id="story" className="scroll-mt-24 py-24 px-5 md:px-20 bg-white">
            <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-14 items-center">

                <motion.img
                    src={cat1}
                    alt="Traditional preparation"
                    loading="lazy"
                    className="w-full aspect-[5/4] object-cover rounded-md"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                />

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
                >
                    <p className="eyebrow mb-4">
                        Our Story
                    </p>

                    <h2 className="font-serif text-4xl md:text-5xl text-brand-dark mb-6">
                        Recipes from the banks of the Godavari.
                    </h2>

                    <p className="text-brand-muted text-lg leading-relaxed mb-4">
                        Three generations of the Maharuchulu kitchen have preserved the
                        soul of Andhra home cooking — slow-cooked jaggery syrups,
                        hand-rolled boondi, and ghee pressed in small copper vessels.
                    </p>

                    <p className="text-brand-muted text-lg leading-relaxed">
                        No preservatives, no shortcuts. Every box carries the warmth of a
                        home kitchen straight to your table.
                    </p>
                </motion.div>

            </div>
        </section>
    );
};

export default StorySection;