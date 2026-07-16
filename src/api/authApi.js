import API from "./api";

export const registerUser = async (userData) => {

    const res = await API.post("/auth/register", userData);

    return res.data;

};

export const loginUser = async (userData) => {

    const res = await API.post(
        "/auth/login",
        userData
    );

    return res.data;

};

export const getProfile = async () => {

    const user = JSON.parse(
        localStorage.getItem("mhf-user")
    );

    const res = await API.get(
        "/auth/profile",
        {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        }
    );

    return res.data;

};

export const googleLogin = async (credential) => {

    const res = await API.post(
        "/auth/google",
        { credential }
    );

    return res.data;

};

export const logoutUser = async () => {

    const res = await API.post("/auth/logout");

    return res.data;

};