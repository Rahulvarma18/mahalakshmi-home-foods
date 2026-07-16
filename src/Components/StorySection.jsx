import cat1 from "../assets/category1.jpg";

const StorySection = () => {
    return (
        <section id="story" className="py-24 px-5 md:px-20 bg-white">
            <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-14 items-center">

                <img
                    src={cat1}
                    alt="Traditional preparation"
                    loading="lazy"
                    className="w-full aspect-[5/4] object-cover rounded-md"
                />

                <div>
                    <p className="eyebrow mb-4">
                        Our Story
                    </p>

                    <h2 className="font-serif text-4xl md:text-5xl text-brand-dark mb-6">
                        Recipes from the banks of the Godavari.
                    </h2>

                    <p className="text-brand-muted text-lg leading-relaxed mb-4">
                        Three generations of the Mahalakshmi kitchen have preserved the
                        soul of Andhra home cooking — slow-cooked jaggery syrups,
                        hand-rolled boondi, and ghee pressed in small copper vessels.
                    </p>

                    <p className="text-brand-muted text-lg leading-relaxed">
                        No preservatives, no shortcuts. Every box carries the warmth of a
                        home kitchen straight to your table.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default StorySection;