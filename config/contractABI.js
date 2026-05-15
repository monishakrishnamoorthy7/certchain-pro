/**
 * Simplified Certificate Verification ABI
 * Contains ONLY the two core functions:
 * - addCertificate(string _hash): Store a certificate hash
 * - verifyCertificate(string _hash): Check if hash exists
 */
const ENHANCED_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "_hash", type: "string" }
    ],
    name: "addCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "_hash", type: "string" }
    ],
    name: "verifyCertificate",
    outputs: [
      { internalType: "bool", name: "", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

module.exports = { ENHANCED_CONTRACT_ABI };