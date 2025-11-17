const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from "react";
import axios from "axios";
import { FaTrash, FaEdit, FaBullseye } from "react-icons/fa";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import "../styles/TaskPage.css";

const TaskSection = ({ tasks, type, onTaskUpdate, onDragEnd, onOpenGoalProgress }) => {
  const [editTask, setEditTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      onTaskUpdate();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      await axios.put(`${API_URL}/${id}`, {
        completed: !completed,
      });
      onTaskUpdate();
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
      await axios.put(`${API_URL}/${editTask._id}`, {
        title: editTitle,
        description: editDescription,
      });
      setEditTask(null);
      onTaskUpdate();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Sort tasks by position to ensure correct order
  const sortedTasks = [...tasks].sort((a, b) => (a.position || 0) - (b.position || 0));

  return (
    <>
      <Droppable droppableId={type}>
        {(provided, snapshot) => (
          <ul
            className={`task-list ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {sortedTasks.length === 0 ? (
              <li className="empty-state">
                <p>No tasks yet. Click the + button to add one!</p>
              </li>
            ) : (
              sortedTasks.map((task, index) => (
                <Draggable key={String(task._id)} draggableId={String(task._id)} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`task-item ${snapshot.isDragging ? "dragging" : ""} ${
                        task.completed ? "completed" : ""
                      }`}
                    >
                      <div className="task-content">
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          onChange={() => toggleComplete(task._id, task.completed)}
                          className="task-checkbox"
                        />
                        <div className="task-info">
                          <strong className="task-title">{task.title}</strong>
                          {task.description && <p className="task-description">{task.description}</p>}
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
                            onClick={() => onOpenGoalProgress(task)}
                            title="View/Add Progress"
                          >
                            <FaBullseye />
                          </button>
                        )}
                        <button className="edit-btn" onClick={() => startEditTask(task)} title="Edit">
                          <FaEdit />
                        </button>
                        <button className="delete-btn" onClick={() => deleteTask(task._id)} title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>

      {editTask && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Task</h3>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task Title"
              autoFocus
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
    </>
  );
};

export default TaskSection;

