export default function Dropzone({ label, helper, fileName, onChange }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/40 px-6 py-10 text-center transition hover:border-blue-500/60">
      <span className="text-sm font-semibold text-white">{label}</span>
      <span className="mt-2 text-xs text-slate-400">{helper}</span>
      {fileName ? (
        <span className="mt-3 text-xs font-semibold text-blue-300">{fileName}</span>
      ) : null}
      <input
        type="file"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
    </label>
  );
}
