/*
  Event indexer service
  - listens for RoleGranted, RoleRevoked, CertificateAdded, CertificateRevoked
  - writes normalized AuditLog entries
  - stores processed tx/logIndex entries to avoid duplicates
  - resumes from last processed block on startup (INDEXER_START_BLOCK env optional)
*/
const { provider, CONTRACT_ADDR, ethers, network } = require('./blockchain');
const AuditLog = require('../models/AuditLog');
const ProcessedEvent = require('../models/ProcessedEvent');
const IndexerState = require('../models/IndexerState');
require('dotenv').config();

const START_BLOCK_ENV = process.env.INDEXER_START_BLOCK ? Number(process.env.INDEXER_START_BLOCK) : null;
const REQUIRED_CONFIRMATIONS = process.env.EVENT_CONFIRMATIONS ? Number(process.env.EVENT_CONFIRMATIONS) : 2;

// RPC and throttling configuration (tweak via env vars)
const RPC_DELAY_MS = process.env.EVENT_RPC_DELAY_MS ? Number(process.env.EVENT_RPC_DELAY_MS) : 1000;
const RPC_MAX_RETRIES = process.env.EVENT_RPC_MAX_RETRIES ? Number(process.env.EVENT_RPC_MAX_RETRIES) : 6;
const RECHECK_INTERVAL_MS = process.env.EVENT_RECHECK_INTERVAL_MS ? Number(process.env.EVENT_RECHECK_INTERVAL_MS) : 5000;

function sleep(ms) { return new Promise((res) => setTimeout(res, ms)); }

// robust retry helper with exponential backoff and jitter
async function rpcRetry(fn, attempts = RPC_MAX_RETRIES, baseDelayMs = 500) {
  let i = 0;
  while (i < attempts) {
    try {
      return await fn();
    } catch (err) {
      i++;
      const is429 = err && err.error && (err.error.code === 429 || (err.error.message && err.error.message.includes && err.error.message.includes('compute units')));
      if (i >= attempts) throw err;
      const multiplier = is429 ? 3 : 1;
      const delay = Math.floor(baseDelayMs * Math.pow(2, i - 1) * multiplier * (0.8 + Math.random() * 0.4));
      console.warn(`RPC retry ${i}/${attempts} (429=${is429}) — waiting ${delay}ms`);
      await sleep(delay);
    }
  }
}

// Minimal ABI for events we care about
const EVENTS_ABI = [
  // AccessControl events
  'event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)',
  'event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)',
  // Certificate events (from ProductionCertificate)
  'event CertificateAdded(string indexed hash, string studentName, string course, uint256 issuedDate)',
  'event CertificateRevoked(string indexed hash)'
];

const iface = new ethers.Interface(EVENTS_ABI);

async function ensureState() {
  let state = await IndexerState.findOne({ network });
  if (!state) {
    state = await IndexerState.create({ network, lastProcessedBlock: START_BLOCK_ENV || 0 });
  }
  return state;
}

async function markProcessed(txHash, logIndex, blockNumber, blockHash) {
  try {
    await ProcessedEvent.create({ network, txHash, logIndex, blockNumber, blockHash });
  } catch (err) {
    // ignore duplicate key errors
  }
}

async function alreadyProcessed(txHash, logIndex) {
  const exists = await ProcessedEvent.findOne({ network, txHash, logIndex });
  return !!exists;
}

function toActionName(eventName) {
  switch (eventName) {
    case 'RoleGranted': return 'role_grant';
    case 'RoleRevoked': return 'role_revoke';
    case 'CertificateAdded': return 'certificate_add';
    case 'CertificateRevoked': return 'certificate_revoke';
    default: return 'chain_event';
  }
}

async function processLog(log) {
  try {
    const { transactionHash: txHash, logIndex, blockNumber } = log;
    // Validate that txHash and logIndex are present before processing
    if (!txHash || logIndex == null) {
      console.warn('[audit] skipping invalid log', { txHash, logIndex });
      return;
    }
    // idempotency: if processed marker exists, we may still want to update confirmations/status
    const existingProcessed = await ProcessedEvent.findOne({ network, txHash, logIndex });

    let parsed;
    try {
      parsed = iface.parseLog(log);
    } catch (err) {
      // not an event we recognize
      return;
    }

    const eventName = parsed.name;
    const args = parsed.args;

    // fetch block and network info with retry
    const latestBlock = await rpcRetry(() => provider.getBlockNumber());
    const block = await rpcRetry(() => provider.getBlock(blockNumber)).catch(() => null);
    const chain = await rpcRetry(() => provider.getNetwork()).catch(() => ({}));
    const blockHash = block?.hash || null;

    const confirmations = latestBlock >= blockNumber ? Math.max(0, latestBlock - blockNumber + 1) : 0;

    // attempt to get tx to extract 'from'
    const tx = await rpcRetry(() => provider.getTransaction(txHash)).catch(() => null);
    const actor = tx?.from || (args.sender ? args.sender : null) || null;

    const metadata = {
      txHash,
      logIndex,
      blockNumber,
      chainId: chain.chainId || null,
      actor,
    };

    if (eventName === 'RoleGranted' || eventName === 'RoleRevoked') {
      metadata.role = args.role;
      metadata.account = args.account;
    }
    if (eventName === 'CertificateAdded') {
      metadata.hash = args.hash;
      metadata.studentName = args.studentName;
      metadata.course = args.course;
      metadata.issuedDate = args.issuedDate?.toString?.() || args.issuedDate;
    }
    if (eventName === 'CertificateRevoked') {
      metadata.hash = args.hash;
    }

    // decide status based on confirmations
    const isCritical = ['RoleGranted', 'RoleRevoked', 'CertificateAdded', 'CertificateRevoked'].includes(eventName);
    const required = isCritical ? REQUIRED_CONFIRMATIONS : 1;
    const status = confirmations >= required ? 'confirmed' : 'pending';

    // upsert AuditLog (create if missing, update otherwise)
    // Ensure txHash/logIndex are valid before attempting to write AuditLog
    if (!txHash || logIndex == null) {
      console.warn('[audit] blocked invalid insert', { txHash, logIndex });
    } else {
      const auditQuery = { network, txHash, logIndex };
      // build update and only include txHash/logIndex when present
      const auditUpdate = {
        network,
        action: toActionName(eventName),
        actor: actor || 'unknown',
        details: `${eventName} observed on-chain`,
        metadata,
        blockNumber,
        chainId: metadata.chainId,
        status,
        confirmations,
        timestamp: block ? new Date(block.timestamp * 1000) : new Date()
      };
      // conditionally add txHash/logIndex to avoid inserting nulls
      if (txHash) auditUpdate.txHash = txHash;
      if (logIndex != null) auditUpdate.logIndex = logIndex;

      try {
        await AuditLog.findOneAndUpdate(auditQuery, auditUpdate, { upsert: true, setDefaultsOnInsert: true });
      } catch (err) {
        console.error('[audit] write failed:', err && err.message ? err.message : err);
      }
    }

    // mark processed marker so we won't duplicate process in catchup
    if (!existingProcessed) {
      await markProcessed(txHash, logIndex, blockNumber, blockHash);
    }

    // if confirmed, advance lastProcessedBlock
    if (status === 'confirmed') {
      await IndexerState.findOneAndUpdate({ network }, { $max: { lastProcessedBlock: blockNumber } }, { upsert: true });
    }
  } catch (err) {
    console.error('Error processing log', err);
  }
}

async function catchUpAndSubscribe() {
  const state = await ensureState();
  const fromBlock = Math.max(START_BLOCK_ENV || 0, (state.lastProcessedBlock || 0) + 1);
  const latest = await provider.getBlockNumber();
  console.log(`Indexer: syncing from block ${fromBlock} to ${latest} on ${network}`);

  // fetch logs in batches (limited to provider constraints, e.g., Alchemy free tier allows 10-block ranges)
  const BATCH = 10;
  for (let start = fromBlock; start <= latest; start += BATCH) {
    // ensure at most 10 blocks per request: fromBlock..toBlock inclusive
    const end = Math.min(start + 9, latest);
    try {
      const filter = { address: CONTRACT_ADDR, fromBlock: start, toBlock: end };
      // use rpcRetry + backoff to handle transient 429s
      const logs = await rpcRetry(() => provider.getLogs(filter)).catch((e) => { throw e; });
      logs.sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex);
      for (const log of logs) {
        await processLog(log);
      }
      // brief pause between batches to avoid throughput spikes
      await sleep(RPC_DELAY_MS);
    } catch (err) {
      console.error('Indexer batch error', err);
    }
  }

  // helper: re-evaluate pending and recent confirmed entries for confirmations/reorgs
  async function recheckRecent(latest) {
    try {
      const lookback = REQUIRED_CONFIRMATIONS + 6;
      const minBlock = Math.max(0, latest - lookback);
      const recent = await AuditLog.find({ network, blockNumber: { $gte: minBlock } }).limit(1000);
      for (const row of recent) {
        try {
          const tx = await rpcRetry(() => provider.getTransaction(row.txHash)).catch(() => null);
          if (!tx || !tx.blockNumber) {
            // tx not found in chain; if it's older than required window, mark reorged
            const age = latest - (row.blockNumber || 0) + 1;
            if (age >= REQUIRED_CONFIRMATIONS) {
              await AuditLog.findByIdAndUpdate(row._id, { status: 'reorged' });
            }
            continue;
          }

          // tx present in chain: recompute confirmations
          const confs = latest - tx.blockNumber + 1;
          const desired = confs >= REQUIRED_CONFIRMATIONS ? 'confirmed' : 'pending';
          await AuditLog.findByIdAndUpdate(row._id, { confirmations: confs, status: desired, blockNumber: tx.blockNumber });
        } catch (e) {
          // ignore per-row errors
        }
      }
    } catch (err) {
      console.error('recheckRecent error', err);
    }
  }

  // subscribe to new blocks; process logs and recheck pending entries
  let lastRecheckTs = 0;
  provider.on('block', async (blockNumber) => {
    try {
      // process logs in this block (with retry)
      const filter = { address: CONTRACT_ADDR, fromBlock: blockNumber, toBlock: blockNumber };
      const logs = await rpcRetry(() => provider.getLogs(filter)).catch(() => []);
      for (const log of logs) await processLog(log);

      // update indexer state
      await IndexerState.findOneAndUpdate({ network }, { lastProcessedBlock: blockNumber }, { upsert: true });

      // debounce heavy rechecks to avoid throughput spikes
      const now = Date.now();
      if (now - lastRecheckTs > RECHECK_INTERVAL_MS) {
        lastRecheckTs = now;
        recheckRecent(blockNumber).catch((e) => console.error('recheckRecent background error', e));
      }
    } catch (err) {
      console.error('Indexer block handler error', err);
    }
  });

  console.log('Indexer: live subscription active');
}

module.exports = {
  start: catchUpAndSubscribe
};
