import { getExpectedNetwork, getNetworkByChainId } from "../config/networks.js";

export function getTxLink(txHash, chainId) {
  if (!txHash) return null;
  const network = chainId ? getNetworkByChainId(chainId) : getExpectedNetwork();
  if (!network?.explorerBaseUrl) return null;
  return `${network.explorerBaseUrl}/tx/${txHash}`;
}
