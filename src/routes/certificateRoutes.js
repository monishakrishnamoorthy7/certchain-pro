const express = require('express');
const router  = express.Router();
const certController = require('../controllers/certificateController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.post('/verify', upload.single('file'), certController.verifyCertificate);
router.get('/:hash', certController.getCertificateByHash);

// Admin Only
router.post('/prepare', verifyToken, upload.single('file'), certController.prepareCertificate);
router.post('/confirm', verifyToken, certController.confirmCertificate);
router.post('/revoke-confirm', verifyToken, certController.revokeConfirm);

module.exports = router;
