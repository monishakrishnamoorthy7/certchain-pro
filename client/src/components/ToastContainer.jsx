import React from 'react';
import { useToasts } from '../context/ToastContext.jsx';

export default function ToastContainer() {
  const { toasts, remove } = useToasts();
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="fixed right-6 top-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-md px-4 py-2 text-sm shadow-lg ${
            t.tone === 'error' ? 'bg-red-600 text-white' : t.tone === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>{t.message}</div>
            <button onClick={() => remove(t.id)} className="opacity-80 hover:opacity-100">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
