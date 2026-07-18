import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";

function Contact() {
    return (
        <div className="min-h-[70vh] px-5 py-16 md:px-20">
            <div className="max-w-[1000px] mx-auto">
                <p className="eyebrow mb-3">Get In Touch</p>

                <h1 className="font-serif text-4xl md:text-5xl text-brand-dark mb-6">
                    Contact Us
                </h1>

                <p className="text-brand-muted text-lg leading-relaxed mb-12 max-w-2xl">
                    Have a question about an order, a product, or just want to say
                    hello? We'd love to hear from you.
                </p>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex items-start gap-4 rounded-lg border border-brand-border bg-white p-6">
                        <FaMapMarkerAlt className="mt-1 text-brand-orange shrink-0 w-5 h-5" />
                        <div>
                            <h3 className="font-serif text-xl text-brand-dark mb-1">
                                Visit Us
                            </h3>
                            <p className="text-brand-muted">
                                Rajahmundry, East Godavari, Andhra Pradesh 533101
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 rounded-lg border border-brand-border bg-white p-6">
                        <FaPhoneAlt className="mt-1 text-brand-orange shrink-0 w-5 h-5" />
                        <div>
                            <h3 className="font-serif text-xl text-brand-dark mb-1">
                                Call Us
                            </h3>
                            <a
                                href="tel:+919876543210"
                                className="text-brand-muted hover:text-brand-maroon"
                            >
                                +91 77803 67903
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 rounded-lg border border-brand-border bg-white p-6">
                        <FaEnvelope className="mt-1 text-brand-orange shrink-0 w-5 h-5" />
                        <div>
                            <h3 className="font-serif text-xl text-brand-dark mb-1">
                                Email Us
                            </h3>
                            <a
                                href="mailto:hello@mahalakshmi.com"
                                className="text-brand-muted hover:text-brand-maroon"
                            >
                                hello@mahalakshmi.com
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 rounded-lg border border-brand-border bg-white p-6">
                        <FaWhatsapp className="mt-1 text-brand-orange shrink-0 w-5 h-5" />
                        <div>
                            <h3 className="font-serif text-xl text-brand-dark mb-1">
                                WhatsApp
                            </h3>
                            <a
                                href="https://wa.me/917780367903"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-muted hover:text-brand-maroon"
                            >
                                Chat with us
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;