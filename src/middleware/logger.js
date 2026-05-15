const AuditLog = require('../models/AuditLog');

const logAction = async (req, action, details, result, hash) => {
  try {
    const doc = {
      action,
      actor: req.admin ? req.admin.address : 'public',
      details,
      metadata: {},
      ip: req.ip || req.connection.remoteAddress,
      network: "ganache"
    };

    // only include certificate hash in metadata if provided
    if (hash) doc.metadata.hash = hash;

    // sanitize result: accept objects or simple status strings
    if (result) {
      if (typeof result === 'object' && !Array.isArray(result)) {
        const safeResult = { ...result };
        const hasTx = safeResult.txHash != null && safeResult.txHash !== '';
        const hasLogIndex = safeResult.logIndex != null && safeResult.logIndex !== '';
        if (!(hasTx && hasLogIndex)) {
          delete safeResult.txHash;
          delete safeResult.logIndex;
        }
        doc.result = safeResult;
      } else {
        // for non-object results (e.g. 'success'), store as status
        doc.result = { status: String(result) };
      }
    }

    await AuditLog.create(doc);
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
};

module.exports = { logAction };
