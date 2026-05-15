const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  course: {
    type: String,
    required: true,
    trim: true,
  },
  issuedDate: {
    type: Date,
    required: true,
  },
  transactionHash: {
    type: String,
    required: true,
  },
  blockNumber: {
    type: Number,
  },
  uploadedBy: {
    type: String, // Admin email or address
    required: true,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  fileName: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Certificate', CertificateSchema);
