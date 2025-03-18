import Task from "../models/Task.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    const taskCount = await Task.countDocuments(); // Get the total number of tasks
    const newTask = await Task.create({
      title: req.body.title,
      description: req.body.description || "",
      completed: false,
      position: taskCount, // Assign position based on current count
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
    const { title, description, completed } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, completed },
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
    const { tasks } = req.body;
    if (!tasks || !Array.isArray(tasks)) return res.status(400).json({ error: "Invalid task order data" });

    await Promise.all(tasks.map((task, index) => Task.findByIdAndUpdate(task._id, { position: index })));

    res.json({ message: "Task order updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating task order" });
  }
};

