import "./config/env.js"; 
import express from "express";

import cors from "cors";
import compression from "compression";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import wardrobeRoutes from "./routes/wardrobeRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import recommendationRoutes from "./routes/recommendationRoutes.js"
import historyRoutes from "./routes/historyRoutes.js"

const app = express();

// middleware
app.use(compression());
app.use(express.json());
app.use(cors());

// DB connect
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wardrobe", wardrobeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/history", historyRoutes);

// server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});