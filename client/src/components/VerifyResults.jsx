import { useEffect, useRef } from "react";
import useVerification from "../hooks/useVerification.js";
import LoadingBox from "./LoadingBox.jsx";
import ResultBox from "./ResultBox.jsx";
import VerificationDetails from "./VerificationDetails.jsx";

export default function VerifyResults({ hash }) {
  const { state, verifyByHash } = useVerification();

  const hasVerified = useRef(false);

  useEffect(() => {
    // reset guard when hash changes
    hasVerified.current = false;
  }, [hash]);

  useEffect(() => {
    if (!hash) return;
    if (hasVerified.current) return;
    hasVerified.current = true;
    console.debug("VerifyResults: starting verifyByHash", { hash });
    verifyByHash(hash).catch((err) => {
      console.error("VerifyResults: verifyByHash error", err);
    });
    // only run when `hash` or verifyByHash changes
  }, [hash, verifyByHash]);

  if (!hash) return null;
  if (state.status === "loading") return <LoadingBox label="Verifying certificate..." />;
  if (state.status === "error") {
    // If server reports not found, show a friendly NOT_FOUND result card
    if (state.error === 'Certificate not found') {
      return <VerificationDetails data={{ status: 'NOT_FOUND', hash }} />;
    }
    return <ResultBox title="Verification failed" message={state.error} tone="error" />;
  }
  return <VerificationDetails data={state.data?.certificate} />;
}
