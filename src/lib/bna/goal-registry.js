const STANDING_GOALS = [
  { id: 'GOAL-CORE-001', title: 'Million-dollar app polish', keywords: ['polish', 'layout', 'visual', 'finished', 'professional', 'million-dollar'] },
  { id: 'GOAL-CORE-002', title: 'Visible actions work', keywords: ['button', 'action', 'click', 'handler', 'disabled', 'coming soon'] },
  { id: 'GOAL-CORE-003', title: 'Routes and links work', keywords: ['route', 'link', 'navigation', 'url', 'page'] },
  { id: 'GOAL-CORE-004', title: 'Mobile clean layout', keywords: ['mobile', 'phone', 'responsive', 'overflow'] },
  { id: 'GOAL-CORE-005', title: 'Consistent shells', keywords: ['header', 'footer', 'sidebar', 'shell', 'manifest', 'topbar'] },
  { id: 'GOAL-CORE-006', title: 'No privacy leaks', keywords: ['privacy', 'private', 'auth', 'login', 'scope', 'student data', 'parent data'] },
  { id: 'GOAL-CORE-007', title: 'Raw intake never lost', keywords: ['raw', 'intake', 'transcript', 'upload', 'ramble', 'recording'] },
  { id: 'GOAL-CORE-008', title: 'Parse into all lanes', keywords: ['parse', 'parser', 'lane', 'task', 'decision', 'question', 'memory'] },
  { id: 'GOAL-CORE-009', title: 'Workspace scoping', keywords: ['workspace', 'scope', 'project', 'provider', 'bna', 'one time'] },
  { id: 'GOAL-CORE-010', title: 'Helper is real', keywords: ['helper', 'sidekick', 'tool', 'natural language'] },
  { id: 'GOAL-CORE-011', title: 'Uploaded classes parse richly', keywords: ['class', 'recording', 'student question', 'transcript', 'lesson'] },
  { id: 'GOAL-CORE-012', title: 'Research findability', keywords: ['research', 'source', 'mishnah', 'gemara', 'pasuk', 'torah'] },
  { id: 'GOAL-CORE-013', title: 'Communications alerting', keywords: ['email', 'whatsapp', 'wapi', 'communication', 'parent message', 'alert'] },
  { id: 'GOAL-CORE-014', title: 'Coherent providers/classrooms', keywords: ['provider', 'classroom', 'community', 'rabbi', 'service provider'] },
  { id: 'GOAL-CORE-015', title: 'Evidence before done', keywords: ['proof', 'evidence', 'done', 'verified', 'watchdog', 'ledger', 'changelog'] },
];

function normalize(value = '') {
  return String(value || '').toLowerCase();
}

function affectedGoalIdsForText(text = '') {
  const lower = normalize(text);
  const ids = STANDING_GOALS
    .filter((goal) => goal.keywords.some((keyword) => lower.includes(keyword)))
    .map((goal) => goal.id);
  if (/\b(always|never|every time|from now on|system should|must|goal mode|watchdog)\b/i.test(text)) {
    ids.push('GOAL-CORE-015');
  }
  return [...new Set(ids)];
}

function standingGoalById(id = '') {
  return STANDING_GOALS.find((goal) => goal.id === id) || null;
}

module.exports = {
  STANDING_GOALS,
  affectedGoalIdsForText,
  standingGoalById,
};
