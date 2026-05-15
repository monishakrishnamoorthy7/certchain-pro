export default function LoadingBox({ label }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm text-slate-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
      <span>{label}</span>
    </div>
  );
}
