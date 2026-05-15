/**
 * Blockchain Configuration
 * Handles RPC provider and contract setup for different networks
 */

const { ethers } = require("ethers");
const { ENHANCED_CONTRACT_ABI } = require("./contractABI");
require("dotenv").config();

const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL || "http://127.0.0.1:7545";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

/**
 * Initialize blockchain provider and wallet
 * @returns {Object} Provider, wallet, and contract instances
 */
function initializeBlockchain() {
    // Validate environment variables
    if (!PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY is not defined in .env file");
    }

    if (!CONTRACT_ADDRESS) {
        throw new Error("CONTRACT_ADDRESS is not defined in .env file");
    }

    // Create provider (read-only connection)
    const provider = new ethers.JsonRpcProvider(GANACHE_RPC_URL);

    // Create wallet (signer) for transactions
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Create contract instance with signer for write operations using enhanced ABI
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ENHANCED_CONTRACT_ABI, wallet);

    return {
        provider,
        wallet,
        contract,
        contractAddress: CONTRACT_ADDRESS,
        ganacheUrl: GANACHE_RPC_URL,
    };
}

module.exports = {
    initializeBlockchain,
    ENHANCED_CONTRACT_ABI,
    GANACHE_RPC_URL,
    CONTRACT_ADDRESS,
};
