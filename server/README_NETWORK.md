Backend: Network-aware contract resolution

Overview
- The backend resolves RPC URL and contract address based on `NETWORK` env var or `client/src/config/addresses.json`.

Environment variables
- `NETWORK` (optional): network key such as `local` or `sepolia`. Defaults to `local`.
- `GANACHE_RPC_URL`, `SEPOLIA_RPC_URL`, `ALCHEMY_SEPOLIA_URL` (one required for selected network)
- `PRIVATE_KEY` for any backend-initiated transactions (deployment scripts should be used instead for production flows).

Contract address resolution
- The backend first checks for `CONTRACT_ADDRESS_<NETWORK>` env var (e.g. `CONTRACT_ADDRESS_SEPOLIA`).
- If not present, it falls back to `CONTRACT_ADDRESS` env var.
- If still not present, it tries to read `client/src/config/addresses.json` and use the matching network key. This allows deployment scripts to populate addresses for the frontend and backend consistently.

Why this flow
- Separation of deployment & runtime configuration ensures addresses are not hardcoded in multiple places.
- `addresses.json` becomes the single source of truth for deployed addresses per network.

Runtime permissions
- The backend validates on-chain role membership when confirming upload/revoke transactions by calling `contract.hasRole(role, address)` before accepting a cert confirmation. This is important because wallet auth (MetaMask) proves ownership of an address but does not imply authorization to perform administrative actions.
