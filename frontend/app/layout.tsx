import { Routes, Route } from "react-router-dom";

// Lazy load the register page for better performance
import RegisterPage from "./register/page";
import LandingPage from "./page";



function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ec-dark text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-ec-gold font-heading mb-4">
          404
        </h1>
        <p className="text-gray-400 font-body mb-6">Page not found.</p>
        <a
          href="/"
          className="px-6 py-3 bg-ec-gold text-ec-dark rounded-full font-bold font-body hover:scale-105 transition-transform"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
