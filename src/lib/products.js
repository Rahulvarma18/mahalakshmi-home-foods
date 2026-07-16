import { useEffect, useState } from "react";
import product1 from "../assets/product1.jpg";
import product2 from "../assets/product2.jpg";
import product3 from "../assets/product3.jpg";
import product4 from "../assets/product4.jpg";

export const defaultProducts = [
    {
        id: "special-laddu",
        name: "Special Laddu",
        category: "Traditional Sweets",
        image: product1,
        price: 249,
        oldPrice: 299,
        rating: 4.9,
        weight: "250g",
        discount: "-17%",
        bestSeller: true,
        description:
            "Hand-rolled boondi laddu made in pure cow ghee and jaggery. A Godavari household favourite for generations, perfect for festivals and daily indulgence.",
        // NEW: Weight variants with pricing
        variants: [
            { weight: "250g", price: 249, oldPrice: 299 },
            { weight: "500g", price: 449, oldPrice: 549 },
            { weight: "1kg", price: 799, oldPrice: 999 },
            { weight: "2kg", price: 1499, oldPrice: 1899 },
            { weight: "5kg", price: 3299, oldPrice: 4299 },
        ],
        // NEW: Customer reviews
        reviews: [
            {
                id: 1,
                name: "Priya Sharma",
                date: "2026-07-15",
                rating: 5,
                title: "Best laddu I've had!",
                comment: "Absolutely delicious! The ghee and jaggery quality is premium. My family loved it and we're already placing another order.",
                helpful: 24,
            },
            {
                id: 2,
                name: "Rajesh Kumar",
                date: "2026-07-10",
                rating: 5,
                title: "Fresh and tasty",
                comment: "Received the order on time. The laddus are fresh and taste homemade. Much better than store-bought ones.",
                helpful: 18,
            },
            {
                id: 3,
                name: "Anu Reddy",
                date: "2026-07-05",
                rating: 4,
                title: "Good quality, a bit pricey",
                comment: "The product quality is great, 100% natural as claimed. My only concern is the price, but I understand it's made fresh.",
                helpful: 12,
            },
            {
                id: 4,
                name: "Vikram Singh",
                date: "2026-06-28",
                rating: 5,
                title: "Perfect for gifting",
                comment: "I bought the 1kg pack to gift my friend. The presentation was beautiful and she absolutely loved it.",
                helpful: 15,
            },
            {
                id: 5,
                name: "Deepa Nair",
                date: "2026-06-20",
                rating: 4,
                title: "Great taste, melts in mouth",
                comment: "The laddus melt in your mouth. The boondi texture is perfect. Just wish they came with more flavor options.",
                helpful: 8,
            },
            {
                id: 6,
                name: "Suresh Gupta",
                date: "2026-06-15",
                rating: 5,
                title: "Authentic Godavari recipe",
                comment: "As someone from Godavari region, I can confirm this tastes authentic! The jaggery proportion is just right.",
                helpful: 20,
            },
        ],
    },
    {
        id: "gottam-kaja",
        name: "Gottam Kaja",
        category: "Traditional Sweets",
        image: product2,
        price: 219,
        oldPrice: 269,
        rating: 4.8,
        weight: "250g",
        discount: "-20%",
        bestSeller: true,
        description:
            "Crispy layered kaja soaked in fragrant sugar syrup. A signature Andhra sweet, prepared the old-fashioned way in small batches.",
        variants: [
            { weight: "250g", price: 219, oldPrice: 269 },
            { weight: "500g", price: 399, oldPrice: 499 },
            { weight: "1kg", price: 699, oldPrice: 899 },
            { weight: "2kg", price: 1299, oldPrice: 1699 },
            { weight: "5kg", price: 2999, oldPrice: 3999 },
        ],
        reviews: [
            {
                id: 1,
                name: "Lakshmi Devi",
                date: "2026-07-12",
                rating: 5,
                title: "Traditional taste",
                comment: "Reminds me of the kaja my grandmother used to make! Crispy on the outside, perfect syrup soaking. Highly recommend.",
                helpful: 22,
            },
            {
                id: 2,
                name: "Arjun Verma",
                date: "2026-07-08",
                rating: 4,
                title: "Good but fragile",
                comment: "Taste is excellent, very crispy. However, some pieces got broken during shipping. The taste makes up for it though.",
                helpful: 14,
            },
            {
                id: 3,
                name: "Sneha Reddy",
                date: "2026-07-01",
                rating: 5,
                title: "Perfect for Diwali",
                comment: "Ordered for Diwali gifts. Everyone loved them. The packaging was excellent and fresh taste guaranteed.",
                helpful: 19,
            },
            {
                id: 4,
                name: "Ramesh Kumar",
                date: "2026-06-25",
                rating: 4,
                title: "Authentic recipe",
                comment: "Good quality kaja. Brings back memories of Andhra Pradesh. Would be better if it came with a dessert fork!",
                helpful: 9,
            },
        ],
    },
    {
        id: "madatha-kaja",
        name: "Madatha Kaja",
        category: "Traditional Sweets",
        image: product3,
        price: 229,
        oldPrice: 279,
        rating: 4.9,
        weight: "250g",
        discount: "-18%",
        bestSeller: true,
        description:
            "Delicate folded pastry layers, dipped in syrup for the perfect balance of crunch and sweetness.",
        variants: [
            { weight: "250g", price: 229, oldPrice: 279 },
            { weight: "500g", price: 429, oldPrice: 529 },
            { weight: "1kg", price: 749, oldPrice: 949 },
            { weight: "2kg", price: 1399, oldPrice: 1799 },
            { weight: "5kg", price: 3099, oldPrice: 4099 },
        ],
        reviews: [
            {
                id: 1,
                name: "Meera Joshi",
                date: "2026-07-14",
                rating: 5,
                title: "Absolutely delightful",
                comment: "The pastry layers are so delicate and the syrup soaking is just right. No artificial taste at all!",
                helpful: 26,
            },
            {
                id: 2,
                name: "Karthik Reddy",
                date: "2026-07-09",
                rating: 5,
                title: "Best for tea time",
                comment: "Perfect companion for my evening tea. The sweetness is balanced and not overwhelming. Ordering again!",
                helpful: 17,
            },
            {
                id: 3,
                name: "Anjali Sharma",
                date: "2026-06-30",
                rating: 4,
                title: "Great quality, slight packaging issue",
                comment: "Product is excellent but packaging could be better for delivery. Still fresh when it arrived!",
                helpful: 11,
            },
            {
                id: 4,
                name: "Rohit Singh",
                date: "2026-06-22",
                rating: 5,
                title: "Worth every rupee",
                comment: "Quality is premium. You can feel the care in preparation. Gladly paying more for authentic taste.",
                helpful: 21,
            },
        ],
    },
    {
        id: "hot-boondi",
        name: "Hot Boondi",
        category: "Traditional Snacks",
        image: product4,
        price: 179,
        oldPrice: 219,
        rating: 4.8,
        weight: "250g",
        discount: "-19%",
        bestSeller: true,
        description:
            "Golden crispy boondi tempered with curry leaves and mild Andhra spices. Irresistible tea-time companion.",
        variants: [
            { weight: "250g", price: 179, oldPrice: 219 },
            { weight: "500g", price: 329, oldPrice: 429 },
            { weight: "1kg", price: 599, oldPrice: 799 },
            { weight: "2kg", price: 1099, oldPrice: 1499 },
            { weight: "5kg", price: 2399, oldPrice: 3499 },
        ],
        reviews: [
            {
                id: 1,
                name: "Divya Nair",
                date: "2026-07-13",
                rating: 5,
                title: "Crunchy perfection",
                comment: "Super crispy! The spice blend is perfect - not too strong. My kids love it as evening snack.",
                helpful: 20,
            },
            {
                id: 2,
                name: "Arun Kumar",
                date: "2026-07-06",
                rating: 4,
                title: "Good but slightly spicy",
                comment: "Good quality and taste. A bit spicier than expected for my palate, but overall great snack.",
                helpful: 10,
            },
            {
                id: 3,
                name: "Swati Gupta",
                date: "2026-06-29",
                rating: 5,
                title: "Tea time essential",
                comment: "Perfect with chai! Stays crispy for days. The flavor is authentic and not artificial.",
                helpful: 25,
            },
            {
                id: 4,
                name: "Prasad Reddy",
                date: "2026-06-21",
                rating: 5,
                title: "Bulk order success",
                comment: "Ordered 2kg for office. Everyone appreciated the quality and taste. Ordering more!",
                helpful: 16,
            },
        ],
    },
    {
        id: "dry-fruit-laddu",
        name: "Dry Fruit Laddu",
        category: "Healthy Sweets",
        image: product1,
        price: 349,
        oldPrice: 399,
        rating: 4.9,
        weight: "250g",
        description:
            "No sugar, no maida. Dates, almonds, cashews and pistachios bound together with pure ghee.",
        variants: [
            { weight: "250g", price: 349, oldPrice: 399 },
            { weight: "500g", price: 629, oldPrice: 749 },
            { weight: "1kg", price: 1099, oldPrice: 1349 },
            { weight: "2kg", price: 2049, oldPrice: 2549 },
            { weight: "5kg", price: 4799, oldPrice: 5999 },
        ],
        reviews: [
            {
                id: 1,
                name: "Neha Kapoor",
                date: "2026-07-11",
                rating: 5,
                title: "Healthy without compromise",
                comment: "Love that there's no artificial sugar! Tastes like real dry fruits. Perfect for diabetics too.",
                helpful: 23,
            },
            {
                id: 2,
                name: "Ravi Sharma",
                date: "2026-07-02",
                rating: 5,
                title: "Great for fitness",
                comment: "As a fitness enthusiast, I appreciate the no-sugar approach. Good protein content. Tasty too!",
                helpful: 18,
            },
            {
                id: 3,
                name: "Pooja Singh",
                date: "2026-06-27",
                rating: 4,
                title: "Good but pricey",
                comment: "Premium dry fruits quality is evident. A bit expensive but worth it for health-conscious people.",
                helpful: 12,
            },
        ],
    },
    {
        id: "ragi-jaggery-ladoo",
        name: "Ragi Jaggery Ladoo",
        category: "Healthy Sweets",
        image: product3,
        price: 259,
        rating: 4.7,
        weight: "250g",
        description:
            "Wholesome finger millet ladoo sweetened with palm jaggery. High in iron and fibre.",
        variants: [
            { weight: "250g", price: 259, oldPrice: 299 },
            { weight: "500g", price: 479, oldPrice: 549 },
            { weight: "1kg", price: 849, oldPrice: 999 },
            { weight: "2kg", price: 1599, oldPrice: 1899 },
            { weight: "5kg", price: 3699, oldPrice: 4599 },
        ],
        reviews: [
            {
                id: 1,
                name: "Kavya Reddy",
                date: "2026-07-08",
                rating: 5,
                title: "Nutritious and tasty",
                comment: "Great combination of health and taste! My kids actually enjoy eating these. Iron rich too!",
                helpful: 19,
            },
            {
                id: 2,
                name: "Ajay Kumar",
                date: "2026-06-28",
                rating: 4,
                title: "Good for anemia",
                comment: "Doctor recommended this for my daughter's anemia. Natural ingredients and good taste. Happy with it!",
                helpful: 13,
            },
            {
                id: 3,
                name: "Sunita Verma",
                date: "2026-06-18",
                rating: 4,
                title: "Excellent for breakfast",
                comment: "Eat one every morning with milk. Keeps me energized throughout the day.",
                helpful: 11,
            },
        ],
    },
    {
        id: "chekkalu",
        name: "Chekkalu",
        category: "Traditional Snacks",
        image: product4,
        price: 189,
        rating: 4.7,
        weight: "200g",
        description:
            "Thin, crisp rice-flour crackers with cumin, sesame and chana dal. A crunchy Andhra classic.",
        variants: [
            { weight: "200g", price: 189, oldPrice: 219 },
            { weight: "400g", price: 349, oldPrice: 429 },
            { weight: "800g", price: 629, oldPrice: 799 },
            { weight: "1.5kg", price: 1149, oldPrice: 1399 },
            { weight: "5kg", price: 3499, oldPrice: 4499 },
        ],
        reviews: [
            {
                id: 1,
                name: "Ramakrishna",
                date: "2026-07-10",
                rating: 5,
                title: "Authentic crackers",
                comment: "These are the real deal! Thin, crispy, and packed with authentic Andhra flavors. No oil, pure health!",
                helpful: 21,
            },
            {
                id: 2,
                name: "Chitra Desai",
                date: "2026-06-30",
                rating: 4,
                title: "Good but need storage",
                comment: "Taste is excellent. Stays fresh in airtight container. Perfect office snack.",
                helpful: 15,
            },
            {
                id: 3,
                name: "Mohan Lal",
                date: "2026-06-25",
                rating: 5,
                title: "Festival favorite",
                comment: "Bought during Diwali. Everyone appreciated the authentic taste. Much better than brands.",
                helpful: 17,
            },
        ],
    },
    {
        id: "murukku",
        name: "Butter Murukku",
        category: "Traditional Snacks",
        image: product2,
        price: 199,
        oldPrice: 229,
        rating: 4.8,
        weight: "250g",
        discount: "-13%",
        description:
            "Crispy, buttery murukku spirals — the perfect crunchy snack for chai or coffee time.",
        variants: [
            { weight: "250g", price: 199, oldPrice: 229 },
            { weight: "500g", price: 379, oldPrice: 449 },
            { weight: "1kg", price: 679, oldPrice: 849 },
            { weight: "2kg", price: 1249, oldPrice: 1599 },
            { weight: "5kg", price: 2899, oldPrice: 3799 },
        ],
        reviews: [
            {
                id: 1,
                name: "Harini Reddy",
                date: "2026-07-12",
                rating: 5,
                title: "Butter magic",
                comment: "The butter flavor is so distinct and tasty. Not greasy at all. Perfect snack to munch!",
                helpful: 24,
            },
            {
                id: 2,
                name: "Sanjay Verma",
                date: "2026-07-04",
                rating: 4,
                title: "Good quality, stays fresh",
                comment: "Been eating these for a month. Still crispy! Great shelf life and taste.",
                helpful: 14,
            },
            {
                id: 3,
                name: "Meenakshi Iyer",
                date: "2026-06-26",
                rating: 5,
                title: "Office favorite",
                comment: "Everyone at office asks for these! Brought 2kg last time and finished in days.",
                helpful: 20,
            },
            {
                id: 4,
                name: "Vikramjeet Singh",
                date: "2026-06-20",
                rating: 5,
                title: "Best murukku ever",
                comment: "Tried many brands, this is the best. Spiral is perfect, butter flavor is authentic, crispy till the end.",
                helpful: 27,
            },
        ],
    },
];

const KEY = "mhf-products";

export function loadProducts() {
    if (typeof window === "undefined") {
        return defaultProducts;
    }

    try {
        const raw = localStorage.getItem(KEY);

        if (!raw) {
            return defaultProducts;
        }

        return JSON.parse(raw);
    } catch {
        return defaultProducts;
    }
}

export function saveProducts(products) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(KEY, JSON.stringify(products));

    window.dispatchEvent(new Event("mhf-products-changed"));
}

// NOTE: this is a localStorage-only product list used purely for the demo
// Admin CRUD screen. The real storefront (Shop, Product, ProductCard,
// BestSellers) reads products from the Express + MongoDB backend via
// src/api/productApi.js — editing here does NOT change what shoppers see.
// Wiring the Admin panel to real backend product CRUD is a separate,
// larger piece of work (new model/routes/controller) that wasn't in scope
// for this cart/auth refactor.
export function useProducts() {
    const [products, setProducts] = useState(loadProducts());

    useEffect(() => {
        const handler = () => {
            setProducts(loadProducts());
        };

        window.addEventListener("mhf-products-changed", handler);
        window.addEventListener("storage", handler);

        return () => {
            window.removeEventListener("mhf-products-changed", handler);
            window.removeEventListener("storage", handler);
        };
    }, []);

    return products;
}