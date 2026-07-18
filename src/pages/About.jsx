import hero from "../assets/hero.jpg";
import category2 from "../assets/category2.jpg";
import category3 from "../assets/ab1.jpg";

function About() {
    return (
        <div className="px-5 py-16 md:px-20">
            <div className="max-w-[1400px] mx-auto">

                {/* Intro */}
                <div className="max-w-2xl mb-16">
                    <p className="eyebrow mb-3">Who We Are</p>

                    <h1 className="font-serif text-4xl md:text-5xl text-brand-dark mb-6">
                        About Mahalakshmi Home Foods
                    </h1>

                    <p className="text-brand-muted text-lg leading-relaxed">
                        We're a family-run kitchen from Rajahmundry, on the banks of
                        the Godavari, bringing handcrafted sweets and snacks to homes
                        across India — made the way our grandmothers made them.
                    </p>
                </div>

                {/* Image + mission */}
                <div className="grid lg:grid-cols-2 gap-14 items-center mb-20">
                    <img
                        src={hero}
                        alt="Mahalakshmi Home Foods kitchen"
                        loading="lazy"
                        className="w-full aspect-[5/4] object-cover rounded-md"
                    />

                    <div>
                        <p className="eyebrow mb-4">Our Mission</p>

                        <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-6">
                            Real ingredients, real recipes, real home cooking.
                        </h2>

                        <p className="text-brand-muted text-lg leading-relaxed mb-4">
                            Every product we make starts with the same recipes passed
                            down through our family — no shortcuts, no artificial
                            preservatives, just ghee, jaggery.
                        </p>

                        <p className="text-brand-muted text-lg leading-relaxed">
                            Our goal is simple: to bring the taste of an Andhra home
                            kitchen to your table, wherever you are.
                        </p>
                    </div>
                </div>

                {/* Values */}
                <div className="mb-20">
                    <p className="eyebrow mb-4">What We Stand For</p>

                    <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-10">
                        Our Values
                    </h2>

                    <div className="grid sm:grid-cols-3 gap-8">
                        <div className="rounded-lg border border-brand-border bg-white p-6">
                            <h3 className="font-serif text-2xl text-brand-dark mb-2">
                                Handcrafted
                            </h3>
                            <p className="text-brand-muted leading-relaxed">
                                Every batch is made by hand, in small quantities, the
                                traditional way.
                            </p>
                        </div>

                        <div className="rounded-lg border border-brand-border bg-white p-6">
                            <h3 className="font-serif text-2xl text-brand-dark mb-2">
                                No Shortcuts
                            </h3>
                            <p className="text-brand-muted leading-relaxed">
                                No preservatives or artificial flavoring — just
                                ingredients you'd find in a home kitchen.
                            </p>
                        </div>

                        <div className="rounded-lg border border-brand-border bg-white p-6">
                            <h3 className="font-serif text-2xl text-brand-dark mb-2">
                                Made With Care
                            </h3>
                            <p className="text-brand-muted leading-relaxed">
                                From our family to yours — every box is packed with
                                the same care as a gift for a loved one.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Secondary image */}
                <div className="grid sm:grid-cols-2 gap-6">
                    <img
                        src={category2}
                        alt="Traditional snacks"
                        loading="lazy"
                        className="w-full aspect-[4/3] object-cover rounded-md"
                    />
                    <img
                        src={category3}
                        alt="Traditional sweets"
                        loading="lazy"
                        className="w-full aspect-[4/3] object-cover rounded-md"
                    />
                </div>

            </div>
        </div>
    );
}

export default About;