import { useState } from "react";
import Card from "../Card.jsx";
import Field from "../Field.jsx";
import LoadingBox from "../LoadingBox.jsx";
import ResultBox from "../ResultBox.jsx";
import useCertificateActions from "../../hooks/useCertificateActions.js";
import useWallet from '../../hooks/useWallet.js';

export default function RevokePanel() {
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const { revokeCertificateOnChain } = useCertificateActions();
  const { walletState } = useWallet();

  const handleRevoke = async () => {
    if (!hash) return;
    setStatus("loading");
    setMessage("");
    try {
      const result = await revokeCertificateOnChain({ hash });
      setStatus("success");
      setMessage(`Tx hash: ${result.txHash}`);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Revoke failed");
    }
  };

  return (
    <Card
      title="Revoke Certificate"
      description="Revocations are permanent and auditable on-chain."
    >
      <div className="space-y-6">
        <Field label="Certificate Hash">
          <input
            value={hash}
            onChange={(event) => setHash(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 focus:border-red-400 focus:outline-none"
            placeholder="Enter certificate hash"
          />
        </Field>

        {!walletState?.roles?.canRevoke ? (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">You do not have permission to revoke certificates.</div>
        ) : (
          <button
            type="button"
            onClick={handleRevoke}
            className="w-full rounded-lg border border-red-500/40 bg-red-500/10 py-3 text-sm font-semibold text-red-200 hover:bg-red-500/20"
          >
            Revoke Certificate
          </button>
        )}

        {status === "loading" ? <LoadingBox label="Updating ledger..." /> : null}
        {status === "idle" ? (
          <ResultBox title="Awaiting revoke" message="Revocation status will appear here." />
        ) : null}
        {status === "success" ? (
          <ResultBox title="Revoked" message={message} tone="success" />
        ) : null}
        {status === "error" ? (
          <ResultBox title="Revoke failed" message={message} tone="error" />
        ) : null}
      </div>
    </Card>
  );
}
