# Sepolia Testnet Deployment Guide

This guide explains how to deploy the Certificate Verification System to the Ethereum Sepolia testnet.

## Prerequisites

1. **Ethereum Account**
   - Create or use an existing account
   - Install MetaMask or use a hardware wallet

2. **Testnet ETH**
   - Get free Sepolia ETH from: https://sepoliafaucet.com/
   - You need at least 0.1 ETH for deployment

3. **Infura Account**
   - Register at: https://infura.io/
   - Create a new API key for Sepolia
   - Copy your API key

4. **Etherscan Account** (Optional, for verification)
   - Register at: https://etherscan.io/
   - Get your API key from Settings

## Step 1: Update Environment Variables

Create or update your `.env` file:

```env
# Ganache (Local Development)
GANACHE_RPC_URL=http://127.0.0.1:7545
PRIVATE_KEY=your_ganache_private_key

# Sepolia Testnet
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_key

# Server
PORT=3000
NODE_ENV=development
CONTRACT_ADDRESS=your_deployed_contract_address
```

⚠️ **Security Warning:**
- **NEVER** commit your private keys
- Keep `.env` file in `.gitignore`
- Use a separate account for testnet (never use mainnet keys)
- Ensure proper file permissions on `.env`

## Step 2: Get Testnet ETH

1. Go to https://sepoliafaucet.com/
2. Enter your Ethereum address
3. Confirm the transaction
4. Wait for ETH to arrive (usually within 2 minutes)

## Step 3: Install Dependencies

```bash
npm install
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

## Step 4: Deploy Smart Contract

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Example output:
```
🚀 Starting contract deployment...

📍 Deploying with account: 0x1234567890123456789012345678901234567890
💰 Account balance: 0.5 ETH

⏳ Deploying CertificateVerification contract...
✅ Contract deployed successfully!

📋 Contract Address: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
👤 Owner Address: 0x1234567890123456789012345678901234567890

🔧 Update your .env file with:
CONTRACT_ADDRESS=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

## Step 5: Update Configuration

Copy the contract address from deployment output and update `.env`:

```env
CONTRACT_ADDRESS=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

## Step 6: Start Backend

```bash
npm run dev
```

## Step 7: Verify Deployment

### Via Block Explorer

1. Go to: https://sepolia.etherscan.io/
2. Search for your contract address
3. Verify all transactions

### Via API

```bash
curl http://localhost:3000/api/status
```

Expected response:
```json
{
  "success": true,
  "blockchain": {
    "connected": true,
    "contractAddress": "0xabcd...",
    "owner": "0x1234...",
    "certificateCount": "0"
  }
}
```

## Verify Contract on Etherscan

### Automatic Verification (Hardhat)

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

### Manual Verification

1. Go to: https://sepolia.etherscan.io/
2. Find your contract
3. Click "Contract"
4. Click "Verify and Publish"
5. Select Solidity as language
6. Paste contract code from `contracts/CertificateVerification.sol`
7. Set compiler to `0.8.0`
8. Submit

## Update Frontend

Update the API endpoints in `index.html` if needed:

```javascript
const API_BASE_URL = "http://localhost:3000"; // for local testing
// or
const API_BASE_URL = "https://your-deployed-backend.com"; // for production
```

## Production Deployment Steps

### Backend (Heroku)

1. Create `Procfile`:
   ```
   web: npm start
   ```

2. Set environment variables in Heroku dashboard

3. Deploy:
   ```bash
   heroku create
   heroku config:set SEPOLIA_RPC_URL=your_url
   heroku config:set SEPOLIA_PRIVATE_KEY=your_key
   git push heroku main
   ```

### Frontend (Vercel)

1. Push code to GitHub
2. Import repository to Vercel
3. Deploy automatically

## Gas Costs

Typical gas costs on Sepolia:
- **Deploy Contract**: ~500,000 gas (~0.01 ETH at 2 Gwei)
- **Add Certificate**: ~50,000 gas (~0.001 ETH)
- **Verify Certificate**: ~0 gas (read-only, no cost)

## Troubleshooting

### "Insufficient funds"
- Get more testnet ETH from faucet
- Check you're not on wrong network

### "Connection failed"
- Verify SEPOLIA_RPC_URL is correct
- Check Infura API key is active
- Ensure you have internet connection

### "Contract not found"
- Verify contract address is correct
- Check you're on Sepolia network
- Wait for block confirmation

### "Private key invalid"
- Ensure key starts with `0x`
- Key must be 64 hex characters (128 total with 0x)
- Check for trailing spaces

## Next Steps

1. Test uploads and verification on testnet
2. Review gas costs and optimize if needed
3. Get security audit before mainnet
4. Deploy to Ethereum mainnet

## Useful Links

- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Etherscan Sepolia**: https://sepolia.etherscan.io/
- **Infura Dashboard**: https://app.infura.io/
- **MetaMask Guide**: https://metamask.io/download/
- **Hardhat Docs**: https://hardhat.org/docs

## Additional Security Notes

For production mainnet deployment:
- ✅ Conduct security audit
- ✅ Use hardware wallet for private keys
- ✅ Set up monitoring and alerts
- ✅ Implement rate limiting on API
- ✅ Use HTTPS everywhere
- ✅ Add authentication to admin functions
- ✅ Keep code updated
- ✅ Use proper logging

---

Need help? Check the main README.md for more information.

