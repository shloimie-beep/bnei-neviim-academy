'use strict';

const { resolvedRoutes, committedActionResults } = require('./evidence');

const INTERNAL_LINK_RE = /(?:https?:\/\/(?:www\.)?bneineviimacademy\.org)?(\/(?:operations|operations-login\.html|parent|student|provider|providers|service-providers|signup\.html|school|parents|one-time|rabbi|rabbi-member|member|member-library|api\/bna|api\/rabbi)[^\s)\]'"<>]*)/gi;

const DONE_CLAIM_RE = /\b(?:done|created|updated|saved|sent|submitted|enrolled|changed|deleted|published|charged|granted|recorded|filed)\b/i;

function normalizeUrl(value = '') {
  return String(value || '').trim();
}

function extractInternalLinks(text = '') {
  const links = [];
  let match;
  while ((match = INTERNAL_LINK_RE.exec(String(text || ''))) !== null) {
    links.push(match[1]);
  }
  return [...new Set(links.map(normalizeUrl).filter(Boolean))];
}

function routeEvidenceUrls(evidence = {}) {
  return new Set(
    resolvedRoutes(evidence)
      .flatMap((route) => [route.url, route.canonical_path, route.route].filter(Boolean))
      .map(normalizeUrl)
  );
}

function unbackedInternalLinks(text = '', evidence = {}) {
  const allowed = routeEvidenceUrls(evidence);
  return extractInternalLinks(text).filter((link) => !allowed.has(link));
}

function hasDoneClaimWithoutCommittedResult(text = '', evidence = {}) {
  if (!DONE_CLAIM_RE.test(String(text || ''))) return false;
  return committedActionResults(evidence).length === 0;
}

function responseSafetyReport(text = '', evidence = {}) {
  const links = unbackedInternalLinks(text, evidence);
  const badDoneClaim = hasDoneClaimWithoutCommittedResult(text, evidence);
  return {
    ok: links.length === 0 && !badDoneClaim,
    unbacked_internal_links: links,
    done_claim_without_committed_result: badDoneClaim,
  };
}

function assertSafeAssistantResponse(text = '', evidence = {}) {
  const report = responseSafetyReport(text, evidence);
  if (!report.ok) {
    const error = new Error('assistant_response_failed_helper_control_plane_safety');
    error.code = 'assistant_response_failed_helper_control_plane_safety';
    error.report = report;
    throw error;
  }
  return true;
}

module.exports = {
  DONE_CLAIM_RE,
  INTERNAL_LINK_RE,
  assertSafeAssistantResponse,
  extractInternalLinks,
  hasDoneClaimWithoutCommittedResult,
  responseSafetyReport,
  unbackedInternalLinks,
};
