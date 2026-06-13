function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeText(value) {
  return compactText(value).toLowerCase();
}

const PHONE_PATTERN = /(?:\+?972[\s-]?)?0?5\d(?:[\s-]?\d){7}/g;

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('972') && digits.length === 12) return `0${digits.slice(3)}`;
  if (digits.startsWith('972') && digits.length === 11) return `0${digits.slice(3)}`;
  if (digits.length === 9 && digits.startsWith('5')) return `0${digits}`;
  return digits;
}

function uniqueValues(values) {
  const seen = new Set();
  return values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function extractPhoneNumbers(text) {
  const matches = String(text || '').match(PHONE_PATTERN) || [];
  return uniqueValues(matches.map(normalizePhone));
}

function hasInterestedParentLeadCaptureIntent(text) {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  const hasPhone = extractPhoneNumbers(text).length > 0;
  const leadLanguage = /\b(interested|lead|leads|warm inbound|called me|called back|call back|facebook ads?|parent|parents?|contact history|pipeline view|pipeline type|whatsapp history|whatsapp group|funnel)\b/.test(normalized);
  const namedNoPhoneLead = /\b(lady\s+alina|alina)\b/.test(normalized) && /\b(interested|call me back|will call)\b/.test(normalized);
  return (hasPhone && leadLanguage) || namedNoPhoneLead;
}

function hasContactLeadPipelineBuildIntent(text) {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  const pipelineObject = /\b(lead section|interested parents?|parents? (?:that are )?interested|warm leads?|pipeline(?: type)? view|pipeline created from contacts?|contacts? pipeline|crm|ghl pipeline|contact history|previous contact|whatsapp history|whatsapp button|online logins?|parent portal logins?|tagged accordingly)\b/.test(normalized);
  const parentContactSection = /\b(parent section|parents section|contacts section)\b/.test(normalized)
    && /\b(whatsapp|previous contact|contact history|login|logins?|parent portal|manage)\b/.test(normalized);
  const buildVerb = /\b(build|build out|need|needs|we need|wanted|want|update|hooked up|track|open it up|see|manage|created?)\b/.test(normalized);
  return (pipelineObject || parentContactSection) && buildVerb;
}

function splitLeadSegments(text) {
  let prepared = compactText(text);
  const cues = [
    'OK the next one',
    'Okay the next one',
    'The next one',
    'then we have',
    "Then there's",
    'Then there is',
    'Other lady',
    'this woman',
    "There's a Lady",
    'There is a Lady',
    'A Lady',
    'Lady Alina',
  ];
  for (const cue of cues) {
    const escaped = cue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    prepared = prepared.replace(new RegExp(`\\s+(${escaped})\\b`, 'gi'), '\n$1');
  }
  return prepared
    .split(/\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function nameFromSegment(segment) {
  const text = compactText(segment);
  const namedRules = [
    [/ilana\s+kahan|elana\s+kahan/i, 'Ilana Kahan'],
    [/\bsari\b.*\bkaplan\b|\bkaplan\b.*\bsari\b/i, 'Sari Kaplan'],
    [/\buriah\b/i, 'Uriah'],
    [/\bshlomo\s+cann?er\b|\bshlomo\s+kaner\b/i, 'Shlomo Canner'],
    [/\bshifra\b/i, 'Shifra'],
    [/\bmiriam\s+zlotnick\b/i, 'Miriam Zlotnick'],
    [/\bbracha\s+castell\b/i, 'Bracha Castell'],
    [/\bpsychodrama\b|\blagat\b|\btouch the heart\b/i, 'Psychodrama Lagaat BaLev'],
    [/\balina\b/i, 'Alina'],
  ];
  const named = namedRules.find(([pattern]) => pattern.test(text));
  if (named) return named[1];

  const explicit = text.match(/\b(?:his|her|the guy'?s|the woman'?s|woman'?s|man'?s)?\s*name\s+is\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,2})/);
  if (explicit) return cleanNameCandidate(explicit[1]);

  const phoneMatch = text.match(PHONE_PATTERN);
  if (phoneMatch) {
    const after = text.slice(text.indexOf(phoneMatch[0]) + phoneMatch[0].length).trim();
    const afterName = leadingNameFromText(after);
    if (afterName) return afterName;

    const before = text.slice(0, text.indexOf(phoneMatch[0])).trim();
    const beforeName = trailingNameFromText(before);
    if (beforeName) return beforeName;
  }

  return '';
}

function cleanNameCandidate(value) {
  const stopWords = new Set(['she', 'he', 'i', 'the', 'next', 'ok', 'okay', 'sorry', 'sa', 'so', 'this', 'that', 'her', 'his', 'number']);
  const tokens = String(value || '')
    .split(/\s+/)
    .map((token) => token.replace(/[^A-Za-z'-]/g, ''))
    .filter(Boolean);
  const nameTokens = [];
  for (const token of tokens) {
    if (stopWords.has(token.toLowerCase())) break;
    if (!/^[A-Z][A-Za-z'-]*$/.test(token)) break;
    nameTokens.push(token);
    if (nameTokens.length >= 3) break;
  }
  return nameTokens.join(' ').trim();
}

function leadingNameFromText(value) {
  const ignoredPrefix = String(value || '')
    .replace(/^I\s+did(?:n't| not)\s+get\s+(?:his|her)?\s*name\s*/i, '')
    .replace(/^(?:the\s+)?(?:guys?|woman|lady|man)'?s?\s+name\s+is\s+/i, '')
    .trim();
  const match = ignoredPrefix.match(/^([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,3})\b/);
  return match ? cleanNameCandidate(match[1]) : '';
}

function trailingNameFromText(value) {
  const match = String(value || '').match(/([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,2})\s+(?:her|his|their)?\s*(?:number|phone)?\s*$/);
  return match ? cleanNameCandidate(match[1]) : '';
}

function leadStatusFromSegment(segment) {
  const normalized = normalizeText(segment);
  if (/\b(no answer|never got back|call back|called back|follow up|more to discuss|speak with (?:her )?husband|will call me back)\b/.test(normalized)) {
    return 'follow_up';
  }
  if (/\b(very interested|interested)\b/.test(normalized)) return 'interested';
  return 'interested';
}

function interestLevelFromSegment(segment) {
  const normalized = normalizeText(segment);
  if (/\bvery interested|hot\b/.test(normalized)) return 'hot';
  if (/\bhesitant|no answer|don't remember|dont remember|not now\b/.test(normalized)) return 'unknown';
  if (/\binterested|spoke for a while|warm inbound|facebook ad\b/.test(normalized)) return 'warm';
  return 'unknown';
}

function tagsFromSegment(segment, globalText) {
  const normalized = normalizeText(`${segment} ${globalText || ''}`);
  const tags = ['school-interest', 'telegram-capture'];
  if (/\bfacebook ads?\b/.test(normalized)) tags.push('facebook-ad-response');
  if (/\bwarm inbound\b/.test(normalized)) tags.push('warm-inbound');
  if (/\bwhatsapp group\b/.test(normalized)) tags.push('whatsapp-group-funnel');
  if (/\bno answer|called back|call back|never got back\b/.test(normalized)) tags.push('needs-callback');
  if (/\bhusband\b/.test(normalized)) tags.push('husband-contact');
  if (/\bhesitant\b/.test(normalized)) tags.push('hesitant');
  if (/\bhome\s*school|homeschool\b/.test(normalized)) tags.push('homeschooling');
  if (/\bzoom\b/.test(normalized)) tags.push('zoom');
  if (/\bhebrew\b/.test(normalized)) tags.push('hebrew');
  if (/\byoknam\b/.test(normalized)) tags.push('yoknam');
  if (/\bnetzach\b/.test(normalized)) tags.push('netzach');
  if (/\bgesher\b/.test(normalized)) tags.push('gesher');
  if (/\brabbi scheller\b/.test(normalized)) tags.push('rabbi-scheller-referral');
  if (/\bvery interested\b/.test(normalized)) tags.push('very-interested');
  return uniqueValues(tags);
}

function studentDetailsFromSegment(segment) {
  const normalized = normalizeText(segment);
  const ageMatch = normalized.match(/\b(?:kid|child|son|daughter|boy)?\s*(?:is|i believe)?\s*(\d{1,2})\s+years?\s+old\b/);
  const gradeMatch = normalized.match(/\b(?:in\s+)?((?:\d+)(?:st|nd|rd|th)\s+grade)\b/);
  return {
    student_age: ageMatch ? Number(ageMatch[1]) : null,
    student_grade: gradeMatch ? gradeMatch[1] : null,
  };
}

function leadPayloadFromSegment(segment, globalText = '', context = {}) {
  const phones = extractPhoneNumbers(segment);
  const name = nameFromSegment(segment);
  if (!name || (!phones.length && !/\balina\b/i.test(segment))) return null;

  let parentPhone = phones[0] || null;
  let otherPhones = phones.slice(1);
  if (/kaplan/i.test(segment) && phones.length >= 2) {
    parentPhone = phones[1];
    otherPhones = [phones[0], ...phones.slice(2)];
  }

  const studentDetails = studentDetailsFromSegment(segment);
  const sourceDetail = /facebook ads?/i.test(globalText)
    ? 'Telegram lead update from warm inbound/Facebook ad context'
    : 'Telegram lead update from operator phone-call notes';
  const note = compactText(segment);

  return {
    parent_name: name,
    parent_phone: parentPhone,
    other_phones: otherPhones,
    student_age: studentDetails.student_age,
    student_grade: studentDetails.student_grade,
    lead_type: 'school_interest',
    status: leadStatusFromSegment(segment),
    interest_level: interestLevelFromSegment(segment),
    source: 'telegram',
    source_detail: sourceDetail,
    owner: 'Shloimie',
    tags: tagsFromSegment(segment, globalText),
    notes: note,
    communication: {
      summary: contactNoteSummary(name, segment),
      body: note,
      follow_up_required: leadStatusFromSegment(segment) === 'follow_up' || /follow up|call back|no answer|husband/i.test(segment),
    },
    metadata: {
      parser: 'telegram-contact-lead-capture-v1',
      chat_id: context.chatId ? String(context.chatId) : null,
      message_id: context.messageId ? String(context.messageId) : null,
    },
  };
}

function contactNoteSummary(name, segment) {
  const normalized = normalizeText(segment);
  if (/\bnever got back\b/.test(normalized)) return `${name}: needs first callback`;
  if (/\bno answer\b/.test(normalized)) return `${name}: no answer, call back`;
  if (/\bvery interested\b/.test(normalized)) return `${name}: very interested`;
  if (/\bhesitant\b/.test(normalized)) return `${name}: hesitant, needs husband discussion`;
  if (/\bhome\s*school|homeschool\b/.test(normalized)) return `${name}: asked about homeschooling`;
  if (/\bzoom\b/.test(normalized)) return `${name}: asked about Zoom classes`;
  return `${name}: interested parent lead`;
}

function extractInterestedParentLeads(text, context = {}) {
  if (!hasInterestedParentLeadCaptureIntent(text)) return [];
  const segments = splitLeadSegments(text);
  const leads = [];
  for (const segment of segments) {
    const payload = leadPayloadFromSegment(segment, text, context);
    if (payload) leads.push(payload);
  }
  const seen = new Set();
  return leads.filter((lead) => {
    const key = `${normalizePhone(lead.parent_phone) || normalizeText(lead.parent_name)}:${normalizeText(lead.parent_name)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = {
  extractInterestedParentLeads,
  extractPhoneNumbers,
  hasContactLeadPipelineBuildIntent,
  hasInterestedParentLeadCaptureIntent,
  normalizePhone,
  splitLeadSegments,
};
