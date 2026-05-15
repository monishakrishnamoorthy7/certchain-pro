import VerificationStatusBadge from "./VerificationStatusBadge.jsx";
import { getTxLink } from "../services/links.js";

export default function VerificationDetails({ data }) {
  if (!data) return null;
  const txHash = data.transactionHash || data.txHash || data.transaction;
  const issuer = data.issuer || data.issuerWallet || data.issuerAddress || null;
  const ipfsHash = data.ipfsCid || data.ipfsHash || data.ipfs || null;
  const txLink = getTxLink(txHash, data.chainId);

  const issuerDisplay = issuer || (data.dbStatus === 'PENDING' ? 'Pending' : '—');
  const txDisplay = txHash || (data.dbStatus === 'PENDING' ? 'Pending' : '—');

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Verification Result</h3>
        <VerificationStatusBadge status={data.status} />
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
        <div className="font-mono text-xs">Hash: {data.hash}</div>
        <button
          onClick={() => navigator.clipboard.writeText(data.hash)}
          className="ml-2 rounded px-2 py-1 text-xs bg-slate-800 text-slate-200"
        >
          Copy Hash
        </button>
      </div>
      {data.status === "NOT_FOUND" ? (
        <p className="mt-4 text-sm text-slate-400">No certificate record was found.</p>
      ) : (
        <div className="mt-6 grid gap-4 text-sm text-slate-200 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase text-slate-500">Student</div>
            <div className="mt-1 font-semibold">{data.studentName}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Course</div>
            <div className="mt-1 font-semibold">{data.course}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Issued</div>
            <div className="mt-1 font-semibold">{new Date(data.issueDate || data.issuedDate).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Issuer Wallet</div>
            <div className="mt-1 font-mono text-xs text-slate-300">{issuerDisplay}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Transaction</div>
            <div className="mt-1 font-mono text-xs text-slate-300">
              {txDisplay}
            </div>
            {data.transactionHash ? (
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(txHash)}
                  className="rounded px-2 py-1 text-xs bg-slate-800 text-slate-200"
                >
                  Copy Tx
                </button>
                {txLink ? (
                  <a className="inline-block text-xs text-blue-300" href={txLink} target="_blank" rel="noreferrer">
                    View on explorer
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Revoked</div>
            <div className="mt-1 font-semibold">{data.status === "REVOKED" ? "Yes" : "No"}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">IPFS</div>
            <div className="mt-1 text-xs text-slate-300">
              {ipfsHash || "Coming in Phase 4"}
            </div>
            {data.ipfsUrl ? (
              <a
                className="mt-1 inline-block text-xs text-blue-300"
                href={data.ipfsUrl}
                target="_blank"
                rel="noreferrer"
              >
                View Original Certificate
              </a>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
