'use strict';

const DEFAULT_ACCOUNTABILITY_SECTIONS = [
  { section_key: 'goals', label: 'Goals', sort_order: 10 },
  { section_key: 'diet', label: 'Diet', sort_order: 20 },
  { section_key: 'attendance', label: 'Attendance', sort_order: 30 },
  { section_key: 'assignments', label: 'Assignments', sort_order: 40 },
  { section_key: 'behavior', label: 'Behavior', sort_order: 50 },
  { section_key: 'torah_learning', label: 'Torah / Learning', sort_order: 60 },
  { section_key: 'chores', label: 'Chores', sort_order: 70 },
];

function normalizeIdentityEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizeIdentityPhone(value = '') {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('972') && digits.length >= 11) return `0${digits.slice(3)}`;
  return digits;
}

function normalizeDisplayName(value = '') {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePersonNameKey(value = '') {
  return normalizeDisplayName(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugifySectionKey(value = '', fallback = 'custom') {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u0590-\u05ff]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  return slug || fallback;
}

function parentMergeDecision({ existingByEmail = null, existingByPhone = null } = {}) {
  if (existingByEmail && existingByPhone && Number(existingByEmail.id) !== Number(existingByPhone.id)) {
    return {
      action: 'review',
      reason: 'phone_conflicts_with_different_email_person',
      person_id: existingByEmail.id,
      candidate_person_id: existingByPhone.id,
    };
  }
  if (existingByEmail) return { action: 'use_existing', person_id: existingByEmail.id, reason: 'exact_email' };
  if (existingByPhone) return { action: 'use_existing', person_id: existingByPhone.id, reason: 'exact_phone' };
  return { action: 'create', reason: 'no_exact_contact_match' };
}

function shouldMergeChildInHousehold({
  existingHouseholdChild = null,
  sameHousehold = false,
  stableSignal = false,
} = {}) {
  return Boolean(existingHouseholdChild && sameHousehold && stableSignal);
}

function shouldMergeChildAcrossHouseholds() {
  return false;
}

module.exports = {
  DEFAULT_ACCOUNTABILITY_SECTIONS,
  normalizeIdentityEmail,
  normalizeIdentityPhone,
  normalizeDisplayName,
  normalizePersonNameKey,
  slugifySectionKey,
  parentMergeDecision,
  shouldMergeChildInHousehold,
  shouldMergeChildAcrossHouseholds,
};
