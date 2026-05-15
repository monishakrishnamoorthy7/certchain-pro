import artifact from './abi/ProductionCertificate.json';

export const CONTRACT_ABI = (artifact && artifact.abi) ? artifact.abi : [];
