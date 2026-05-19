import { useEffect, useState } from "react";
import Card from "../Card.jsx";
import Dropzone from "../Dropzone.jsx";
import Field from "../Field.jsx";
import VerifyResults from "../VerifyResults.jsx";
import { verifyByFile as serviceVerifyByFile } from "../../services/verification.js";

export default function VerifyPanel({ defaultHash }) {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    if (defaultHash) {
      setHash(defaultHash);
      setActiveHash(defaultHash);
    }
  }, [defaultHash]);

  const handleVerifyHash = () => {
    if (!hash.trim()) return;

    console.log("VERIFY HASH:", hash);

    setActiveHash(hash.trim());
  };

  const handleVerifyFile = async () => {
    if (!file) return;

    try {
      const response = await serviceVerifyByFile(file);

      console.log("VERIFY FILE RESPONSE:", response);

      const certificate = response?.certificate || response;

      console.log("FULL RESPONSE", response);
      console.log("CERTIFICATE", certificate);

      setActiveHash("");

      setTimeout(() => {
        setHash(certificate.hash);
        setActiveHash(certificate.hash);
      }, 100);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card
      title="Quick Verification"
      description="Upload a certificate or paste a SHA-256 hash."
    >
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
            onChange={(e) => setHash(e.target.value)}
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

        {activeHash && <VerifyResults hash={activeHash} />}
      </div>
    </Card>
  );
}