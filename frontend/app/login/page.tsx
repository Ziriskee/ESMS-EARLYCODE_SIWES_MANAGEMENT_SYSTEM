import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/request-magic-link/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      setStatus("sent");
      setMessage(data.message || "Check your email for a login link.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
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
            Enter your email to receive a secure login link.
          </p>
        </div>

        {status === "sent" ? (
          <div className="p-6 rounded-2xl border border-green-500/30 bg-green-500/10 text-center">
            <svg
              className="w-12 h-12 text-green-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-xl font-bold text-white font-heading mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-300 font-body">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#FBCD15] mb-2 font-body">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-[#2A2A2B] px-4 py-3 text-white placeholder-gray-500 focus:border-[#FBCD15] focus:outline-none font-body"
                placeholder="you@example.com"
                required
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-400 font-body">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full px-6 py-3 bg-ec-gold text-ec-dark rounded-full font-bold text-sm hover:scale-105 hover:shadow-lg hover:shadow-ec-gold/20 transition-all duration-300 font-body flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Login Link"
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <a
            href="/register"
            className="text-gray-400 hover:text-ec-gold transition-colors text-sm font-body"
          >
            Don't have an account? Register
          </a>
        </div>
      </div>
    </div>
  );
}
