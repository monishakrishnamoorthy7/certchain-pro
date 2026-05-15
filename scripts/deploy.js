/**
 * Smart Contract Deployment Script
 * Deploy SimpleCertificateVerification contract to Ganache or Sepolia
 * 
 * Usage:
 *   npx hardhat run scripts/deploy.js --network ganache
 *   npx hardhat run scripts/deploy.js --network sepolia
 */

const hre = require("hardhat");
const { writeFileSync, mkdirSync, existsSync } = require("fs");
const path = require("path");
require("dotenv").config();

const { ethers, artifacts } = hre;

async function main() {
    console.log("🚀 Starting contract deployment...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`📝 Deploying with account: ${deployer.address}`);

    // Get balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH\n`);

    // Deploy contract (ethers v6 compatible)
    console.log("⏳ Deploying ProductionCertificate contract...");
    const ProductionCertificate = await ethers.getContractFactory("ProductionCertificate");
    const contract = await ProductionCertificate.deploy();

    // get deployment transaction and log hash
    const deploymentTx = contract.deploymentTransaction();
    if (deploymentTx && deploymentTx.hash) console.log('🧾 Transaction Hash:', deploymentTx.hash);

    // wait for on-chain deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    // Wait for deployment receipt (1 confirmation)
    const receipt = await deploymentTx.wait(1);

    console.log("✅ Contract deployed successfully!");
    console.log(`\n🏷️ Contract Address: ${contractAddress}`);
    console.log(`👤 Owner Address: ${deployer.address}`);
    console.log(`📦 Transaction Hash: ${receipt.transactionHash || receipt.transactionHash}`);
        const { execSync } = require('child_process');

    // Export artifacts for frontend (ABI + network addresses)
    console.log("\n📦 Exporting ABI and addresses for frontend...");
    const clientAbiDir = path.join(__dirname, "..", "client", "src", "config", "abi");
    const clientAddressesPath = path.join(__dirname, "..", "client", "src", "config", "addresses.json");
    if (!existsSync(clientAbiDir)) mkdirSync(clientAbiDir, { recursive: true });

    // Read artifact using Hardhat artifacts helper
    const artifact = await hre.artifacts.readArtifact("ProductionCertificate");
    const abiOutPath = path.join(clientAbiDir, "ProductionCertificate.json");
    writeFileSync(abiOutPath, JSON.stringify(artifact, null, 2));

    // Update addresses file (preserve existing if present)
    let addresses = {};
    try {
        addresses = require(path.join(__dirname, "..", "client", "src", "config", "addresses.json"));
    } catch (err) {
        addresses = {};
    }
    const networkKey = hre.network.name || "local";
    addresses[networkKey] = contractAddress;
    writeFileSync(clientAddressesPath, JSON.stringify(addresses, null, 2));
    console.log(`✅ Wrote ABI to ${abiOutPath}`);
    console.log(`✅ Updated frontend addresses at ${clientAddressesPath}`);

        // Write deployment manifest
        try {
            const manifestDir = path.join(__dirname, '..', 'deployments');
            if (!existsSync(manifestDir)) mkdirSync(manifestDir, { recursive: true });
            const manifestPath = path.join(manifestDir, `${networkKey}.json`);
            const commit = (function(){
                try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch(e){ return null; }
            })();
            const manifest = {
                network: networkKey,
                contract: 'ProductionCertificate',
                address: contractAddress,
                deployer: deployer.address,
                txHash: receipt.transactionHash || receipt.transactionHash,
                timestamp: new Date().toISOString(),
                gitCommit: commit
            };
            writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
            console.log(`✅ Wrote deployment manifest to ${manifestPath}`);
        } catch (err) {
            console.warn('Failed to write deployment manifest:', err.message || err);
        }

    // Optionally verify on Etherscan if API key present and network supports it
    if (process.env.ETHERSCAN_API_KEY && hre.network.name !== "localhost" && hre.network.name !== "ganache") {
        try {
            console.log('\n🔍 Attempting Etherscan verification...');
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: []
            });
            console.log('✅ Contract verified on Etherscan');
        } catch (err) {
            console.warn('⚠️ Etherscan verification failed:', err.message || err);
        }
    }

    // Display configuration
    console.log("\n🔧 Deployment Summary:");
    console.log(`   Network: ${hre.network.name}`);
    console.log(`   Contract: ProductionCertificate`);
    console.log(`   Address: ${contractAddress}`);
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Tx Hash: ${receipt.transactionHash || receipt.transactionHash}`);

    console.log("\n✨ Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
