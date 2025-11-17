const API_URL = import.meta.env.VITE_API_URL;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext } from "@hello-pangea/dnd";
import { FaPlus } from "react-icons/fa";
import TaskSection from "../components/TaskSection";
import Navigation from "../components/Navigation";
import "../styles/TaskPage.css";

const GoalTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [goalProgressModal, setGoalProgressModal] = useState(null);
  const [newProgressNote, setNewProgressNote] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    fetchTasks();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/`);
      setTasks(response.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceType = source.droppableId;
    const destType = destination.droppableId;

    if (sourceType !== destType || sourceType !== "goal") return;

    const goalTasks = tasks.filter((task) => task.type === "goal");
    const sortedTasks = [...goalTasks].sort((a, b) => (a.position || 0) - (b.position || 0));
    const [reorderedItem] = sortedTasks.splice(source.index, 1);
    sortedTasks.splice(destination.index, 0, reorderedItem);

    // Update positions
    const updatedTasks = tasks.map((task) => {
      if (task.type === "goal") {
        const newIndex = sortedTasks.findIndex((t) => String(t._id) === String(task._id));
        return { ...task, position: newIndex };
      }
      return task;
    });

    setTasks(updatedTasks);

    try {
      await axios.put(`${API_URL}/reorder`, {
        tasks: sortedTasks,
        type: "goal",
      });
      setTimeout(() => fetchTasks(), 100);
    } catch (error) {
      console.error("Error updating task order:", error);
      fetchTasks();
    }
  };

  const openGoalProgress = (task) => {
    setGoalProgressModal(task);
    setNewProgressNote("");
  };

  const addProgressNote = async () => {
    if (!newProgressNote.trim()) return;
    try {
      await axios.post(`${API_URL}/goal/${goalProgressModal._id}/progress`, {
        progressNote: newProgressNote,
      });
      setNewProgressNote("");
      fetchTasks();
      // Update modal with latest task data
      const updatedTask = tasks.find((t) => t._id === goalProgressModal._id);
      if (updatedTask) {
        setGoalProgressModal({
          ...updatedTask,
          progress: [...(updatedTask.progress || []), newProgressNote.trim()],
        });
      }
    } catch (error) {
      console.error("Error adding progress note:", error);
    }
  };

  const deleteProgressNote = async (index) => {
    const updatedProgress = [...(goalProgressModal.progress || [])];
    updatedProgress.splice(index, 1);
    try {
      await axios.put(`${API_URL}/goal/${goalProgressModal._id}/progress`, {
        progress: updatedProgress,
      });
      setGoalProgressModal({ ...goalProgressModal, progress: updatedProgress });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting progress note:", error);
    }
  };

  const goalTasks = tasks.filter((task) => task.type === "goal");

  return (
    <div className="task-page">
      <Navigation darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="page-container">
        <div className="page-header">
          <h2>Goal Tasks</h2>
          <p className="page-subtitle">Track your progress towards achieving your goals</p>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <TaskSection
            tasks={goalTasks}
            type="goal"
            onTaskUpdate={fetchTasks}
            onDragEnd={onDragEnd}
            onOpenGoalProgress={openGoalProgress}
          />
        </DragDropContext>

        <button className="add-task-btn" onClick={() => navigate("/add-task?type=goal")}>
          <FaPlus />
        </button>
      </div>

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

export default GoalTasks;

