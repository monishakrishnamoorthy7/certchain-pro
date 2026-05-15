# 🚀 Quick Start Guide

Get the Certificate Verification System running in 10 minutes!

## Step-by-Step Setup

### 1️⃣ Install Requirements (2 min)

Make sure you have:
- **Node.js** (v14+): https://nodejs.org/
- **Ganache CLI**: `npm install -g ganache-cli`

### 2️⃣ Install Dependencies (2 min)

```bash
# Install all npm packages
npm install

# Install Hardhat for contract deployment (optional)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 3️⃣ Start Ganache (1 min)

Open a **NEW TERMINAL** and run:

```bash
ganache-cli
```

Keep this running! Output will show:
- **RPC Endpoint**: `http://127.0.0.1:7545`
- **10 Test Accounts** with 100 ETH each
- **First Account Private Key** (for .env file)

### 4️⃣ Deploy Smart Contract (2 min)

In another **NEW TERMINAL**, run:

```bash
npx hardhat run scripts/deploy.js --network ganache
```

✅ Copy the **Contract Address** from output

### 5️⃣ Configure Environment

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` and update:

```env
CONTRACT_ADDRESS=0x... (from step 4)
PRIVATE_KEY=0x... (from Ganache output)
GANACHE_RPC_URL=http://127.0.0.1:7545
PORT=3000
```

### 6️⃣ Start Server (1 min)

In a **NEW TERMINAL**:

```bash
npm run dev
```

Expected output:
```
🚀 ============================================
   Certificate Verification System
============================================
📍 Server running on: http://localhost:3000
```

### 7️⃣ Open in Browser (1 min)

Navigate to: **http://localhost:3000**

✨ You're done! Try uploading a file to get started.

---

## 📋 Complete Setup Checklist

- [ ] Node.js installed
- [ ] Ganache CLI installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Ganache running (`ganache-cli`)
- [ ] Smart contract deployed
- [ ] Contract address in `.env`
- [ ] Private key in `.env`
- [ ] Server running (`npm run dev`)
- [ ] Browser open at `http://localhost:3000`

---

## 🧪 Quick Test

1. Create a test file: `echo "Test" > test.txt`
2. Upload via UI: Click "Store Certificate"
3. Select `test.txt` and upload
4. Copy the hash
5. Verify: Upload the same file again
6. Result: ✅ **VALID CERTIFICATE**

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` on port 7545 | Start Ganache with `ganache-cli` |
| `Contract address is invalid` | Deploy contract and update `.env` |
| `Private key invalid` | Key must start with `0x` and be 64 hex chars |
| CORS errors | Check server is running with `npm run dev` |
| File upload fails | Ensure `uploads/` folder exists |

---

## 📚 Full Documentation

- **README.md** - Complete documentation
- **SEPOLIA_DEPLOYMENT.md** - Deploy to testnet
- **API Docs** - In README.md API section

---

## 🎯 What's Next?

1. **Test the System** - Try uploading different files
2. **Explore APIs** - Check the /api/status endpoint
3. **Modify UI** - Customize index.html styling
4. **Add Features** - Implement user authentication
5. **Deploy to Testnet** - Follow SEPOLIA_DEPLOYMENT.md
6. **Go Live** - Deploy contract and backend

---

## 📊 Architecture Overview

```
┌─────────────────┐
│  Web Browser    │
│  (index.html)   │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────────────────────────┐
│   Node.js Express Server            │
│   (server.js)                       │
│   ├─ /api/upload                    │
│   ├─ /api/verify                    │
│   └─ /api/status                    │
└────────┬────────────────────────────┘
         │ Ethers.js
         ▼
┌──────────────────────────────────────┐
│   Smart Contract (Solidity)          │
│   CertificateVerification            │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   Ganache Blockchain                 │
│   (http://127.0.0.1:7545)            │
└──────────────────────────────────────┘
```

---

## 🔐 Security Reminders

✅ **DO:**
- Keep `.env` secret
- Never commit private keys
- Use test accounts only
- Enable HTTPS in production

❌ **DON'T:**
- Share private keys
- Commit .env file
- Use mainnet keys on testnet
- Run without HTTPS in production

---

## 📞 Need Help?

1. Check **README.md** for detailed docs
2. Review **SEPOLIA_DEPLOYMENT.md** for testnet
3. Check Ethers.js docs: https://docs.ethers.org/
4. Check Express.js docs: https://expressjs.com/

---

**Happy coding! 🚀**

