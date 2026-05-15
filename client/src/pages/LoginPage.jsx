import Navbar from "../components/Navbar.jsx";
import useAuth from "../hooks/useAuth.js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { authState, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authState?.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [authState, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="container-shell py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Admin Access</p>
          <h1 className="mt-4 text-2xl font-semibold">Sign in to manage certificates</h1>
          <p className="mt-2 text-sm text-slate-400">
            Connect your wallet to authenticate as an admin.
          </p>
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={login}
              className="w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-400"
            >
              {authState.status === "loading" ? "Connecting..." : "Sign in with Wallet"}
            </button>
            {authState.error ? (
              <p className="text-sm text-red-300">{authState.error}</p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
