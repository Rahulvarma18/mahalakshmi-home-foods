// Cloudinary lets you resize/compress an image just by editing its URL —
// nothing needs to be re-uploaded. This inserts:
//   f_auto  → serves WebP/AVIF to browsers that support it (much smaller
//             than JPEG/PNG), falls back automatically where it doesn't
//   q_auto  → Cloudinary picks the lowest quality that still looks good
//   w_<N>   → resizes down to roughly the size it'll actually be shown at,
//             so a 300px product card never downloads a 1200px original
//
// Non-Cloudinary URLs (e.g. anything still pointing at a local /products/
// path from before the migration) are returned untouched.
export function cldUrl(url, { width } = {}) {

    if (!url || !url.includes("/upload/")) return url;

    const params = ["f_auto", "q_auto"];

    if (width) params.push(`w_${width}`, "c_limit");

    return url.replace("/upload/", `/upload/${params.join(",")}/`);

}