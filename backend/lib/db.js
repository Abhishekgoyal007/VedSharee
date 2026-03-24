import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
	// Prevent multiple connections in serverless environment
	if (isConnected) {
		return;
	}

	if (mongoose.connection.readyState >= 1) {
		isConnected = true;
		return;
	}

	try {
		const conn = await mongoose.connect(process.env.DB_URI, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});
		isConnected = true;
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		console.error("Error connecting to MongoDB:", error.message);
		throw error;
	}
};
