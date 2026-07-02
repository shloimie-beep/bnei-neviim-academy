function looksLikeQuestionMarkEncodingCorruption(value) {
  const text = String(value || '');
  if (!text.trim()) return false;

  const questionRuns = text.match(/\?{3,}/g) || [];
  if (questionRuns.length < 2) return false;

  const questionMarkCount = questionRuns.reduce((total, run) => total + run.length, 0);
  if (questionMarkCount < 12) return false;

  const nonQuestionLetters = (text.replace(/\?+/g, '').match(/[A-Za-z\u0590-\u05ff]/g) || []).length;
  return questionMarkCount > nonQuestionLetters;
}

function assertOutboundTextReadable(value, label = 'outbound message') {
  if (looksLikeQuestionMarkEncodingCorruption(value)) {
    const error = new Error(`${label} appears to contain encoding-corrupted text; refusing to send repeated question marks`);
    error.statusCode = 400;
    error.code = 'OUTBOUND_TEXT_ENCODING_CORRUPTION';
    throw error;
  }
  return String(value || '');
}

module.exports = {
  assertOutboundTextReadable,
  looksLikeQuestionMarkEncodingCorruption,
};
