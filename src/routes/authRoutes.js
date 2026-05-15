const express = require('express');
const router  = express.Router();
const authController = require('../controllers/authController');

router.post('/nonce', authController.requestNonce);
router.post('/verify', authController.verifySignature);
router.post('/logout', authController.logout);

module.exports = router;
