import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const id = hash.replace("#", "");

            // The target element may not exist yet on the first paint
            // (e.g. navigating from another page), so retry briefly.
            let attempts = 0;
            const tryScroll = () => {
                const el = document.getElementById(id);

                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                } else if (attempts < 20) {
                    attempts += 1;
                    requestAnimationFrame(tryScroll);
                }
            };

            requestAnimationFrame(tryScroll);
            return;
        }

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }, [pathname, hash]);

    return null;
}

export default ScrollToTop;