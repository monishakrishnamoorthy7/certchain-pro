**Event Indexer (server-side) — design notes**

Overview
- The server runs an event indexer at `src/services/eventIndexer.js` that:
  - syncs past events (RoleGranted, RoleRevoked, CertificateAdded, CertificateRevoked) from the configured RPC
  - writes normalized audit records to the `AuditLog` collection
  - persists processed tx/log indexes to `ProcessedEvent` to avoid duplicates
  - remembers last processed block in `IndexerState` so restarts resume work

Why index chain events
- Trust boundary: frontend logs can be manipulated. The canonical source of truth for state changes is on-chain events.
- Events are emitted by the smart contract and are immutable once confirmed, providing a tamper-evident audit trail.

Event sourcing concepts (short)
- Event sourcing records every state change as an append-only stream of events. Consumers rebuild read models by replaying those events.
- Our indexer is a read-side projector: it reads the chain's event stream and materializes a queryable audit view (MongoDB `AuditLog`).

Replay protection & idempotency
- Each processed log is recorded in `ProcessedEvent` keyed by `(network, txHash, logIndex)` with a unique index.
- Before processing a log we check `ProcessedEvent` — if present we skip it. This prevents duplicate ingestion across restarts or reorgs.

Startup sync / resume
- `IndexerState` stores `lastProcessedBlock` per network. On start the indexer:
  1. reads the last processed block
  2. fetches historical logs from `last+1` to current in batches
  3. processes logs in-order and updates lastProcessedBlock
  4. subscribes to new blocks and processes logs as they appear
- You can override the initial starting block with env `INDEXER_START_BLOCK`.

Event record format (AuditLog.metadata)
- `txHash`, `logIndex`, `blockNumber`, `chainId`, `actor` (tx.from or sender),
- event-specific fields: `role`, `account`, `hash`, `studentName`, `course`, `issuedDate`.


Consistency model
- The DB is eventually consistent with the chain: there may be a short delay between on-chain confirmation and the corresponding audit record.
- Because we persist processed markers and resume from the last processed block, the indexer tolerates restarts and keeps the DB in sync over time.

Confirmations and reorgs
- Chain reorganizations (reorgs) occur when a previously canonical block is replaced by a different competing chain. Short reorgs (a few blocks) are possible and normal on public networks.
- To avoid acting on transactions that may be dropped by a reorg, the indexer waits for `EVENT_CONFIRMATIONS` (default 2) before marking critical events as `confirmed`.
- Events are initially recorded as `pending` with a `confirmations` counter. Once confirmations >= `EVENT_CONFIRMATIONS` the event becomes `confirmed`.
- If a pending/confirmed transaction is no longer found at the expected block (indicating a reorg or dropped tx), the indexer marks the audit record as `reorged` to indicate it should not be trusted.

Why confirmations matter
- The blockchain is probabilistic: a transaction included in a block becomes more final as additional blocks build on top of it.
- Waiting for N confirmations reduces the chance that the transaction will be reverted by a short reorg. This is important for governance (role grants/revokes) and certificate issuance.

RPC failures and retry
- The indexer uses a small RPC retry helper for transient errors and backoff, improving resilience against temporary node outages.

Next improvements
- Add an admin endpoint to trigger reindexing of a specific block range for backfills or repairs.
- Consider waiting for more confirmations on mainnet (e.g., 12) and exposing different thresholds per event type.
