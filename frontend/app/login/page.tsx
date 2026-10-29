import { useState } from "react";
import { apiFetch, ApiError } from "../../lib/api";

export default function LoginPage() {
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      const data = await apiFetch<{ message?: string }>(
        "auth/request-magic-link/",
        { method: "POST", body: JSON.stringify({ email }) }
      );
      setStatus("sent");
      setMessage(data.message || "Check your email for a login link.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setStatus("loading");
    setMessage("");
    try {
      await apiFetch<{ message?: string; role?: string }>(
        "auth/login/",
        { method: "POST", body: JSON.stringify({ email, password }) }
      );
      // Hard navigate to hydrate the auth context with the new cookie
      window.location.href = "/dashboard";
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError) {
        setMessage(err.message); // Shows backend's specific error (e.g., "This account uses magic links...")
      } else {
        setMessage("Invalid email or password.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-ec-dark flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-heading">
            SIWES <span className="text-ec-gold">Login</span>
          </h1>
          <p className="text-gray-400 mt-2 font-body">
            Access your training dashboard
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-6 bg-ec-surface rounded-full p-1">
          <button
            type="button"
            onClick={() => { setMode("magic"); setStatus("idle"); setMessage(""); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors ${
              mode === "magic" 
                ? "bg-ec-gold text-ec-dark" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => { setMode("password"); setStatus("idle"); setMessage(""); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors ${
              mode === "password" 
                ? "bg-ec-gold text-ec-dark" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Admin Password
          </button>
        </div>

        <div className="bg-ec-surface rounded-2xl p-6 shadow-xl border border-white/5">
          {mode === "magic" ? (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-ec-dark border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ec-gold"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3 bg-ec-gold text-ec-dark font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-ec-dark border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ec-gold"
                  placeholder="admin@earlycode.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-ec-dark border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ec-gold"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3 bg-ec-gold text-ec-dark font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "Logging in..." : "Log In"}
              </button>
            </form>
          )}

          {/* Status Messages */}
          {status === "sent" && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-700 text-green-300 text-sm rounded-lg text-center">
              {message}
            </div>
          )}
          {status === "error" && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg text-center">
              {message}
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <a href="/register" className="text-ec-gold hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}