# 🚀 Deployment Guide

This guide explains how to deploy the CertChain Production System to live environments.

## 1. Blockchain Deployment (Sepolia Testnet)

To deploy the smart contract to Sepolia:

1.  **Update `.env`**:
    -   Set `SEPOLIA_RPC_URL` to your Infura/Alchemy endpoint.
    -   Set `PRIVATE_KEY` to your Sepolia wallet key (ensure it has test ETH).
2.  **Run Deployment**:
    ```bash
    npx hardhat run scripts/deploy_production.js --network sepolia
    ```
3.  **Note the Address**: The script will automatically update your `.env` with the new `CONTRACT_ADDRESS`.

---

## 2. Backend Deployment (Render / Railway)

The backend is a standard Node.js Express application with MongoDB.

### Render
1.  **New Web Service**: Connect your GitHub repository.
2.  **Build Command**: `npm install`
3.  **Start Command**: `node server.js`
4.  **Environment Variables**:
    -   `PORT`: 10000 (standard for Render)
    -   `MONGODB_URI`: Your MongoDB Atlas connection string.
    -   `JWT_SECRET`: A long random string.
    -   `PRIVATE_KEY`: Your wallet private key.
    -   `GANACHE_RPC_URL`: Your blockchain RPC URL (e.g., Sepolia/Mainnet).
    -   `CONTRACT_ADDRESS`: Deployed contract address.
    -   `ADMIN_EMAIL` / `ADMIN_PASSWORD`: For initial setup.

---

## 3. Frontend Deployment (Netlify / Vercel)

Since the frontend is served as a static file (`index.html`) by the backend in this configuration, you have two options:

### Option A: Monolithic (Easiest)
-   Deploy the backend (as above). The frontend is served automatically at the root `/`.

### Option B: Decoupled (Best Performance)
1.  **Modify `index.html`**:
    -   Set `const API = "https://your-backend-url.onrender.com";` at the top of the `<script>` tag.
2.  **Upload to Netlify**: Drag and drop the `index.html` file or connect GitHub.
3.  **Update CORS**: Ensure the backend allows requests from your Netlify domain.

---

## 4. Security Checklist
- [ ] Change `JWT_SECRET` in production.
- [ ] Disable `/api/admin/setup` after first use (automatically handled if admin exists).
- [ ] Use `HTTPS` only.
- [ ] Ensure MongoDB is protected with IP whitelisting.
