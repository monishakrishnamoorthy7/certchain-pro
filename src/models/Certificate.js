const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  hash: { type: String, required: true, unique: true, index: true },
  studentName: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  issuedDate: { type: Date, required: true },
  transactionHash: { type: String },
  blockNumber: { type: Number },
  issuerWallet: { type: String },
  uploadedBy: { type: String, required: true },
  isValid: { type: Boolean, default: true },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'REVOKED'], default: 'PENDING' },
  originalFileName: { type: String },
  fileSize: { type: Number },
  ipfsCid: { type: String },
  ipfsUrl: { type: String },
  mimeType: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
