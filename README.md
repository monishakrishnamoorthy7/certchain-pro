# 🔐 Blockchain-Based Certificate Verification System

A production-ready, full-stack application for storing and verifying document authenticity using blockchain technology. Built with Solidity smart contracts, Node.js/Express backend, and modern HTML/CSS/JavaScript frontend.

## ✨ Features

✅ **Blockchain Integration** - Store certificate hashes on Ethereum blockchain
✅ **Smart Contract** - Secure Solidity contract with owner-only access control
✅ **File Upload** - Multer-based file handling with SHA-256 hashing
✅ **Verification API** - RESTful endpoints for upload and verification
✅ **Modern UI** - Responsive, user-friendly interface with real-time feedback
✅ **Error Handling** - Comprehensive error handling and validation
✅ **Environment Variables** - Secure configuration management with .env
✅ **Production Ready** - Follows best practices and coding standards

## 🛠 Tech Stack

### Blockchain
- **Solidity** ^0.8.0 - Smart contracts
- **Ethereum** - Blockchain network
- **Ganache** - Local blockchain for development

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Ethers.js** - Blockchain interaction
- **Multer** - File upload handling
- **crypto** - SHA-256 hashing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with gradients and animations
- **JavaScript (Vanilla)** - Client-side logic
- **Fetch API** - HTTP requests

## 📁 Project Structure

```
certificate-project/
├── contracts/
│   └── CertificateVerification.sol    # Smart contract
├── config/
│   └── blockchain.js                  # Blockchain configuration & setup
├── utils/
│   ├── hashGenerator.js               # SHA-256 hashing utilities
│   └── errorHandler.js                # Centralized error handling
├── uploads/                           # Temporary uploaded files storage
├── server.js                          # Express server & API endpoints
├── index.html                         # Frontend UI
├── package.json                       # Dependencies
├── .env.example                       # Environment variables template
└── README.md                          # This file
```

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Ganache CLI** - Local blockchain emulator
  ```bash
  npm install -g ganache-cli
  ```
- **Hardhat** or **Truffle** (optional, for contract compilation)
  ```bash
  npm install -g hardhat
  # or
  npm install -g truffle
  ```

### 1. Install Dependencies

```bash
npm install
```

This installs:
- express (web framework)
- multer (file uploads)
- ethers.js (blockchain interaction)
- cors (cross-origin requests)
- dotenv (environment variables)
- nodemon (development auto-reload)

### 2. Start Ganache Local Blockchain

```bash
ganache-cli
```

This starts a local blockchain on `http://127.0.0.1:7545` with:
- 10 test accounts
- 100 ETH per account
- Gas price: 2 Gwei
- Network ID: 5777

**Keep this terminal open!**

### 3. Deploy Smart Contract

The smart contract is already provided in `contracts/CertificateVerification.sol`. Deploy it using:

#### Option A: Using Hardhat (Recommended)

```bash
# Initialize Hardhat (if not already done)
npx hardhat init

# Compile the contract
npx hardhat compile

# Deploy to Ganache
npx hardhat run scripts/deploy.js --network ganache
```

#### Option B: Using Remixe IDE (Easy, No Setup)

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create a new file and paste the content of `contracts/CertificateVerification.sol`
3. Compile (Ctrl+S)
4. Connect to Ganache via MetaMask or use "Inject Web3"
5. Deploy the contract
6. Copy the contract address and ABI

#### Option C: Using web3.js Script

Create `deploy.js`:

```javascript
const { ethers } = require("ethers");
require("dotenv").config();

async function deploy() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const Contract = await ethers.getContractFactory("CertificateVerification", wallet);
    const contract = await Contract.deploy();
    await contract.deploymentTransaction().wait();
    
    console.log("Contract deployed at:", contract.address);
}

deploy().catch(console.error);
```

Run: `node deploy.js`

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Blockchain
GANACHE_RPC_URL=http://127.0.0.1:7545
PRIVATE_KEY=0x3a4068c12189ee2c212d3abb195b8b764941917fabeb13341df4a969cb44c476
CONTRACT_ADDRESS=0x92b6DB1de5f0A62400ed5a31D21Dd550400823d1

# Server
PORT=3000
NODE_ENV=development
```

⚠️ **IMPORTANT**: 
- Replace `CONTRACT_ADDRESS` with your deployed contract address
- `PRIVATE_KEY` is from Ganache's first account (already provided for testing)
- **NEVER commit .env to version control!**

### 5. Start the Server

```bash
# Production mode
npm start

# Development mode (with hot reload)
npm run dev
```

Expected output:
```
🚀 ============================================
   Certificate Verification System
============================================
📍 Server running on: http://localhost:3000
🌐 Frontend: http://localhost:3000/index.html
⛓️  Blockchain: http://127.0.0.1:7545
📋 Contract: 0x92b6DB1de5f0A62400ed5a31D21Dd550400823d1
============================================
```

### 6. Open in Browser

Navigate to: **http://localhost:3000**

## 📖 API Documentation

### 1. Health Check

```
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "blockchain": {
    "connected": true,
    "contractAddress": "0x92b6DB1de5f0A62400ed5a31D21Dd550400823d1"
  }
}
```

### 2. Get Contract Status

```
GET /api/status
```

**Response:**
```json
{
  "success": true,
  "blockchain": {
    "connected": true,
    "contractAddress": "0x92b6DB1de5f0A62400ed5a31D21Dd550400823d1",
    "owner": "0x...",
    "certificateCount": "5"
  }
}
```

## 📦 Deployment Notes

### Frontend (Vercel)
- Build command: `npm run build` inside the `client` folder.
- Output directory: `client/dist` (or adjust to your Vite build output). Configure Vercel to set `VITE_API_URL` to your backend URL.

### Backend (Render / Railway)
- Ensure environment variables from `.env.example` are configured in the platform dashboard.
- Use the `start` script (`node server.js`) and expose port `3000` or the platform-assigned port.

## 🖼 Screenshots
Include screenshots in `/docs/screenshots/` and reference them here for README previews.

## 📚 API Reference (selected)

- `GET /api/status` — Returns counts and blockchain status.
- `POST /api/certificate/prepare` — Upload cert file (admin) and persist pending record.
- `POST /api/certificate/confirm` — Confirm certificate with `hash` and `txHash` (admin).
- `POST /api/certificate/revoke-confirm` — Revoke certificate on-chain and persist.
- `POST /api/certificate/verify` — Verify by file upload (public).
- `GET  /api/certificate/:hash` — Public certificate verification payload (returns `certificate` object).

## 🔮 Future Improvements
- Add automated tests and CI pipeline.
- Add Sentry or similar error tracking for production.
- Add analytics and usage dashboards.
- Add email notifications for issued certificates.

---

If you want, I can generate screenshot placeholders and a short `docs/DEPLOY.md` for Vercel/Render steps.

### 3. Store Certificate

```
POST /api/upload
Content-Type: multipart/form-data

file: <binary file data>
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate stored on blockchain successfully",
  "data": {
    "fileName": "diploma.pdf",
    "fileSize": 245632,
    "hash": "a1b2c3d4e5f6...",
    "transactionHash": "0x7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f",
    "blockNumber": 5,
    "gasUsed": "123456"
  }
}
```

### 4. Verify Certificate (File Upload)

```
POST /api/verify
Content-Type: multipart/form-data

file: <binary file data>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileName": "diploma.pdf",
    "fileSize": 245632,
    "hash": "a1b2c3d4e5f6...",
    "isValid": true,
    "status": "✅ VALID CERTIFICATE"
  }
}
```

### 5. Verify Certificate by Hash

```
POST /api/verify-hash
Content-Type: application/json

{
  "hash": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hash": "a1b2c3d4e5f6...",
    "isValid": true,
    "status": "✅ VALID CERTIFICATE"
  }
}
```

## 🔐 Smart Contract Features

### Constructor

```solidity
constructor()
```
- Sets the deployer as contract owner
- Initializes certificate count to 0

### addCertificate

```solidity
function addCertificate(string memory _hash) public onlyOwner
```
- Adds a new certificate hash
- Only owner can call
- Emits `CertificateAdded` event
- Reverts if hash is empty or already exists

### verifyCertificate

```solidity
function verifyCertificate(string memory _hash) public view returns (bool)
```
- Returns true if certificate exists
- Read-only (no gas cost for this call)
- Safe to call from any address

### addMultipleCertificates

```solidity
function addMultipleCertificates(string[] memory _hashes) public onlyOwner
```
- Adds multiple certificates in one transaction
- Gas-efficient batch operation

### transferOwnership

```solidity
function transferOwnership(address _newOwner) public onlyOwner
```
- Transfers contract ownership
- Emits `OwnershipTransferred` event

## 🧪 Testing

### Test Upload Endpoint

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@certificate.pdf"
```

### Test Verify Endpoint

```bash
curl -X POST http://localhost:3000/api/verify \
  -F "file=@certificate.pdf"
```

### Test Verify by Hash

```bash
curl -X POST http://localhost:3000/api/verify-hash \
  -H "Content-Type: application/json" \
  -d '{"hash":"a1b2c3d4..."}'
```

## 🔄 Workflow Example

1. **User uploads a certificate** (PDF, image, etc.)
2. **Backend calculates SHA-256 hash** of the file
3. **Hash is stored on blockchain** via smart contract
4. **Transaction receipt is returned** with block number
5. **Later, user uploads the same file** for verification
6. **Hash is recalculated** and queried from blockchain
7. **Result: ✅ Valid** or **❌ Fake**

## 📊 Architecture Diagram

```
┌─────────────────┐
│   Frontend      │
│  (index.html)   │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────────────────────────┐
│   Backend (server.js)               │
│  ┌─────────────────────────────────┐│
│  │ • File Upload (Multer)          ││
│  │ • SHA-256 Hashing               ││
│  │ • Error Handling                ││
│  │ • Express Routing               ││
│  └─────────────────────────────────┘│
└────────┬────────────────────────────┘
         │ Ethers.js
         ▼
┌──────────────────────────────────────────┐
│   Smart Contract (Solidity)              │
│  ┌────────────────────────────────────┐ │
│  │ • Certificate Storage (Mapping)    │ │
│  │ • Owner Access Control             │ │
│  │ • Verification Logic               │ │
│  └────────────────────────────────────┘ │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Ganache (Local Blockchain)       │
│ • 10 Test Accounts               │
│ • 100 ETH per Account            │
│ • Instant Block Generation       │
└──────────────────────────────────┘
```

## 🔧 Troubleshooting

### Issue: "Contract connection failed"

**Solution:**
- Ensure Ganache is running: `ganache-cli`
- Check RPC URL in `.env`: `http://127.0.0.1:7545`
- Verify network ID matches

### Issue: "Private key invalid"

**Solution:**
- Ensure private key in `.env` starts with `0x`
- Use a valid 64-character hex string
- Get from Ganache account details

### Issue: "Contract address not found"

**Solution:**
- Deploy the contract using one of the methods above
- Update `CONTRACT_ADDRESS` in `.env`
- Ensure contract address is checksum format (optional but recommended)

### Issue: CORS errors

**Solution:**
- CORS is already enabled in `server.js`
- If using external services, whitelist URLs in `cors()` middleware

### Issue: File upload failed

**Solution:**
- Check file size (50MB limit)
- Verify `uploads/` directory exists
- Check disk space
- Ensure read/write permissions

## 📈 Deployment Guide

### Deploy to Ethereum Testnet (Sepolia)

1. **Get Testnet ETH**
   - Go to [Sepolia Faucet](https://sepoliafaucet.com)
   - Get free testnet ETH

2. **Update .env**
   ```env
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   SEPOLIA_PRIVATE_KEY=your_private_key_here
   ```

3. **Deploy Contract**
   ```javascript
   const provider = new ethers.JsonRpcProvider(
     process.env.SEPOLIA_RPC_URL
   );
   // Deploy using this provider
   ```

### Deploy Frontend (Vercel/Netlify)

1. Create repository with current files
2. Push to GitHub
3. Connect to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
4. Deploy automatically

### Deploy Backend (Heroku/Railway)

1. Add `Procfile`:
   ```
   web: npm start
   ```

2. Set environment variables in platform dashboard
3. Deploy using Git

## 🔐 Security Best Practices

✅ **DO:**
- Use environment variables for sensitive data
- Validate all file uploads
- Implement rate limiting for production
- Use HTTPS in production
- Keep private keys secure
- Audit smart contract before production use

❌ **DON'T:**
- Commit .env file to version control
- Use test account private keys in production
- Store sensitive data in frontend
- Skip input validation
- Use hardcoded contract addresses

## 📚 Additional Resources

- **Solidity Docs**: https://docs.soliditylang.org/
- **Ethers.js Docs**: https://docs.ethers.org/
- **Ganache Docs**: https://trufflesuite.com/ganache/
- **Express.js Docs**: https://expressjs.com/
- **Ethereum Concepts**: https://ethereum.org/en/developers/

## 💡 Future Enhancements

- [ ] JWT authentication
- [ ] Database for transaction history
- [ ] IPFS integration for file storage
- [ ] Multi-chain support
- [ ] Advanced analytics dashboard
- [ ] Batch certificate uploads
- [ ] WebSocket for real-time updates
- [ ] Mobile app version
- [ ] Automated tests with Mocha/Chai
- [ ] CI/CD pipeline

## 📝 License

ISC License - Feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest improvements
- Submit pull requests
- Share feedback

## 📧 Support

For issues or questions:
1. Check the troubleshooting section
2. Review smart contract code comments
3. Check Express.js and Ethers.js documentation
4. Open an issue in the repository

---

**Built with ❤️ for blockchain certificate verification**

