require('dotenv').config();
const fs      = require('fs');
const path    = require('path');
const solc    = require('solc');
const { ethers } = require('ethers');

async function main() {
  const rpc = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545';
  const pk  = process.env.PRIVATE_KEY;
  if (!pk) throw new Error('PRIVATE_KEY missing in .env');

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet   = new ethers.Wallet(pk, provider);
  console.log('Deployer:', wallet.address);

  // Read new contract
  const source = fs.readFileSync(path.join(__dirname, '..', 'contracts', 'ProductionCertificate.sol'), 'utf8');
  const input = {
    language: 'Solidity',
    sources: { 'ProductionCertificate.sol': { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'paris',
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } }
    },
  };

  console.log('Compiling ProductionCertificate.sol...');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors && output.errors.some(e => e.severity === 'error')) {
    console.error('Compile errors:', output.errors);
    process.exit(1);
  }

  const { abi, evm } = output.contracts['ProductionCertificate.sol']['ProductionCertificate'];
  const bytecode = evm.bytecode.object;
  console.log('Compiled OK');

  const factory  = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy({ gasLimit: 3000000 });
  await contract.waitForDeployment();
  const addr     = contract.target || (await contract.getAddress());
  console.log('Contract deployed at:', addr);
  // Export ABI and address to frontend instead of updating .env
  const networkKey = (process.env.NETWORK || 'local').toLowerCase();
  const clientAbiDir = path.join(__dirname, '..', 'client', 'src', 'config', 'abi');
  const clientAddressesPath = path.join(__dirname, '..', 'client', 'src', 'config', 'addresses.json');
  if (!fs.existsSync(clientAbiDir)) fs.mkdirSync(clientAbiDir, { recursive: true });
  try {
    const abiOut = path.join(clientAbiDir, 'ProductionCertificate.json');
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
