# 🎯 Getting Started - Complete Setup Instructions

Follow these steps in order to get your blockchain certificate verification system running.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** installed (v14+): https://nodejs.org/
- [ ] **Git** installed (optional): https://git-scm.com/
- [ ] **Administrator access** to install software globally
- [ ] **Text editor** for editing files (VS Code recommended)
- [ ] At least **500MB free disk space**

**Verify Installations**:
```bash
node --version      # Should show v14 or higher
npm --version       # Should show npm version
```

---

## 🚀 Complete Setup (3 Steps)

### STEP 1: Install Ganache CLI (5 minutes)

Ganache is a local blockchain simulator for testing.

**Windows/Mac/Linux**:
```bash
npm install -g ganache-cli
```

**Verify**:
```bash
ganache-cli --version
```

✅ **You should see a version number**

---

### STEP 2: Install Project Dependencies (3 minutes)

Navigate to your project folder and install npm packages:

```bash
# Open terminal in project folder (right-click → "Open Terminal Here")
npm install
```

⏳ **This takes 1-2 minutes** - Wait for it to complete

✅ **You should see: "added X packages"**

---

### STEP 3: Create Configuration File (2 minutes)

Copy the example environment file:

**Windows**:
```bash
copy .env.example .env
```

**Mac/Linux**:
```bash
cp .env.example .env
```

**Then edit `.env` file** (use Notepad or VS Code):
```env
# Keep all values as-is for now
GANACHE_RPC_URL=http://127.0.0.1:7545
PRIVATE_KEY=0x3a4068c12189ee2c212d3abb195b8b764941917fabeb13341df4a969cb44c476
CONTRACT_ADDRESS=0x92b6DB1de5f0A62400ed5a31D21Dd550400823d1
PORT=3000
NODE_ENV=development
```

✅ **All set!**

---

## ▶️ Running the System (3 Terminals)

### Terminal 1: Start Ganache Blockchain

Open a new terminal and run:

```bash
ganache-cli
```

**You should see**:
```
ganache v7.0.0 (https://www.trufflesuite.com/ganache)

Available Accounts
==================
(0) 0x...  (100 ETH)
(1) 0x...  (100 ETH)
...

Listening on 127.0.0.1:7545
```

⚠️ **Keep this terminal OPEN!**

---

### Terminal 2: Deploy Smart Contract

Open a new terminal (in your project folder) and run:

```bash
npx hardhat run scripts/deploy.js --network ganache
```

**You should see**:
```
🚀 Starting contract deployment...

📍 Deploying with account: 0x...
💰 Account balance: 100 ETH

✅ Contract deployed successfully!

📋 Contract Address: 0x92b6DB1de5f0A62400ed5a31D21Dd550400823d1
👤 Owner Address: 0x...

✨ Deployment complete!
```

✅ **Contract is deployed!**

⚠️ **Save the Contract Address** - You may need it later

---

### Terminal 3: Start Backend Server

Open another new terminal (in your project folder) and run:

```bash
npm run dev
```

**You should see**:
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

✅ **Server is running!**

---

## 🌐 Open Your Browser

Navigate to:

**http://localhost:3000**

You should see a purple interface with:
- Upload section
- Verify section  
- System status

---

## 🧪 Quick Test (2 minutes)

### Test Upload

1. Create a test file:
   ```bash
   # Windows (in any terminal)
   echo "Test Certificate" > test.txt
   
   # Mac/Linux
   echo "Test Certificate" > test.txt
   ```

2. In browser, click "Store Certificate"
3. Select `test.txt`
4. Click "Store on Blockchain"
5. ✅ You should see a green success message with hash and transaction

### Test Verification

1. In browser, click "Verify Certificate"
2. Select the SAME `test.txt` file
3. Click "Verify Certificate"
4. ✅ You should see green ✅ **VALID CERTIFICATE**

### Test Fake Certificate

1. Edit the test file:
   ```bash
   echo "Modified Content" > test.txt
   ```

2. Click "Verify Certificate"
3. Select the modified `test.txt`
4. Click "Verify Certificate"
5. ✅ You should see red ❌ **INVALID/FAKE CERTIFICATE**

---

## 🎉 Success! System is Running

If all tests passed, your system is fully functional!

---

## 📚 Next Steps

### 1. Explore the Code (15 minutes)

Open these files to understand the system:

1. **Smart Contract** (`contracts/CertificateVerification.sol`)
   - Shows how certificates are stored
   - Comments explain each function

2. **Backend** (`server.js`)
   - Shows API endpoints
   - File upload and hashing logic

3. **Frontend** (`index.html`)
   - User interface code
   - JavaScript that calls the API

### 2. Read Documentation (30 minutes)

Pick one to read:

- `QUICK_START.md` - More detailed setup
- `ARCHITECTURE.md` - How everything works
- `README.md` - Complete reference

### 3. Deploy to Testnet (1 hour)

When ready:

1. Follow `SEPOLIA_DEPLOYMENT.md`
2. Get testnet ETH
3. Deploy to Ethereum Sepolia
4. Test on real blockchain

---

## 🆘 Troubleshooting

### "ECONNREFUSED: Connection refused"

**Problem**: Server can't reach Ganache

**Solution**:
1. Check Ganache is running in Terminal 1
2. Verify it shows "Listening on 127.0.0.1:7545"
3. Restart Ganache if needed

### "Contract address is invalid"

**Problem**: Contract deployment failed

**Solution**:
1. Stop server (Ctrl+C in Terminal 3)
2. Check Ganache is running
3. Redeploy: `npx hardhat run scripts/deploy.js --network ganache`
4. Copy new contract address to `.env`
5. Restart server

### "File upload failed"

**Problem**: Can't upload file

**Solution**:
1. Check file exists: `ls test.txt` (or `dir test.txt` on Windows)
2. Ensure uploads folder exists (it should)
3. Check file permissions
4. Try with a smaller file

### "Page shows loading forever"

**Problem**: Frontend stuck loading

**Solution**:
1. Press F5 to refresh browser
2. Check console (F12) for errors
3. Check server is running in Terminal 3
4. Check all terminals are still running

### "404 Not Found"

**Problem**: Wrong URL

**Solution**:
1. Use exactly: `http://localhost:3000`
2. Not: `https://` (no S)
3. Not: `127.0.0.1:3000` (use localhost)

---

## 📊 System Status Check

### Check Ganache Status

Look for:
```
Listening on 127.0.0.1:7545
```

### Check Server Status

Go to: `http://localhost:3000/health`

Should show:
```json
{
  "success": true,
  "blockchain": {
    "connected": true,
    "contractAddress": "0x..."
  }
}
```

### Check API Status

Go to: `http://localhost:3000/api/status`

Should show:
```json
{
  "success": true,
  "blockchain": {
    "connected": true,
    "contractAddress": "0x...",
    "certificateCount": "0"
  }
}
```

---

## 🔄 Restarting Everything

If something breaks:

1. Stop Ganache: `Ctrl+C` in Terminal 1
2. Stop Server: `Ctrl+C` in Terminal 3
3. Close all terminals
4. Open new terminals
5. Start Ganache first: `ganache-cli`
6. Start Server second: `npm run dev`
7. Refresh browser

---

## 💾 Saving Your Work

### Keep These Files
- `.env` - Your configuration
- `contracts/CertificateVerification.sol` - Smart contract
- `server.js` - Your backend logic
- `index.html` - Your UI
- Modified code

### Don't Need to Backup
- `node_modules/` - Can reinstall with npm
- `uploads/` - Temporary files
- `package-lock.json` - Can regenerate

### If You Want to Share

1. Don't share `.env` file ⚠️
2. Copy `.env.example` instead
3. Share these folders:
   - `contracts/`
   - `config/`
   - `utils/`
   - `scripts/`
   - Main files: `server.js`, `index.html`, `package.json`

---

## 📈 What Comes Next?

### Easy (1 hour)
- [ ] Customize UI colors/branding
- [ ] Change button text
- [ ] Modify styling

### Medium (2-3 hours)
- [ ] Add user authentication
- [ ] Store more certificate info
- [ ] Create admin dashboard
- [ ] Deploy to cloud

### Advanced (4+ hours)
- [ ] Deploy to Sepolia testnet
- [ ] Implement IPFS integration
- [ ] Add database for history
- [ ] Mobile app version
- [ ] Multi-chain support

---

## 🎓 Learning Path

If you want to learn more:

### Day 1: Understand the System
- Read `ARCHITECTURE.md`
- Review `README.md`
- Explore the code

### Day 2: Deploy to Testnet
- Get Sepolia testnet ETH
- Follow `SEPOLIA_DEPLOYMENT.md`
- Deploy contract
- Test on testnet

### Day 3: Customize System
- Modify UI styling
- Add new fields
- Extend smart contract
- Add database

### Week 2: Production
- Prepare for mainnet
- Conduct security review
- Deploy backend
- Monitor performance

---

## 🆘 Need More Help?

1. Check `README.md` for detailed docs
2. Check `SEPOLIA_DEPLOYMENT.md` for testnet info
3. Check `ARCHITECTURE.md` for system details
4. Review code comments
5. Check Ethers.js docs: https://docs.ethers.org/

---

## ✨ Pro Tips

### Tip 1: Use VS Code
- Download free from https://code.visualstudio.com/
- Install "REST Client" extension for API testing
- Install "Solidity" extension for smart contracts

### Tip 2: Save Terminal Output
```bash
# Save output to file
npm run dev > server.log 2>&1
```

### Tip 3: Multiple Test Files
```bash
# Create several test files with different content
echo "Certificate 1" > test1.txt
echo "Certificate 2" > test2.txt

# Test uploads and verify they're different
```

### Tip 4: Check Gas Usage
Each upload shows gas used. You can optimize:
- Batch multiple certificates
- Use cheaper operations
- Clean up state

---

## 🎉 Congratulations!

You now have a fully functional blockchain-based certificate verification system! 

**Next:** Follow the `QUICK_START.md` or `SEPOLIA_DEPLOYMENT.md` guides to continue.

---

**Happy Coding! 🚀**

