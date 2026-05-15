import { useState, useEffect } from "react";
import Card from "../Card.jsx";
import Dropzone from "../Dropzone.jsx";
import Field from "../Field.jsx";
import LoadingBox from "../LoadingBox.jsx";
import ResultBox from "../ResultBox.jsx";
import useCertificateActions from "../../hooks/useCertificateActions.js";
import useWallet from '../../hooks/useWallet.js';

export default function UploadPanel() {
  const [file, setFile] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [course, setCourse] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const { uploadCertificate } = useCertificateActions();
  const { walletState } = useWallet();
  // Debug: log wallet roles to help trace permission issues (only when roles change)
  useEffect(() => {
    // Avoid noisy logs in production UI
  }, [walletState?.roles]);

  const handleUpload = async () => {
    setStatus("loading");
    setMessage("");
    setProgress(0);
    try {
      const result = await uploadCertificate({
        file,
        studentName,
        course,
        onProgress: (value) => setProgress(value)
      });
      setStatus("success");
      if (result.confirmed && result.confirmed.warning) {
        setMessage('Certificate uploaded successfully, but audit sync is pending.');
      } else {
        setMessage(`Tx hash: ${result.txHash}`);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Upload failed");
    }
  };

  return (
    <Card
      title="Secure Upload"
      description="File is hashed on-chain and stored with encrypted metadata."
    >
      <div className="space-y-6">
        <Dropzone
          label="Select Document"
          helper="Max 5MB • PDF, PNG, JPG"
          fileName={file?.name}
          onChange={setFile}
        />

        <Field label="Student Name">
          <input
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
            placeholder="Student name"
          />
        </Field>

        <Field label="Course Title">
          <input
            value={course}
            onChange={(event) => setCourse(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
            placeholder="Course title"
          />
        </Field>

        {!walletState?.roles?.canAdd ? (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">You do not have permission to upload certificates.</div>
        ) : (
          <button
            type="button"
            onClick={handleUpload}
            className="w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-400"
          >
            Deploy to Blockchain
          </button>
        )}

        {status === "loading" ? (
          <div className="space-y-3">
            <LoadingBox label="Uploading to IPFS and broadcasting..." />
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">Upload progress: {progress}%</p>
          </div>
        ) : null}
        {status === "idle" ? (
          <ResultBox title="Awaiting upload" message="Transaction details will appear here." />
        ) : null}
        {status === "success" ? (
          <ResultBox title="Deployed" message={message} tone="success" />
        ) : null}
        {status === "error" ? (
          <ResultBox title="Upload failed" message={message} tone="error" />
        ) : null}
      </div>
    </Card>
  );
}
