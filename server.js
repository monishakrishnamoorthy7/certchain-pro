const app = require('./src/app');
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
const { provider } = require('./src/services/blockchain');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  try {
    // 1. Connect MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // 2. Seed Admin if missing
    if (process.env.ADMIN_EMAIL) {
      const exists = await Admin.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });
      if (!exists) {
        await Admin.create({
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          name: process.env.ADMIN_NAME
        });
        console.log('✅ Admin Seeded');
      }
    }

    // 3. Check Blockchain
    console.log('✅ Blockchain Connected');
    console.log(`   Latest Block: ${await provider.getBlockNumber()}`);

    // Runtime env validation for production networks
    const net = (process.env.NETWORK || 'local').toLowerCase();
    if (net === 'sepolia') {
      if (!process.env.SEPOLIA_RPC_URL) {
        console.warn('⚠️ SEPOLIA_RPC_URL is not set. Set it before starting in production.');
      }
    }

    // Startup validation: RPC reachable and contract exists (if configured)
    try {
      const networkInfo = await provider.getNetwork();
      console.log(`   Connected to chainId: ${networkInfo.chainId}`);
    } catch (err) {
      console.error('❌ RPC not reachable:', err.message || err);
      throw err;
    }

    const { CONTRACT_ADDR } = require('./src/services/blockchain');
    if (!CONTRACT_ADDR) {
      console.warn('⚠️ No contract address configured for this network. Set CONTRACT_ADDRESS_<NETWORK> or update client/src/config/addresses.json');
    } else {
      try {
        const code = await provider.getCode(CONTRACT_ADDR);
        if (!code || code === '0x') {
          console.error('❌ No contract code at configured address:', CONTRACT_ADDR);
          // In production (sepolia) fail fast
          if ((process.env.NETWORK || 'local').toLowerCase() === 'sepolia') {
            throw new Error('Contract not found at configured address on Sepolia');
          }
        } else {
          console.log('✅ Contract code present at configured address');
        }
      } catch (err) {
        console.warn('⚠️ Error checking contract code:', err.message || err);
      }
    }

    // 3.b Start event indexer
    try {
      const indexer = require('./src/services/eventIndexer');
      indexer.start().catch((e) => console.error('Indexer failed to start', e));
      console.log('✅ Event indexer started');
    } catch (err) {
      console.warn('Indexer not started:', err.message);
    }

    // 4. Start Listen
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 CertChain MVC Server running on:`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Network: http://${process.env.SERVER_IP}:${PORT}\n`);
    });
  } catch (err) {
    console.error('❌ Startup Failed:', err.message);
    process.exit(1);
  }
}

start();
