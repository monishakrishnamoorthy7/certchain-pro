import addresses from './addresses.json';

const networks = {
  local: {
    chainId: 1337,
    name: "Ganache",
    rpcUrl: import.meta.env.VITE_RPC_LOCAL || "http://127.0.0.1:7545",
    contractAddress: (addresses.local && addresses.local.ProductionCertificate) || "",
    explorerBaseUrl: null,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: import.meta.env.VITE_RPC_SEPOLIA || import.meta.env.VITE_ALCHEMY_SEPOLIA || "",
    contractAddress: (addresses.sepolia && addresses.sepolia.ProductionCertificate) || "",
    explorerBaseUrl: "https://sepolia.etherscan.io",
    nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 }
  }
};

export const DEFAULT_NETWORK_KEY = import.meta.env.VITE_DEFAULT_NETWORK || "local";

export function getExpectedNetwork() {
  return networks[DEFAULT_NETWORK_KEY] || networks.local;
}

export function getNetworkByChainId(chainId) {
  return Object.values(networks).find((network) => network.chainId === Number(chainId));
}

export function getAllNetworks() {
  return networks;
}
