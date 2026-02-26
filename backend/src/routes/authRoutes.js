const express = require('express');
const { login, registerAdmin } = require('../controllers/authController');

const router = express.Router();


router.post('/register-admin', registerAdmin);
router.post('/login', login);

module.exports = router;
=======
// Admin registration route
router.post('/register-admin', registerAdmin);

// Login route
router.post('/login', login);

module.exports = router;

