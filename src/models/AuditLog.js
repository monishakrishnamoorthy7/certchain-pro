const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  network: { type: String, required: true },
  action: {
    type: String,
    required: true,
    enum: ['upload', 'verify', 'revoke', 'login', 'logout', 'prepare', 'nonce', 'role_grant', 'role_revoke', 'certificate_add', 'certificate_revoke', 'chain_event']
  },
  actor: { type: String, default: 'public' }, // wallet or 'public'
  details: { type: String },
  metadata: { type: Object, default: {} },
  // normalized fields for indexing and UI
  txHash: { type: String, index: true },
  logIndex: { type: Number },
  blockNumber: { type: Number, index: true },
  chainId: { type: Number },
  status: { type: String, enum: ['pending', 'confirmed', 'reorged', 'failed'], default: 'pending' },
  confirmations: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

// ensure uniqueness per network/tx/log to avoid duplicates
// Enforce uniqueness only when both txHash and logIndex are present
AuditLogSchema.index(
  { network: 1, txHash: 1, logIndex: 1 },
  { unique: true, partialFilterExpression: { txHash: { $type: 'string' }, logIndex: { $type: 'number' } } }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
