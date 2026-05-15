import { apiFetch } from "./api.js";

export async function verifyByHash(hash) {
  if (!hash) throw new Error("Hash required");
  const data = await apiFetch(`/certificate/${hash}`);
  return data.data;
}

export async function verifyByFile(file) {
  if (!file) throw new Error("File required");
  const formData = new FormData();
  formData.append("file", file);
  const data = await apiFetch("/certificate/verify", {
    method: "POST",
    body: formData
  });
  return data.data;
}
