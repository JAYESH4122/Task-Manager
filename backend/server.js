import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// ✅ Allow CORS from Vercel Frontend
app.use(cors({
    origin: "https://task-manager-gamma-blue.vercel.app",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
  }));
  

app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ API Routes
app.use("/", taskRoutes);

// ✅ Root Route to Fix "Cannot GET /"

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
