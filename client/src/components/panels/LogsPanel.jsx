import Card from "../Card.jsx";
import { useEffect, useState } from 'react';
import { getTxLink } from '../../services/links.js';
import { apiFetch } from '../../services/api.js';

export default function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    apiFetch('/logs')
      .then((j) => setLogs((j && j.data) || []))
      .catch(() => setLogs([]));
  }, []);

  const filtered = logs.filter((l) => (filter === 'all' ? true : l.action === filter));

  return (
    <Card title="Audit Logs" description="Recent on-chain governance and certificate actions.">
      <div className="flex items-center gap-3 mb-3">
        <label className="text-xs text-slate-400">Filter</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md bg-slate-900/50 px-2 py-1 text-sm">
          <option value="all">All</option>
          <option value="role_grant">Role Grants</option>
          <option value="role_revoke">Role Revokes</option>
          <option value="certificate_add">Certificate Adds</option>
          <option value="certificate_revoke">Certificate Revokes</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 text-[0.7rem] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Time</th>
              <th className="px-3 py-3">Action</th>
              <th className="px-3 py-3">Actor</th>
              <th className="px-3 py-3">Target / Details</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Confirmations</th>
              <th className="px-3 py-3">Tx</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className="border-b border-slate-800">
                <td className="px-3 py-4 text-slate-500" colSpan={5}>No audit events</td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row._id} className="border-b border-slate-800 hover:bg-slate-900/30">
                  <td className="px-3 py-3 text-slate-400">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-3">{row.action}</td>
                  <td className="px-3 py-3">{row.actor}</td>
                  <td className="px-3 py-3 text-slate-400">{row.details || JSON.stringify(row.metadata || {})}</td>
                  <td className="px-3 py-3"><span className={row.status === 'confirmed' ? 'text-emerald-300' : row.status === 'pending' ? 'text-amber-300' : 'text-rose-300'}>{row.status}</span></td>
                  <td className="px-3 py-3">{row.confirmations ?? row.metadata?.confirmations ?? '-'}</td>
                  <td className="px-3 py-3">
                    {row.txHash || row.metadata?.txHash ? (
                      <a className="text-blue-400 underline" href={getTxLink(row.txHash || row.metadata.txHash, row.chainId || row.metadata?.chainId)} target="_blank" rel="noreferrer">tx</a>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
