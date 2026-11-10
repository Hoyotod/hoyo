import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toast";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Card } from "./components/ui/card";
import { Spinner } from "./components/ui/spinner";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));

function LoadingFallback() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Card className="p-6 font-bold uppercase text-center flex items-center justify-center gap-2">
        <Spinner /> Loading…
      </Card>
    </main>
  );
}

export default function App() {
  return (
    <Toaster>
      <div className="min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><Profile /></Suspense></ProtectedRoute>} />
        </Routes>
        <footer className="border-t-2 border-border py-6 text-center text-xs uppercase">
          Hoyo · Neobrutalist UI · Workers + D1 API
        </footer>
      </div>
    </Toaster>
  );
}
