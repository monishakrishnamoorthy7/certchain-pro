const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_BASE_URL = process.env.IPFS_API_URL || 'https://api.pinata.cloud';
const IPFS_GATEWAY_URL = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud';

const assertPinataConfig = () => {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error('Pinata API credentials are missing');
  }
};

const buildGatewayUrl = (cid) => `${IPFS_GATEWAY_URL.replace(/\/$/, '')}/ipfs/${cid}`;

async function uploadToIPFS({ buffer, fileName, mimeType }) {
  assertPinataConfig();

  const form = new FormData();
  form.append('file', buffer, { filename: fileName, contentType: mimeType });
  form.append('pinataMetadata', JSON.stringify({ name: fileName }));

  const response = await axios.post(`${PINATA_BASE_URL}/pinning/pinFileToIPFS`, form, {
    headers: {
      ...form.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });

  const cid = response.data.IpfsHash;
  return {
    cid,
    ipfsUrl: buildGatewayUrl(cid)
  };
}

async function deleteFromIPFS(cid) {
  if (!cid) return;
  // Placeholder for future unpin support
}

module.exports = {
  uploadToIPFS,
  deleteFromIPFS
};
