# 🏗️ System Architecture

This document explains the complete architecture of the Certificate Verification System.

## Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      Client Layer                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Frontend (HTML/CSS/JavaScript)                        │  │
│  │  - File Upload Interface                               │  │
│  │  - Verification Display                                │  │
│  │  - System Status Monitor                               │  │
│  └──────────────────────┬─────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │ HTTP/REST
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                  Application Layer                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Express.js Server (Node.js)                           │  │
│  │                                                        │  │
│  │  Routing Layer:                                        │  │
│  │  ├─ POST /api/upload                                  │  │
│  │  ├─ POST /api/verify                                  │  │
│  │  ├─ POST /api/verify-hash                             │  │
│  │  ├─ GET /api/status                                   │  │
│  │  └─ GET /health                                       │  │
│  │                                                        │  │
│  │  Business Logic:                                       │  │
│  │  ├─ File Upload (Multer)                              │  │
│  │  ├─ Hash Generation (Crypto)                          │  │
│  │  ├─ Error Handling                                    │  │
│  │  └─ Response Formatting                               │  │
│  └──────────────────────┬─────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │ JSON RPC
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              Blockchain Interaction Layer                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Ethers.js                                             │  │
│  │  ├─ Provider (RPC Connection)                          │  │
│  │  ├─ Wallet (Signing)                                  │  │
│  │  └─ Contract Interface (ABI)                          │  │
│  └──────────────────────┬─────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │ EVM Calls
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                  Smart Contract Layer                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Solidity Contract (CertificateVerification)           │  │
│  │                                                        │  │
│  │  State Variables:                                      │  │
│  │  ├─ owner: address                                     │  │
│  │  ├─ certificates: mapping(string => bool)             │  │
│  │  └─ certificateCount: uint256                         │  │
│  │                                                        │  │
│  │  Functions:                                            │  │
│  │  ├─ addCertificate() [write]                          │  │
│  │  ├─ verifyCertificate() [read]                        │  │
│  │  └─ transferOwnership()                               │  │
│  │                                                        │  │
│  │  Events:                                               │  │
│  │  └─ CertificateAdded(string, address, uint256)        │  │
│  └──────────────────────┬─────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                     Blockchain Layer                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Ganache / Ethereum Network                            │  │
│  │  ├─ Accounts                                           │  │
│  │  ├─ Blocks                                             │  │
│  │  ├─ Transactions                                       │  │
│  │  └─ Smart Contract State                              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Frontend Layer (index.html)

**Purpose**: User interface for uploading and verifying certificates

**Key Components**:
- **Upload Section**: File selection + store button
- **Verify Section**: File selection + verify button
- **Status Panel**: Real-time blockchain status
- **Result Display**: Hash, transaction info, verification result

**Technologies**:
- HTML5 for structure
- CSS3 for responsive design
- Vanilla JavaScript for interactivity
- Fetch API for HTTP requests

**User Flow**:
```
User Opens index.html
       │
       ▼
┌──────────────────┐
│ Select File      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ Click Upload/Verify  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Fetch API to Backend         │
│ POST /api/upload or /verify  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────┐
│ Display Results      │
│ - Hash              │
│ - Tx Hash           │
│ - Valid/Invalid     │
└──────────────────────┘
```

### 2. Application Layer (server.js)

**Purpose**: Handle HTTP requests and coordinate blockchain interactions

**Architecture**:

```
Express Server
│
├─ Middleware Layer
│  ├─ CORS
│  ├─ JSON Parser
│  ├─ URL Encoder
│  └─ Request Logger
│
├─ Route Layer
│  ├─ GET /health
│  ├─ GET /api/status
│  ├─ POST /api/upload
│  ├─ POST /api/verify
│  └─ POST /api/verify-hash
│
├─ Business Logic Layer
│  ├─ File Handling (Multer)
│  ├─ Hashing (Crypto)
│  ├─ Smart Contract Calls (Ethers)
│  └─ Error Handling
│
└─ Data Layer
   ├─ Uploaded Files
   ├─ Hash Generation
   └─ Blockchain State
```

**Request Processing Flow**:

```
HTTP Request
     │
     ▼
Middleware Processing
(CORS, Parsing, Logging)
     │
     ▼
Route Matching
     │
     ▼
┌────────────────────────────────┐
│ POST /api/upload               │
├────────────────────────────────┤
│ 1. Validate File               │
│ 2. Store Temporarily           │
│ 3. Generate SHA-256 Hash       │
│ 4. Check if Already Exists     │
│ 5. Call addCertificate()       │
│ 6. Wait for Receipt            │
│ 7. Return Response             │
│ 8. Cleanup Temp File           │
└────────────────────────────────┘
     │
     ▼
JSON Response
```

**Key Features**:
- Multer handles file uploads
- Crypto module generates SHA-256 hashes
- Ethers.js interacts with smart contract
- Error handling middleware
- Graceful error responses

### 3. Blockchain Interaction Layer (config/blockchain.js)

**Purpose**: Initialize and manage blockchain connections

**Components**:

```
blockchain.js
│
├─ initializeBlockchain()
│  ├─ Create Provider (RPC)
│  ├─ Create Wallet (Signer)
│  └─ Create Contract Interface
│
├─ Provider
│  └─ JsonRpcProvider("http://127.0.0.1:7545")
│     └─ Read-only blockchain access
│
├─ Wallet
│  └─ new ethers.Wallet(PRIVATE_KEY, provider)
│     └─ Signs transactions
│
└─ Contract
   └─ new ethers.Contract(ADDRESS, ABI, wallet)
      ├─ Call functions
      ├─ Send transactions
      └─ Decode responses
```

**Flow**:

```
Backend Request
       │
       ▼
initializeBlockchain()
       │
       ├─ Load Private Key from .env
       ├─ Create Provider (RPC connection)
       ├─ Create Wallet with Private Key
       ├─ Create Contract Instance
       └─ Validate Configuration
       │
       ▼
Contract Object Ready
       │
       ├─ contract.addCertificate(hash)
       ├─ contract.verifyCertificate(hash)
       └─ contract.getCertificateCount()
```

### 4. Smart Contract Layer (CertificateVerification.sol)

**Purpose**: Immutable record of certificate hashes on blockchain

**State Variables**:

```solidity
contract CertificateVerification {
    // Owner-only functions
    address public owner;
    
    // Certificate storage
    mapping(string => bool) public certificates;
    
    // Statistics
    uint256 public certificateCount;
}
```

**Functions**:

1. **addCertificate(hash)** - Write
   - Only callable by owner
   - Stores hash in mapping
   - Emits event
   - Costs gas

2. **verifyCertificate(hash)** - Read
   - Callable by anyone
   - Returns boolean
   - No gas cost
   - Instant

3. **addMultipleCertificates(hashes[])** - Write
   - Batch operation
   - Gas efficient
   - Owner only

**Event Flow**:

```
addCertificate(hash)
       │
       ▼
require(onlyOwner)
       │
       ▼
require(hash not empty)
       │
       ▼
require(hash doesn't exist)
       │
       ▼
certificates[hash] = true
certificateCount++
       │
       ▼
emit CertificateAdded(hash, msg.sender, block.timestamp)
       │
       ▼
Transaction Recorded on Blockchain
```

### 5. Data Storage

**Files**:
- Temporary files in `uploads/` directory
- Deleted after hashing
- Filename: `timestamp-random-originalname`

**Blockchain**:
- Contract state variables
- Immutable on Ethereum
- Synced across network

**Configuration**:
- `.env` file (not committed)
- Environment variables
- Sensitive data (keys, addresses)

---

## Data Flow Diagrams

### Upload Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User selects file via index.html                     │
└──────────────────────┬──────────────────────────────────┘
                       │ FormData + File
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 2. fetch POST /api/upload                               │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Multer saves file to uploads/                        │
│    (uploads/1234567890-123456-document.pdf)             │
└──────────────────────┬───────────────────────────────────┘
                       │ filePath
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 4. generateFileHash(filePath)                           │
│    - Read file into buffer                              │
│    - Calculate SHA-256                                  │
│    - Return hex string (64 chars)                       │
└──────────────────────┬───────────────────────────────────┘
                       │ hash
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 5. contract.verifyCertificate(hash)                     │
│    - Check if hash already exists                       │
│    - Return boolean                                     │
└──────────────────────┬───────────────────────────────────┘
                       │ isValid
                       ▼
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
        YES                      NO
      ┌────────┐         ┌─────────────┐
      │ Exists │         │ New Hash    │
      │ Error  │         └──────┬──────┘
      └────────┘                │
                                ▼
                    ┌──────────────────────┐
                    │ contract.              │
                    │ addCertificate(hash) │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Transaction Signed   │
                    │ by Wallet            │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Sent to Ganache      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ await tx.wait()      │
                    │ Wait for Confirmation│
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Receipt with:        │
                    │ - txHash             │
                    │ - blockNumber        │
                    │ - gasUsed            │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ JSON Response        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Display in UI        │
                    │ - Hash               │
                    │ - Tx Hash            │
                    │ - Block Number       │
                    └──────────────────────┘
```

### Verification Flow

```
┌────────────────────────────────────────────────────────┐
│ 1. User selects same file for verification             │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│ 2. fetch POST /api/verify                              │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│ 3. Multer saves file to uploads/                       │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│ 4. generateFileHash() - Calculate same hash            │
└──────────────────────┬─────────────────────────────────┘
                       │ hash
                       ▼
┌────────────────────────────────────────────────────────┐
│ 5. contract.verifyCertificate(hash) - Read query      │
│    No gas cost, instant result                         │
└──────────────────────┬─────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    Found = true            Not Found = false
          │                         │
          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│ ✅ VALID        │      │ ❌ INVALID       │
│ Certificate OK  │      │ Fake/Not Stored  │
└──────────────────┘      └──────────────────┘
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
        ┌─────────────────────────┐
        │ JSON Response           │
        │ {                       │
        │   isValid: true/false   │
        │   hash: "...",          │
        │   status: "..."         │
        │ }                       │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │ Display in UI           │
        │ Green or Red Result      │
        └─────────────────────────┘
```

---

## Security Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Security Layers                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Blockchain Security                            │
│  ├─ Smart contract audited                              │
│  ├─ Owner-only access control                           │
│  └─ Immutable record on blockchain                      │
│                                                          │
│  Layer 2: Cryptographic Security                         │
│  ├─ SHA-256 hashing (one-way)                           │
│  ├─ Unique hash per file                                │
│  └─ Digital signatures for transactions                 │
│                                                          │
│  Layer 3: Access Control                                │
│  ├─ Private key required for writing                    │
│  ├─ Owner-only modifier on contract                     │
│  └─ No public write access                              │
│                                                          │
│  Layer 4: Data Validation                               │
│  ├─ File type validation                                │
│  ├─ File size limits (50MB)                             │
│  ├─ Hash format validation                              │
│  └─ Empty value checks                                  │
│                                                          │
│  Layer 5: Error Handling                                │
│  ├─ Try-catch blocks                                    │
│  ├─ Validation middleware                               │
│  ├─ Error logging                                       │
│  └─ Graceful failure                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Development (Local Ganache)

```
User Browser
    │
    ├─ http://localhost:3000 (Frontend)
    │
    └─ http://localhost:3000 (Backend API)
            │
            └─ http://127.0.0.1:7545 (Ganache RPC)
                    │
                    └─ Smart Contract @ 0x92b6DB1...
                            │
                            └─ In-Memory Blockchain
```

### Testnet (Sepolia)

```
User Browser
    │
    ├─ https://your-domain.com (Frontend)
    │
    └─ https://api.your-domain.com (Backend API)
            │
            └─ https://sepolia.infura.io (Infura RPC)
                    │
                    └─ Smart Contract @ 0xabcd...
                            │
                            └─ Ethereum Sepolia Network
```

### Production (Mainnet)

```
User Browser
    │
    ├─ https://certificate-app.com (Frontend - CDN)
    │
    └─ https://api.certificate-app.com (Backend - Autoscaling)
            │
            └─ https://eth-mainnet.alchemyapi.io (Alchemy RPC)
                    │
                    └─ Smart Contract @ 0x123...
                            │
                            └─ Ethereum Mainnet
```

---

## Performance Considerations

### Read Operations (Verification)
- **Time**: < 1 second
- **Cost**: 0 gas (read-only)
- **Scalability**: Unlimited
- **Example**: `verifyCertificate(hash)`

### Write Operations (Upload)
- **Time**: 10-30 seconds (wait for confirmation)
- **Cost**: ~50,000 gas (~$0.01 at typical prices)
- **Scalability**: Network dependent
- **Example**: `addCertificate(hash)`

### Bottlenecks
1. **File Upload**: Limited by network bandwidth
2. **Blockchain Confirmation**: 15 seconds average on Ethereum
3. **RPC Provider**: Depends on provider capacity

---

## Scalability Solutions

For high-volume deployments:

1. **Layer 2 Solutions**
   - Arbitrum
   - Optimism
   - Polygon

2. **Batch Processing**
   - `addMultipleCertificates()`
   - Single transaction for multiple hashes

3. **Caching**
   - Cache verification results
   - Cache contract state

4. **Offchain Storage**
   - Use IPFS for actual files
   - Keep hashes on blockchain

---

This architecture is designed to be:
- ✅ **Secure** - Multiple security layers
- ✅ **Scalable** - Efficient blockchain interactions
- ✅ **Maintainable** - Clean code structure
- ✅ **Extendable** - Easy to add features

