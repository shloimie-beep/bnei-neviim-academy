const {
  metadataWithGoalBoard,
  normalizeGoalBoardSection,
} = require('./goal-board');

function cleanString(value, fallback = '') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function firstCompactSentence(value, fallback = '') {
  const text = cleanString(value);
  if (!text) return fallback;
  const sentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  return sentence.slice(0, 180).trim() || fallback;
}

function clampProgressPercent(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function normalizeClockTime(hourText, minuteText = '00', meridiemText = '', { assumePm = false } = {}) {
  let hour = Number(hourText);
  const minute = Number(minuteText || '00');
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour < 0 || hour > 24 || minute < 0 || minute > 59) {
    return '';
  }
  const meridiem = String(meridiemText || '').toLowerCase();
  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  if (!meridiem && assumePm && hour > 0 && hour <= 12) hour += 12;
  if (hour === 24) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function extractBedtimeTime(text) {
  const value = String(text || '');
  const explicit = value.match(/\b(?:bedtime|bed\s+by|in\s+bed\s+by|asleep\s+by|sleep\s+by)\D{0,30}(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (explicit) return normalizeClockTime(explicit[1], explicit[2], explicit[3], { assumePm: true });
  if (/\b(bed|bedtime|sleep|asleep)\b/i.test(value)) {
    const nearby = value.match(/\b(\d{1,2})(?::(\d{2}))?\s*(pm)\b/i);
    if (nearby) return normalizeClockTime(nearby[1], nearby[2], nearby[3], { assumePm: true });
  }
  return '';
}

function extractWakeTime(text) {
  const value = String(text || '');
  const explicit = value.match(/\b(?:wake|wake\s+up|out\s+of\s+bed|up\s+by)\D{0,30}(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  return explicit ? normalizeClockTime(explicit[1], explicit[2], explicit[3]) : '';
}

function clauseAfter(text, labelPattern, stopPattern = '') {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  const stop = stopPattern || 'checklist|items?|consequence|recovery|incentive|reward|permission|parent visible|student hidden|student visible|pending review|needs review';
  const match = value.match(new RegExp(`\\b(?:${labelPattern})(?:\\s*(?:is|are|:|-))?\\s+([\\s\\S]{4,220})`, 'i'));
  if (!match) return '';
  const stopped = match[1].split(new RegExp(`\\b(?:${stop})\\b`, 'i'))[0] || match[1];
  return cleanString(stopped.split(/[.\n]/)[0], '').replace(/\s*[;:,]$/, '').trim();
}

function inferTelegramGoalBoardSection(text, fallback = 'learning') {
  const value = String(text || '').toLowerCase();
  const explicit = value.match(/\b(?:section|goal section)\s*(?:is|:|-)\s*([a-z_ -]{4,40})/i);
  if (explicit) return normalizeGoalBoardSection(explicit[1], fallback);
  if (/\b(bed|bedtime|sleep|wake|floor|clean|cleanup|chores?|room|home|family|responsibilit(?:y|ies)|routine)\b/.test(value)) return 'personal_home';
  if (/\b(permission|permissions|allow|allowed|go out|outside|friend|device|tablet|phone|computer|screen|screens)\b/.test(value)) return 'permissions';
  if (/\b(incentive|incentives|reward|rewards|prize|bonus|percent target|percentage target|trip)\b/.test(value)) return 'incentives';
  if (/\b(parent meeting|rabbi meeting|private meeting|meeting|check[-\s]?in)\b/.test(value)) return 'meetings';
  if (/\b(learn|learning|torah|mishna|mishnah|mishnayos|gemara|reading|minutes?|assignment|worksheet)\b/.test(value)) return 'learning';
  return normalizeGoalBoardSection(fallback || 'learning', 'learning');
}

function explicitSubsection(text) {
  const match = String(text || '').match(/\b(?:subsection|child section|child-specific section)\s*(?:is|:|-)\s*([^.;\n]{3,90})/i);
  return match ? cleanString(match[1]).slice(0, 90) : '';
}

function inferTelegramGoalBoardSubsection(text, section) {
  const explicit = explicitSubsection(text);
  if (explicit) return explicit;
  const value = String(text || '').toLowerCase();
  if (section === 'personal_home' && /\b(chores?|floor|clean|bed|bedtime|sleep)\b/.test(value)) return 'Chores and bedtime';
  if (section === 'permissions') return 'Permissions';
  if (section === 'incentives') return 'Incentives';
  if (section === 'meetings') return /\bparent\b/.test(value) ? 'Parent meeting' : 'Meeting follow-up';
  if (section === 'learning') return 'Learning';
  return '';
}

function splitChecklistText(text) {
  return String(text || '')
    .split(/\s*(?:;|\n|\band then\b|\bthen\b)\s*/i)
    .map((item) => cleanString(item).replace(/^(?:and|to)\s+/i, '').replace(/\s*[.!?]+$/g, '').trim())
    .filter((item) => item.length >= 3)
    .slice(0, 8);
}

function telegramGoalChecklistFromText(text) {
  const value = String(text || '');
  const lower = value.toLowerCase();
  const explicit = value.match(/\b(?:checklist|items?)\s*(?:is|are|:|-)\s*([\s\S]{4,360})/i);
  if (explicit) {
    const stopped = explicit[1].split(/\b(?:consequence|recovery|incentive|reward|parent visible|student hidden|pending review|needs review)\b/i)[0];
    const items = splitChecklistText(stopped);
    if (items.length) return items;
  }
  const checklist = [];
  if (/\bfloor\b|\bclean|cleanup|chores?/.test(lower)) checklist.push('Finish the agreed floor or chore cleanup.');
  if (/\bbed\b|\bbedtime\b|\bsleep\b/.test(lower)) checklist.push('Be in bed at the agreed bedtime.');
  if (/\bpermission|allowed|go out|outside|device|tablet|phone|screen/.test(lower)) checklist.push('Follow the agreed permission rule.');
  if (/\blearn|torah|mishna|mishnah|reading|minutes?|assignment|worksheet/.test(lower)) checklist.push('Complete the agreed learning block.');
  if (/\bmeeting|check[-\s]?in/.test(lower)) checklist.push('Review the meeting follow-up with Rabbi/admin.');
  if (!checklist.length) checklist.push(firstCompactSentence(value, 'Complete the agreed goal.'));
  return checklist.slice(0, 8);
}

function telegramGoalConsequenceFromText(text) {
  const value = String(text || '');
  const explicit = clauseAfter(value, 'chosen consequence|consequence|natural consequence|rule');
  if (explicit) return explicit;
  if (/\b(no|can't|cannot|not)\s+go\s+out\b|\bno\s+going\s+out\b/i.test(value)) {
    return 'No going out the next day if the agreed responsibility is not completed.';
  }
  if (/\b(no|lose|loses|without)\s+(?:device|tablet|phone|screen|computer)\b/i.test(value)) {
    return 'Device or screen access stays restricted until the recovery path is reviewed.';
  }
  return '';
}

function telegramGoalRecoveryPathFromText(text, consequence = '') {
  const explicit = clauseAfter(text, 'recovery path|recovery|repair path|repair');
  return explicit || consequence || '';
}

function telegramGoalIncentiveFromText(text) {
  const value = String(text || '');
  if (!/\b(incentive|reward|prize|bonus|percent target|percentage target)\b/i.test(value)) return {};
  const explicit = clauseAfter(value, 'incentive|reward|prize|bonus');
  const percentMatch = value.match(/\b(100|[1-9]?\d)\s*(?:%|\bpercent\b)/i);
  return {
    text: explicit || firstCompactSentence(value, 'Goal Board incentive'),
    chosen_by: /\bstudent[-\s]?chosen|chosen by (?:the )?student|boy chose\b/i.test(value) ? 'student' : 'telegram',
    percent_target: percentMatch ? Number(percentMatch[1]) : null,
  };
}

function parentAccountabilitySource(text) {
  const value = String(text || '').toLowerCase();
  if (/\b(parent meeting|meeting recording|parent recording|uploaded by parent|parent upload)\b/.test(value)) return 'parent_meeting';
  if (/\b(parent chat|parent update|from (?:the )?(?:parent|mom|mother|father|dad)|mom says|mother says|father says|dad says)\b/.test(value)) return 'parent_update';
  if (/\b(private meeting|rabbi meeting|one on one|1:1)\b/.test(value)) return 'private_meeting';
  return 'admin';
}

function hasGoalBoardFieldIntent(text) {
  const value = String(text || '').toLowerCase();
  return /\b(goal board|student goal|goal|bedtime|chores?|floor|permission|permissions|consequence|recovery path|incentive|reward|parent[-\s]?visible|student[-\s]?hidden|pending review|checklist|agreement)\b/.test(value);
}

function hasParentAccountabilityRoutingIntent(text) {
  const value = String(text || '').toLowerCase();
  const sourceMarker = /\b(parent meeting|parent recording|meeting recording|parent chat|parent portal|parent accountability|uploaded by parent|from (?:the )?(?:parent|mom|mother|father|dad)|mom says|mother says|father says|dad says)\b/.test(value);
  const accountabilityMarker = /\b(accountability|student|child|son|daughter|goal|goals|bedtime|chores?|floor|clean|permission|permissions|consequence|incentive|reward|parent[-\s]?visible|student[-\s]?hidden|pending review|rabbi review|meeting summary)\b/.test(value);
  return sourceMarker && accountabilityMarker;
}

function buildTelegramGoalBoardPayload(text, { eventType = '', progressPercent = null } = {}) {
  const source = parentAccountabilitySource(text);
  const section = inferTelegramGoalBoardSection(text, eventType === 'private_meeting' ? 'meetings' : 'learning');
  const subsection = inferTelegramGoalBoardSubsection(text, section);
  const consequence = telegramGoalConsequenceFromText(text);
  const recoveryPath = telegramGoalRecoveryPathFromText(text, consequence);
  const incentive = telegramGoalIncentiveFromText(text);
  const parentCreated = ['parent_meeting', 'parent_update'].includes(source) || hasParentAccountabilityRoutingIntent(text);
  const explicitPendingReview = /\b(pending review|needs review|rabbi review|admin review|review before (?:student )?visible)\b/i.test(text);
  const studentHidden = parentCreated || /\b(student[-\s]?hidden|hide from (?:the )?student|not visible to (?:the )?student|student should not see)\b/i.test(text);
  const studentVisible = !studentHidden && !/\b(do not show|don't show|dont show)\b/i.test(text);
  const parentHidden = /\b(parent[-\s]?hidden|hide from (?:the )?parent|not visible to (?:the )?parent)\b/i.test(text);
  const approvalRequired = parentCreated || explicitPendingReview || studentHidden || Boolean(consequence || recoveryPath || incentive.text);

  return {
    source,
    category: section,
    section,
    subsection,
    urgency: /\btoday|tonight|urgent\b/i.test(text) ? 'today' : 'this_week',
    status: approvalRequired ? 'waiting' : 'active',
    parent_visible: !parentHidden,
    student_visible: parentCreated ? false : studentVisible,
    approval_required: approvalRequired,
    approval_status: approvalRequired ? 'pending_review' : 'approved',
    student_summary: firstCompactSentence(text, 'Goal Board update'),
    private_note: parentCreated
      ? 'Parent-created Telegram update is waiting for Rabbi/admin review before student visibility.'
      : '',
    checklist: telegramGoalChecklistFromText(text),
    agreement_type: section === 'personal_home' ? 'home_responsibility' : '',
    bedtime_time: extractBedtimeTime(text),
    wake_time: extractWakeTime(text),
    student_commitment: firstCompactSentence(text, ''),
    chosen_consequence: consequence,
    recovery_path: recoveryPath,
    consequence_status: consequence || recoveryPath ? 'pending_review' : 'none',
    review_reason: approvalRequired
      ? 'Telegram-created consequence/permission/incentive needs Rabbi/admin approval before student visibility.'
      : '',
    incentive,
    incentive_text: incentive.text || '',
    incentive_chosen_by: incentive.chosen_by || '',
    incentive_percent_target: incentive.percent_target,
    progress_percent: progressPercent,
  };
}

function detectTelegramAccountabilityType(text) {
  const normalized = String(text || '').toLowerCase();
  if (/\b(question|asked|asks|שאלה|\?)\b/.test(normalized)) return 'question';
  if (/\b(goal board|student goal|goal|goals|work on|practice|commit|kabbalah|accountability|bedtime|chores?|floor|permission|permissions|consequence|recovery path|incentive|reward)\b/.test(normalized)) return 'student_goal';
  if (/\b(parent meeting|private|meeting|met with|1:1|one on one|check in|meeting summary)\b/.test(normalized)) return 'private_meeting';
  if (/\b(decided|decision|we agreed|agreed to|next time)\b/.test(normalized)) return 'decision';
  if (/\b(class|shiur|lesson|learned|taught|topic|recording)\b/.test(normalized)) return 'learning_note';
  return null;
}

function isLikelyTelegramStudentAccountabilityUnit(text, eventType, student) {
  if (student) return true;
  if (hasParentAccountabilityRoutingIntent(text)) return true;

  const normalized = String(text || '').toLowerCase();
  const systemRamble = /\b(api|app|dashboard|telegram|bot|bridge|drive|folder|whisper|openai|kimi|kimmy|codex|video|facebook|whatsapp|youtube|blog|newsletter|pipeline|repo|database|railway|ghl)\b/.test(normalized);
  if (systemRamble) return false;

  if (eventType === 'learning_note' || eventType === 'question') {
    return /\b(class question|student asked|boy asked|asked by|question from)\b/.test(normalized);
  }

  return /\b(private meeting|parent meeting|met with|one on one|1:1|check in|check-in|student goal|goal board|goal for|attendance|next meeting|next check|bedtime|chores?|floor|permission|permissions|consequence|recovery path|incentive|reward|parent[-\s]?visible|student[-\s]?hidden|pending review)\b/.test(normalized);
}

function extractTelegramAccountabilityDetails(text, { eventType = detectTelegramAccountabilityType(text) } = {}) {
  const normalized = String(text || '').toLowerCase();
  const details = {
    metadata: {
      parser: 'telegram-accountability-v1',
    },
  };

  const ratioMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:\/|out of|of|instead of)\s*(\d+(?:\.\d+)?)/);
  if (ratioMatch) {
    const actual = Number(ratioMatch[1]);
    const target = Number(ratioMatch[2]);
    if (target > 0) {
      details.goal_actual_value = actual;
      details.goal_target_value = target;
      details.progress_percent = clampProgressPercent((actual / target) * 100);
    }
  }

  const percentMatch = normalized.match(/(\d{1,3})\s*%/);
  if (percentMatch) details.progress_percent = clampProgressPercent(percentMatch[1]);

  const unitMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(minutes?|mins?|pages?|daf|blatt|mishnayos?|questions?|times?)\b/);
  if (unitMatch && details.goal_actual_value === undefined) {
    details.goal_actual_value = Number(unitMatch[1]);
    details.goal_unit = unitMatch[2];
  } else if (unitMatch) {
    details.goal_unit = unitMatch[2];
  }

  if (/\b(missed|absent|did not show|no show)\b/.test(normalized)) details.attendance_status = 'missed';
  else if (/\b(late|came late)\b/.test(normalized)) details.attendance_status = 'late';
  else if (/\b(showed up|attended|came|was there|present)\b/.test(normalized)) details.attendance_status = 'attended';

  if (/\b(very focused|focused|engaged|talkative|opened up|participated)\b/.test(normalized)) details.engagement_level = 'high';
  else if (/\b(quiet|hard for him|struggled|distracted|not focused|shut down)\b/.test(normalized)) details.engagement_level = 'low';
  else if (/\b(okay|fine|somewhat|medium)\b/.test(normalized)) details.engagement_level = 'medium';

  if (/\b(follow up|check next|next week|next meeting|remind me|needs reminder|ask him)\b/.test(normalized)) {
    details.follow_up_required = true;
  }

  const topicMatch = String(text).match(/\b(?:topic|about|regarding)\s+([^.;,\n]{4,60})/i);
  if (topicMatch) details.topic = topicMatch[1].trim();

  if (eventType === 'student_goal' || hasGoalBoardFieldIntent(text)) {
    const goalBoard = buildTelegramGoalBoardPayload(text, {
      eventType,
      progressPercent: details.progress_percent ?? null,
    });
    details.metadata = metadataWithGoalBoard(details.metadata, goalBoard);
    if (!details.topic) details.topic = goalBoard.category;
  }

  return details;
}

module.exports = {
  buildTelegramGoalBoardPayload,
  detectTelegramAccountabilityType,
  extractTelegramAccountabilityDetails,
  hasParentAccountabilityRoutingIntent,
  isLikelyTelegramStudentAccountabilityUnit,
};
