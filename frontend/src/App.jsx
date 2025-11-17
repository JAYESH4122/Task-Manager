import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DailyTasks from "./pages/DailyTasks";
import WeekendTasks from "./pages/WeekendTasks";
import GoalTasks from "./pages/GoalTasks";
import AddTask from "./components/AddTask";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/daily" replace />} />
        <Route path="/daily" element={<DailyTasks />} />
        <Route path="/weekend" element={<WeekendTasks />} />
        <Route path="/goals" element={<GoalTasks />} />
        <Route path="/add-task" element={<AddTask />} />
      </Routes>
    </Router>
  );
};

export default App;
