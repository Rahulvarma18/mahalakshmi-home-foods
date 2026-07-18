import cat1 from "../assets/story.jpg";

function OurStory() {
    return (
        <div className="px-5 py-16 md:px-20">
            <div className="max-w-[1100px] mx-auto">

                {/* Intro */}
                <div className="grid lg:grid-cols-2 gap-14 items-center">
                    <img
                        src={cat1}
                        alt="Traditional preparation"
                        loading="lazy"
                        className="w-full aspect-[5/4] object-cover rounded-md"
                    />

                    <div className="text-left">
                        <p className="eyebrow mb-4">Our Story</p>

                        <h1 className="font-serif text-4xl md:text-5xl text-brand-dark mb-6">
                            Recipes from the banks of the Godavari.
                        </h1>

                        <p className="text-brand-muted text-lg leading-relaxed mb-4">
                            It started in our grandmother's kitchen in Rajahmundry —
                            festival sweets and everyday snacks made fresh for the
                            family. Three generations later, the same recipes still
                            guide everything we make: slow-cooked jaggery syrups,
                            hand-rolled boondi, and ghee pressed in small copper
                            vessels.
                        </p>

                        <p className="text-brand-muted text-lg leading-relaxed">
                            No preservatives, no shortcuts. Every box carries the
                            warmth of a home kitchen straight to your table.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default OurStory;