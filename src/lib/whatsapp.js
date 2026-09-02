// Your WhatsApp business number, in international format with no
// "+", spaces, or leading zeros (matches the wa.me link format).
export const WHATSAPP_NUMBER = "917780367903";

// Builds a readable order summary and points an already-open browser tab
// at the wa.me link for it. The tab must be opened synchronously on the
// click itself (see Checkout.jsx) — opening a new tab *after* an await
// (like the order-saving call) gets silently blocked by most browsers'
// popup blockers since it's no longer tied to the original user gesture.
export function openWhatsAppOrder(targetWindow, { rows, address, subtotal, shipping, total, payment }) {

    const lines = [];

    lines.push("Hi Maharuchulu! I'd like to place an order:");
    lines.push("");

    rows.forEach((row, i) => {
        lines.push(
            `${i + 1}. ${row.product.name} (${row.variant.weight}) x${row.qty} - ₹${row.variant.price * row.qty}`
        );
    });

    lines.push("");
    lines.push(`Subtotal: ₹${subtotal}`);
    lines.push(`Shipping: ${shipping === 0 ? "Free" : `₹${shipping}`}`);
    lines.push(`Total: ₹${total}`);
    lines.push("");
    lines.push("Delivery Address:");
    lines.push(`${address.name}, ${address.phone}`);
    lines.push(`${address.line1}, ${address.city} - ${address.pincode}`);
    lines.push("");
    lines.push(`Payment: ${payment === "COD" ? "Cash on Delivery" : payment}`);

    const text = encodeURIComponent(lines.join("\n"));

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    if (targetWindow && !targetWindow.closed) {
        targetWindow.location.href = url;
    } else {
        // Fallback (e.g. targetWindow was blocked anyway) — still try.
        window.open(url, "_blank");
    }

}