import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

// Files land straight in Cloudinary — multer never touches the local disk,
// so this works the same on serverless/ephemeral hosts as it does locally.
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "mahalakshmi-home-foods/products",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;

// Reuse the same Cloudinary storage for the "up to 6 gallery images at
// once" endpoint — same folder, same transformation, same limits.
export const uploadGallery = upload.array("images", 6);