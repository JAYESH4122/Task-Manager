const API_URL = import.meta.env.VITE_API_URL;
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaMoon, FaSun, FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../styles/TaskList.css";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/`);
      console.log("Fetched Data:", response.data); // Debugging log
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]); // Ensure tasks is always an array
    }
  };
  

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, {
        completed: !completed,
      });
      setTasks(tasks.map((task) => (task._id === id ? response.data : task)));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const startEditTask = (task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const saveEditTask = async () => {
    if (!editTitle.trim()) return;
    try {
      const response = await axios.put(`${API_BASE_URL}/${editTask._id}`, {
        title: editTitle,
        description: editDescription,
      });
      setTasks(tasks.map((task) => (task._id === editTask._id ? response.data : task)));
      setEditTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const updatedTasks = [...tasks];
    const [reorderedItem] = updatedTasks.splice(result.source.index, 1);
    updatedTasks.splice(result.destination.index, 0, reorderedItem);

    setTasks(updatedTasks);

    try {
      await axios.put(`${API_BASE_URL}/reorder`, { tasks: updatedTasks });
    } catch (error) {
      console.error("Error updating task order:", error);
    }
  };

  return (
    <div className="task-container">
      <div className="header">
        <h2>Task Manager</h2>
        <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <ul className="task-list" {...provided.droppableProps} ref={provided.innerRef}>
              {tasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided) => (
                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <div className="task-content">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleComplete(task._id, task.completed)}
                        />
                        <div className="task-info">
                          <strong>{task.title}</strong>
                          <p>{task.description}</p>
                        </div>
                      </div>
                      <div className="task-actions">
                        <button className="edit-btn" onClick={() => startEditTask(task)}>
                          <FaEdit />
                        </button>
                        <button className="delete-btn" onClick={() => deleteTask(task._id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <button className="add-task-btn" onClick={() => navigate("/add-task")}>
      <FaPlus />
    </button>

      {editTask && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Task</h3>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            <button className="save-btn" onClick={saveEditTask}>Save</button>
            <button className="cancel-btn" onClick={() => setEditTask(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
