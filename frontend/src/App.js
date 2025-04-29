// frontend/src/App.js (Modify this file)

import Login from "./components/Login";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard"; // Import the Dashboard component
import { useSelector } from 'react-redux'; // Import useSelector

// ProtectedRoute component to guard routes
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return isAuthenticated ? element : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        {/* You can add more protected routes here */}
        {/* Example: Admin route */}
        {/* <Route
          path="/admin"
          element={<ProtectedRoute element={<AdminPanel />} />} // Create an AdminPanel component
        /> */}
      </Routes>
    </Router>
  );
}

export default App;