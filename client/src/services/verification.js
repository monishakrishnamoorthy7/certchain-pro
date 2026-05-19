import { apiFetch } from "./api.js";

export async function verifyByHash(hash) {
  if (!hash) throw new Error("Hash required");

  const response = await apiFetch(`/certificate/${hash}`);

  console.log("VERIFY HASH RESPONSE:", response);

  return response.certificate;
}

export async function verifyByFile(file) {
  if (!file) throw new Error("File required");

  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/certificate/verify", {
    method: "POST",
    body: formData
  });

  console.log("VERIFY FILE RESPONSE:", response);

  return response.certificate;
}