export default function Card({ title, children, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40">
      {title ? (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
