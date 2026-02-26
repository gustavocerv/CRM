const express = require('express');
const { checkout, webhook } = require('../controllers/paymentsController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/checkout', requireAuth, requireRole('admin', 'manager'), checkout);
router.post('/webhook/stripe', webhook);

module.exports = router;
