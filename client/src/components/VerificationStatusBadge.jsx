const toneMap = {
  VALID: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  REVOKED: "border-red-500/40 bg-red-500/10 text-red-200",
  NOT_FOUND: "border-slate-600/40 bg-slate-800/40 text-slate-300"
};

export default function VerificationStatusBadge({ status }) {
  const tone = toneMap[status] || toneMap.NOT_FOUND;
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${tone}`}>
      {status.replace("_", " ")}
    </span>
  );
}
