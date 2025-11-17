import { Link, useLocation } from "react-router-dom";
import { FaHome, FaCalendarWeek, FaBullseye, FaMoon, FaSun } from "react-icons/fa";
import "../styles/Navigation.css";

const Navigation = ({ darkMode, setDarkMode }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className={`navigation ${darkMode ? "dark" : ""}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <h1>Task Manager</h1>
        </div>
        <div className="nav-links">
          <Link to="/daily" className={`nav-link ${isActive("/daily")}`}>
            <FaHome />
            <span>Daily</span>
          </Link>
          <Link to="/weekend" className={`nav-link ${isActive("/weekend")}`}>
            <FaCalendarWeek />
            <span>Weekend</span>
          </Link>
          <Link to="/goals" className={`nav-link ${isActive("/goals")}`}>
            <FaBullseye />
            <span>Goals</span>
          </Link>
        </div>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;

