import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  reorderTasks,
  toggleComplete, // Added toggleComplete route
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", createTask);
router.get("/", getTasks);
router.put("/:id", updateTask);
router.put("/complete/:id", toggleComplete); // Route for toggling task completion
router.delete("/:id", deleteTask);
router.put("/reorder", reorderTasks);
 // New route for reordering tasks

export default router;
