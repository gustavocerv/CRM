const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../controllers/filesController');
const { requireAuth } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/upload', requireAuth, upload.single('file'), uploadFile);

module.exports = router;
