'use strict';
const https = require('node:https');

const PUBLIC_ORIGIN = 'https://bneineviimacademy.org';
const UPSTREAM = 'https://life-skills.bneineviimacademy.org';
const STAGES = '(?:foundation|independent|advanced|leadership)';
const page = new RegExp('^(/he)?/fishing-academy(/(?:apply|pricing|stages/' + STAGES + '))?/?$');
const legacy = new RegExp('^/(en|he)/florida(/(?:apply|pricing|stages/' + STAGES + '))?/?$');
const assets = new Set([
  '/groups/brand/jlfa-logo-locked-v1.png',
  '/groups/people/founder-grass-group.webp', '/groups/people/founder-head.jpg',
  '/groups/testimonials/l-bars-2024.png',
  '/groups/academy/hero-desktop-selected-20261018.png', '/groups/academy/hero-mobile-selected-20261018.png',
  '/groups/academy/hero-desktop-wide-20261019.png',
  '/groups/academy/hero-owner03-desktop-en.png', '/groups/academy/hero-owner03-mobile-en.png',
  '/groups/academy/hero-owner03-desktop-he.png', '/groups/academy/hero-owner03-mobile-he.png',
  '/groups/academy/hero-desktop-20261018.png', '/groups/academy/hero-mobile-20261018.png',
  '/fonts/Heebo-wght.ttf', '/fonts/FrankRuhlLibre-wght.ttf',
  ...['foundation', 'independent', 'independent-mobile', 'advanced', 'advanced-mobile', 'leadership', 'locations', 'habitat', 'form', 'freshwater', 'freshwater-mobile'].map(name => '/groups/academy/scenes/' + name + '.webp'),
]);
const API = '/api/public/group-applications';
const unsafePath = /\\|\.\.|%2e|%2f|%5c/i;

function publicPath(locale, suffix = '') { return (locale === 'he' ? '/he/fishing-academy' : '/fishing-academy') + suffix; }
function classify(url) {
  if (unsafePath.test(url.pathname)) return null;
  const match = page.exec(url.pathname);
  if (match) return { kind: 'page', path: '/' + (match[1] ? 'he' : 'en') + '/florida' + (match[2] || '') };
  const old = legacy.exec(url.pathname);
  if (old) return { kind: 'redirect', path: publicPath(old[1], old[2] || '') };
  if (url.pathname === API) {
    if (url.searchParams.size !== 1 || url.searchParams.get('program') !== 'sunday_fishing_academy') return null;
    return { kind: 'inquiry', path: API };
  }
  if (assets.has(url.pathname)) return { kind: 'asset', path: url.pathname };
  // Next's compiled client JS/CSS/fonts are already public. No image proxy,
  // source map, development endpoint, arbitrary file or server/API path.
  if (/^\/_next\/static\/(?:[A-Za-z0-9_.()[\]%-]+\/)*[A-Za-z0-9_.()%-]+\.(?:js|css|woff2|ttf)$/.test(url.pathname)) return { kind: 'asset', path: url.pathname };
  return null;
}
function deny(res, status = 404) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
  res.end('{"ok":false,"error":{"code":"UNAVAILABLE"}}');
}

/** Existing public Academy only; never forward BNA sessions, credentials,
 * private routes or provider endpoints. Default disabled. Injected origins and
 * transport exist solely for local fixture tests; production uses fixed URLs. */
function createFishingAcademyGateway({ enabled = () => false, origin = PUBLIC_ORIGIN, upstream = UPSTREAM, transport = https } = {}) {
  const external = new URL(origin), target = new URL(upstream);
  return function fishingAcademyGateway(req, res, next) {
    if (!enabled() || req.headers.host !== external.host) return next();
    let url;
    try { url = new URL(req.originalUrl || req.url, origin); } catch { return next(); }
    const route = classify(url);
    if (url.origin !== external.origin || !route) {
      if (/^\/(?:he\/)?fishing-academy(?:\/|$)/.test(url.pathname) || url.pathname === API) return deny(res);
      return next();
    }
    const protocol = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
    if (protocol !== external.protocol.slice(0, -1)) return deny(res, 400);
    if (route.kind !== 'inquiry' && !['GET', 'HEAD'].includes(req.method)) return deny(res, 405);
    if (route.kind === 'redirect') {
      res.writeHead(308, { Location: route.path + url.search, 'Cache-Control': 'no-store' }); return res.end();
    }
    if (route.kind === 'inquiry') {
      if (!['GET', 'POST'].includes(req.method)) return deny(res, 405);
      if (req.method === 'POST' && (req.headers.origin !== external.origin || req.headers['sec-fetch-site'] !== 'same-origin' || !/^application\/json(?:;|$)/i.test(req.headers['content-type'] || ''))) return deny(res, 403);
      if (req.method === 'GET' && ((req.headers.origin && req.headers.origin !== external.origin) || ['cross-site', 'same-site'].includes(req.headers['sec-fetch-site']))) return deny(res, 403);
    }
    // Rewrite only this public presentation hint and canonical upstream
    // transport. It selects no actor, workspace, account or auth capability.
    const headers = { host: target.host, 'x-forwarded-host': target.host, 'x-forwarded-proto': target.protocol.slice(0, -1), 'x-jlfa-public-site': 'bna-v1', accept: String(req.headers.accept || '*/*').slice(0, 1024) };
    for (const key of ['rsc', 'next-router-state-tree', 'next-router-prefetch', 'next-router-segment-prefetch']) {
      if (typeof req.headers[key] === 'string' && req.headers[key].length <= 16384) headers[key] = req.headers[key];
    }
    if (route.kind === 'inquiry') { headers.origin = target.origin; headers['sec-fetch-site'] = 'same-origin'; }
    const dispatch = body => {
      if (res.destroyed || req.aborted) return;
      if (body) { headers['content-type'] = 'application/json'; headers['content-length'] = String(body.length); }
      const remote = transport.request(new URL(route.path + url.search, target), { method: req.method, headers, timeout: 15000 }, response => {
        const outgoing = { 'Cache-Control': route.kind === 'asset' ? (response.headers['cache-control'] || 'public, max-age=300') : 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY' };
        for (const key of ['content-type', 'content-encoding', 'content-length', 'content-security-policy', 'etag', 'last-modified', 'vary', 'link']) if (response.headers[key] !== undefined) outgoing[key] = response.headers[key];
        if (response.headers.location) {
          let destination;
          try { destination = new URL(response.headers.location, target); } catch { response.destroy(); return deny(res, 502); }
          const old = legacy.exec(destination.pathname);
          if (destination.origin !== target.origin || !old) { response.destroy(); return deny(res, 502); }
          outgoing.Location = publicPath(old[1], old[2] || '') + destination.search;
        }
        res.writeHead(response.statusCode || 502, outgoing); response.pipe(res);
        response.on('error', () => res.destroy());
      });
      remote.on('timeout', () => remote.destroy());
      remote.on('error', () => { if (!res.headersSent) deny(res, 503); else res.destroy(); });
      req.once('aborted', () => remote.destroy()); res.once('close', () => { if (!res.writableFinished) remote.destroy(); });
      // Exactly one dispatch, including uncertain inquiry outcomes. Never retry.
      remote.end(body);
    };
    if (req.method !== 'POST') return dispatch();
    if (req.headers['content-length'] && (!/^\d+$/.test(req.headers['content-length']) || Number(req.headers['content-length']) > 16384)) return deny(res, 413);
    const chunks = []; let size = 0, ended = false;
    const timer = setTimeout(() => { ended = true; deny(res, 408); }, 5000);
    req.on('data', chunk => { if (ended) return; size += chunk.length; if (size > 16384) { ended = true; clearTimeout(timer); deny(res, 413); } else chunks.push(chunk); });
    req.once('end', () => { clearTimeout(timer); if (!ended) { ended = true; dispatch(Buffer.concat(chunks)); } });
    req.once('error', () => { clearTimeout(timer); if (!ended) { ended = true; deny(res, 400); } });
    req.once('aborted', () => { ended = true; clearTimeout(timer); });
  };
}
module.exports = { createFishingAcademyGateway, classify, publicPath };
