import { useEffect, useState } from 'react';
import Card from '../Card.jsx';
import Field from '../Field.jsx';
import LoadingBox from '../LoadingBox.jsx';
import { getRolesForAddress, grantRole, revokeRole, subscribeToRoleEvents } from '../../services/blockchain.js';
import { ROLES } from '../../config/roles.js';
import { useToasts } from '../../context/ToastContext.jsx';

const ROLE_OPTIONS = [
  { key: 'SUPER_ADMIN_ROLE', label: 'Super Admin', hash: ROLES.SUPER_ADMIN_ROLE },
  { key: 'UNIVERSITY_ADMIN_ROLE', label: 'University Admin', hash: ROLES.UNIVERSITY_ADMIN_ROLE },
  { key: 'DEPARTMENT_ADMIN_ROLE', label: 'Department Admin', hash: ROLES.DEPARTMENT_ADMIN_ROLE }
];

export default function RolesPanel() {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[1].hash);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState(null);
  const [txPending, setTxPending] = useState(false);
  const { push } = useToasts();

  useEffect(() => {
    const unsub = subscribeToRoleEvents((ev) => {
      // refresh roles for the focused address when events occur
      if (ev.account && ev.account.toLowerCase() === (walletAddress || '').toLowerCase()) {
        fetchRoles(walletAddress);
        push(`Role event: ${ev.type} ${ev.txHash}`, 'info');
      }
    });
    return () => unsub && unsub();
  }, [walletAddress]);

  async function fetchRoles(addr) {
    if (!addr) return setRoles(null);
    setLoading(true);
    try {
      const r = await getRolesForAddress(addr);
      setRoles(r);
    } catch (err) {
      setRoles(null);
      push('Failed to fetch roles: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleCheck = () => fetchRoles(walletAddress);

  const handleGrant = async () => {
    if (!walletAddress) return push('No wallet address provided', 'error');
    if (!selectedRole) return push('No role selected', 'error');
    setTxPending(true);
    try {
      const tx = await grantRole(selectedRole, walletAddress);
      push('Grant confirmed: ' + (tx && tx.hash ? tx.hash : ''), 'success');
      // refresh roles after confirmation
      fetchRoles(walletAddress);
    } catch (err) {
      console.error('Grant failed:', err);
      push('Grant failed: ' + (err.message || err), 'error');
    } finally {
      setTxPending(false);
    }
  };

  const handleRevoke = async () => {
    if (!walletAddress) return;
    // safety confirmation
    const ok = window.confirm('Are you sure you want to revoke this role? This action is auditable.');
    if (!ok) return;
    setTxPending(true);
    try {
      const tx = await revokeRole(selectedRole, walletAddress);
      push('Revoke confirmed: ' + (tx && tx.hash ? tx.hash : ''), 'success');
      fetchRoles(walletAddress);
    } catch (err) {
      console.error('Revoke failed:', err);
      push('Revoke failed: ' + (err.message || err), 'error');
    } finally {
      setTxPending(false);
    }
  };


  return (
    <Card title="Role Management" description="Grant or revoke on-chain roles.">
      <div className="space-y-4">
        <Field label="Wallet Address">
          <input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-200" placeholder="0x..." />
        </Field>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs uppercase text-slate-500">Role</label>
            <select className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-200" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.key} value={r.hash}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGrant}
              disabled={txPending}
              className={`w-full rounded-lg py-3 text-sm font-semibold text-white ${txPending ? 'bg-blue-400/60' : 'bg-blue-500'}`}
            >
              {txPending ? 'Processing…' : 'Grant'}
            </button>
          </div>
          <div className="flex items-end">
            <button onClick={handleRevoke} disabled={txPending} className="w-full rounded-lg border border-red-500/40 bg-red-500/10 py-3 text-sm font-semibold text-red-200">Revoke</button>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handleCheck} className="rounded-lg px-4 py-2 bg-slate-800 text-sm">Check Roles</button>
        </div>

        {loading ? <LoadingBox label="Fetching roles..." /> : null}

        {roles ? (
          <div>
            <div className="text-xs text-slate-400">Roles for {walletAddress}</div>
            <div className="mt-2 flex gap-2 items-center">
              {roles.isSuper ? <div className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-200">SUPER_ADMIN</div> : null}
              {roles.isUniversity ? <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200">UNIVERSITY_ADMIN</div> : null}
              {roles.isDept ? <div className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-200">DEPARTMENT_ADMIN</div> : null}
              {!roles.isSuper && !roles.isUniversity && !roles.isDept ? <div className="text-sm text-slate-400">No roles</div> : null}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400">Enter an address and click "Check Roles"</div>
        )}
      </div>
    </Card>
  );
}
