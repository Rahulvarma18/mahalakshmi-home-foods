import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useAuth } from "./AuthContext";
import {
    getCart as apiGetCart,
    addToCart as apiAddToCart,
    updateCart as apiUpdateCart,
    removeCartItem as apiRemoveCartItem,
    clearCart as apiClearCart,
    mergeGuestCart as apiMergeGuestCart,
} from "../api/cartApi";

const CartContext = createContext(null);

// Shared with AuthContext's expectations: this is the ONE key used to
// persist the guest cart, so login-time merging always finds it.
const GUEST_CART_KEY = "guest-cart";

// Backend cart items look like { product: {...populated product}, weight, qty }.
// Guest cart items look like { productId, weight, qty }.
// Everywhere else in the app (Cart page, Checkout, ProductCard, Product page)
// only cares about { productId, weight, qty } — so we normalize to that shape
// as soon as the backend responds, and keep it consistent for guests too.
function normalizeBackendCart(cart) {
    if (!cart?.items) return [];

    const deduped = new Map();

    cart.items
        .filter((item) => item.product) // guard against a deleted/missing product
        .forEach((item) => {
            const key = `${item.product._id}-${item.weight}`;

            if (deduped.has(key)) {
                deduped.get(key).qty += item.qty;
            } else {
                deduped.set(key, {
                    productId: item.product._id,
                    weight: item.weight,
                    qty: item.qty,
                });
            }
        });

    return Array.from(deduped.values());
}

function readGuestCart() {
    try {
        const raw = localStorage.getItem(GUEST_CART_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error("Failed to read guest cart:", error);
        return [];
    }
}

function writeGuestCart(items) {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
    const { user, loading: authLoading } = useAuth();

    const [items, setItems] = useState(() => readGuestCart());
    const [loading, setLoading] = useState(false);

    // Guards against merging the guest cart twice for the same login session
    // (e.g. React StrictMode's double-invoked effects in development).
    const hasMergedRef = useRef(false);

    // Whenever auth state settles or changes, load the right cart:
    // - logged in + guest items waiting  -> merge them into the backend cart
    // - logged in, nothing to merge      -> just fetch the backend cart
    // - logged out                       -> fall back to the guest cart
    useEffect(() => {
        if (authLoading) return;

        let cancelled = false;

        async function loadForUser() {
            setLoading(true);

            try {
                if (user) {
                    const guestItems = readGuestCart();

                    if (guestItems.length > 0 && !hasMergedRef.current) {
                        hasMergedRef.current = true;

                        const merged = await apiMergeGuestCart(guestItems);
                        localStorage.removeItem(GUEST_CART_KEY);

                        if (!cancelled) setItems(normalizeBackendCart(merged));
                    } else {
                        const cart = await apiGetCart();

                        if (!cancelled) setItems(normalizeBackendCart(cart));
                    }
                } else {
                    hasMergedRef.current = false;
                    setItems(readGuestCart());
                }
            } catch (error) {
                console.error("Failed to load cart:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadForUser();

        return () => {
            cancelled = true;
        };
    }, [user, authLoading]);

    const add = useCallback(
        async (productId, qty = 1, weight = null) => {
            if (user) {
                const cart = await apiAddToCart(productId, weight, qty);
                setItems(normalizeBackendCart(cart));
                return;
            }

            setItems((prev) => {
                const existing = prev.find(
                    (item) => item.productId === productId && item.weight === weight
                );

                const next = existing
                    ? prev.map((item) =>
                        item.productId === productId && item.weight === weight
                            ? { ...item, qty: item.qty + qty }
                            : item
                    )
                    : [...prev, { productId, qty, weight }];

                writeGuestCart(next);

                return next;
            });
        },
        [user]
    );

    const remove = useCallback(
        async (productId, weight = null) => {
            if (user) {
                const cart = await apiRemoveCartItem(productId, weight);
                setItems(normalizeBackendCart(cart));
                return;
            }

            setItems((prev) => {
                const next = prev.filter(
                    (item) => !(item.productId === productId && item.weight === weight)
                );

                writeGuestCart(next);

                return next;
            });
        },
        [user]
    );

    const setQty = useCallback(
        async (productId, weight, qty) => {
            if (qty < 1) return;

            if (user) {
                const cart = await apiUpdateCart(productId, weight, qty);
                setItems(normalizeBackendCart(cart));
                return;
            }

            setItems((prev) => {
                const next = prev.map((item) =>
                    item.productId === productId && item.weight === weight
                        ? { ...item, qty }
                        : item
                );

                writeGuestCart(next);

                return next;
            });
        },
        [user]
    );

    const clear = useCallback(async () => {
        if (user) {
            await apiClearCart();
        } else {
            writeGuestCart([]);
        }

        setItems([]);
    }, [user]);

    const count = useMemo(
        () => items.reduce((sum, item) => sum + item.qty, 0),
        [items]
    );

    const value = useMemo(
        () => ({ items, add, remove, setQty, clear, count, loading }),
        [items, add, remove, setQty, clear, count, loading]
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return context;
}