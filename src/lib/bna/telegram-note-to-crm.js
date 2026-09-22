function compactWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeMatchText(value) {
  return compactWhitespace(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, ' ')
    .trim();
}

function normalizePhoneDigitsForNote(value) {
  return String(value || '').replace(/\D/g, '');
}

function phoneSuffix(value) {
  const digits = normalizePhoneDigitsForNote(value);
  return digits.length >= 7 ? digits.slice(-9) : '';
}

function jsonObject(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function cleanContactClue(value) {
  return compactWhitespace(value)
    .replace(/^(?:the\s+)?(?:latest|last|recent)\s+/i, '')
    .replace(/^(?:whatsapp|whats\s*app|wa)\s+(?:message|chat|conversation|thread)\s+/i, '')
    .replace(/^(?:contact|person|parent|lead)\s*[:#-]?\s*/i, '')
    .replace(/\s+(?:was|is)\s+(?:about|just)\b.*$/i, '')
    .replace(/^[|"':,\s-]+|[|"':,\s-]+$/g, '')
    .slice(0, 160);
}

function cleanNoteText(value) {
  return compactWhitespace(value)
    .replace(/^(?:note|body|comment|details)\s*[:#-]\s*/i, '')
    .replace(/^[|"'\s-]+|[|"'\s]+$/g, '')
    .slice(0, 4000);
}

function commandBody(text) {
  return compactWhitespace(text).replace(/^\/(?:crm_note|whatsapp_note|wa_note)\b/i, '').trim();
}

function parseCommandTokens(text) {
  const body = commandBody(text);
  const tokens = {};
  const unkeyed = [];
  for (const part of body.split('|').map((item) => item.trim()).filter(Boolean)) {
    const match = part.match(/^([a-z][a-z0-9_ -]{1,32})\s*[:#]\s*(.+)$/i);
    const key = match ? match[1].trim().toLowerCase().replace(/[\s-]+/g, '_') : '';
    const value = match ? match[2].trim() : part;
    if (match && [
      'contact',
      'name',
      'person',
      'parent',
      'lead',
      'phone',
      'chat',
      'communication',
      'communication_id',
      'comm',
      'message',
      'message_id',
      'note',
      'body',
      'comment',
      'details',
      'channel',
    ].includes(key)) {
      tokens[key] = value;
    } else {
      unkeyed.push(part);
    }
  }

  if (!tokens.note && !tokens.body && !tokens.comment && !tokens.details && unkeyed.length > 1) {
    tokens.note = unkeyed.slice(1).join(' | ');
  }
  if (!tokens.contact && !tokens.name && !tokens.person && !tokens.parent && !tokens.lead && !tokens.phone && !tokens.chat && unkeyed.length) {
    tokens.contact = unkeyed[0];
  }

  if ((!tokens.contact && !tokens.note) || (!tokens.note && body.includes(':'))) {
    const fallback = body.match(/^(.+?)\s*[:|-]\s*(.+)$/);
    if (fallback) {
      tokens.contact ||= fallback[1].trim();
      tokens.note ||= fallback[2].trim();
    }
  }

  return tokens;
}

function hasTelegramNoteToCrmIntent(text = '') {
  const raw = compactWhitespace(text);
  if (!raw) return false;
  if (/^\/(?:crm_note|whatsapp_note|wa_note)\b/i.test(raw)) return true;
  if (/^\/(?:send_whatsapp|whatsapp_send|wa_send|link_whatsapp|whatsapp_link|wa_link|wapi_sync|whatsapp_sync|wa_sync|wapi_status|whatsapp_status|wa_status)\b/i.test(raw)) {
    return false;
  }
  const hasWhatsApp = /\b(?:whatsapp|whats\s*app|wa)\b/i.test(raw);
  const hasNoteVerb = /\b(?:attach|add|save|log|record|crm|note|internal note|was about|is about|was just|not a lead|friend)\b/i.test(raw);
  const hasContactShape = /\b(?:with|from|to|for)\s+[\p{L}0-9+@]/iu.test(raw);
  return hasWhatsApp && hasNoteVerb && hasContactShape;
}

function parseNaturalNote(text) {
  const raw = compactWhitespace(text);
  const patterns = [
    /\b(?:that|the|latest|last|recent)?\s*(?:whatsapp|whats\s*app|wa)\s*(?:message|chat|conversation|thread)?\s*(?:with|from|to)\s+(.+?)\s+((?:was|is)\s+(?:about|just)\b.+)$/i,
    /\b(?:attach|add|save|log|record)\s+(?:an?\s+)?(?:crm\s+|internal\s+)?note\s+(?:to|for|on)\s+(?:the\s+)?(?:latest|last|recent)?\s*(?:whatsapp|whats\s*app|wa)?\s*(?:message|chat|conversation|thread)?\s*(?:with|from|to|for)\s+([^:|]+?)\s*[:|-]\s*(.+)$/i,
    /\b(?:crm\s+)?note\s+(?:to|for|on)\s+(?:the\s+)?(?:latest|last|recent)?\s*(?:whatsapp|whats\s*app|wa)?\s*(?:message|chat|conversation|thread)?\s*(?:with|from|to|for)?\s+([^:|]+?)\s*[:|-]\s*(.+)$/i,
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) {
      return {
        contact_clue: cleanContactClue(match[1]),
        note_text: cleanNoteText(match[2]),
      };
    }
  }
  return { contact_clue: '', note_text: '' };
}

function parseTelegramNoteToCrm(text = '') {
  const raw = compactWhitespace(text);
  const parsed = {
    matched: false,
    source: 'telegram_note_to_crm',
    channel: 'whatsapp',
    contact_clue: '',
    note_text: '',
    communication_id: null,
    raw_text: raw,
  };
  if (!hasTelegramNoteToCrmIntent(raw)) {
    return { ...parsed, reason: 'no_note_to_crm_intent' };
  }

  if (/^\/(?:crm_note|whatsapp_note|wa_note)\b/i.test(raw)) {
    const tokens = parseCommandTokens(raw);
    parsed.contact_clue = cleanContactClue(tokens.contact || tokens.name || tokens.person || tokens.parent || tokens.lead || tokens.phone || tokens.chat || '');
    parsed.note_text = cleanNoteText(tokens.note || tokens.body || tokens.comment || tokens.details || '');
    parsed.channel = compactWhitespace(tokens.channel || 'whatsapp').toLowerCase() || 'whatsapp';
    parsed.communication_id = Number(tokens.communication || tokens.communication_id || tokens.comm || tokens.message || tokens.message_id || 0) || null;
  } else {
    const natural = parseNaturalNote(raw);
    parsed.contact_clue = natural.contact_clue;
    parsed.note_text = natural.note_text;
  }

  const hasTarget = Boolean(parsed.contact_clue || parsed.communication_id);
  parsed.matched = Boolean(hasTarget && parsed.note_text);
  if (!parsed.matched) parsed.reason = hasTarget ? 'missing_note_text' : 'missing_contact_clue';
  return parsed;
}

function candidateMetadata(candidate) {
  return jsonObject(candidate?.metadata);
}

function candidateSourceContext(candidate) {
  return jsonObject(candidate?.source_context);
}

function candidateNameValues(candidate = {}) {
  const metadata = candidateMetadata(candidate);
  const sourceContext = candidateSourceContext(candidate);
  return [
    metadata.matched_name,
    metadata.push_name,
    metadata.chat_name,
    metadata.sender_name,
    metadata.contact_name,
    metadata.parent_name,
    sourceContext.push_name,
    sourceContext.chat_name,
    candidate.lead_parent_name,
    candidate.signup_parent_name,
    candidate.signup_student_name,
    candidate.student_name,
    candidate.created_by,
  ].map(compactWhitespace).filter(Boolean);
}

function candidatePhoneValues(candidate = {}) {
  const metadata = candidateMetadata(candidate);
  const sourceContext = candidateSourceContext(candidate);
  return [
    sourceContext.chat_id,
    sourceContext.from_number,
    sourceContext.to_number,
    metadata.recipient_phone,
    metadata.phone,
    metadata.parent_phone,
    metadata.whatsapp_phone,
    candidate.summary,
    candidate.body,
  ].map(compactWhitespace).filter(Boolean);
}

function candidateHaystackValues(candidate = {}) {
  const metadata = candidateMetadata(candidate);
  const sourceContext = candidateSourceContext(candidate);
  return [
    candidate.summary,
    candidate.body,
    candidate.source,
    candidate.channel,
    sourceContext.chat_id,
    sourceContext.from_number,
    sourceContext.to_number,
    sourceContext.message_id,
    metadata.matched_name,
    metadata.push_name,
    metadata.chat_name,
    metadata.message_type,
    candidate.lead_parent_name,
    candidate.signup_parent_name,
    candidate.signup_student_name,
    candidate.student_name,
  ].map(compactWhitespace).filter(Boolean);
}

function scoreNameMatch(clueNorm, values) {
  if (!clueNorm || clueNorm.length < 2) return { score: 0, reason: '' };
  let best = { score: 0, reason: '' };
  for (const value of values) {
    const valueNorm = normalizeMatchText(value);
    if (!valueNorm) continue;
    if (valueNorm === clueNorm) return { score: 75, reason: 'exact_name_match' };
    if (valueNorm.includes(clueNorm) || clueNorm.includes(valueNorm)) {
      if (Math.min(valueNorm.length, clueNorm.length) >= 4 && best.score < 60) {
        best = { score: 60, reason: 'partial_name_match' };
      }
    }
  }
  return best;
}

function scoreHaystackMatch(clueNorm, values) {
  if (!clueNorm || clueNorm.length < 3) return { score: 0, reason: '' };
  const haystack = normalizeMatchText(values.join(' '));
  if (!haystack) return { score: 0, reason: '' };
  if (haystack.includes(clueNorm)) return { score: 38, reason: 'communication_text_match' };
  const tokens = clueNorm.split(/\s+/).filter((token) => token.length >= 3);
  if (tokens.length >= 2 && tokens.every((token) => haystack.includes(token))) {
    return { score: 28, reason: 'communication_token_match' };
  }
  if (tokens.length === 1 && haystack.includes(tokens[0])) {
    return { score: 18, reason: 'communication_single_token_match' };
  }
  return { score: 0, reason: '' };
}

function scorePhoneMatch(clueDigits, values) {
  if (!clueDigits || clueDigits.length < 5) return { score: 0, reason: '' };
  const clueSuffix = phoneSuffix(clueDigits);
  let best = { score: 0, reason: '' };
  for (const value of values) {
    const digits = normalizePhoneDigitsForNote(value);
    if (!digits) continue;
    if (digits === clueDigits) return { score: 85, reason: 'exact_phone_match' };
    if (clueSuffix && phoneSuffix(digits) === clueSuffix && best.score < 58) {
      best = { score: 58, reason: 'phone_suffix_match' };
    }
  }
  return best;
}

function scoreTelegramNoteCandidate(candidate = {}, parsed = {}) {
  const contactClue = compactWhitespace(parsed.contact_clue || parsed.contact || parsed.clue || '');
  const communicationId = Number(parsed.communication_id || parsed.communicationId || 0) || null;
  const clueNorm = normalizeMatchText(contactClue);
  const clueDigits = normalizePhoneDigitsForNote(contactClue);
  const reasons = [];
  let score = 0;

  if (communicationId && String(candidate.id) === String(communicationId)) {
    score += 110;
    reasons.push('explicit_communication_id');
  }

  const channel = String(candidate.channel || '').toLowerCase();
  const source = String(candidate.source || '').toLowerCase();
  if (channel === 'whatsapp' || source === 'wapi') {
    score += 8;
    reasons.push('whatsapp_candidate');
  }

  const phoneMatch = scorePhoneMatch(clueDigits, candidatePhoneValues(candidate));
  if (phoneMatch.score) {
    score += phoneMatch.score;
    reasons.push(phoneMatch.reason);
  }

  const nameMatch = scoreNameMatch(clueNorm, candidateNameValues(candidate));
  if (nameMatch.score) {
    score += nameMatch.score;
    reasons.push(nameMatch.reason);
  }

  if (!nameMatch.score) {
    const haystackMatch = scoreHaystackMatch(clueNorm, candidateHaystackValues(candidate));
    if (haystackMatch.score) {
      score += haystackMatch.score;
      reasons.push(haystackMatch.reason);
    }
  }

  return {
    candidate,
    score,
    reasons,
    confidence: score >= 75 ? 'high' : score >= 35 ? 'medium' : 'low',
  };
}

function summarizeTelegramNoteMatch(scored = {}) {
  const candidate = scored.candidate || scored || {};
  return {
    communication_id: candidate.id || null,
    contact_type: candidate.contact_type || 'general',
    lead_id: candidate.lead_id || null,
    signup_id: candidate.signup_id || null,
    student_id: candidate.student_id || null,
    channel: candidate.channel || null,
    direction: candidate.direction || null,
    source: candidate.source || null,
    occurred_at: candidate.occurred_at || candidate.created_at || null,
    score: scored.score || 0,
    confidence: scored.confidence || 'low',
    reasons: Array.isArray(scored.reasons) ? scored.reasons : [],
  };
}

function selectBestTelegramNoteCandidate(candidates = [], parsed = {}, options = {}) {
  const minScore = Number(options.minScore || 35);
  const ambiguityMargin = Number(options.ambiguityMargin || 8);
  const scored = candidates
    .map((candidate) => scoreTelegramNoteCandidate(candidate, parsed))
    .sort((a, b) => b.score - a.score);
  const best = scored[0] || null;
  if (!best || best.score < minScore) {
    return {
      matched: false,
      reason: 'no_confident_match',
      best: best ? summarizeTelegramNoteMatch(best) : null,
      candidates_scored: scored.length,
    };
  }
  const second = scored[1] || null;
  const explicitId = Number(parsed.communication_id || parsed.communicationId || 0) || null;
  if (!explicitId && second && best.score < 80 && best.score - second.score < ambiguityMargin) {
    return {
      matched: false,
      reason: 'ambiguous_match',
      best: summarizeTelegramNoteMatch(best),
      second: summarizeTelegramNoteMatch(second),
      candidates_scored: scored.length,
    };
  }
  return {
    matched: true,
    reason: 'matched',
    best,
    match: summarizeTelegramNoteMatch(best),
    candidates_scored: scored.length,
  };
}

function telegramNoteRequiresFollowUp(noteText = '') {
  return /\b(?:follow\s*up|call|remind|reminder|task|ticket|todo|to-do|needs?|ask him|ask her|check back)\b/i.test(String(noteText || ''));
}

function suggestTelegramNoteContactRole(noteText = '') {
  const text = String(noteText || '');
  if (/\b(?:not\s+(?:a\s+)?lead|not\s+school|friend|carpool|personal)\b/i.test(text)) {
    return 'friend_non_lead';
  }
  if (/\b(?:tuition|registration|register|enroll|school|bna|class|mishnah|membership|lead)\b/i.test(text)) {
    return 'school_interest';
  }
  return '';
}

module.exports = {
  cleanContactClue,
  cleanNoteText,
  compactWhitespace,
  hasTelegramNoteToCrmIntent,
  normalizeMatchText,
  normalizePhoneDigitsForNote,
  parseTelegramNoteToCrm,
  scoreTelegramNoteCandidate,
  selectBestTelegramNoteCandidate,
  suggestTelegramNoteContactRole,
  summarizeTelegramNoteMatch,
  telegramNoteRequiresFollowUp,
};
