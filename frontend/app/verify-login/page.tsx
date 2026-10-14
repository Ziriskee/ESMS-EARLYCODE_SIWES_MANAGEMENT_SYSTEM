import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function VerifyLoginPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    const verify = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/auth/verify-magic-link/?token=${encodeURIComponent(token)}`,
          { credentials: "include" },
        );
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || "Invalid or expired link");
        }
        // Hard-navigate: the session cookie is brand new, so the whole
        // app must re-bootstrap from it — identical to the manual
        // refresh that was previously required. No SPA state survives.
        window.location.replace("/dashboard");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    };
    verify();
    return () => {
      isMounted = false;
    };
  }, [token, searchParams]);

  if (!token || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ec-dark px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Invalid or expired link
          </h1>
          <p className="text-gray-400 mb-6">
            {error ??
              "This login link is no longer valid. Please request a new one."}
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
