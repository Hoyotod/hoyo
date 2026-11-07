import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
      <footer className="border-t-3 border-black dark:border-neutral-100 mt-12 py-6 text-center font-mono text-xs uppercase">
        Hoyo · Neobrutalist UI · Workers + D1 API
      </footer>
    </div>
  );
}
