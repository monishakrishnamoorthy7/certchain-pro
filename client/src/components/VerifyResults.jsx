import { useEffect, useRef } from "react";
import useVerification from "../hooks/useVerification.js";

export default function VerifyResults({ hash }) {
  const { state, verifyByHash } = useVerification();
  const requestedRef = useRef("");

  useEffect(() => {
    if (!hash) return;

    if (requestedRef.current === hash) return;

    requestedRef.current = hash;

    verifyByHash(hash).catch((err) => {
      console.error("VERIFY ERROR:", err);
    });
  }, [hash]);

  if (!hash) return null;

  if (state.status === "loading") {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-slate-300">
        Verifying certificate...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
        Verification failed: {state.error}
      </div>
    );
  }

  if (!state.data) return null;

  const data = state.data;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Verification Result
        </h3>

        <div className="rounded-full bg-green-500/20 px-4 py-1 text-sm text-green-300">
          {data.status}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-xs uppercase text-slate-500">
            Student
          </div>

          <div className="mt-1 font-semibold">
            {data.studentName || "-"}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase text-slate-500">
            Course
          </div>

          <div className="mt-1 font-semibold">
            {data.course || "-"}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase text-slate-500">
            Hash
          </div>

          <div className="mt-1 break-all text-xs text-slate-300">
            {data.hash}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase text-slate-500">
            Revoked
          </div>

          <div className="mt-1 font-semibold">
            {data.status === "REVOKED" ? "Yes" : "No"}
          </div>
        </div>
      </div>
    </div>
  );
}