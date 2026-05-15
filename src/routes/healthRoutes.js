const express = require('express');
const router = express.Router();
const { provider, CONTRACT_ADDR } = require('../services/blockchain');
const IndexerState = require('../models/IndexerState');
const axios = require('axios');
require('dotenv').config();

router.get('/blockchain', async (req, res) => {
  try {
    const block = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    const code = CONTRACT_ADDR ? await provider.getCode(CONTRACT_ADDR) : null;
    res.json({ success: true, data: { latestBlock: block, chainId: network.chainId, contractAddress: CONTRACT_ADDR, contractCode: code } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/indexer', async (req, res) => {
  try {
    const state = await IndexerState.findOne({ network: process.env.NETWORK || 'local' });
    res.json({ success: true, data: { lastProcessedBlock: state ? state.lastProcessedBlock : null } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/ipfs', async (req, res) => {
  try {
    const gateway = process.env.IPFS_GATEWAY_URL || process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';
    const r = await axios.get(gateway, { timeout: 3000 }).catch(() => null);
    res.json({ success: true, data: { gateway, reachable: !!r } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
