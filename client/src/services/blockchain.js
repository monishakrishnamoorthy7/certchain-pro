import * as ethers from "ethers";
import { CONTRACT_ABI } from "../config/contract.js";
import { getExpectedNetwork, getNetworkByChainId } from "../config/networks.js";
import addresses from "../config/addresses.json";
import { getEthereum, getChainId } from "./wallet.js";
import { ROLES } from "../config/roles.js";

// Module-level contract instance (initialized once)
let contract = null;

// Export the active contract address. Prefer explicit mapping from addresses.json
// (localhost -> ProductionCertificate) and fall back to the network config.
export const CONTRACT_ADDRESS =
  (addresses && addresses.localhost && addresses.localhost.ProductionCertificate) ||
  getExpectedNetwork().contractAddress || "";

export function getProvider() {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("MetaMask not detected");
  }
  return new ethers.BrowserProvider(ethereum);
}

export async function validateNetwork() {
  const expected = getExpectedNetwork();
  const chainId = await getChainId();
  if (Number(chainId) !== Number(expected.chainId)) {
    throw new Error(`Wrong network. Please switch to ${expected.name}.`);
  }
  return { chainId, expected };
}

export async function getSigner() {
  const provider = getProvider();
  await validateNetwork();
  const signer = await provider.getSigner();
  const address = await signer.getAddress().catch(() => null);
  if (!address) {
    throw new Error("Wallet not connected");
  }
  return signer;
}

export async function getContract() {
  // Initialize a single contract instance and reuse it.
  if (contract) return contract;

  // Prefer the network matching the user's current chainId
  const chainId = await getChainId().catch(() => null);
  // Use the single active CONTRACT_ADDRESS only
  const contractAddress = CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error(
      '[blockchain] Missing active CONTRACT_ADDRESS',
      { chainId, addresses }
    );
    throw new Error("Missing contract address");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  // Create a browser provider directly and get signer without enforcing network validation here.
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Create and cache the contract instance
  contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
  return contract;
}

// Expose role constants from shared ROLES map
export const SUPER_ADMIN_ROLE = ROLES.SUPER_ADMIN_ROLE;
export const UNIVERSITY_ADMIN_ROLE = ROLES.UNIVERSITY_ADMIN_ROLE;
export const DEPARTMENT_ADMIN_ROLE = ROLES.DEPARTMENT_ADMIN_ROLE;

export async function getRolesForAddress(address) {
  if (!address) return null;
  // Resolve contract address based on current chain if possible
  // Always use the single active CONTRACT_ADDRESS
  const contractAddress = CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error('[blockchain] getRolesForAddress: Missing active CONTRACT_ADDRESS');
    return null;
  }
  // Prefer using an initialized contract if available (lazy-init), otherwise create a read-only contract.
  const provider = getProvider();
  const readOnlyContract = contract ? contract : new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
  try {
    const isSuper = await readOnlyContract.hasRole(SUPER_ADMIN_ROLE, address).catch(() => false);
    const isUniversity = await readOnlyContract.hasRole(UNIVERSITY_ADMIN_ROLE, address).catch(() => false);
    const isDept = await readOnlyContract.hasRole(DEPARTMENT_ADMIN_ROLE, address).catch(() => false);
    return {
      isSuper,
      isUniversity,
      isDept,
      canAdd: isUniversity || isSuper,
      canRevoke: isUniversity || isSuper
    };
  } catch (err) {
    console.error('[blockchain] failed to read roles', err && err.message ? err.message : err);
    return null;
  }
}

export async function grantRole(roleHash, address) {
  // Ensure contract is initialized (lazy init)
  const contract = await getContract();
  const tx = await contract.grantRole(roleHash, address);
  await tx.wait();
  return tx;
}

export async function revokeRole(roleHash, address) {
  const contract = await getContract();
  const tx = await contract.revokeRole(roleHash, address);
  await tx.wait();
  return tx;
}

export function subscribeToRoleEvents(onEvent) {
  const expected = getExpectedNetwork();
  if (!CONTRACT_ADDRESS) return () => {};
  // Use the contract instance to subscribe to events. BrowserProvider
  // does not accept contract filter objects directly which causes
  // "unknown ProviderEvent" errors in ethers v6.
  const provider = getProvider();
  const readOnlyContract = contract ? contract : new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  const grantedFilter = readOnlyContract.filters.RoleGranted();
  const revokedFilter = readOnlyContract.filters.RoleRevoked();

  const grantedHandler = (role, account, sender, event) => {
    onEvent({ type: 'RoleGranted', role, account, sender, txHash: event.transactionHash });
  };
  const revokedHandler = (role, account, sender, event) => {
    onEvent({ type: 'RoleRevoked', role, account, sender, txHash: event.transactionHash });
  };

  // Attach handlers to the contract instance which supports filters
  // and will work correctly with the browser provider.
  readOnlyContract.on(grantedFilter, grantedHandler);
  readOnlyContract.on(revokedFilter, revokedHandler);

  return () => {
    readOnlyContract.off(grantedFilter, grantedHandler);
    readOnlyContract.off(revokedFilter, revokedHandler);
  };
}

function normalizeRpcError(error) {
  if (!error) return "Transaction failed";
  if (error.code === 4001) return "Transaction rejected by user";
  if (error.code === "ACTION_REJECTED") return "Transaction rejected by user";
  return error.shortMessage || error.message || "Transaction failed";
}

export async function addCertificate(hash, studentName, course, issuedDate) {
  try {
    const contract = await getContract();
    const tx = await contract.addCertificate(hash, studentName, course, issuedDate);
    const receipt = await tx.wait();
    return { txHash: tx.hash, receipt };
  } catch (error) {
    throw new Error(normalizeRpcError(error));
  }
}

export async function revokeCertificate(hash) {
  try {
    const contract = await getContract();
    const tx = await contract.revokeCertificate(hash);
    const receipt = await tx.wait();
    return { txHash: tx.hash, receipt };
  } catch (error) {
    throw new Error(normalizeRpcError(error));
  }
}
