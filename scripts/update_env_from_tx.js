const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const rpc = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545';
  const txHash = process.argv[2];
  if (!txHash) {
    console.error('Usage: node update_env_from_tx.js <txHash>');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) {
    console.error('Transaction receipt not found for', txHash);
    process.exit(1);
  }

  const contractAddress = receipt.to;
  if (!contractAddress) {
    console.error('Could not determine contract address from tx receipt');
    process.exit(1);
  }

  // Write contract address to client addresses.json instead of .env
  const clientAddressesPath = path.join(__dirname, '..', 'client', 'src', 'config', 'addresses.json');
  const networkKey = (process.env.NETWORK || 'local').toLowerCase();
  let addresses = {};
  try { addresses = require(clientAddressesPath); } catch (e) { addresses = {}; }
  addresses[networkKey] = contractAddress;
  fs.writeFileSync(clientAddressesPath, JSON.stringify(addresses, null, 2), 'utf8');
  console.log('Updated client addresses.json with', networkKey, contractAddress);
}

main().catch(err => { console.error(err); process.exit(1); });
