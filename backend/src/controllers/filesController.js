const { uploadToGcs } = require('../services/storageService');

async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Missing file' });
  }

  const { projectId } = req.body;
  const fileUrl = await uploadToGcs({
    tenantId: req.user.tenantId,
    projectId,
    file: req.file
  });

  // Persist file metadata in `files` table including tenant_id and uploaded_by.
  return res.status(201).json({ fileUrl });
}

module.exports = { uploadFile };
