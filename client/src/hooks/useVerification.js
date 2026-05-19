import { useState, useCallback } from "react";
import { verifyByFile, verifyByHash } from "../services/verification.js";

export default function useVerification() {
  const [state, setState] = useState({
    status: "idle",
    data: null,
    error: null
  });

  const runVerifyByHash = useCallback(async (hash) => {
    setState({
      status: "loading",
      data: null,
      error: null
    });

    try {
      const response = await verifyByHash(hash);

      const certificate = response?.certificate || response;

      setState({
        status: "success",
        data: certificate,
        error: null
      });

      return certificate;
    } catch (error) {
      setState({
        status: "error",
        data: null,
        error: error.message || "Verification failed"
      });

      throw error;
    }
  }, []);

  const runVerifyByFile = useCallback(async (file) => {
    setState({
      status: "loading",
      data: null,
      error: null
    });

    try {
      const response = await verifyByFile(file);

      const certificate = response?.certificate || response;

      setState({
        status: "success",
        data: certificate,
        error: null
      });

      return certificate;
    } catch (error) {
      setState({
        status: "error",
        data: null,
        error: error.message || "Verification failed"
      });

      throw error;
    }
  }, []);

  const reset = () => {
    setState({
      status: "idle",
      data: null,
      error: null
    });
  };

  return {
    state,
    verifyByHash: runVerifyByHash,
    verifyByFile: runVerifyByFile,
    reset
  };
}