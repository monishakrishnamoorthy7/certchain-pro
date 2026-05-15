const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const WalletAuth = require('../models/WalletAuth');
const { logAction } = require('../middleware/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const NONCE_TTL_SECONDS = Number(process.env.WALLET_NONCE_TTL_SECONDS || 300);

const buildMessage = (nonce) => `Login to CertChain: ${nonce}`;

exports.requestNonce = async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: 'Wallet address required' });
    }

    const normalized = address.toLowerCase();
    const nonce = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + NONCE_TTL_SECONDS * 1000);

    await WalletAuth.findOneAndUpdate(
      { address: normalized },
      { address: normalized, nonce, expiresAt },
      { upsert: true, returnDocument: 'after' }
    );

    await logAction(req, 'nonce', `Nonce issued for ${normalized}`, 'success');

    res.json({
      success: true,
      data: {
        address: normalized,
        nonce,
        message: buildMessage(nonce),
        expiresAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifySignature = async (req, res) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature) {
      return res.status(400).json({ success: false, message: 'Address and signature required' });
    }

    const normalized = address.toLowerCase();
    const auth = await WalletAuth.findOne({ address: normalized });
    if (!auth) {
      return res.status(404).json({ success: false, message: 'Nonce not found' });
    }
    if (auth.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Nonce expired' });
    }

    const message = buildMessage(auth.nonce);
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== normalized) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const token = jwt.sign({ address: normalized }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    auth.nonce = crypto.randomBytes(16).toString('hex');
    auth.expiresAt = new Date(Date.now() - 1000);
    await auth.save();

    req.admin = { address: normalized };
    await logAction(req, 'login', `Wallet ${normalized} logged in`, 'success');

    res.json({ success: true, data: { token, address: normalized } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = async (req, res) => {
  await logAction(req, 'logout', `Wallet logged out`, 'success');
  res.json({ success: true, message: 'Logged out' });
};
