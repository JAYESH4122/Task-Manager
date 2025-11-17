import Task from "../models/Task.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    const { type = "daily" } = req.body;
    const taskCount = await Task.countDocuments({ type });
    const newTask = await Task.create({
      title: req.body.title,
      description: req.body.description || "",
      completed: false,
      position: taskCount,
      type: type,
      progress: type === "goal" ? [] : undefined,
    });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all tasks (Sorted by position)
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ position: 1 }); // Sort tasks by position
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
};

// Update task (title, description, completed status)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.completed !== undefined) updateData.completed = req.body.completed;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedTask) return res.status(404).json({ error: "Task not found" });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Error updating task" });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    
    if (!task) return res.status(404).json({ error: "Task not found" });

    await Task.findByIdAndDelete(id);
    
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting task" });
  }
};

// Toggle task completion status
export const toggleComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { completed },
      { new: true }
    );

    if (!updatedTask) return res.status(404).json({ error: "Task not found" });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Error toggling task completion" });
  }
};

// Reorder tasks (Drag & Drop Persistence)
export const reorderTasks = async (req, res) => {
  try {
    const { tasks, type } = req.body;
    if (!tasks || !Array.isArray(tasks)) return res.status(400).json({ error: "Invalid task order data" });

    // Update positions for tasks of the specified type
    const updatePromises = tasks.map((task, index) => {
      const taskId = task._id || task.id;
      return Task.findByIdAndUpdate(taskId, { position: index }, { new: true });
    });

    await Promise.all(updatePromises);

    res.json({ message: "Task order updated successfully" });
  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({ error: "Error updating task order" });
  }
};

// Reset weekend tasks (set all weekend tasks to incomplete)
export const resetWeekendTasks = async (req, res) => {
  try {
    const result = await Task.updateMany(
      { type: "weekend" },
      { completed: false }
    );
    res.json({ message: "Weekend tasks reset successfully", count: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: "Error resetting weekend tasks" });
  }
};

// Add progress note to goal task
export const addGoalProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progressNote } = req.body;

    if (!progressNote || !progressNote.trim()) {
      return res.status(400).json({ error: "Progress note is required" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.type !== "goal") return res.status(400).json({ error: "Task is not a goal task" });

    task.progress.push(progressNote.trim());
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Error adding progress note" });
  }
};

// Update goal progress (edit or delete progress notes)
export const updateGoalProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body; // Array of progress notes

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.type !== "goal") return res.status(400).json({ error: "Task is not a goal task" });

    task.progress = progress || [];
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Error updating progress notes" });
  }
};

