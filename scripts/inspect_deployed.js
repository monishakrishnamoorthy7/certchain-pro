require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  const rpc = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(rpc);
  const addr = process.env.CONTRACT_ADDRESS;

  console.log('Inspecting contract at:', addr);
  const code = await provider.getCode(addr);
  if (code === '0x') {
    console.log('ERROR: No code at address');
    process.exit(1);
  }
  console.log('✓ Contract code present, bytecode length:', code.length);

  // Try calling verifyCertificate with minimal ABI
  const abi = [
    {
      inputs: [{ internalType: 'string', name: '_hash', type: 'string' }],
      name: 'verifyCertificate',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const contract = new ethers.Contract(addr, abi, provider);
  const hash = 'test123';
  try {
    const result = await contract.verifyCertificate(hash);
    console.log('✓ verifyCertificate returned:', result);
  } catch (err) {
    console.error('✗ Error calling verifyCertificate:');
    console.error('  Message:', err.message);
    if (err.data) console.error('  Data:', err.data);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
