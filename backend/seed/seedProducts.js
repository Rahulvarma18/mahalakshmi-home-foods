import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import Product from "../src/models/Product.js";
import { products } from "../data/products.js";

dotenv.config();

const seedProducts = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");

        await Product.deleteMany();

        console.log("🗑 Old products removed");

        await Product.insertMany(products);

        console.log(`🎉 ${products.length} products inserted`);

        process.exit();

    } catch (error) {

        console.log(error);

        process.exit(1);

    }
};

seedProducts(); 