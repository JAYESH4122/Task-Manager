import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: "https://task-manager-rlsi.vercel.app",  // 🔥 Allow a
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
