export default function ResultBox({ title, message, tone = "neutral" }) {
  const toneClasses = {
    neutral: "border-slate-700 bg-slate-950/50 text-slate-300",
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    error: "border-red-500/40 bg-red-500/10 text-red-200"
  };

  return (
    <div className={`rounded-xl border px-4 py-4 text-sm ${toneClasses[tone]}`}>
      <div className="text-sm font-semibold">{title}</div>
      {message ? <p className="mt-2 text-xs text-slate-300">{message}</p> : null}
    </div>
  );
}
