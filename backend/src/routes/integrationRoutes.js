const express = require('express');
const { gmailConnect } = require('../controllers/integrationsController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/gmail/connect', requireAuth, requireRole('admin'), gmailConnect);

module.exports = router;
