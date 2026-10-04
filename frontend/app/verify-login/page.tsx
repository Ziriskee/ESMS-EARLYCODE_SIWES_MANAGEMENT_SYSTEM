import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";

export default function VerifyLoginPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { refetch } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [status] = useState<"loading" | "error">(token ? "loading" : "error");

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      setVerifying(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:8000/api/auth/verify-magic-link/?token=${encodeURIComponent(token)}`,
          { credentials: "include" },
        );
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || "Invalid or expired link");
        }

        // ✅ CRITICAL: populate useAuth BEFORE navigating.
        await refetch();

        navigate("/dashboard", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setVerifying(false);
      }
    };

    verify();
  }, [token, refetch, navigate, searchParams]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ec-dark px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Invalid or expired link
          </h1>
          <p className="text-gray-400 mb-6">
            This login link is no longer valid. Please request a new one.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-ec-gold text-ec-dark rounded-full font-semibold"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ec-dark text-white">
      {verifying && !error ? "Logging you in..." : error || "Logging you in..."}
    </div>
  );
}
