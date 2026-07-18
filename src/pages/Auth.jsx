import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

import { useAuth } from "../context/AuthContext";
function Auth() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const redirect = searchParams.get("redirect") || "/";

    const { login, signup, googleLogin } = useAuth();

    const [mode, setMode] = useState("login");

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    };

    const submit = async (e) => {

        e.preventDefault();

        setLoading(true);

        const result =
            mode === "signup"
                ? await signup(form.name, form.email, form.password)
                : await login(form.email, form.password);

        if (result.ok) {

            toast.success(
                mode === "signup"
                    ? "Account Created Successfully!"
                    : "Welcome Back!"
            );

            navigate(redirect);

        } else {

            toast.error(result.error);

        }

        setLoading(false);

    };

    const handleGoogleSuccess = async (credentialResponse) => {

        const result = await googleLogin(credentialResponse.credential);

        if (result.ok) {

            toast.success("Signed in with Google!");

            navigate(redirect);

        } else {

            toast.error(result.error);

        }

    };

    return (

        <div className="min-h-[70vh] grid place-items-center px-5 py-16">

            <div className="w-full max-w-md rounded-lg border border-brand-border bg-white p-8 md:p-10">

                <p className="eyebrow mb-3">

                    {mode === "login"

                        ? "Welcome Back"

                        : "Join Us"}

                </p>

                <h1 className="mb-6 font-serif text-4xl text-brand-dark">

                    {mode === "login"

                        ? "Sign In"

                        : "Create Account"}

                </h1>

                <form

                    onSubmit={submit}

                    className="space-y-4"

                >
                    {mode === "signup" && (

                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-brand-border bg-cream px-4 py-3 focus:border-brand-maroon focus:outline-none"
                        />

                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-brand-border bg-cream px-4 py-3 focus:border-brand-maroon focus:outline-none"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-brand-border bg-cream px-4 py-3 focus:border-brand-maroon focus:outline-none"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full justify-center disabled:opacity-60"
                    >
                        {loading
                            ? "Please Wait..."
                            : mode === "login"
                                ? "Sign In"
                                : "Create Account"}
                    </button>

                </form>

                <button
                    onClick={() =>
                        setMode(
                            mode === "login"
                                ? "signup"
                                : "login"
                        )
                    }
                    className="mt-6 w-full text-sm text-brand-muted hover:text-brand-maroon"
                >
                    {mode === "login"
                        ? "New here? Create an account"
                        : "Already have an account? Sign in"}
                </button>

                <div className="mt-6 flex justify-center">

                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error("Google Sign-In Failed")}
                    />

                </div>


            </div>

        </div>

    );

}

export default Auth;