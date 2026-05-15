require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  const rpc = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545';
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) {
    console.error('CONTRACT_ADDRESS not set in .env');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  console.log('Using RPC:', rpc);
  console.log('Inspecting contract at:', address);

  const code = await provider.getCode(address);
  if (!code || code === '0x') {
    console.log('No contract code at address (empty).');
  } else {
    console.log('Bytecode length:', code.length, 'chars');
    console.log('Bytecode starts with:', code.slice(0, 10));
    console.log('Bytecode sample (last 10 chars):', code.slice(-10));
  }

  // Minimal ABI used by backend
  const abi = [
    {
      inputs: [{ internalType: 'string', name: '_hash', type: 'string' }],
      name: 'addCertificate',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'string', name: '_hash', type: 'string' }],
      name: 'verifyCertificate',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const contract = new ethers.Contract(address, abi, provider);

  const testHash = 'abc123';
  try {
    const res = await contract.verifyCertificate(testHash);
    console.log('verifyCertificate returned:', res);
  } catch (err) {
    console.error('verifyCertificate call failed:', err && err.message ? err.message : err);
    if (err && err.info) console.error('Error info:', err.info);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
