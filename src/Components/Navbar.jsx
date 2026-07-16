import { Link, useNavigate } from "react-router-dom";
import { FaShoppingBag, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import logo from "../assets/logo.png";

const nav = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/shop?category=Traditional+Sweets", label: "Sweets" },
    { to: "/shop?category=Traditional+Snacks", label: "Snacks" },
    { to: "/shop?category=Healthy+Sweets", label: "Healthy" },
];

const Navbar = () => {
    const { count } = useCart();
    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [menu, setMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        setMenu(false);
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-brand-border">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between px-5 md:px-10 py-4">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="Mahalakshmi Home Foods"
                        className="w-11 h-11 rounded-full object-cover"
                    />

                    <div className="leading-tight">
                        <h1 className="font-serif text-xl text-brand-dark">
                            Mahalakshmi
                        </h1>

                        <p className="text-[10px] tracking-[0.3em] text-brand-muted">
                            HOME FOODS
                        </p>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {nav.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="group relative text-sm text-brand-dark hover:text-brand-maroon transition-colors"
                        >
                            {item.label}

                            <span className="absolute left-0 -bottom-1 h-[1.5px] w-full origin-left scale-x-0 bg-brand-maroon transition-transform duration-300 group-hover:scale-x-100" />
                        </Link>
                    ))}
                </nav>

                {/* Right Side */}
                <div className="flex items-center gap-4">

                    {/* User */}
                    <div className="relative">
                        {user ? (
                            <button
                                onClick={() => setMenu(!menu)}
                                className="flex items-center gap-2 text-brand-dark hover:text-brand-maroon"
                            >
                                <FaUserCircle className="w-6 h-6" />

                                <span className="hidden sm:inline text-sm">
                                    {user.name.split(" ")[0]}
                                </span>
                            </button>
                        ) : (
                            <Link
                                to="/auth"
                                className="flex items-center gap-2 text-brand-dark hover:text-brand-maroon"
                            >
                                <FaUserCircle className="w-6 h-6" />

                                <span className="hidden sm:inline text-sm">
                                    Sign In
                                </span>
                            </Link>
                        )}

                        {user && menu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-brand-border py-2">

                                <Link
                                    to="/orders"
                                    onClick={() => setMenu(false)}
                                    className="block px-4 py-2 text-sm hover:bg-cream"
                                >
                                    My Orders
                                </Link>

                                {user.role === "admin" && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMenu(false)}
                                        className="block px-4 py-2 text-sm hover:bg-cream"
                                    >
                                        Admin Panel
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-cream text-brand-maroon"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Cart */}
                    <Link
                        to="/cart"
                        className="relative text-brand-dark hover:text-brand-maroon"
                    >
                        <FaShoppingBag className="w-6 h-6" />

                        {count > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-maroon text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {count}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden text-brand-dark"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? (
                            <FaTimes className="w-5 h-5" />
                        ) : (
                            <FaBars className="w-5 h-5" />
                        )}
                    </button>

                </div>
            </div>

            {/* Mobile Navigation */}
            {open && (
                <nav className="lg:hidden border-t border-brand-border bg-cream px-5 py-4 flex flex-col gap-3">
                    {nav.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className="text-brand-dark hover:text-brand-maroon"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
};

export default Navbar;
