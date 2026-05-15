require('dotenv').config();
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

async function main() {
  const rpc = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(rpc);

  // Compile
  const source = fs.readFileSync(path.join(__dirname, '..', 'contracts', 'SimpleCertificateVerification.sol'), 'utf8');
  const input = {
    language: 'Solidity',
    sources: {
      'SimpleCertificateVerification.sol': { content: source },
    },
    settings: {
      outputSelection: {
        '*': { '*': ['abi', 'evm.bytecode.object'] },
      },
    },
  };

  console.log('Compiling...');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors && output.errors.some(e => e.severity === 'error')) {
    console.error('Compile errors:', output.errors);
    process.exit(1);
  }

  const { abi, evm } = output.contracts['SimpleCertificateVerification.sol']['SimpleCertificateVerification'];
  const bytecode = evm.bytecode.object;

  // Deploy via raw transaction
  console.log('Deploying...');
  const pk = process.env.PRIVATE_KEY || '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
  const wallet = new ethers.Wallet(pk, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log('Deployer:', wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH');

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  const addr = await contract.getAddress ? await contract.getAddress() : contract.target || contract.address;
  console.log('✓ Contract deployed at:', addr);
  // Export ABI and address to frontend
  const networkKey = (process.env.NETWORK || 'local').toLowerCase();
  const clientAbiDir = path.join(__dirname, '..', 'client', 'src', 'config', 'abi');
  const clientAddressesPath = path.join(__dirname, '..', 'client', 'src', 'config', 'addresses.json');
  if (!fs.existsSync(clientAbiDir)) fs.mkdirSync(clientAbiDir, { recursive: true });
  try {
    const abiOut = path.join(clientAbiDir, 'SimpleCertificateVerification.json');
    fs.writeFileSync(abiOut, JSON.stringify({ abi }, null, 2));
    console.log('Wrote ABI to', abiOut);
  } catch (err) {
    console.warn('Failed to write ABI:', err.message || err);
  }
  let addresses = {};
  try { addresses = require(clientAddressesPath); } catch (e) { addresses = {}; }
  addresses[networkKey] = addr;
  fs.writeFileSync(clientAddressesPath, JSON.stringify(addresses, null, 2));
  console.log('Updated client addresses.json with', networkKey);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
