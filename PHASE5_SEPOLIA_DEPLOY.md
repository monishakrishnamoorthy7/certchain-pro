Sepolia Deployment Notes
------------------------

Commands
- Deploy to Sepolia (requires `SEPOLIA_RPC_URL` and `PRIVATE_KEY` in env):

```
npx hardhat run scripts/deploy.js --network sepolia
```

What the deploy script produces
- `client/src/config/abi/ProductionCertificate.json` — ABI artifact for the frontend
- `client/src/config/addresses.json` — mapping of network -> contract address
- `deployments/<network>.json` — deployment manifest (network, address, deployer, txHash, timestamp, gitCommit)

Environment guidance
- Keep secrets out of source control. Use a `.env` file locally (not committed) or CI secrets in your deploy pipeline.
- Frontend env (Vite) should use `VITE_NETWORK` and `VITE_CONTRACT_ADDRESS` or read `client/src/config/addresses.json` at build time.
- Backend env uses `NETWORK` and may read `CONTRACT_ADDRESS_<NETWORK>` or `client/src/config/addresses.json` as a fallback.

Health endpoints
- `GET /api/health/blockchain` — latest block, chainId, contract address, contract code
- `GET /api/health/indexer` — indexer last processed block
- `GET /api/health/ipfs` — IPFS gateway reachability

Validation performed at startup
- RPC reachable (provider.getBlockNumber)
- Contract code present at configured address (provider.getCode)

Notes on verification
- If `ETHERSCAN_API_KEY` is set, the deploy script will attempt `hre.run('verify:verify')` after deploy.
