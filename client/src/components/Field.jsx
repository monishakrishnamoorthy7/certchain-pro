export default function Field({ label, children }) {
  return (
    <label className="block space-y-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      <span>{label}</span>
      {children}
    </label>
  );
}
