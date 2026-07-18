function ShippingPolicy() {
    return (
        <div className="min-h-[70vh] px-5 py-16 md:px-20">
            <div className="max-w-[800px] mx-auto">
                <p className="eyebrow mb-3">Good To Know</p>

                <h1 className="font-serif text-4xl md:text-5xl text-brand-dark mb-10">
                    Shipping Policy
                </h1>

                <div className="space-y-8 text-brand-muted text-lg leading-relaxed">
                    <section>
                        <h2 className="font-serif text-2xl text-brand-dark mb-3">
                            Processing Time
                        </h2>
                        <p>
                            Every order is handcrafted fresh in small batches. Please
                            allow 1–2 business days for your order to be prepared and
                            packed before it ships.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-brand-dark mb-3">
                            Delivery Timelines
                        </h2>
                        <p>
                            Orders within Andhra Pradesh typically arrive within
                            2–4 business days. Orders to the rest of India usually
                            take 4–7 business days, depending on your location.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-brand-dark mb-3">
                            Packaging
                        </h2>
                        <p>
                            All sweets and snacks are sealed in food-safe, airtight
                            packaging to preserve freshness and ensure they arrive in
                            perfect condition.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-brand-dark mb-3">
                            Tracking Your Order
                        </h2>
                        <p>
                            Once your order ships, you can track its status anytime
                            from the Orders page in your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-brand-dark mb-3">
                            Questions?
                        </h2>
                        <p>
                            If you have any questions about your shipment, reach out
                            to us at{" "}
                            <a
                                href="mailto:hello@mahalakshmi.com"
                                className="text-brand-maroon hover:underline"
                            >
                                hello@mahalakshmi.com
                            </a>{" "}
                            or call +91 98765 43210.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default ShippingPolicy;