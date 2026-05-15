import { apiFetch } from "./api.js";
import { getProvider } from "./blockchain.js";

const TOKEN_KEY = "auth_token";
const MESSAGE_PREFIX = "Login to CertChain:";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    return null;
  }
}

export async function requestNonce(address) {
  const data = await apiFetch("/auth/nonce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address })
  });
  return data.data;
}

export async function verifySignature(address, signature) {
  const data = await apiFetch("/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, signature })
  });
  return data.data;
}

export async function loginWithWallet() {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const { nonce } = await requestNonce(address);
  const message = `${MESSAGE_PREFIX} ${nonce}`;
  const signature = await signer.signMessage(message);
  const { token } = await verifySignature(address, signature);
  setToken(token);
  return { address, token };
}

export async function logout() {
  const token = getToken();
  if (token) {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      // Ignore network errors on logout
    }
  }
  clearToken();
}

export function isTokenValid(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;
  return decoded.exp * 1000 > Date.now();
}
