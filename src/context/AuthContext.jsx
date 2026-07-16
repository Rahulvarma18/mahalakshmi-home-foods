import { createContext, useContext, useEffect, useState } from "react";
import {
    loginUser,
    registerUser,
    logoutUser,
    googleLogin as googleLoginApi,
} from "../api/authApi";
import { mergeGuestCart } from "../api/cartApi";
const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const savedUser = localStorage.getItem("mhf-user");

        if (savedUser) {

            setUser(JSON.parse(savedUser));

        }

        setLoading(false);

    }, []);

    const login = async (email, password) => {

        try {

            const data = await loginUser({
                email,
                password,
            });

            localStorage.setItem(
                "mhf-user",
                JSON.stringify(data)
            );

            setUser(data);
            const guestCart = JSON.parse(
                localStorage.getItem("guest-cart")
            );

            if (guestCart?.length) {

                await mergeGuestCart(guestCart);

                localStorage.removeItem("guest-cart");

            }

            return {
                ok: true,
            };

        } catch (error) {

            return {
                ok: false,
                error:
                    error.response?.data?.message ||
                    "Login Failed",
            };

        }

    };

    const signup = async (name, email, password) => {

        try {

            const data = await registerUser({
                name,
                email,
                password,
            });

            localStorage.setItem(
                "mhf-user",
                JSON.stringify(data)
            );

            setUser(data);

            return {
                ok: true,
            };

        } catch (error) {

            return {
                ok: false,
                error:
                    error.response?.data?.message ||
                    "Signup Failed",
            };

        }

    };

    const googleLogin = async (credential) => {

        try {

            const data = await googleLoginApi(credential);

            localStorage.setItem(
                "mhf-user",
                JSON.stringify(data)
            );

            setUser(data);

            const guestCart = JSON.parse(
                localStorage.getItem("guest-cart")
            );

            if (guestCart?.length) {

                await mergeGuestCart(guestCart);

                localStorage.removeItem("guest-cart");

            }

            return {
                ok: true,
            };

        } catch (error) {

            return {
                ok: false,
                error:
                    error.response?.data?.message ||
                    "Google Sign-In Failed",
            };

        }

    };

    const logout = async () => {

        try {

            await logoutUser();

        } catch { }

        localStorage.removeItem("mhf-user");

        setUser(null);

    };

    return (

        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                googleLogin,
                logout,
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}

export function useAuth() {

    return useContext(AuthContext);

}