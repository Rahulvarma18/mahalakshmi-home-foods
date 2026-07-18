import { Link } from "react-router-dom";
import {
    FaInstagram,
    FaFacebookF,
    FaWhatsapp,
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
} from "react-icons/fa";

import logo from "../assets/logo.png";

const Footer = () => {
    return (
        <footer className="bg-brand-dark text-white pt-20 pb-8 px-5 md:px-20">
            <div className="max-w-[1400px] mx-auto grid gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.3fr]">

                {/* Logo & Description */}
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <img
                            src={logo}
                            alt="Mahalakshmi Home Foods"
                            className="w-16 h-16 rounded-full object-cover bg-white/5"
                        />

                        <div>
                            <h2 className="font-serif text-3xl">
                                Mahalakshmi
                            </h2>

                            <p className="text-xs tracking-[0.25em] text-white/60">
                                HOME FOODS
                            </p>
                        </div>
                    </div>

                    <p className="text-white/70 leading-relaxed mb-6 max-w-md">
                        Bringing the authentic taste of Godavari homes to families across
                        India through handcrafted sweets, snacks and traditional recipes.
                    </p>

                    <div className="flex gap-4">
                        {[FaInstagram, FaFacebookF, FaWhatsapp].map((Icon, index) => (
                            <a
                                key={index}
                                href="#"
                                className="w-10 h-10 rounded-full border border-white/20 grid place-items-center hover:bg-brand-maroon hover:border-brand-maroon transition"
                            >
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Shop Links */}
                <div>
                    <h3 className="font-serif text-2xl mb-5">
                        Shop
                    </h3>

                    <ul className="space-y-3 text-white/70">
                        <li>
                            <Link
                                to="/shop?category=Traditional%20Sweets"
                                className="hover:text-brand-orange"
                            >
                                Traditional Sweets
                            </Link>
                        </li>

                        <li>
                            <Link
                                to="/shop?category=Traditional%20Snacks"
                                className="hover:text-brand-orange"
                            >
                                Traditional Snacks
                            </Link>
                        </li>

                        <li>
                            <Link
                                to="/shop?category=Healthy%20Sweets"
                                className="hover:text-brand-orange"
                            >
                                Healthy Sweets
                            </Link>
                        </li>

                        <li>
                            <Link
                                to="/shop"
                                className="hover:text-brand-orange"
                            >
                                All Products
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h3 className="font-serif text-2xl mb-5">
                        Company
                    </h3>

                    <ul className="space-y-3 text-white/70">
                        <li>
                            <Link to="/about" className="hover:text-brand-orange">
                                About Us
                            </Link>
                        </li>

                        <li>
                            <Link to="/our-story" className="hover:text-brand-orange">
                                Our Story
                            </Link>
                        </li>

                        <li>
                            <Link to="/contact" className="hover:text-brand-orange">
                                Contact
                            </Link>
                        </li>

                        <li>
                            <Link to="/shipping-policy" className="hover:text-brand-orange">
                                Shipping Policy
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="font-serif text-2xl mb-5">
                        Contact
                    </h3>

                    <ul className="space-y-3 text-white/70">
                        <li className="flex items-start gap-3">
                            <FaMapMarkerAlt className="mt-1 text-brand-orange shrink-0" />
                            Rajahmundry, East Godavari, Andhra Pradesh 533101
                        </li>

                        <li className="flex items-center gap-3">
                            <FaPhoneAlt className="text-brand-orange shrink-0" />
                            +91 77803 67903
                        </li>

                        <li className="flex items-center gap-3">
                            <FaEnvelope className="text-brand-orange shrink-0" />
                            venkatnallaias@gmail.com
                        </li>
                    </ul>
                </div>

            </div>

            <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-white/10 text-center text-white/50 text-sm">
                © {new Date().getFullYear()} Mahalakshmi Home Foods. Crafted with love
                from the Godavari.
            </div>
        </footer>
    );
};

export default Footer;