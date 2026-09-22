const { compactWhitespace } = require('./task-shaping');

function normalizeAlias(value = '') {
  return compactWhitespace(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function personTypeFromRole(role = '') {
  const key = String(role || '').toLowerCase();
  if (/\b(student|child|son|daughter|boy|girl|talmid)\b/.test(key) || /תלמיד|ילד|בן|בת/.test(key)) return 'student';
  if (/\b(parent|mother|mom|father|dad|caregiver)\b/.test(key) || /הורה|אמא|אבא|אם|אב/.test(key)) return 'parent';
  if (/\b(provider|service provider|rabbi|teacher|tutor)\b/.test(key)) return 'provider';
  if (/\b(admin|staff|operator|shloimie|codex)\b/.test(key)) return 'staff';
  return 'unknown';
}

function pushPerson(people, seen, name, role, confidence, sourceExcerpt = '') {
  const displayName = compactWhitespace(name)
    .replace(/^[,:;\-\s]+|[,:;\-\s]+$/g, '')
    .replace(/\b(?:needs|should|said|asked|was|is|and|with|about)\b.*$/i, '')
    .trim();
  const normalized = normalizeAlias(displayName);
  if (!displayName || normalized.length < 2 || seen.has(normalized)) return;
  seen.add(normalized);
  people.push({
    display_name: displayName,
    name: displayName,
    person_type: personTypeFromRole(role),
    aliases: [displayName],
    normalized_alias: normalized,
    confidence,
    source_excerpt: compactWhitespace(sourceExcerpt || displayName).slice(0, 500),
  });
}

function extractPeopleFromText(text = '') {
  const raw = String(text || '');
  const people = [];
  const seen = new Set();
  const patterns = [
    [/\b(student|son|daughter|child|boy)\s+([A-Z][a-zA-Z'’-]+(?:\s+[A-Z][a-zA-Z'’-]+){0,3})/g, 0.86],
    [/\b(parent|mother|mom|father|dad)\s+([A-Z][a-zA-Z'’-]+(?:\s+[A-Z][a-zA-Z'’-]+){0,3})/g, 0.84],
    [/\b(provider|rabbi|teacher|tutor)\s+([A-Z][a-zA-Z'’-]+(?:\s+[A-Z][a-zA-Z'’-]+){0,4})/g, 0.82],
    [/(?:תלמיד|ילד|בן|בת)\s+([\u0590-\u05ff]{2,}(?:\s+[\u0590-\u05ff]{2,}){0,3})/g, 0.84],
    [/(?:הורה|אמא|אבא|אם|אב)\s+([\u0590-\u05ff]{2,}(?:\s+[\u0590-\u05ff]{2,}){0,3})/g, 0.82],
  ];
  for (const [pattern, confidence] of patterns) {
    let match;
    while ((match = pattern.exec(raw))) {
      pushPerson(people, seen, match[2] || match[1], match[1] || '', confidence, match[0]);
    }
  }

  const parentStudentPattern = /\b([A-Z][a-zA-Z'’-]+(?:\s+[A-Z][a-zA-Z'’-]+){0,2})'?s\s+(son|daughter|child)\s+([A-Z][a-zA-Z'’-]+(?:\s+[A-Z][a-zA-Z'’-]+){0,2})/g;
  let relationMatch;
  while ((relationMatch = parentStudentPattern.exec(raw))) {
    pushPerson(people, seen, relationMatch[1], 'parent', 0.82, relationMatch[0]);
    pushPerson(people, seen, relationMatch[3], 'student', 0.82, relationMatch[0]);
  }

  return people;
}

function inferRelationshipsFromText(text = '', people = []) {
  const raw = String(text || '');
  const relationships = [];
  const add = (personName, relatedName, relationshipType, confidence, sourceExcerpt) => {
    const person = compactWhitespace(personName);
    const related = compactWhitespace(relatedName);
    if (!person || !related) return;
    relationships.push({
      person_name: person,
      related_person_name: related,
      relationship_type: relationshipType,
      confidence,
      source_excerpt: compactWhitespace(sourceExcerpt).slice(0, 500),
    });
  };

  const possessive = /\b([A-Z][a-zA-Z'’-]+(?:\s+[A-Z][a-zA-Z'’-]+){0,2})'?s\s+(son|daughter|child)\s+([A-Z][a-zA-Z'’-]+(?:\s+[A-Z][a-zA-Z'’-]+){0,2})/g;
  let match;
  while ((match = possessive.exec(raw))) {
    add(match[1], match[3], 'parent_child', 0.86, match[0]);
  }

  const parent = people.find((item) => item.person_type === 'parent');
  const student = people.find((item) => item.person_type === 'student');
  if (parent && student) add(parent.display_name, student.display_name, 'parent_child', Math.min(parent.confidence, student.confidence, 0.82), `${parent.source_excerpt} ${student.source_excerpt}`);

  return relationships;
}

function ambiguousPeopleFromExtraction(people = []) {
  return people
    .filter((person) => person.confidence < 0.85 || normalizeAlias(person.display_name).split(' ').length < 2)
    .map((person) => ({
      review_type: 'ambiguous_person',
      reason: `Person "${person.display_name}" needs confirmation before automatic linking.`,
      payload: { person },
      confidence: person.confidence,
    }));
}

module.exports = {
  normalizeAlias,
  personTypeFromRole,
  extractPeopleFromText,
  inferRelationshipsFromText,
  ambiguousPeopleFromExtraction,
};
