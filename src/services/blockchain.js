const { ethers } = require('ethers');
require('dotenv').config();

// Force Ganache / local usage by preferring the generic RPC_URL environment
// variable. Allow legacy GANACHE_RPC_URL for backward compatibility.
const NETWORK = (process.env.NETWORK || 'ganache').toLowerCase();
const RPC_URL = process.env.RPC_URL || process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545';
const CHAIN_ID = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : null;

// Resolve contract address: prefer explicit env var CONTRACT_ADDR or CONTRACT_ADDRESS
function resolveContractAddress() {
  if (process.env.CONTRACT_ADDR) return process.env.CONTRACT_ADDR;
  if (process.env.CONTRACT_ADDRESS) return process.env.CONTRACT_ADDRESS;
  try {
    const addresses = require('../../client/src/config/addresses.json');
    if (addresses && addresses.local) {
      const entry = addresses.local;
      if (typeof entry === 'string') return entry;
      if (entry && entry.ProductionCertificate) return entry.ProductionCertificate;
    }
  } catch (err) {
    // ignore if file missing
  }
  // Default Ganache contract address used in local deployments
  return process.env.CONTRACT_ADDR || process.env.CONTRACT_ADDRESS || '0x3C844D346384B66903917cc3eE5eb14b7943c553';
}

const GANACHE_URL = RPC_URL;
const CONTRACT_ADDR = resolveContractAddress();

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'string', name: '_hash',        type: 'string'  },
      { internalType: 'string', name: '_studentName', type: 'string'  },
      { internalType: 'string', name: '_course',      type: 'string'  },
      { internalType: 'uint256',name: '_issuedDate',  type: 'uint256' },
    ],
    name: 'addCertificate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: '_hash', type: 'string' }],
    name: 'verifyCertificate',
    outputs: [
      {
        components: [
          { internalType: 'string',  name: 'studentName', type: 'string'  },
          { internalType: 'string',  name: 'course',      type: 'string'  },
          { internalType: 'uint256', name: 'issuedDate',  type: 'uint256' },
          { internalType: 'bool',    name: 'isValid',     type: 'bool'    },
        ],
        internalType: 'struct ProductionCertificate.Certificate',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: '_hash', type: 'string' }],
    name: 'revokeCertificate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: '', type: 'string' }],
    name: 'certificateExists',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'string', name: 'hash', type: 'string' },
      { indexed: false, internalType: 'string', name: 'studentName', type: 'string' },
      { indexed: false, internalType: 'string', name: 'course', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'issuedDate', type: 'uint256' },
    ],
    name: 'CertificateAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'string', name: 'hash', type: 'string' }
    ],
    name: 'CertificateRevoked',
    type: 'event',
  }
];

const provider = CHAIN_ID ? new ethers.JsonRpcProvider(GANACHE_URL, CHAIN_ID) : new ethers.JsonRpcProvider(GANACHE_URL);
const contract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);

module.exports = {
  contract,
  provider,
  ethers,
  CONTRACT_ADDR,
  CONTRACT_ABI,
  network: NETWORK,
  rpcUrl: GANACHE_URL,
  chainId: CHAIN_ID
};
