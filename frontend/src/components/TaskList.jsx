const API_URL = import.meta.env.VITE_API_URL;
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaMoon, FaSun, FaTrash, FaEdit, FaPlus, FaBullseye } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../styles/TaskList.css";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [goalProgressModal, setGoalProgressModal] = useState(null);
  const [newProgressNote, setNewProgressNote] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAndResetWeekendTasks();
    fetchTasks();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Check if it's Friday and reset weekend tasks
  const checkAndResetWeekendTasks = async () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday
    
    if (dayOfWeek === 5) { // Friday
      const lastResetDate = localStorage.getItem("lastWeekendReset");
      const todayStr = today.toDateString();
      
      if (lastResetDate !== todayStr) {
        try {
          await axios.put(`${API_URL}/reset-weekend`);
          localStorage.setItem("lastWeekendReset", todayStr);
        } catch (error) {
          console.error("Error resetting weekend tasks:", error);
        }
      }
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/`);
      console.log("Fetched Data:", response.data);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, {
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
      const response = await axios.put(`${API_URL}/${editTask._id}`, {
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

    const { source, destination, draggableId } = result;
    const sourceType = source.droppableId;
    const destType = destination.droppableId;

    // Only allow reordering within the same section
    if (sourceType !== destType) return;

    const sectionTasks = tasks.filter((task) => task.type === sourceType);
    const updatedSectionTasks = [...sectionTasks];
    const [reorderedItem] = updatedSectionTasks.splice(source.index, 1);
    updatedSectionTasks.splice(destination.index, 0, reorderedItem);

    // Update positions
    const updatedTasks = tasks.map((task) => {
      if (task.type === sourceType) {
        const newIndex = updatedSectionTasks.findIndex((t) => t._id === task._id);
        return { ...task, position: newIndex };
      }
      return task;
    });

    setTasks(updatedTasks);

    try {
      await axios.put(`${API_URL}/reorder`, { 
        tasks: updatedSectionTasks,
        type: sourceType 
      });
    } catch (error) {
      console.error("Error updating task order:", error);
      fetchTasks(); // Revert on error
    }
  };

  const openGoalProgress = (task) => {
    setGoalProgressModal(task);
    setNewProgressNote("");
  };

  const addProgressNote = async () => {
    if (!newProgressNote.trim()) return;
    try {
      const response = await axios.post(`${API_URL}/goal/${goalProgressModal._id}/progress`, {
        progressNote: newProgressNote,
      });
      setTasks(tasks.map((task) => (task._id === goalProgressModal._id ? response.data : task)));
      setNewProgressNote("");
    } catch (error) {
      console.error("Error adding progress note:", error);
    }
  };

  const deleteProgressNote = async (index) => {
    const updatedProgress = [...goalProgressModal.progress];
    updatedProgress.splice(index, 1);
    try {
      const response = await axios.put(`${API_URL}/goal/${goalProgressModal._id}/progress`, {
        progress: updatedProgress,
      });
      setTasks(tasks.map((task) => (task._id === goalProgressModal._id ? response.data : task)));
      setGoalProgressModal({ ...goalProgressModal, progress: updatedProgress });
    } catch (error) {
      console.error("Error deleting progress note:", error);
    }
  };

  const getTasksByType = (type) => {
    return tasks
      .filter((task) => task.type === type)
      .sort((a, b) => a.position - b.position);
  };

  const renderTaskSection = (type, title) => {
    const sectionTasks = getTasksByType(type);

    return (
      <div className="task-section">
        <h3 className="section-title">{title}</h3>
        <Droppable droppableId={type}>
          {(provided) => (
            <ul className="task-list" {...provided.droppableProps} ref={provided.innerRef}>
              {sectionTasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="task-content">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleComplete(task._id, task.completed)}
                        />
                        <div className="task-info">
                          <strong>{task.title}</strong>
                          <p>{task.description}</p>
                          {type === "goal" && task.progress && task.progress.length > 0 && (
                            <div className="progress-preview">
                              <small>{task.progress.length} progress note(s)</small>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="task-actions">
                        {type === "goal" && (
                          <button
                            className="progress-btn"
                            onClick={() => openGoalProgress(task)}
                            title="View/Add Progress"
                          >
                            <FaBullseye />
                          </button>
                        )}
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
      </div>
    );
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
        {renderTaskSection("daily", "Daily Tasks")}
        {renderTaskSection("weekend", "Weekend Tasks")}
        {renderTaskSection("goal", "Goal Tasks")}
      </DragDropContext>

      <button className="add-task-btn" onClick={() => navigate("/add-task")}>
        <FaPlus />
      </button>

      {editTask && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Task</h3>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task Title"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Task Description"
            />
            <div className="modal-buttons">
              <button className="save-btn" onClick={saveEditTask}>
                Save
              </button>
              <button className="cancel-btn" onClick={() => setEditTask(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {goalProgressModal && (
        <div className="modal">
          <div className="modal-content goal-progress-modal">
            <h3>Goal Progress: {goalProgressModal.title}</h3>
            <div className="progress-notes">
              <h4>Progress Notes:</h4>
              {goalProgressModal.progress && goalProgressModal.progress.length > 0 ? (
                <ul className="progress-list">
                  {goalProgressModal.progress.map((note, index) => (
                    <li key={index} className="progress-item">
                      <span>{note}</span>
                      <button
                        className="delete-progress-btn"
                        onClick={() => deleteProgressNote(index)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-progress">No progress notes yet.</p>
              )}
            </div>
            <div className="add-progress">
              <textarea
                value={newProgressNote}
                onChange={(e) => setNewProgressNote(e.target.value)}
                placeholder="What have you done to achieve this goal?"
                rows={3}
              />
              <button className="add-progress-btn" onClick={addProgressNote}>
                Add Progress Note
              </button>
            </div>
            <button className="cancel-btn" onClick={() => setGoalProgressModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
