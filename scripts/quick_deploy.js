require('dotenv').config();
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

async function main() {
  const rpc = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(rpc);

  // Get first funded account from Ganache
  const accounts = await provider.listAccounts();
  if (!accounts || accounts.length === 0) {
    console.error('No accounts available from Ganache');
    process.exit(1);
  }
  const signer = accounts[0];
  const signerAddress = signer.address;
  const balance = await provider.getBalance(signerAddress);
  console.log('Deployer:', signerAddress);
  console.log('Balance:', ethers.formatEther(balance), 'ETH\n');

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
  if (!bytecode) {
    console.error('Empty bytecode');
    process.exit(1);
  }

  // Deploy
  console.log('Deploying...');
  const tx = await signer.sendTransaction({
    data: '0x' + bytecode,
    gasLimit: 6000000,
  });
  console.log('Tx hash:', tx.hash);

  const receipt = await tx.wait();
  const addr = receipt.contractAddress;
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

main().catch(e => { console.error(e); process.exit(1); });

