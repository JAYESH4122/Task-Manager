import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  position: { type: Number, required: true }, // Ensure position exists
});

export default mongoose.model("Task", TaskSchema);
