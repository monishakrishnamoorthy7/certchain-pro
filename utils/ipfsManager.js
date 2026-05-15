/**
 * IPFS Management Utility
 * Handles file upload to IPFS and retrieval of IPFS content
 */

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

const PINATA_API_URL = process.env.IPFS_API_URL || "https://api.pinata.cloud";
const PINATA_GATEWAY = process.env.IPFS_GATEWAY_URL || "https://gateway.pinata.cloud";
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

/**
 * Upload file to IPFS via Pinata
 * @param {string} filePath - Path to file to upload
 * @param {string} fileName - Original file name
 * @returns {Promise<string>} IPFS Content Identifier (CID)
 * @throws {Error} If upload fails
 */
async function uploadToIPFS(filePath, fileName) {
    try {
        // Validate file exists
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found");
        }

        // Create form data
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));

        // Add metadata
        const metadata = JSON.stringify({
            name: fileName,
            keyvalues: {
                uploadedAt: new Date().toISOString(),
            },
        });
        formData.append("pinataMetadata", metadata);

        // Upload to Pinata
        const response = await axios.post(
            `${PINATA_API_URL}/pinning/pinFileToIPFS`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_API_SECRET,
                },
            }
        );

        const ipfsHash = response.data.IpfsHash;
        console.log(`✅ File uploaded to IPFS: ${ipfsHash}`);
        return ipfsHash;
    } catch (error) {
        throw new Error(`IPFS upload failed: ${error.message}`);
    }
}

/**
 * Get IPFS gateway URL for CID
 * @param {string} cid - IPFS Content Identifier
 * @returns {string} Full IPFS gateway URL
 */
function getIPFSGatewayURL(cid) {
    return `${PINATA_GATEWAY}/ipfs/${cid}`;
}

/**
 * Verify IPFS hash format
 * @param {string} cid - IPFS Content Identifier
 * @returns {boolean} True if valid CID format
 */
function isValidCID(cid) {
    // CIDv0: 46 character base58 hash (Qm...)
    // CIDv1: base32 encoded (baf...)
    return /^(Qm[a-zA-Z0-9]{44}|baf[a-zA-Z0-9]+)$/.test(cid);
}

/**
 * Pin content to IPFS by hash (make permanent)
 * @param {string} cid - IPFS Content Identifier
 * @returns {Promise<void>}
 */
async function pinToIPFS(cid) {
    try {
        if (!isValidCID(cid)) {
            throw new Error("Invalid CID format");
        }

        await axios.post(
            `${PINATA_API_URL}/pinning/pinByHash`,
            { hashToPin: cid },
            {
                headers: {
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_API_SECRET,
                },
            }
        );

        console.log(`✅ Content pinned permanently: ${cid}`);
    } catch (error) {
        throw new Error(`Failed to pin content: ${error.message}`);
    }
}

/**
 * Unpin content from IPFS
 * @param {string} cid - IPFS Content Identifier
 * @returns {Promise<void>}
 */
async function unpinFromIPFS(cid) {
    try {
        if (!isValidCID(cid)) {
            throw new Error("Invalid CID format");
        }

        await axios.delete(
            `${PINATA_API_URL}/pinning/unpin/${cid}`,
            {
                headers: {
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_API_SECRET,
                },
            }
        );

        console.log(`✅ Content unpinned: ${cid}`);
    } catch (error) {
        throw new Error(`Failed to unpin content: ${error.message}`);
    }
}

module.exports = {
    uploadToIPFS,
    getIPFSGatewayURL,
    isValidCID,
    pinToIPFS,
    unpinFromIPFS,
};
