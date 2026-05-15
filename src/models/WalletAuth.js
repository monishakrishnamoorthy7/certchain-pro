const mongoose = require('mongoose');

const WalletAuthSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true, lowercase: true, trim: true },
  nonce: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

WalletAuthSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('WalletAuth', WalletAuthSchema);
