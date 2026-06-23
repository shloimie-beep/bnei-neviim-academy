const { redactValue } = require('./redaction');
const { resolveHelperScope } = require('./scope');

function compactText(value = '', maxLength = 1000) {
  return String(value || '').replace(/\r/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function safeJson(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function safeArray(value = [], maxItems = 40) {
  return (Array.isArray(value) ? value : [])
    .map((item) => compactText(item, 500))
    .filter(Boolean)
    .slice(0, maxItems);
}

function safeObject(value = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function defaultProfileForScope(scope = {}) {
  return {
    id: null,
    scope_type: scope.scopeType,
    scope_id: scope.scopeId,
    helper_name: scope.helperName,
    display_tone: scope.displayTone,
    communication_style: scope.toneProfile?.communicationStyle || {},
    do_rules: scope.safetyPolicy?.doRules || [],
    avoid_rules: scope.safetyPolicy?.avoidRules || [],
    memory_summary: '',
    safety_level: scope.safetyPolicy?.safetyLevel || 'standard',
    questionnaire: questionnaireForScope(scope.scopeType),
    created_at: null,
    updated_at: null,
  };
}

function profileView(row = null, scope = {}) {
  const fallback = defaultProfileForScope(scope);
  if (!row) return fallback;
  return {
    id: row.id,
    scope_type: row.scope_type || scope.scopeType,
    scope_id: row.scope_id || scope.scopeId,
    helper_name: row.helper_name || fallback.helper_name,
    display_tone: row.display_tone || fallback.display_tone,
    communication_style: safeJson(row.communication_style, fallback.communication_style),
    do_rules: safeJson(row.do_rules, fallback.do_rules),
    avoid_rules: safeJson(row.avoid_rules, fallback.avoid_rules),
    memory_summary: row.memory_summary || '',
    safety_level: row.safety_level || fallback.safety_level,
    questionnaire: questionnaireForScope(row.scope_type || scope.scopeType),
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

function questionnaireForScope(scopeType = 'admin') {
  if (scopeType === 'student') {
    return [
      'What kind of learning help is easiest for you: short hints, examples, or step-by-step?',
      'Which language should the helper use with you?',
      'What should the helper do when you are stuck?',
    ];
  }
  if (scopeType === 'parent' || scopeType === 'family') {
    return [
      'What tone helps you most: direct, warm, brief, or detailed?',
      'What usually causes homework or accountability friction?',
      'How does your child respond when pushed?',
      'What kind of reminders work?',
      'What should the helper avoid saying?',
      'What are your family priorities?',
      'What language should the helper use?',
      'What information should only be visible to parents?',
    ];
  }
  if (scopeType === 'provider') {
    return [
      'What is your brand voice?',
      'Who do you serve?',
      'What is your main offer?',
      'What language should the helper use?',
      'What should it never promise?',
      'What kinds of leads are good or bad fits?',
      'What tone should marketing drafts use?',
    ];
  }
  if (scopeType === 'rabbi') {
    return [
      'What teaching voice should the helper preserve?',
      'What Torah or Mishnayos tone should it use?',
      'What parent-facing style should it use?',
      'What student-facing style should it use?',
      'Which phrases should it use or avoid?',
      'How formal should it be?',
      'What class structure preferences should it remember?',
    ];
  }
  return [
    'What tone helps you most while operating the system?',
    'What should the helper do automatically as drafts or internal writes?',
    'What should always become a decision or pending blocker?',
    'What should the helper avoid saying or exposing?',
  ];
}

async function loadHelperProfile(db, context = {}) {
  const scope = resolveHelperScope(context);
  const result = await db.query(
    `SELECT *
     FROM bna_helper_profiles
     WHERE scope_type = $1 AND scope_id = $2
     LIMIT 1`,
    [scope.scopeType, scope.scopeId]
  );
  return {
    scope,
    profile: profileView(result.rows[0] || null, scope),
  };
}

async function upsertHelperProfile(db, context = {}, patch = {}) {
  const scope = resolveHelperScope(context);
  const current = defaultProfileForScope(scope);
  const communicationStyle = redactValue({
    ...safeObject(current.communication_style),
    ...safeObject(patch.communication_style || patch.communicationStyle),
  });
  const doRules = safeArray(patch.do_rules || patch.doRules || current.do_rules);
  const avoidRules = safeArray(patch.avoid_rules || patch.avoidRules || current.avoid_rules);
  const result = await db.query(
    `INSERT INTO bna_helper_profiles (
       scope_type, scope_id, helper_name, display_tone, communication_style,
       do_rules, avoid_rules, memory_summary, safety_level
     ) VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9)
     ON CONFLICT(scope_type, scope_id) DO UPDATE SET
       helper_name = EXCLUDED.helper_name,
       display_tone = EXCLUDED.display_tone,
       communication_style = bna_helper_profiles.communication_style || EXCLUDED.communication_style,
       do_rules = EXCLUDED.do_rules,
       avoid_rules = EXCLUDED.avoid_rules,
       memory_summary = EXCLUDED.memory_summary,
       safety_level = EXCLUDED.safety_level,
       updated_at = NOW()
     RETURNING *`,
    [
      scope.scopeType,
      scope.scopeId,
      compactText(patch.helper_name || patch.helperName || current.helper_name, 160),
      compactText(patch.display_tone || patch.displayTone || current.display_tone, 500),
      JSON.stringify(communicationStyle),
      JSON.stringify(doRules),
      JSON.stringify(avoidRules),
      compactText(patch.memory_summary || patch.memorySummary || current.memory_summary, 4000),
      compactText(patch.safety_level || patch.safetyLevel || current.safety_level, 80),
    ]
  );
  return {
    scope,
    profile: profileView(result.rows[0], scope),
  };
}

async function storeHelperQuestionnaire(db, context = {}, payload = {}) {
  const answers = redactValue(safeObject(payload.answers || payload.questionnaire || payload.communication_style || payload.communicationStyle));
  const current = await loadHelperProfile(db, context);
  const mergedStyle = {
    ...safeObject(current.profile.communication_style),
    questionnaire_answers: answers,
    questionnaire_updated_at: new Date().toISOString(),
  };
  return upsertHelperProfile(db, context, {
    ...current.profile,
    communication_style: mergedStyle,
    memory_summary: compactText(payload.memory_summary || payload.memorySummary || current.profile.memory_summary, 4000),
  });
}

module.exports = {
  defaultProfileForScope,
  loadHelperProfile,
  profileView,
  questionnaireForScope,
  storeHelperQuestionnaire,
  upsertHelperProfile,
};
