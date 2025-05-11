// In your main routing file (e.g., App.js)
import { Routes, Route, Navigate, BrowserRouter as Router } from "react-router-dom";
import { useSelector } from "react-redux";
import IntroPage from "./components/IntroPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import ForgotPassword from "./components/ForgotPassword"; // Ensure this import is correct
import ResetPassword from "./components/ResetPassword"; // Import the new component

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:id/:token" element={<ResetPassword />} /> {/* Update this route to include both id and token */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;