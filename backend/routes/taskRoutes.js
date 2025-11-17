import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  reorderTasks,
  toggleComplete,
  resetWeekendTasks,
  addGoalProgress,
  updateGoalProgress,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", createTask);
router.get("/", getTasks);
router.put("/:id", updateTask);
router.put("/complete/:id", toggleComplete);
router.delete("/:id", deleteTask);
router.put("/reorder", reorderTasks);
router.put("/reset-weekend", resetWeekendTasks);
router.post("/goal/:id/progress", addGoalProgress);
router.put("/goal/:id/progress", updateGoalProgress);

export default router;
