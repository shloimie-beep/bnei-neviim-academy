'use strict';

const HEBREW_TEXT_RE = /[\u0590-\u05ff]/;
const HEBREW_NIKKUD_RE = /[\u0591-\u05c7]/g;
const HEBREW_FINALS = new Map([
  ['\u05da', '\u05db'],
  ['\u05dd', '\u05de'],
  ['\u05df', '\u05e0'],
  ['\u05e3', '\u05e4'],
  ['\u05e5', '\u05e6'],
]);

const KNOWN_STUDENT_ALIAS_GROUPS = [
  {
    key: 'menachem_mendel_dratler',
    canonical: 'Menachem Mendel Dratler',
    aliases: [
      'Menachem Mendel Dratler',
      'Menachem Mendel',
      'Menachem',
      'Menahem',
      'Mendel',
      '\u05de\u05e0\u05d7\u05dd',
      '\u05de\u05e0\u05d7\u05dd \u05de\u05e0\u05d3\u05dc',
      '\u05de\u05e0\u05d7\u05dd \u05de\u05e2\u05e0\u05d3\u05dc',
    ],
  },
];

function containsHebrewText(value = '') {
  return HEBREW_TEXT_RE.test(String(value || ''));
}

function normalizeHebrewFinals(value = '') {
  return String(value || '').replace(/[\u05da\u05dd\u05df\u05e3\u05e5]/g, (char) => HEBREW_FINALS.get(char) || char);
}

function normalizeStudentNameKey(value = '') {
  return normalizeHebrewFinals(String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(HEBREW_NIKKUD_RE, '')
    .toLowerCase())
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeStudentNameCompact(value = '') {
  return normalizeStudentNameKey(value).replace(/\s+/g, '');
}

function normalizeStudentEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizeStudentPhone(value = '') {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('972') && digits.length >= 11) return `0${digits.slice(3)}`;
  return digits;
}

function uniqueByNormalizedText(values = []) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const key = normalizeStudentNameKey(text) || text.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function aliasGroupForName(value = '') {
  const key = normalizeStudentNameCompact(value);
  if (!key) return null;
  return KNOWN_STUDENT_ALIAS_GROUPS.find((group) =>
    group.aliases.some((alias) => normalizeStudentNameCompact(alias) === key)
  ) || null;
}

function aliasGroupKeysForNames(values = []) {
  return new Set(values.map(aliasGroupForName).filter(Boolean).map((group) => group.key));
}

function expandKnownStudentAliases(values = []) {
  const expanded = [...values];
  for (const group of KNOWN_STUDENT_ALIAS_GROUPS) {
    if (values.some((value) => aliasGroupForName(value)?.key === group.key)) {
      expanded.push(group.canonical, ...group.aliases);
    }
  }
  return uniqueByNormalizedText(expanded);
}

function buildStudentAliases(input = {}) {
  const fromSourceRecords = Array.isArray(input.source_records)
    ? input.source_records.flatMap((record) => [
        record?.student_name,
        record?.name,
        record?.alias,
        record?.display_name,
      ])
    : [];
  return expandKnownStudentAliases(uniqueByNormalizedText([
    input.canonical_display_name,
    input.name,
    input.student_name,
    input.name_en,
    input.name_he,
    input.english_name,
    input.hebrew_name,
    ...(Array.isArray(input.aliases) ? input.aliases : []),
    ...fromSourceRecords,
  ]));
}

function buildNormalizedStudentNames(input = {}) {
  const names = buildStudentAliases(input);
  const normalized = [];
  for (const name of names) {
    const spaced = normalizeStudentNameKey(name);
    const compact = normalizeStudentNameCompact(name);
    if (spaced) normalized.push(spaced);
    if (compact && compact !== spaced) normalized.push(compact);
  }
  return [...new Set(normalized)];
}

function studentIdentityLanguageChips(input = {}) {
  const aliases = buildStudentAliases(input);
  const chips = new Set();
  if (aliases.some(containsHebrewText)) chips.add('hebrew');
  if (aliases.some((value) => /[a-z]/i.test(String(value || '')))) chips.add('english');
  return [...chips];
}

function intersect(valuesA = [], valuesB = []) {
  const b = new Set(valuesB.filter(Boolean));
  return valuesA.filter((value) => b.has(value));
}

function scoreStudentIdentityCandidate(candidate = {}, input = {}) {
  const inputAliases = buildStudentAliases(input);
  const candidateAliases = buildStudentAliases(candidate);
  const inputNames = buildNormalizedStudentNames(input);
  const candidateNames = buildNormalizedStudentNames(candidate);
  const sharedNames = intersect(inputNames, candidateNames);
  const inputGroups = aliasGroupKeysForNames(inputAliases);
  const candidateGroups = aliasGroupKeysForNames(candidateAliases);
  const sharedAliasGroups = intersect([...inputGroups], [...candidateGroups]);

  const inputEmail = normalizeStudentEmail(input.parent_email || input.parentEmail);
  const candidateEmail = normalizeStudentEmail(candidate.parent_email || candidate.parentEmail);
  const inputPhone = normalizeStudentPhone(input.parent_phone || input.parentPhone);
  const candidatePhone = normalizeStudentPhone(candidate.parent_phone || candidate.parentPhone);
  const sameParentEmail = Boolean(inputEmail && candidateEmail && inputEmail === candidateEmail);
  const sameParentPhone = Boolean(inputPhone && candidatePhone && inputPhone === candidatePhone);
  const conflictingParentEmail = Boolean(inputEmail && candidateEmail && inputEmail !== candidateEmail);
  const conflictingParentPhone = Boolean(inputPhone && candidatePhone && inputPhone !== candidatePhone);

  const inputSignupId = Number(input.signup_id || input.signupId || 0);
  const candidateSignupId = Number(candidate.signup_id || candidate.signupId || 0);
  const sameSignup = Number.isFinite(inputSignupId) && inputSignupId > 0
    && Number.isFinite(candidateSignupId) && candidateSignupId > 0
    && inputSignupId === candidateSignupId;
  const canonicalStudentId = Number(input.canonical_student_id || input.canonicalStudentId || 0);
  const sameCanonicalStudent = Number.isFinite(canonicalStudentId) && canonicalStudentId > 0
    && Number(candidate.id) === canonicalStudentId;
  const samePerson = Number(input.person_id || 0) > 0
    && Number(candidate.person_id || 0) > 0
    && Number(input.person_id) === Number(candidate.person_id);
  const sameHousehold = Number(input.household_id || 0) > 0
    && Number(candidate.household_id || 0) > 0
    && Number(input.household_id) === Number(candidate.household_id);
  const inputExternalId = String(input.legacy_crm_contact_id || input.ghl_contact_id || input.legacy_crm_student_contact_id || '').trim();
  const candidateExternalId = String(candidate.legacy_crm_contact_id || candidate.ghl_contact_id || candidate.legacy_crm_student_contact_id || '').trim();
  const sameExternalContact = Boolean(inputExternalId && candidateExternalId && inputExternalId === candidateExternalId);
  const exactName = sharedNames.length > 0;
  const knownAlias = sharedAliasGroups.length > 0;
  const sameParentContact = sameParentEmail || sameParentPhone;
  const conflict = conflictingParentEmail || conflictingParentPhone;

  let confidence = 0;
  if (sameSignup || sameCanonicalStudent) confidence = 100;
  else if (sameExternalContact) confidence = 96;
  else if (samePerson) confidence = 95;
  else if (sameHousehold && exactName && sameParentContact) confidence = 94;
  else if (exactName && sameParentContact) confidence = 92;
  else if (knownAlias && sameParentContact) confidence = 90;
  else if (sameHousehold && knownAlias) confidence = 82;
  else if (exactName) confidence = 75;
  else if (knownAlias) confidence = 68;
  else if (sameParentContact) confidence = 50;

  if (conflict) confidence = Math.min(confidence, 59);

  const evidence = {
    same_signup: sameSignup,
    same_canonical_student: sameCanonicalStudent,
    same_external_contact: sameExternalContact,
    same_person: samePerson,
    same_household: sameHousehold,
    same_parent_email: sameParentEmail,
    same_parent_phone: sameParentPhone,
    known_hebrew_english_alias: knownAlias,
    exact_normalized_name: exactName,
    shared_normalized_names: sharedNames.slice(0, 8),
    shared_alias_groups: sharedAliasGroups,
    conflicting_parent_email: conflictingParentEmail,
    conflicting_parent_phone: conflictingParentPhone,
    language_chips: [...new Set([
      ...studentIdentityLanguageChips(candidate),
      ...studentIdentityLanguageChips(input),
    ])],
  };

  return {
    candidate,
    confidence,
    evidence,
    safe_auto_match: confidence >= 90 && !conflict,
    review_required: confidence >= 55 && (!confidence || confidence < 90 || conflict),
  };
}

function evidenceLabels(evidence = {}) {
  const labels = [];
  if (evidence.same_signup) labels.push('same signup');
  if (evidence.same_canonical_student) labels.push('same canonical student');
  if (evidence.same_external_contact) labels.push('same external contact');
  if (evidence.same_person) labels.push('same person record');
  if (evidence.same_household) labels.push('same household');
  if (evidence.same_parent_email) labels.push('same parent email');
  if (evidence.same_parent_phone) labels.push('same parent phone');
  if (evidence.known_hebrew_english_alias) labels.push('known Hebrew/English alias');
  if (evidence.exact_normalized_name) labels.push('exact normalized name');
  if (evidence.conflicting_parent_email) labels.push('conflicting parent email');
  if (evidence.conflicting_parent_phone) labels.push('conflicting parent phone');
  return labels;
}

function maskEmail(value = '') {
  const email = normalizeStudentEmail(value);
  if (!email || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  return `${local.slice(0, 1) || '*'}***@${domain}`;
}

function maskPhone(value = '') {
  const digits = normalizeStudentPhone(value);
  if (!digits) return '';
  return `***${digits.slice(-4)}`;
}

module.exports = {
  KNOWN_STUDENT_ALIAS_GROUPS,
  containsHebrewText,
  normalizeStudentNameKey,
  normalizeStudentNameCompact,
  normalizeStudentEmail,
  normalizeStudentPhone,
  buildStudentAliases,
  buildNormalizedStudentNames,
  expandKnownStudentAliases,
  aliasGroupForName,
  scoreStudentIdentityCandidate,
  evidenceLabels,
  maskEmail,
  maskPhone,
};
