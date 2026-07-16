import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error("❌ MONGODB_URI not found in .env file");
        }

        const connection = await mongoose.connect(mongoURI);

        console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
        return connection;

    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Exit process if connection fails
    }
};

export default connectDB;