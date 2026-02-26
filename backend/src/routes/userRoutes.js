const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { createUser, listUsers } = require('../controllers/usersController');

const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'manager'), listUsers);
router.post('/', requireAuth, requireRole('admin'), createUser);

module.exports = router;
