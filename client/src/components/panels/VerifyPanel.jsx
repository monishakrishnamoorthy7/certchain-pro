import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../Card.jsx";
import Dropzone from "../Dropzone.jsx";
import Field from "../Field.jsx";
import LoadingBox from "../LoadingBox.jsx";
import ResultBox from "../ResultBox.jsx";
import { verifyByFile as serviceVerifyByFile } from "../../services/verification.js";
import VerifyResults from "../VerifyResults.jsx";

export default function VerifyPanel({ defaultHash }) {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  // verification actions are handled in the results component; use the service directly for file uploads
  const navigate = useNavigate();

  useEffect(() => {
    if (defaultHash) setHash(defaultHash);
  }, [defaultHash]);

  const handleVerifyHash = () => {
    if (!hash) return;
    navigate(`/verify/${hash}`);
  };

  const handleVerifyFile = async () => {
    if (!file) return;
    try {
      const data = await serviceVerifyByFile(file);
      if (data?.hash) {
        navigate(`/verify/${data.hash}`);
      }
    } catch (error) {
      // handled in hook state
    }
  };

  return (
    <Card title="Quick Verification" description="Upload a certificate or paste a SHA-256 hash.">
      <div className="space-y-6">
        <Dropzone
          label="Select Certificate File"
          helper="PDF, PNG, JPG (Max 5MB)"
          fileName={file?.name}
          onChange={setFile}
        />

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
          <span className="h-px flex-1 bg-slate-800" />
          <span>Or use hash</span>
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <Field label="Certificate Hash">
          <input
            value={hash}
            onChange={(event) => setHash(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
            placeholder="Enter SHA-256 hash"
          />
        </Field>

        <button
          type="button"
          onClick={handleVerifyHash}
          className="w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-400"
        >
          Verify Authenticity
        </button>

        <button
          type="button"
          onClick={handleVerifyFile}
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 py-3 text-sm font-semibold text-slate-200 hover:border-blue-500/60"
        >
          Verify Uploaded File
        </button>

        {hash && <VerifyResults hash={hash} />}

        {hash && <VerifyResults hash={hash} />}
      </div>
    </Card>
  );
}
