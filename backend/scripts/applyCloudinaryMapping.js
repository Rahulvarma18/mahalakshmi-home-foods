// Applies an existing cloudinary-migration-map.json (produced by
// migrateImagesToCloudinary.js) to MongoDB — no images are re-uploaded,
// this just writes the URLs that are already on Cloudinary into the
// matching Product documents.
//
// Use this instead of re-running migrateImagesToCloudinary.js after
// fixing product IDs in the DB, so you don't upload duplicate images.
//
// Run from the backend/ folder:
//   node scripts/applyCloudinaryMapping.js

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import Product from "../src/models/Product.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAP_PATH = path.join(__dirname, "cloudinary-migration-map.json");

async function apply() {

    if (!fs.existsSync(MAP_PATH)) {

        console.error(
            `❌ Couldn't find ${MAP_PATH} — run migrateImagesToCloudinary.js first.`
        );
        process.exit(1);

    }

    const mapping = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    for (const [productId, { image, gallery }] of Object.entries(mapping)) {

        const updated = await Product.findOneAndUpdate(
            { id: productId },
            { image, gallery },
            { returnDocument: "after" }
        );

        if (updated) {
            console.log(`✅ "${productId}" updated`);
        } else {
            console.log(
                `⚠️  Still no product with id "${productId}" in MongoDB — check spelling`
            );
        }

    }

    console.log("\n🎉 Done.");

    await mongoose.disconnect();

    process.exit(0);

}

apply().catch((err) => {

    console.error("❌ Failed:", err);
    process.exit(1);

});