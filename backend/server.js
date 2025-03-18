import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// API Routes
app.use('/api/tasks', taskRoutes);

// Define `__dirname` manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// // ✅ Serve static files from React's build folder
// app.use(express.static(path.join(__dirname, '../frontend/dist')));

// // ✅ Catch-all handler to serve React's index.html for any route
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));

