Frontend: ABI & Network Integration

Overview
- The frontend consumes ABI artifacts and a centralized `addresses.json` produced by the deployment scripts.

Files
- `client/src/config/abi/ProductionCertificate.json` — Contract artifact (ABI + metadata) written by deploy scripts.
- `client/src/config/addresses.json` — Map of network keys to deployed addresses (e.g., { "local": "0x...", "sepolia": "0x..." }).

How it works
1. Deployment scripts write ABI artifact(s) to `client/src/config/abi` and update `client/src/config/addresses.json` with the deployed address for the target network.
2. The frontend imports `client/src/config/contract.js` which reads the ABI artifact and exposes `CONTRACT_ABI`.
3. The frontend reads `client/src/config/networks.js` which uses values from `addresses.json` (with env fallbacks) to determine `expected.contractAddress` and `rpcUrl`.
4. Wallet connection (MetaMask) triggers role checks via the read-only contract: `getRolesForAddress(address)`.

Notes for local development
- After running a deploy script, run `npm run dev` in the client.
- If you change contracts, re-run the deployment to refresh ABI and addresses.

Security
- Do not commit private keys or overwrite `addresses.json` manually in git; treat it as a runtime artifact.
- The frontend only reads addresses and ABI — write operations require user-signed transactions (MetaMask).
