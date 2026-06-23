function normalizeNameForMatch(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameTokens(value) {
  return normalizeNameForMatch(value)
    .split(/\s+/)
    .filter(Boolean);
}

function studentAliasesForServer(student) {
  const normalized = normalizeNameForMatch(student?.name);
  const parts = normalized.split(/\s+/).filter((part) => part.length >= 3);
  const aliases = new Set([normalized, ...parts]);
  const haystack = `${student?.name || ''} ${student?.notes || ''}`.toLowerCase();

  if (/golambo|golamb/i.test(haystack)) {
    ['eitan', 'eitan chaim', 'eitan chaim golambo', 'golambo', 'shalom golambo']
      .forEach((alias) => aliases.add(normalizeNameForMatch(alias)));
  }
  if (/kosovsky|kosofsky|amitai|amitay/i.test(haystack)) {
    ['amitay', 'amitai', 'amiti', 'amitai kosovsky', 'amitay kosovsky', 'kosovsky', 'kosofsky']
      .forEach((alias) => aliases.add(normalizeNameForMatch(alias)));
  }

  return [...aliases].filter((alias) => alias.length >= 3);
}

function scoreStudentParsedNameMatch(parsedName, student) {
  const normalized = normalizeNameForMatch(parsedName);
  if (!normalized) return 0;

  const normalizedTokens = nameTokens(normalized);
  const tokenSet = new Set(normalizedTokens);
  const studentName = normalizeNameForMatch(student?.name);
  const studentNameTokens = nameTokens(studentName);
  let bestScore = 0;

  for (const alias of studentAliasesForServer(student)) {
    const aliasTokens = nameTokens(alias);
    const aliasIsFullName = alias === studentName && aliasTokens.length >= 2;
    let score = 0;

    if (normalized === alias) {
      score = aliasTokens.length >= 2 ? 120 : 70;
    } else if (aliasIsFullName && normalized.includes(alias)) {
      score = 115;
    } else if (aliasIsFullName && studentNameTokens.every((token) => tokenSet.has(token))) {
      score = 110;
    } else if (aliasTokens.length >= 2 && normalized.includes(alias)) {
      score = 95;
    } else if (aliasTokens.length >= 2 && alias.includes(normalized) && normalizedTokens.length >= 2) {
      score = 80;
    } else if (aliasTokens.length === 1 && normalizedTokens.length === 1 && normalized === alias) {
      score = 70;
    } else if (aliasTokens.length === 1 && normalizedTokens.length === 1 && (normalized.includes(alias) || alias.includes(normalized))) {
      score = 55;
    } else if (aliasTokens.length === 1 && normalizedTokens.length > 1 && tokenSet.has(alias)) {
      score = 10;
    }

    bestScore = Math.max(bestScore, score);
  }

  return bestScore;
}

function findStudentForParsedName(name, students = []) {
  const ranked = (Array.isArray(students) ? students : [])
    .map((student) => ({
      student,
      score: scoreStudentParsedNameMatch(name, student),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || Number(a.student?.id || 0) - Number(b.student?.id || 0));

  if (!ranked.length) return null;
  if (ranked[1] && ranked[1].score === ranked[0].score && ranked[0].score < 100) return null;
  return ranked[0].student;
}

module.exports = {
  findStudentForParsedName,
  normalizeNameForMatch,
  scoreStudentParsedNameMatch,
  studentAliasesForServer,
};
