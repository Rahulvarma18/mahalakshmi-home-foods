import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: function () {
                // Google OAuth accounts don't have a password.
                return !this.googleId;
            },
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        profilePicture: {
            type: String,
        },

    },
    {
        timestamps: true
    }
);

export default mongoose.model("User", userSchema);