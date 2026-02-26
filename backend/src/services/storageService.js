const path = require('path');

function buildObjectPath({ tenantId, projectId, filename }) {
  const safeName = filename.replace(/\s+/g, '_');
  return path.posix.join('tenants', tenantId, 'projects', projectId, `${Date.now()}_${safeName}`);
}

async function uploadToGcs({ tenantId, projectId, file }) {
  // Replace this placeholder with @google-cloud/storage implementation.
  // This scaffold returns a deterministic fake URL for local development.
  const objectPath = buildObjectPath({ tenantId, projectId, filename: file.originalname });
  return `gs://${process.env.GCS_BUCKET}/${objectPath}`;
}

module.exports = { uploadToGcs };
