import { apiFetch, apiUpload } from "../services/api.js";
import { addCertificate, revokeCertificate } from "../services/blockchain.js";
import { getToken } from "../services/auth.js";

function getAuthHeaders() {
  const token = getToken();
  if (!token) {
    throw new Error("Admin login required");
  }
  return { Authorization: `Bearer ${token}` };
}

async function prepareUpload({ file, studentName, course, onProgress }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("studentName", studentName);
  formData.append("course", course);

  const data = await apiUpload("/certificate/prepare", formData, {
    headers: getAuthHeaders(),
    onProgress
  });

  return data.data;
}

async function confirmUpload({ hash, txHash, blockNumber }) {
  const data = await apiFetch("/certificate/confirm", {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ hash, txHash, blockNumber })
  });

  return data.data;
}

async function confirmRevoke({ hash, txHash, blockNumber }) {
  const data = await apiFetch("/certificate/revoke-confirm", {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ hash, txHash, blockNumber })
  });

  return data.data;
}

export default function useCertificateActions() {
  const uploadCertificate = async ({ file, studentName, course, onProgress }) => {
    if (!file) throw new Error("Select a file to upload");
    if (!studentName || !course) throw new Error("Student name and course required");
    try {
      const prepared = await prepareUpload({ file, studentName, course, onProgress });
      if (!prepared || !prepared.hash) {
        throw new Error(prepared?.message || 'Prepare failed');
      }
      const { hash, issuedTimestamp } = prepared;

      // Perform on-chain write. Capture txHash/receipt so that if the
      // backend confirm endpoint fails for non-critical reasons we still
      // surface a successful on-chain result to the user.
      let txHash = null;
      let receipt = null;
      try {
        const txResult = await addCertificate(hash, studentName, course, issuedTimestamp);
        txHash = txResult.txHash;
        receipt = txResult.receipt;

        const confirmed = await confirmUpload({ hash, txHash, blockNumber: receipt.blockNumber });
        return { hash, txHash, receipt, confirmed };
      } catch (err) {
        // If transaction was broadcast and we have a txHash, treat this as
        // a partial success: on-chain succeeded but backend post-processing
        // failed. Return success with a warning rather than throwing a generic error.
        if (txHash) {
          return { hash, txHash, receipt, confirmed: { success: true, txHash, warning: 'Audit sync pending' } };
        }
        throw err;
      }
    } catch (err) {
      // Provide clearer error messages to the UI
      const message = err && err.message ? err.message : 'Upload failed';
      throw new Error(message === 'Certificate already prepared' ? 'Certificate already exists' : message);
    }
  };

  const revokeCertificateOnChain = async ({ hash }) => {
    if (!hash) throw new Error("Certificate hash required");

    let txHash = null;
    let receipt = null;
    try {
      const txResult = await revokeCertificate(hash);
      txHash = txResult.txHash;
      receipt = txResult.receipt;

      const confirmed = await confirmRevoke({ hash, txHash, blockNumber: receipt.blockNumber });
      return { hash, txHash, receipt, confirmed };
    } catch (err) {
      if (txHash) {
        return { hash, txHash, receipt, confirmed: { success: true, txHash, warning: 'Audit sync pending' } };
      }
      throw err;
    }
  };

  return { uploadCertificate, revokeCertificateOnChain };
}
