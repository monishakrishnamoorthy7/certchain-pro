const fs = require("fs");
const crypto = require("crypto");

function generateFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    return hash;
}

// change file name here
const hash = generateFileHash("certificate.txt");

console.log("Hash:", hash);