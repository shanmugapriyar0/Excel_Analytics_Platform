// In your main routing file (e.g., App.js)
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import IntroPage from "./components/IntroPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      {/* Other routes */}
    </Routes>
  );
}
export default App;