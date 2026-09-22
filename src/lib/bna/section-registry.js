const SYSTEM_SECTION_DEFINITIONS = [
  ['goals', 'Goals', 'person'],
  ['diet', 'Diet / Nutrition', 'person'],
  ['attendance', 'Attendance', 'person'],
  ['assignments', 'Assignments', 'person'],
  ['behavior', 'Behavior', 'person'],
  ['torah_learning', 'Torah Learning', 'person'],
  ['chores', 'Chores', 'household'],
  ['screen_time', 'Screen Time', 'household'],
  ['medical_note', 'Medical Note', 'person'],
  ['parent_question', 'Parent Question', 'household'],
  ['provider_lead', 'Provider Lead', 'workspace'],
  ['class_notes', 'Class Notes', 'workspace'],
  ['content_item', 'Content Item', 'workspace'],
  ['task', 'Task', 'workspace'],
  ['decision', 'Decision', 'workspace'],
  ['ticket', 'Ticket', 'workspace'],
];

function slugifySectionKey(value = '') {
  const text = String(value || '').trim().toLowerCase();
  const ascii = text
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return ascii || 'custom_section';
}

function systemSectionRows() {
  return SYSTEM_SECTION_DEFINITIONS.map(([section_key, label, scope]) => ({
    section_key,
    label,
    scope,
    schema_json: defaultSectionSchema(section_key),
    source_parser: 'system_seed',
    visible_to: defaultSectionVisibility(section_key),
    status: 'active',
    metadata: { seeded: true },
  }));
}

function defaultSectionSchema(sectionKey = '') {
  const key = slugifySectionKey(sectionKey);
  if (key === 'goals') return { fields: ['goal', 'target', 'next_check_in', 'parent_visible', 'student_visible'] };
  if (key === 'diet') return { fields: ['note', 'food', 'pattern', 'follow_up'] };
  if (key === 'attendance') return { fields: ['status', 'date', 'reason', 'follow_up'] };
  if (key === 'assignments') return { fields: ['assignment', 'due_at', 'source', 'status'] };
  if (key === 'behavior') return { fields: ['behavior', 'context', 'repair_path', 'follow_up'] };
  if (key === 'medical_note') return { fields: ['note', 'sensitivity', 'follow_up_required'] };
  if (key === 'provider_lead') return { fields: ['provider_name', 'service_type', 'contact', 'next_action'] };
  if (key === 'class_notes') return { fields: ['summary', 'topics', 'sources', 'student_questions'] };
  return { fields: ['title', 'notes', 'source_excerpt'] };
}

function defaultSectionVisibility(sectionKey = '') {
  const key = slugifySectionKey(sectionKey);
  if (key === 'medical_note') return { admin: true, parent: false, student: false, provider: false };
  if (['goals', 'diet', 'attendance', 'assignments', 'behavior', 'torah_learning', 'parent_question'].includes(key)) {
    return { admin: true, parent: true, student: false, provider: false };
  }
  return { admin: true, parent: false, student: false, provider: false };
}

function sectionKeyForItemType(itemType = '') {
  const key = String(itemType || '').trim();
  return ({
    goal: 'goals',
    goals: 'goals',
    diet_nutrition_note: 'diet',
    diet_nutrition_notes: 'diet',
    attendance: 'attendance',
    assignment: 'assignments',
    assignments: 'assignments',
    behavior_note: 'behavior',
    behavior_notes: 'behavior',
    provider_lead: 'provider_lead',
    provider_leads: 'provider_lead',
    class_session_note: 'class_notes',
    class_session_notes: 'class_notes',
    custom_section: 'custom_section',
    task: 'task',
    decision: 'decision',
    ticket: 'ticket',
  })[key] || slugifySectionKey(key);
}

function buildCustomSectionProposal(input = {}) {
  const label = String(input.label || input.title || input.section || 'Custom Section').trim();
  const sectionKey = slugifySectionKey(input.section_key || label);
  return {
    section_key: sectionKey,
    label,
    scope: ['workspace', 'household', 'person'].includes(String(input.scope || '').trim()) ? input.scope : 'person',
    schema_json: input.schema_json || { fields: input.fields || ['notes', 'source_excerpt'] },
    source_parser: input.source_parser || 'canonical-intake-parser',
    visible_to: input.visible_to || { admin: true, parent: false, student: false, provider: false },
    status: 'proposed',
    metadata: {
      parser_created: true,
      ...(input.metadata || {}),
    },
  };
}

module.exports = {
  SYSTEM_SECTION_DEFINITIONS,
  systemSectionRows,
  slugifySectionKey,
  defaultSectionSchema,
  defaultSectionVisibility,
  sectionKeyForItemType,
  buildCustomSectionProposal,
};
