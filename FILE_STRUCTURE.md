# 📁 Project File Structure & Documentation

Complete guide to all files in the Certificate Verification System.

## Directory Tree

```
certificate-project/
├── 📄 README.md                    # Complete project documentation
├── 📄 QUICK_START.md              # 10-minute setup guide
├── 📄 SEPOLIA_DEPLOYMENT.md       # Testnet deployment guide
├── 📄 ARCHITECTURE.md             # System architecture details
├── 📄 FILE_STRUCTURE.md           # This file
│
├── 📂 contracts/
│   └── CertificateVerification.sol # ⭐ Smart contract (Solidity)
│
├── 📂 config/
│   └── blockchain.js              # Blockchain configuration & initialization
│
├── 📂 utils/
│   ├── hashGenerator.js           # SHA-256 hashing utilities
│   └── errorHandler.js            # Centralized error handling
│
├── 📂 scripts/
│   └── deploy.js                  # Smart contract deployment script
│
├── 📂 uploads/                    # Temporary uploaded files
│   └── .gitkeep                   # Ensures folder is tracked
│
├── 🌐 index.html                  # ⭐ Frontend UI
├── 🔧 server.js                   # ⭐ Express backend server
├── 📋 package.json                # Node.js dependencies & scripts
├── ⚙️ hardhat.config.js           # Hardhat configuration
│
├── 🔐 .env.example                # Environment variables template
├── .gitignore                     # Git ignore rules
└── package-lock.json              # Locked dependency versions
```

---

## Core Files (⭐ Most Important)

### 1. Smart Contract (`contracts/CertificateVerification.sol`)

**Purpose**: Immutable certificate storage and verification on blockchain

**Key Functions**:
- `addCertificate(hash)` - Store certificate hash (owner only)
- `verifyCertificate(hash)` - Check if certificate exists
- `addMultipleCertificates(hashes[])` - Batch store certificates
- `transferOwnership(address)` - Transfer contract control

**Key Events**:
- `CertificateAdded(hash, owner, timestamp)` - Emitted when certificate added

**State Variables**:
- `owner` - Contract owner address
- `certificates` - Mapping of hash → exists (bool)
- `certificateCount` - Total certificates stored

**Code Size**: ~700 lines (with comments)
**Gas Cost**: ~500k to deploy, ~50k per certificate

---

### 2. Backend Server (`server.js`)

**Purpose**: RESTful API for file upload, hashing, and blockchain interaction

**Endpoints**:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Server health check |
| GET | `/api/status` | Contract status |
| POST | `/api/upload` | Upload & store certificate |
| POST | `/api/verify` | Verify uploaded certificate |
| POST | `/api/verify-hash` | Verify by hash string |

**Key Features**:
- Multer for file uploads (50MB limit)
- SHA-256 hashing with crypto module
- Ethers.js for blockchain interaction
- Error handling middleware
- CORS enabled for frontend access

**Code Size**: ~400 lines (with comments)
**Dependencies**: express, multer, ethers, cors, dotenv

---

### 3. Frontend UI (`index.html`)

**Purpose**: User interface for certificate upload and verification

**Sections**:
1. **Upload Section**
   - File input
   - Store button
   - Result display

2. **Verify Section**
   - File input
   - Verify button
   - Result display

3. **Status Panel**
   - Server status
   - Contract address
   - Certificate count

**Features**:
- Responsive design (mobile-friendly)
- Real-time loading indicators
- Color-coded results (green/red)
- Transaction hash display
- Auto-refresh status every 30 seconds

**Code Size**: ~800 lines (HTML + CSS + JS)
**No Dependencies**: Vanilla JavaScript, no external libraries needed

---

## Configuration Files

### `package.json`

**Purpose**: Node.js project metadata and dependencies

**Contents**:
```json
{
  "name": "certificate-verification-system",
  "version": "1.0.0",
  "dependencies": {
    "cors": "^2.8.6",
    "dotenv": "^16.3.1",
    "ethers": "^6.16.0",
    "express": "^5.2.1",
    "multer": "^2.1.1"
  }
}
```

**Scripts**:
- `npm start` - Run server (production)
- `npm run dev` - Run with nodemon (development)

---

### `hardhat.config.js`

**Purpose**: Hardhat configuration for smart contract compilation and deployment

**Features**:
- Solidity compiler: ^0.8.0
- Network configurations:
  - `ganache` - Local development
  - `sepolia` - Ethereum testnet
  - `localhost` - Hardhat node

**Important**: Update RPC URLs and API keys before deployment

---

### `.env.example` & `.env`

**Purpose**: Environment variables for sensitive data

**Template Contents**:
```env
# Blockchain
GANACHE_RPC_URL=http://127.0.0.1:7545
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...

# Server
PORT=3000
NODE_ENV=development
ETHERSCAN_API_KEY=...
```

**Security**:
- ❌ Never commit `.env` file
- ✅ Keep `.env.example` for reference
- ✅ Add `.env` to `.gitignore`

---

## Utility Files

### `config/blockchain.js`

**Purpose**: Initialize blockchain provider, wallet, and contract instance

**Functions**:
```javascript
initializeBlockchain()
// Returns: { provider, wallet, contract, ganacheUrl }
```

**Features**:
- Validates environment variables
- Creates JsonRpcProvider
- Creates Wallet with private key
- Initializes Contract instance with ABI
- Error handling with helpful messages

**Usage**:
```javascript
const blockchain = initializeBlockchain();
await blockchain.contract.addCertificate(hash);
```

---

### `utils/hashGenerator.js`

**Purpose**: SHA-256 hashing utilities

**Functions**:

1. **`generateFileHash(filePath)`**
   - Input: File path (string)
   - Output: SHA-256 hash (hex string)
   - Throws: Error if file not found

2. **`generateBufferHash(buffer)`**
   - Input: Buffer data
   - Output: SHA-256 hash

3. **`generateStringHash(str)`**
   - Input: String
   - Output: SHA-256 hash

4. **`isValidHash(hash)`**
   - Input: Hash string
   - Output: Valid/Invalid (boolean)
   - Validates: 64 hex characters

**Example**:
```javascript
const hash = generateFileHash("document.pdf");
// Returns: "a1b2c3d4e5f6..."
```

---

### `utils/errorHandler.js`

**Purpose**: Centralized error handling and HTTP response formatting

**Classes**:
```javascript
class ApiError extends Error {
  constructor(statusCode, message, details)
}
```

**Functions**:

1. **`handleError(error)`**
   - Converts errors to API response format
   - Returns: Formatted error object

2. **`errorHandler(err, req, res, next)`**
   - Express middleware
   - Logs errors
   - Sends HTTP response

**Example**:
```javascript
throw new ApiError(400, "Invalid hash", "Hash must be 64 hex chars");
```

---

## Deployment & Setup Files

### `scripts/deploy.js`

**Purpose**: Smart contract deployment script

**Features**:
- Connects to blockchain network
- Deploys CertificateVerification contract
- Logs contract address
- Generates .env updates
- Optional Etherscan verification

**Usage**:
```bash
npx hardhat run scripts/deploy.js --network ganache
npx hardhat run scripts/deploy.js --network sepolia
```

---

### `setup.sh` (Linux/Mac)

**Purpose**: Automated project setup for Unix systems

**Steps**:
1. Checks Node.js installation
2. Installs Ganache CLI globally
3. Installs npm dependencies
4. Creates `.env` from template

**Usage**:
```bash
bash setup.sh
chmod +x setup.sh  # Make executable
./setup.sh         # Run
```

---

### `setup.bat` (Windows)

**Purpose**: Automated project setup for Windows

**Same Steps as setup.sh but for Windows PowerShell**

**Usage**:
```cmd
setup.bat
```

---

## Upload & Temporary Files

### `uploads/` Directory

**Purpose**: Temporary storage for uploaded certificates during processing

**Characteristics**:
- Files automatically deleted after hashing
- Unique filenames prevent collisions
- Naming: `timestamp-random-originalname`

**Example**:
```
uploads/
├── 1698765432-987654321-diploma.pdf
├── 1698765433-123456789-certificate.txt
└── .gitkeep
```

**Note**: Files don't persist on disk after processing

---

## Documentation Files

### `README.md`

**Sections**:
- Features overview
- Tech stack
- Project structure
- Quick start guide
- API documentation
- Smart contract features
- Deployment guide
- Troubleshooting
- Security best practices

**Length**: ~800 lines

---

### `QUICK_START.md`

**Purpose**: Get started in 10 minutes

**Covers**:
- Prerequisites
- Step-by-step installation
- Ganache setup
- Contract deployment
- Server startup
- Testing

---

### `SEPOLIA_DEPLOYMENT.md`

**Purpose**: Deploy to Ethereum testnet

**Covers**:
- Prerequisites (wallet, testnet ETH, Infura key)
- Environment variable setup
- Contract deployment
- Configuration
- Verification
- Production deployment tips

---

### `ARCHITECTURE.md`

**Purpose**: System architecture documentation

**Covers**:
- Architecture diagrams
- Component details
- Data flow diagrams
- Security architecture
- Deployment topologies
- Performance considerations
- Scalability solutions

---

### `FILE_STRUCTURE.md`

**Purpose**: This file - guide to all project files

---

## Additional Files

### `.gitignore`

**Purpose**: Prevent sensitive files from being committed

**Key Entries**:
```
node_modules/
.env
.env.local
artifacts/
cache/
uploads/*
!uploads/.gitkeep
```

---

### `package-lock.json`

**Purpose**: Lock exact versions of dependencies

**Generated by**: `npm install`
**Should be committed**: Yes

---

## File Statistics

| Category | Count | Examples |
|----------|-------|----------|
| Core Files | 3 | server.js, index.html, smart contract |
| Config Files | 4 | package.json, hardhat.config.js, .env |
| Utils | 2 | hashGenerator.js, errorHandler.js |
| Docs | 6 | README, QUICK_START, ARCHITECTURE |
| Scripts | 2 | deploy.js, setup.sh/bat |

---

## Development Workflow

### When Starting a New Session

1. **Review Files**:
   - `QUICK_START.md` - Refresh memory on setup
   - `.env` - Check configuration

2. **Run Dependencies**:
   - Ganache: `ganache-cli`
   - Server: `npm run dev`

3. **Check Status**:
   - Browser: `http://localhost:3000`
   - API: `http://localhost:3000/api/status`

### When Making Changes

1. **Backend Changes** (`server.js`):
   - Nodemon auto-restarts server
   - Test via `curl` or browser

2. **Frontend Changes** (`index.html`):
   - Browser auto-refreshes
   - Check console for errors

3. **Smart Contract Changes**:
   - Redeploy: `npx hardhat run scripts/deploy.js --network ganache`
   - Update `CONTRACT_ADDRESS` in `.env`
   - Restart server

### When Deploying

1. **To Testnet**:
   - Follow `SEPOLIA_DEPLOYMENT.md`
   - Deploy contract first
   - Update backend configuration
   - Deploy backend to cloud

2. **To Mainnet**:
   - Security audit first!
   - Use production-grade RPC provider
   - Implement monitoring
   - Setup alerting

---

## Common File Edits

### Adding New API Endpoint

**File**: `server.js`
**Location**: Around line 200
**Steps**:
1. Add route
2. Add error handling
3. Add response format

---

### Modifying Smart Contract

**File**: `contracts/CertificateVerification.sol`
**Steps**:
1. Edit contract
2. Compile: `npx hardhat compile`
3. Redeploy: `npx hardhat run scripts/deploy.js --network ganache`
4. Update `.env` with new address

---

### Updating Frontend

**File**: `index.html`
**Sections**:
- HTML: Lines 1-100
- CSS: Lines 100-400
- JavaScript: Lines 400-end

---

## Backup & Recovery

### Critical Files to Backup

1. **`.env`** - Contains private keys ⚠️
2. **`contracts/CertificateVerification.sol`** - Smart contract
3. **`server.js`** - Backend logic
4. **`index.html`** - Frontend UI

### What NOT to Backup

- ❌ `node_modules/` - Reinstall with npm
- ❌ `package-lock.json` - Regenerated
- ❌ `uploads/*` - Temporary files
- ❌ `artifacts/` - Build output

### Recovery Steps

1. Delete `node_modules/`
2. Run `npm install`
3. Restore `.env` file
4. Restart services

---

## File Permissions

### Important Permissions

```bash
# Executable scripts
chmod +x setup.sh
chmod +x deploy.js

# Readable configs
chmod 600 .env          # Only user can read
chmod 644 .env.example  # Readable
chmod 644 package.json  # Readable
```

---

## Monitoring File Changes

### Using Git

```bash
# Check status
git status

# View changes
git diff server.js

# Stage changes
git add .
```

### Using File Watcher

```bash
# Watch for file changes
nodemon --watch . --ignore node_modules
```

---

This document provides a complete guide to every file in the project!

