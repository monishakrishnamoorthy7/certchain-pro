const express = require('express');
const cors    = require('cors');
const path    = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const certRoutes = require('./routes/certificateRoutes');
const logRoutes  = require('./routes/logRoutes');
const { provider } = require('./services/blockchain');
const Certificate = require('./models/Certificate');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../')));

// System Status API
app.get('/api/status', async (req, res) => {
  try {
    const totalCerts = await Certificate.countDocuments();
    const revokedCerts = await Certificate.countDocuments({ isValid: false });
    const validCerts = await Certificate.countDocuments({ isValid: true });
    res.json({
      success: true,
      data: {
        totalCertificates: totalCerts,
        validCertificates: validCerts,
        revokedCertificates: revokedCerts,
        latestBlock: await provider.getBlockNumber(),
        serverIp: process.env.SERVER_IP
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/certificate', certRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/health', healthRoutes);

// Public Verification Page
app.get('/verify-hash/:hash', (req, res) => {
  res.sendFile(path.join(__dirname, '../public_verify.html'));
});

// Compatibility aliases (to not break existing frontend if possible)
app.use('/api', certRoutes); 

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
