import { Routes, Route } from "react-router-dom";
// import { AnimatePresence } from "framer-motion";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import ShippingPolicy from "./pages/ShippingPolicy";
import About from "./pages/About";
import OurStory from "./pages/OurStory";
import ScrollToTop from "./Components/ScrollToTop";
function App() {
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/about" element={<About />} />
        <Route path="/our-story" element={<OurStory />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;