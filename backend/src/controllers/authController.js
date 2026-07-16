import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// ======================
// Register User
// ======================

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {

            return res.status(400).json({
                message: "User already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// ======================
// Login User
// ======================

export const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

// ======================
// Get Logged In User
// ======================

export const getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id).select("-password");

        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// ======================
// Logout
// ======================

export const logoutUser = async (req, res) => {

    res.json({
        message: "Logged out successfully",
    });

};
export const googleAuth = async (req, res) => {
    try {
        const { name, email, googleId, profilePicture } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user exists
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            // Update Google ID if not already set
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // Create new user
            user = await User.create({
                name: name || email.split('@')[0],
                email: normalizedEmail,
                googleId,
                profilePicture: profilePicture || null,
                password: null, // No password for OAuth users
            });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};