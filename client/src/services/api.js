const _rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const API_BASE = _rawApiUrl.replace(/\/+$/, "") + "/api";

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const message = data.message || "Request failed";
    throw new Error(message);
  }
  return data;
}

export function apiUpload(path, formData, { headers = {}, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}${path}`, true);

    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const progress = Math.round((event.loaded / event.total) * 100);
      if (onProgress) onProgress(progress);
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300 && data.success !== false) {
          resolve(data);
          return;
        }
        reject(new Error(data.message || "Upload failed"));
      } catch (error) {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });
}
