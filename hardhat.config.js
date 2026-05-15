/**
 * Hardhat Configuration (CommonJS)
 */

require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';

module.exports = {
    solidity: {
        version: '0.8.20',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        ganache: {
            url: process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545',
            accounts: [PRIVATE_KEY],
            chainId: 1337,
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || '',
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        },
        localhost: {
            url: 'http://127.0.0.1:7545',
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || '',
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts',
    },
};
