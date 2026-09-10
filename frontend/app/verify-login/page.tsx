import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { useAuth } from "@/contexts/useAuth";

export default function VerifyLoginPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState<"loading" | "error">(
    token ? "loading" : "error",
  );

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        await apiFetch(
           `/auth/verify-magic-link/?token=${token}`
        );

        await refreshUser();

        navigate("/dashboard", { replace: true });
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [token, refreshUser, navigate]);

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
      Logging you in...
    </div>
  );
}
