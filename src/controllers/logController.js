const AuditLog = require('../models/AuditLog');

exports.getLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createLog = async (req, res) => {
  try {
    const { action, details, metadata } = req.body;
    if (!action) return res.status(400).json({ success: false, message: 'action required' });
    const user = req.user?.address || null;
    // Clean metadata to avoid inserting explicit null txHash/logIndex
    const safeMetadata = { ...(metadata || {}) };
    const hasTx = safeMetadata.txHash != null && safeMetadata.txHash !== '';
    const hasLogIndex = safeMetadata.logIndex != null && safeMetadata.logIndex !== '';
    if (!(hasTx && hasLogIndex)) {
      // remove possibly-null txHash/logIndex so they are not indexed as null
      delete safeMetadata.txHash;
      delete safeMetadata.logIndex;
    }

    const entry = await AuditLog.create({
      action,
      details,
      metadata: safeMetadata,
      actor: user,
      network: "ganache"
    });
    res.json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
