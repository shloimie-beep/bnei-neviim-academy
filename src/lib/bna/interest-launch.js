'use strict';
const crypto = require('node:crypto');
const DECISION = 'BNA-INTEREST-LAUNCH-20261105-01';
const NOTICE = Object.freeze({
  version: 'BNA-INTEREST-LAUNCH-20261105-v1',
  en: 'Please contact me about the BNA program or programs I selected using the details I provided. I have read the Privacy Notice.',
  he: 'אבקש ליצור איתי קשר בנוגע לתוכנית או לתוכניות של BNA שבחרתי, באמצעות הפרטים שמסרתי. קראתי את הודעת הפרטיות.',
});
const PROGRAMS = Object.freeze(['pod', 'academy', 'both']);
function problem(code, status = 400) { const error = new Error(code); error.code = code; error.statusCode = status; return error; }
function text(value, max, required = false) {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) throw problem('INVALID_FIELDS');
  const result = value.trim(); if (required && !result) throw problem('REQUIRED_FIELDS'); return result;
}
function normalizeSubmission(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.operationId || '')) throw problem('INVALID_OPERATION');
  const f = body.fields;
  if (!f || typeof f !== 'object' || Array.isArray(f)) throw problem('INVALID_FIELDS');
  if (!PROGRAMS.includes(f.program)) throw problem('PROGRAM_REQUIRED');
  if (!['email', 'phone', 'whatsapp'].includes(f.contactChannel)) throw problem('REPLY_METHOD_REQUIRED');
  if (!['en', 'he'].includes(f.language) || !['en', 'he'].includes(f.siteLanguage)) throw problem('LANGUAGE_REQUIRED');
  const email = text(f.email, 254, true).toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw problem('INVALID_EMAIL');
  const phone = text(f.phone, 40).replace(/[\s().-]/g, '');
  if (phone && !/^\+[1-9]\d{6,14}$/.test(phone)) throw problem('INVALID_PHONE');
  if (f.contactChannel !== 'email' && !phone) throw problem('PHONE_REQUIRED');
  if (!Array.isArray(f.childAges) || !f.childAges.length || f.childAges.length > 8 || f.childAges.some(age => !Number.isInteger(age) || age < 1 || age > 25)) throw problem('INVALID_AGE');
  if (f.permission?.confirmed !== true || f.permission.version !== NOTICE.version || f.permission.language !== f.siteLanguage) throw problem('CONTACT_PERMISSION_REQUIRED');
  for (const key of ['articleUpdates', 'podUpdates', 'academyUpdates']) if (typeof f[key] !== 'boolean') throw problem('INVALID_PREFERENCES');
  if (f.podUpdates && f.program === 'academy' || f.academyUpdates && f.program === 'pod') throw problem('INVALID_PREFERENCES');
  const fields = {
    program: f.program, name: text(f.name, 160, true), email, phone,
    contactChannel: f.contactChannel, language: f.language, siteLanguage: f.siteLanguage,
    area: text(f.area, 180, true), preferredArea: text(f.preferredArea, 180),
    childAges: f.childAges, learningArrangement: text(f.learningArrangement, 160),
    torahExperience: text(f.torahExperience, 1000), question: text(f.question, 2000),
    articleUpdates: f.articleUpdates, podUpdates: f.podUpdates, academyUpdates: f.academyUpdates,
    permission: { confirmed: true, version: NOTICE.version, language: f.siteLanguage, text: NOTICE[f.siteLanguage] },
  };
  const attribution = {};
  if (body.attribution && typeof body.attribution === 'object' && !Array.isArray(body.attribution)) {
    for (const key of ['campaign', 'source', 'medium', 'content', 'groupRef', 'postRef', 'referral']) {
      const value = body.attribution[key];
      if (value !== undefined) { if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(value)) throw problem('INVALID_ATTRIBUTION'); attribution[key] = value; }
    }
  }
  if (!/^[a-f0-9-]{36}$/i.test(body.recoveryToken || '')) throw problem('INVALID_RECOVERY');
  return { operationId: body.operationId.toLowerCase(), recoveryHash: crypto.createHash('sha256').update(body.recoveryToken).digest('hex'), fields, attribution, digest: crypto.createHash('sha256').update(JSON.stringify({ fields, attribution })).digest('hex') };
}
module.exports = { DECISION, NOTICE, PROGRAMS, normalizeSubmission, problem };
