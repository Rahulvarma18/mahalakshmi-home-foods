import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatically attach the JWT (if we have one) to every request.
// This means individual api modules never have to read localStorage
// or build headers themselves.
API.interceptors.request.use((config) => {
    try {
        const saved = localStorage.getItem("mhf-user");
        const user = saved ? JSON.parse(saved) : null;

        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
    } catch {
        // Corrupt localStorage value — just send the request without auth.
    }

    return config;
});

export default API;