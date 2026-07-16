// One-off migration: uploads every image under public/products/<id>/ to
// Cloudinary, then updates the matching Product document in MongoDB
// (image + gallery fields) to point at the new Cloudinary URLs.
//
// Run from the backend/ folder:
//   node scripts/migrateImagesToCloudinary.js
//
// Requires backend/.env to already have MONGO_URI and the CLOUDINARY_*
// vars set (same ones config/cloudinary.js uses).

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dns from "dns";

// Same fix seed/seedProducts.js uses: some networks can't resolve the
// mongodb+srv:// SRV record against the default DNS resolver, so point
// Node at Google's DNS before connecting.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import cloudinary from "../src/config/cloudinary.js";
import Product from "../src/models/Product.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// public/products lives at the project root, one level up from backend/
const PRODUCTS_DIR = path.join(__dirname, "../../public/products");

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

async function uploadFile(filePath, folder) {

    const result = await cloudinary.uploader.upload(filePath, {
        folder,
        transformation: [{ width: 1200, height: 1200, crop: "limit" }],
    });

    return result.secure_url;

}

async function migrate() {

    if (!fs.existsSync(PRODUCTS_DIR)) {

        console.error(`❌ Couldn't find ${PRODUCTS_DIR}`);
        process.exit(1);

    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    const productDirs = fs
        .readdirSync(PRODUCTS_DIR)
        .filter((f) => fs.statSync(path.join(PRODUCTS_DIR, f)).isDirectory());

    const mapping = {};

    for (const productId of productDirs) {

        const dir = path.join(PRODUCTS_DIR, productId);

        const files = fs
            .readdirSync(dir)
            .filter((f) => IMAGE_EXTENSIONS.test(f));

        if (files.length === 0) continue;

        console.log(`\n📦 ${productId} (${files.length} images)`);

        const cloudinaryFolder = `mahalakshmi-home-foods/products/${productId}`;

        let mainUrl = null;
        const galleryUrls = [];

        for (const file of files) {

            const filePath = path.join(dir, file);

            process.stdout.write(`   uploading ${file}... `);

            const url = await uploadFile(filePath, cloudinaryFolder);

            console.log("done");

            // main.jpg / main.png etc. becomes the primary product image,
            // everything else goes into the gallery array.
            if (path.parse(file).name.toLowerCase() === "main") {
                mainUrl = url;
            } else {
                galleryUrls.push(url);
            }

        }

        // No file literally named "main.*"? Fall back to the first upload.
        if (!mainUrl && galleryUrls.length) {
            mainUrl = galleryUrls.shift();
        }

        mapping[productId] = { image: mainUrl, gallery: galleryUrls };

        const updated = await Product.findOneAndUpdate(
            { id: productId },
            { image: mainUrl, gallery: galleryUrls },
            { returnDocument: "after" }
        );

        if (updated) {
            console.log(`   ✅ MongoDB product "${productId}" updated`);
        } else {
            console.log(
                `   ⚠️  No product with id "${productId}" found in MongoDB — DB not updated, but the images are on Cloudinary (see mapping file)`
            );
        }

    }

    const mapPath = path.join(__dirname, "cloudinary-migration-map.json");

    fs.writeFileSync(mapPath, JSON.stringify(mapping, null, 2));

    console.log(`\n🎉 Done. URL mapping written to ${mapPath}`);
    console.log(
        "   Use it to update backend/data/products.js too, so future `npm run seed` runs use Cloudinary URLs instead of local paths."
    );

    await mongoose.disconnect();

    process.exit(0);

}

migrate().catch((err) => {

    console.error("❌ Migration failed:", err);
    process.exit(1);

});