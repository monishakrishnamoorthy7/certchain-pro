# 🛠️ Local Setup Guide

Follow these steps to get the CertChain Production System running on your machine.

## 1. Prerequisites
- **Node.js**: v18+ recommended.
- **MongoDB**: Community Edition running locally (`localhost:27017`).
- **Ganache**: Running locally (`localhost:7545`).

## 2. Installation
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Configure Environment**:
    -   Copy `example.env` to `.env`.
    -   Update `PRIVATE_KEY` with your Ganache account key.
    -   Update `SERVER_IP` with your local network IP (run `ipconfig` or `ifconfig`).

## 3. Smart Contract Deployment
Deploy the new production contract to your local Ganache:
```bash
node scripts/deploy_production.js
```
This will compile the contract and update your `.env` with the new address.

## 4. Run the Application
Start the server with nodemon:
```bash
npm run dev
```

## 5. First-Time Admin Login
-   By default, the system seeds an admin account from `.env`:
    -   **Email**: `admin@certchain.com`
    -   **Password**: `Admin@1234`
-   Open `http://localhost:3000` in your browser.
-   Click **Admin Login** and enter the credentials.

## 6. Verification
1.  **Upload**: Select a PDF, enter student details, and click Upload.
2.  **Verify**: Upload the same PDF or paste the hash in the Verify tab.
3.  **QR Page**: Use the "Open QR Verify Page" link to see the public-facing verification view.
4.  **Revoke**: Copy the hash of an uploaded cert, go to Revoke tab, and confirm. Verify again to see the "REVOKED" status.
