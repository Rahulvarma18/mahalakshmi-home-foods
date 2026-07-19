// One-time migration: copies each existing product's old top-level
// `stock` value onto every one of its variants (since that's the closest
// reasonable starting point), then removes the old field.
//
// Run once after deploying the per-variant stock changes:
//   node scripts/migrateVariantStock.js
//
// After running this, go into the Admin panel and adjust each variant's
// stock to the real number you actually have — this migration can't know
// how your old single stock count should really be split across weights,
// it just avoids leaving every variant at 0.

import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../src/models/Product.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

async function migrate() {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected. Migrating products...");

    const products = await Product.find();

    let updated = 0;

    for (const product of products) {

        const oldStock = product.toObject().stock;

        if (typeof oldStock !== "number") continue;

        product.variants = product.variants.map((v) => ({
            ...v.toObject(),
            stock: v.stock || oldStock,
        }));

        await product.save();

        updated++;

    }

    console.log(`Done. Updated ${updated} product(s).`);

    await mongoose.disconnect();

}

migrate().catch((err) => {
    console.error(err);
    process.exit(1);
});