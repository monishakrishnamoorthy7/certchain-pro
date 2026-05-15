import { getExpectedNetwork } from "../config/networks.js";

export function getEthereum() {
  if (typeof window === "undefined") return null;
  return window.ethereum || null;
}

export async function requestAccounts() {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask not detected");
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  return accounts;
}

export async function getChainId() {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask not detected");
  const chainIdHex = await ethereum.request({ method: "eth_chainId" });
  return Number(chainIdHex);
}

export function isExpectedChain(chainId) {
  const expected = getExpectedNetwork();
  return Number(chainId) === Number(expected.chainId);
}

export function formatAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function switchToExpectedChain() {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask not detected");
  const expected = getExpectedNetwork();

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${expected.chainId.toString(16)}` }]
    });
  } catch (error) {
    if (error.code === 4902 && expected.rpcUrl) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${expected.chainId.toString(16)}`,
            chainName: expected.name,
            rpcUrls: [expected.rpcUrl],
            nativeCurrency: expected.nativeCurrency
          }
        ]
      });
      return;
    }
    throw error;
  }
}
