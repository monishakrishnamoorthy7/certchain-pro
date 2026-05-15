const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const rpc = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545';
  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    console.error('Missing PRIVATE_KEY in .env');
    process.exit(1);
  }

  const sourcePath = path.join(__dirname, '..', 'contracts', 'SimpleCertificateVerification.sol');
  const source = fs.readFileSync(sourcePath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'SimpleCertificateVerification.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object'],
        },
      },
    },
  };

  console.log('Compiling contract...');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors) {
    const fatal = output.errors.filter(e => e.severity === 'error');
    console.error('Compilation errors:');
    console.error(output.errors.map(e => e.formattedMessage).join('\n'));
    if (fatal.length) process.exit(1);
  }

  const contractOutput = output.contracts['SimpleCertificateVerification.sol']['SimpleCertificateVerification'];
  const abi = contractOutput.abi;
  const bytecode = contractOutput.evm.bytecode.object;

  if (!bytecode || bytecode.length === 0) {
    console.error('Empty bytecode; compilation failed.');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  let signer;
  if (pk && pk.length > 10) {
    signer = new ethers.Wallet(pk, provider);
    const bal = await provider.getBalance(signer.address);
    if (bal && BigInt(bal) > 0n) {
      console.log('Deploying using PRIVATE_KEY wallet:', signer.address);
    } else {
      console.log('PRIVATE_KEY wallet has zero balance — falling back to RPC account');
      const accounts = await provider.listAccounts();
      if (!accounts || accounts.length === 0) {
        console.error('No accounts available from RPC and PRIVATE_KEY has no funds');
        process.exit(1);
      }
      signer = provider.getSigner(accounts[0]);
      console.log('Deploying using RPC account:', accounts[0]);
    }
  } else {
    // Fall back to node-provided unlocked account (Ganache)
    const accounts = await provider.listAccounts();
    if (!accounts || accounts.length === 0) {
      console.error('No accounts available from RPC and no PRIVATE_KEY provided');
      process.exit(1);
    }
    signer = provider.getSigner(accounts[0]);
    console.log('Deploying using RPC account:', accounts[0]);
  }

  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  let contract;
  try {
    contract = await factory.deploy();
    await contract.waitForDeployment();
    console.log('Contract deployed at (factory):', contract.target || contract.address || contract);
  } catch (err) {
    console.warn('Factory deploy failed, attempting raw deployment via signer.sendTransaction()', err.message || err);
    // Raw deployment: send transaction with bytecode as data
    const deployTx = await signer.sendTransaction({ data: '0x' + bytecode, gasLimit: 6000000 });
    console.log('Raw deploy tx hash:', deployTx.hash);
    const receipt = await deployTx.wait();
    const deployedAddress = receipt.contractAddress;
    if (!deployedAddress) {
      console.error('Raw deployment failed, no contractAddress in receipt');
      process.exit(1);
    }
    // Create a minimal contract object to mimic factory output
    contract = { address: deployedAddress, target: deployedAddress };
    console.log('Contract deployed at (raw):', deployedAddress);
  }

  // Update .env
  // Export ABI and address for frontend instead of updating .env
  const networkKey = (process.env.NETWORK || 'local').toLowerCase();
  const clientAbiDir = path.join(__dirname, '..', 'client', 'src', 'config', 'abi');
  const clientAddressesPath = path.join(__dirname, '..', 'client', 'src', 'config', 'addresses.json');
  if (!fs.existsSync(clientAbiDir)) fs.mkdirSync(clientAbiDir, { recursive: true });
  // Write ABI if available
  try {
    if (abi) {
      const abiOut = path.join(clientAbiDir, 'SimpleCertificateVerification.json');
      fs.writeFileSync(abiOut, JSON.stringify({ abi }, null, 2), 'utf8');
      console.log('Wrote ABI to', abiOut);
    }
  } catch (err) {
    console.warn('Failed to write ABI artifact:', err.message || err);
  }

  // Update addresses.json
  let addresses = {};
  try { addresses = require(clientAddressesPath); } catch (e) { addresses = {}; }
  addresses[networkKey] = contract.target || contract.address;
  fs.writeFileSync(clientAddressesPath, JSON.stringify(addresses, null, 2), 'utf8');
  console.log('Updated client addresses.json with', networkKey);
}

main().catch(err => { console.error(err); process.exit(1); });
