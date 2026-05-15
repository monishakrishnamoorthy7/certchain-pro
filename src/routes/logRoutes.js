const express = require('express');
const router  = express.Router();
const logController = require('../controllers/logController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, logController.getLogs);
// Allow creation of audit logs from authenticated users (e.g., role grants/revokes)
router.post('/', verifyToken, logController.createLog);

module.exports = router;
