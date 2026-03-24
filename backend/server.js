import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import feedbackRoutes from './routes/feedback.route.js';
import userRoutes from "./routes/user.route.js";
import extractorRoutes from "./routes/extractor.route.js";
import interviewRoutes from "./routes/interview.route.js";
import documentRoutes from "./routes/document.route.js";
import focusRoutes from "./routes/focus.route.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

// CORS configuration
const allowedOrigins = [
	"http://localhost:5173",
	"http://localhost:5174",
	"http://localhost:3000",
	"http://127.0.0.1:5173",
	"http://127.0.0.1:5174",
	"http://127.0.0.1:3000",
	process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
	origin: function (origin, callback) {
		// Allow requests with no origin (mobile apps, curl, same-origin)
		if (!origin) return callback(null, true);

		// Check against allowed list
		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		}

		// Allow all Vercel preview deployments
		if (/\.vercel\.app$/.test(origin)) {
			return callback(null, true);
		}

		// Reject unknown origins in production
		callback(new Error("Not allowed by CORS"));
	},
	credentials: true,
}));

// Trust proxy for Vercel (required for rate limiting & secure cookies behind reverse proxy)
app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/extractor', extractorRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/focus', focusRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "frontend", "dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Connect to DB before starting server
connectDB().then(() => {
	app.listen(PORT, () => {
		console.log("Server is running on http://localhost:" + PORT);
	});
});

// Export for Vercel serverless
export default app;
