import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {

    try {

        let token;

        const authHeader = req.headers.authorization;

        if (
            authHeader &&
            authHeader.startsWith("Bearer ")
        ) {

            token = authHeader.split(" ")[1];

        }

        if (!token) {

            return res.status(401).json({
                message: "Not authorized. No token.",
            });

        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = await User.findById(decoded.id).select("-password");

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Token is invalid",
        });

    }

};

export const adminOnly = (req, res, next) => {

    if (req.user && req.user.role === "admin") {
        return next();
    }

    return res.status(403).json({
        message: "Admin access only.",
    });

};