import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  position: { type: Number, required: true },
  type: { type: String, enum: ["daily", "weekend", "goal"], default: "daily", required: true },
  progress: [{ type: String }],
});

export default mongoose.model("Task", TaskSchema);
