'use strict';
const https = require('node:https');

const PUBLIC_ORIGIN = 'https://bneineviimacademy.org';
const UPSTREAM = 'https://life-skills.bneineviimacademy.org';
const PUBLIC_PATH = '/api/bna/interest';
const UPSTREAM_PATH = '/api/public/bna-inquiries';
const COOP_PUBLIC_PATH = '/api/bna/coop-interest';
const COOP_UPSTREAM_PATH = '/api/public/bna-coop-inquiries';
const SUPPORT_PUBLIC_PATH = '/api/bna/support-interest';
const SUPPORT_UPSTREAM_PATH = '/api/public/bna-support-inquiries';

function deny(res, status = 404) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
  res.end('{"saved":false,"error":"UNAVAILABLE"}');
}

/** Same-origin, single-effect bridge into the existing Life Skills inquiry store.
 * No BNA session, authorization header or private cookie crosses this boundary. */
function createGateway(publicPath, upstreamPath, { enabled = () => false, origin = PUBLIC_ORIGIN, upstream = UPSTREAM, transport = https } = {}) {
  const external = new URL(origin), target = new URL(upstream);
  return function torahInterestGateway(req, res, next) {
    if (!enabled() || req.headers.host !== external.host) return next();
    let url;
    try { url = new URL(req.originalUrl || req.url, origin); } catch { return next(); }
    if (url.pathname !== publicPath) return next();
    if (url.origin !== external.origin || url.search || /\\|%2e|%2f|%5c/i.test(req.originalUrl || req.url)) return deny(res);
    if (!['GET', 'POST'].includes(req.method)) return deny(res, 405);
    const protocol = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
    if (protocol !== external.protocol.slice(0, -1)) return deny(res, 400);
    if (req.method === 'POST' && (req.headers.origin !== external.origin || req.headers['sec-fetch-site'] !== 'same-origin' || !/^application\/json(?:;|$)/i.test(req.headers['content-type'] || ''))) return deny(res, 403);
    if (req.method === 'GET' && ((req.headers.origin && req.headers.origin !== external.origin) || ['cross-site', 'same-site'].includes(req.headers['sec-fetch-site']))) return deny(res, 403);

    const dispatch = body => {
      if (res.destroyed || req.aborted) return;
      const headers = { host: target.host, 'x-forwarded-host': target.host, 'x-forwarded-proto': target.protocol.slice(0, -1), origin: target.origin, 'sec-fetch-site': 'same-origin', accept: 'application/json' };
      if (body) { headers['content-type'] = 'application/json'; headers['content-length'] = String(body.length); }
      const remote = transport.request(new URL(upstreamPath, target), { method: req.method, headers, timeout: 15000 }, response => {
        if (response.headers.location || response.headers['set-cookie']) { response.destroy(); return deny(res, 502); }
        const outgoing = { 'Content-Type': response.headers['content-type'] || 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY' };
        res.writeHead(response.statusCode || 502, outgoing); response.pipe(res);
        response.on('error', () => res.destroy());
      });
      remote.on('timeout', () => remote.destroy());
      remote.on('error', () => { if (!res.headersSent) deny(res, 503); else res.destroy(); });
      req.once('aborted', () => remote.destroy());
      res.once('close', () => { if (!res.writableFinished) remote.destroy(); });
      // Never retry an uncertain submission here. The browser retains its operation ID.
      remote.end(body);
    };
    if (req.method === 'GET') return dispatch();
    if (req.headers['content-length'] && (!/^\d+$/.test(req.headers['content-length']) || Number(req.headers['content-length']) > 16384)) return deny(res, 413);
    const chunks = []; let size = 0, ended = false;
    const timer = setTimeout(() => { ended = true; deny(res, 408); }, 5000);
    req.on('data', chunk => { if (ended) return; size += chunk.length; if (size > 16384) { ended = true; clearTimeout(timer); deny(res, 413); } else chunks.push(chunk); });
    req.once('end', () => { clearTimeout(timer); if (!ended) { ended = true; dispatch(Buffer.concat(chunks)); } });
    req.once('error', () => { clearTimeout(timer); if (!ended) { ended = true; deny(res, 400); } });
    req.once('aborted', () => { ended = true; clearTimeout(timer); });
  };
}

function createTorahInterestGateway(options) { return createGateway(PUBLIC_PATH, UPSTREAM_PATH, options); }
function createCoopInterestGateway(options) { return createGateway(COOP_PUBLIC_PATH, COOP_UPSTREAM_PATH, options); }
function createSupportInterestGateway(options) { return createGateway(SUPPORT_PUBLIC_PATH, SUPPORT_UPSTREAM_PATH, options); }
module.exports = { createTorahInterestGateway, createCoopInterestGateway, createSupportInterestGateway, PUBLIC_PATH, UPSTREAM_PATH, COOP_PUBLIC_PATH, COOP_UPSTREAM_PATH, SUPPORT_PUBLIC_PATH, SUPPORT_UPSTREAM_PATH };
