'use strict';
const express = require('express');
const { normalizeSubmission } = require('./interest-launch');
function createInterestRouter({ store, enabled = () => false, origin = 'https://bneineviimacademy.org' }) {
  const router = express.Router(), allowed = new URL(origin), rates = new Map();
  router.use('/api/bna/coop-interest', (req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' });
    if (!enabled()) return res.status(503).json({ error: 'FORM_UNAVAILABLE' });
    if (req.originalUrl !== '/api/bna/coop-interest' || req.headers.host !== allowed.host) return res.status(404).json({ error: 'UNAVAILABLE' });
    if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'METHOD_UNAVAILABLE' });
    if (req.headers.origin && req.headers.origin !== allowed.origin || req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin') return res.status(403).json({ error: 'ORIGIN_DENIED' });
    if (req.method === 'POST' && (req.headers.origin !== allowed.origin || !/^application\/json(?:;|$)/i.test(req.headers['content-type'] || ''))) return res.status(403).json({ error: 'ORIGIN_DENIED' });
    const key = req.socket.remoteAddress, now = Date.now();
    if (rates.size > 2000) for (const [address, rate] of rates) if (now - rate.start > 60000) rates.delete(address);
    const rate = rates.get(key); if (!rate || now - rate.start > 60000) rates.set(key, { start: now, count: 1 });
    else if (++rate.count > 30) return res.status(429).json({ error: 'TRY_LATER' });
    next();
  });
  router.get('/api/bna/coop-interest', async (req, res) => {
    try { res.json({ data: await store.issueChallenge() }); } catch { res.status(503).json({ error: 'FORM_UNAVAILABLE' }); }
  });
  router.post('/api/bna/coop-interest', express.json({ limit: '16kb' }), async (req, res) => {
    try { const result = req.body?.action === 'recover' ? await store.recover(req.body.operationId, req.body.recoveryToken) : await store.save(normalizeSubmission(req.body), req.body.challenge); res.status(result.replayed || req.body?.action === 'recover' ? 200 : 201).json({ data: result }); }
    catch (error) { const status = error.statusCode || 503; res.status(status).json({ error: status < 500 ? error.code : 'SAVE_UNAVAILABLE' }); }
  });
  router.use((error, req, res, next) => { if (req.path !== '/api/bna/coop-interest') return next(error); res.status(error.status === 413 ? 413 : 400).json({ error: 'INVALID_REQUEST' }); });
  return router;
}
module.exports = { createInterestRouter };
