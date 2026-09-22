// Obsolete serverless signup handler.
//
// The active BNA runtime is the Express route in server.js: POST /api/submit.
// This legacy file used a separate signup schema and could create duplicate
// student identities, so it intentionally refuses writes if deployed directly.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  return res.status(410).json({
    success: false,
    error: 'This legacy signup endpoint is disabled. Use the BNA Express /api/submit route.',
  });
};
