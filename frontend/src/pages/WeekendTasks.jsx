const API_URL = import.meta.env.VITE_API_URL;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext } from "@hello-pangea/dnd";
import { FaPlus } from "react-icons/fa";
import TaskSection from "../components/TaskSection";
import Navigation from "../components/Navigation";
import "../styles/TaskPage.css";

const WeekendTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    checkAndResetWeekendTasks();
    fetchTasks();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const checkAndResetWeekendTasks = async () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday

    if (dayOfWeek === 5) {
      // Friday
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

    if (sourceType !== destType || sourceType !== "weekend") return;

    const weekendTasks = tasks.filter((task) => task.type === "weekend");
    const sortedTasks = [...weekendTasks].sort((a, b) => (a.position || 0) - (b.position || 0));
    const [reorderedItem] = sortedTasks.splice(source.index, 1);
    sortedTasks.splice(destination.index, 0, reorderedItem);

    // Update positions
    const updatedTasks = tasks.map((task) => {
      if (task.type === "weekend") {
        const newIndex = sortedTasks.findIndex((t) => String(t._id) === String(task._id));
        return { ...task, position: newIndex };
      }
      return task;
    });

    setTasks(updatedTasks);

    try {
      await axios.put(`${API_URL}/reorder`, {
        tasks: sortedTasks,
        type: "weekend",
      });
      setTimeout(() => fetchTasks(), 100);
    } catch (error) {
      console.error("Error updating task order:", error);
      fetchTasks();
    }
  };

  const weekendTasks = tasks.filter((task) => task.type === "weekend");

  return (
    <div className="task-page">
      <Navigation darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="page-container">
        <div className="page-header">
          <h2>Weekend Tasks</h2>
          <p className="page-subtitle">Tasks that reset every Friday</p>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <TaskSection
            tasks={weekendTasks}
            type="weekend"
            onTaskUpdate={fetchTasks}
            onDragEnd={onDragEnd}
          />
        </DragDropContext>

        <button className="add-task-btn" onClick={() => navigate("/add-task?type=weekend")}>
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default WeekendTasks;

