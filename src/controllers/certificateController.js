const crypto = require('crypto');
const { contract, provider, ethers, CONTRACT_ADDR, CONTRACT_ABI } = require('../services/blockchain');
const { uploadToIPFS } = require('../services/ipfs');
const Certificate = require('../models/Certificate');
const { logAction } = require('../middleware/logger');

// Hash helper
const hashBuffer = (buffer) => {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
};

const iface = new ethers.Interface(CONTRACT_ABI);

// Role identifiers (match Solidity keccak256 of role names)
const SUPER_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes('SUPER_ADMIN_ROLE'));
const UNIVERSITY_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes('UNIVERSITY_ADMIN_ROLE'));
const DEPARTMENT_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes('DEPARTMENT_ADMIN_ROLE'));

const findEvent = (receipt, eventName) => {
  for (const log of receipt.logs || []) {
    if (log.address.toLowerCase() !== CONTRACT_ADDR.toLowerCase()) continue;
    try {
      const parsed = iface.parseLog(log);
      if (parsed && parsed.name === eventName) return parsed;
    } catch (err) {
      // Skip non-matching logs
    }
  }
  return null;
};

const getTxAndReceipt = async (txHash) => {
  const tx = await provider.getTransaction(txHash);
  if (!tx) throw new Error('Transaction not found');

  // Poll for the receipt in case the RPC is eventually consistent or the tx is still pending
  let receipt = null;
  for (let i = 0; i < 10; i++) {
    receipt = await provider.getTransactionReceipt(txHash).catch(() => null);
    if (receipt) break;
    // wait 1.5s before retrying
    await new Promise((r) => setTimeout(r, 1500));
  }
  if (!receipt) throw new Error('Transaction receipt not found');
  if (receipt.status !== 1) throw new Error('Transaction failed on-chain');
  if (!tx.to || tx.to.toLowerCase() !== CONTRACT_ADDR.toLowerCase()) {
    throw new Error('Transaction target mismatch');
  }
  return { tx, receipt };
};

exports.prepareCertificate = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { studentName, course } = req.body;
    if (!studentName || !course) return res.status(400).json({ success: false, message: 'Missing fields' });

    if (!req.file.buffer) {
      return res.status(400).json({ success: false, message: 'Invalid upload payload' });
    }

    const hash = hashBuffer(req.file.buffer);
    const issuedTimestamp = Math.floor(Date.now() / 1000);

    // Check on-chain first; if contract reports exists and is valid, treat as duplicate
    if (await contract.certificateExists(hash)) {
      // existing confirmed on-chain
      const existingOnChain = await Certificate.findOne({ hash });
      if (existingOnChain && existingOnChain.transactionHash && existingOnChain.status === 'ACTIVE') {
        console.warn('[prepare] duplicate detected (on-chain):', existingOnChain);
        return res.status(409).json({ success: false, message: 'Certificate already exists' });
      }
    }

    // Check DB for existing record
    const existing = await Certificate.findOne({ hash });
    if (existing) {
      // if existing is fully confirmed and has txHash, treat as duplicate
      if (existing.transactionHash && existing.status === 'ACTIVE') {
        console.warn('[prepare] duplicate detected:', existing);
        return res.status(409).json({ success: false, message: 'Certificate already prepared' });
      }
      // otherwise, allow retry and overwrite stale/incomplete record
      console.warn('[prepare] stale/incomplete record found, allowing retry:', { id: existing._id, transactionHash: existing.transactionHash, status: existing.status });
    }

    const ipfsResult = await uploadToIPFS({
      buffer: req.file.buffer,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype
    });

    // Upsert certificate record to avoid duplicate key errors for retries
    const cert = await Certificate.findOneAndUpdate(
      { hash },
      {
        hash,
        studentName,
        course,
        issuedDate: new Date(issuedTimestamp * 1000),
        uploadedBy: req.admin.address,
        status: 'PENDING',
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        ipfsCid: ipfsResult.cid,
        ipfsUrl: ipfsResult.ipfsUrl,
        mimeType: req.file.mimetype
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    await logAction(req, 'prepare', `Prepared cert for ${studentName}`, 'success', hash);

    res.status(201).json({
      success: true,
      data: { hash, issuedTimestamp, certId: cert._id }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.confirmCertificate = async (req, res) => {
  try {
    const { hash, txHash } = req.body;
    if (!hash || !txHash) {
      return res.status(400).json({ success: false, message: 'hash and txHash required' });
    }
    console.log('[confirm] incoming hash:', hash);
    console.log('[confirm] incoming txHash:', txHash);

    // Prefer the most recent DB record for this hash (ignore stale PENDING rows)
    const cert = await Certificate.findOne({ hash }).sort({ updatedAt: -1 }).exec();
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Prepared certificate not found' });
    }
    console.log('[confirm] matched certificate:', cert?._id);
    // If already active, only reject when the stored txHash differs from incoming
    if (cert.status === 'ACTIVE') {
      if (cert.transactionHash && cert.transactionHash !== txHash) {
        return res.status(409).json({ success: false, message: 'Certificate already confirmed with a different transaction' });
      }
      // If txHash matches or missing, treat as idempotent success
      return res.json({ success: true, txHash: cert.transactionHash || txHash, data: cert });
    }

    // Validate tx and receipt (may throw). We'll try to treat errors conservatively
    // so that a successful on-chain transaction won't be reported as a failure
    // if only non-critical post-processing fails.
    let tx, receipt, event;
    try {
      const result = await getTxAndReceipt(txHash);
      tx = result.tx;
      receipt = result.receipt;
      event = findEvent(receipt, 'CertificateAdded');
      if (!event) {
        return res.status(400).json({ success: false, message: 'CertificateAdded event not found' });
      }
      const eventHash = event.args.hash;
      if (eventHash !== hash) {
        return res.status(400).json({ success: false, message: 'Transaction event hash does not match requested certificate hash' });
      }

      // Authorization: ensure tx.from has the appropriate role on-chain
      const caller = tx.from;
      const hasRole = await contract.hasRole(UNIVERSITY_ADMIN_ROLE, caller) || await contract.hasRole(SUPER_ADMIN_ROLE, caller);
      if (!hasRole) {
        return res.status(403).json({ success: false, message: 'Issuer address not authorized on-chain to add certificates' });
      }

      // Persist the certificate as the primary success path. Allow overwriting
      // of any existing PENDING transactionHash (e.g., retries / stale records).
      cert.transactionHash = txHash;
      cert.blockNumber = receipt.blockNumber;
      cert.issuerWallet = tx.from;
      cert.isValid = true;
      cert.status = 'ACTIVE';
      await cert.save();

      // Schedule non-critical work asynchronously (audit logging, indexing, analytics)
      // Do not await these; wrap each in its own try/catch so failures are non-fatal.
      (async () => {
        try {
          await logAction(req, 'upload', `Confirmed cert for ${cert.studentName}`, 'success', hash);
        } catch (err) {
          console.error('[audit] non-fatal failure:', err && err.message ? err.message : err);
        }
        // future non-critical tasks may be added here, always try/catch them
      })().catch((err) => {
        // Catch any unexpected scheduling errors
        console.error('[confirm] scheduling background tasks failed:', err && err.message ? err.message : err);
      });

      // Return success immediately after persistence. If background work fails
      // the frontend will be informed through the warning field when appropriate.
      return res.json({ success: true, txHash, data: cert });
    } catch (err) {
      // If we managed to persist the certificate but a later non-critical
      // operation threw, prefer returning success with a warning rather than
      // a 500 which incorrectly marks the on-chain tx as failed to the user.
      const errMsg = err && err.message ? err.message : String(err);
      console.error('[confirm] non-fatal error after persistence check:', errMsg);
      if (cert && cert.transactionHash) {
        return res.json({ success: true, txHash: cert.transactionHash, warning: 'Audit sync pending', data: cert });
      }
      // Otherwise rethrow to let outer catch handle it as a true failure
      throw err;
    }
  } catch (err) {
    const message = err && err.message ? err.message : 'Failed to confirm certificate';
    res.status(500).json({ success: false, message });
  }
};

const buildVerificationPayload = async (hash) => {
  const exists = await contract.certificateExists(hash);
  if (!exists) {
    return {
      hash,
      status: 'NOT_FOUND'
    };
  }
  const cert = await contract.verifyCertificate(hash);
  const dbCert = await Certificate.findOne({ hash });
  const networkInfo = await provider.getNetwork();
  const onChainValid = cert.isValid === true;
  const dbRevoked = dbCert?.status === 'REVOKED';
  const status = onChainValid && !dbRevoked ? 'VALID' : 'REVOKED';
  // Build a clean certificate object for API consumers
  const certificate = {
    status,
    studentName: cert.studentName,
    course: cert.course,
    issuerWallet: dbCert?.issuerWallet || cert.issuerWallet || null,
    transactionHash: dbCert?.transactionHash || null,
    issueDate: dbCert?.issuedDate || new Date(Number(cert.issuedDate) * 1000),
    revokedAt: dbCert?.status === 'REVOKED' ? dbCert.updatedAt : null,
    ipfsHash: dbCert?.ipfsCid || null,
    ipfsUrl: dbCert?.ipfsUrl || null,
    blockchainVerificationStatus: onChainValid ? 'VALID' : 'REVOKED',
    dbStatus: dbCert?.status || null,
    chainId: networkInfo.chainId,
    hash
  };

  return certificate;
};

// Helper to safely serialize objects that may contain BigInt values
const safeSerialize = (payload) => {
  try {
    return JSON.parse(JSON.stringify(payload, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));
  } catch (err) {
    // Fallback: return payload as-is if serialization fails
    return payload;
  }
};

exports.verifyCertificate = async (req, res) => {
  try {
    let hash = req.body.hash;
    // Log incoming verification requests to aid local debugging
    console.log('[verify] incoming request', { hasFile: !!req.file, bodyHash: req.body.hash });
    if (req.file) {
      if (!req.file.buffer) {
        return res.status(400).json({ success: false, message: 'Invalid upload payload' });
      }
      hash = hashBuffer(req.file.buffer);
      console.log('[verify] computed hash from uploaded file', { hash });
    }

    if (!hash) {
      console.log('[verify] no hash supplied');
      return res.status(400).json({ success: false, message: 'Hash or file required' });
    }

    console.log('[verify] verifying hash', hash);
    const data = await buildVerificationPayload(hash);
    if (!data || data.status === 'NOT_FOUND') {
      await logAction(req, 'verify', `Verified cert lookup`, 'NOT_FOUND', hash).catch(() => {});
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    await logAction(req, 'verify', `Verified cert lookup`, data.status, hash).catch(() => {});
    return res.json(safeSerialize({ success: true, certificate: data }));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.revokeConfirm = async (req, res) => {
  try {
    const { hash, txHash } = req.body;
    if (!hash || !txHash) {
      return res.status(400).json({ success: false, message: 'hash and txHash required' });
    }

    const cert = await Certificate.findOne({ hash });
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    if (cert.status === 'REVOKED') {
      return res.status(409).json({ success: false, message: 'Certificate already revoked' });
    }

    // Validate tx and receipt, persist first, and perform non-critical work asynchronously
    try {
      const { tx, receipt } = await getTxAndReceipt(txHash);
      const event = findEvent(receipt, 'CertificateRevoked');
      if (!event) {
        return res.status(400).json({ success: false, message: 'CertificateRevoked event not found' });
      }

      const eventHash = event.args.hash;
      if (eventHash !== hash) {
        return res.status(400).json({ success: false, message: 'Transaction hash does not match certificate' });
      }

      // Authorization: ensure tx.from has the appropriate role on-chain
      const caller = tx.from;
      const hasRole = await contract.hasRole(UNIVERSITY_ADMIN_ROLE, caller) || await contract.hasRole(SUPER_ADMIN_ROLE, caller);
      if (!hasRole) {
        return res.status(403).json({ success: false, message: 'Issuer address not authorized on-chain to revoke certificates' });
      }

      cert.transactionHash = txHash;
      cert.blockNumber = receipt.blockNumber;
      cert.isValid = false;
      cert.status = 'REVOKED';
      await cert.save();

      // schedule non-critical logging and indexing
      (async () => {
        try {
          await logAction(req, 'revoke', `Revoked cert`, 'success', hash);
        } catch (err) {
          console.error('[audit] non-fatal failure (revoke):', err && err.message ? err.message : err);
        }
      })().catch((err) => {
        console.error('[revokeConfirm] scheduling background tasks failed:', err && err.message ? err.message : err);
      });

      return res.json({ success: true, txHash, data: cert });
    } catch (err) {
      const msg = err && err.message ? err.message : 'Failed to revoke';
      console.error('[revokeConfirm] non-fatal error after persistence check:', msg);
      if (cert && cert.transactionHash) {
        return res.json({ success: true, txHash: cert.transactionHash, warning: 'Audit sync pending', data: cert });
      }
      throw err;
    }
  } catch (err) {
    const message = err && err.message ? err.message : 'Failed to revoke certificate';
    res.status(500).json({ success: false, message });
  }
};

exports.getCertificateByHash = async (req, res) => {
  try {
    const { hash } = req.params;
    const data = await buildVerificationPayload(hash);
    if (!data || data.status === 'NOT_FOUND') {
      await logAction(req, 'verify', `Verified cert lookup`, 'NOT_FOUND', hash).catch(() => {});
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    await logAction(req, 'verify', `Verified cert lookup`, data.status, hash).catch(() => {});
    return res.json(safeSerialize({ success: true, certificate: data }));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
