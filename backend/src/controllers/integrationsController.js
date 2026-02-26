const { getAuthUrl } = require('../services/gmailService');

async function gmailConnect(req, res) {
  return res.json({ authUrl: getAuthUrl() });
}

module.exports = { gmailConnect };
