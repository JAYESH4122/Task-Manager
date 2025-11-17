const API_URL = import.meta.env.VITE_API_URL;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Paper, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { motion } from "framer-motion";
import "../styles/AddTask.css";

const AddTask = () => {
  const [task, setTask] = useState({ title: "", description: "", type: "daily" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/`, task);
    navigate("/");
  };

  return (
    <div className="add-task-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} className="add-task-form">
          <Typography variant="h4" className="form-title">
            Add
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Task Title */}
            <TextField
              label="Task Title"
              variant="outlined"
              name="title"
              value={task.title}
              onChange={handleChange}
              fullWidth
              required
              className="task-input"
            />

            {/* Task Description */}
            <TextField
              label="Task Description"
              variant="outlined"
              name="description"
              value={task.description}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={3}
              className="task-input"
            />

            {/* Task Type */}
            <FormControl fullWidth className="task-input">
              <InputLabel>Task Type</InputLabel>
              <Select
                name="type"
                value={task.type}
                onChange={handleChange}
                label="Task Type"
                required
              >
                <MenuItem value="daily">Daily Task</MenuItem>
                <MenuItem value="weekend">Weekend Task</MenuItem>
                <MenuItem value="goal">Goal Task</MenuItem>
              </Select>
            </FormControl>

            {/* Submit Button */}
            <Button type="submit" variant="contained" className="submit-btn">
              Add Task
            </Button>
          </form>
        </Paper>
      </motion.div>
    </div>
  );
};

export default AddTask;
