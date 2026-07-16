import { FaWhatsapp } from "react-icons/fa";

// Business WhatsApp number from the requirements doc (+91 7780367903).
// Update this if the number ever changes.
const WHATSAPP_NUMBER = "917780367903";
const DEFAULT_MESSAGE =
    "Hi Mahalakshmi Home Foods! I'd like to know more about your products.";

function WhatsAppButton() {
    const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        DEFAULT_MESSAGE
    )}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-110"
        >
            <FaWhatsapp className="text-3xl" />
        </a>
    );
}

export default WhatsAppButton;