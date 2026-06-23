function normalizeDirectReplyGuardText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function hasDirectReplyInsteadOfCodexIntent(text) {
  const normalized = normalizeDirectReplyGuardText(text);
  if (!normalized) return false;

  const mentionsMachineWorker = /\b(codex|kodak|codak|kimi|kimmy|agent|machine work)\b/.test(normalized);
  const negatesMachineWorker =
    /\b(?:don'?t|do not|didn'?t|did not|no)\b.{0,80}\b(?:speak|talk|file|task|queue|route|assign|send|hand|give)\b.{0,80}\b(?:codex|kodak|codak|kimi|kimmy|agent|machine work)\b/.test(normalized) ||
    /\b(?:codex|kodak|codak|kimi|kimmy|agent|machine work)\b.{0,80}\b(?:isn'?t|is not|wasn'?t|was not|don'?t|do not|didn'?t|did not|not|no)\b.{0,80}\b(?:wanted|needed|the point|what i wanted|what i asked|for this)\b/.test(normalized);
  const negatesTaskFiling =
    /\b(?:don'?t|do not|didn'?t|did not|no)\b.{0,100}\b(?:file|create|make|queue|assign|route|turn|put)\b.{0,100}\b(?:task|codex|kodak|codak|kimi|kimmy|agent|background)\b/.test(normalized) ||
    /\b(?:not|no)\b.{0,30}\b(?:a )?(?:codex|kodak|codak|kimi|kimmy|task|background)\b/.test(normalized);
  const wantsConversation =
    /\bi\b.{0,30}\b(?:want|wanted|need|needed)\b.{0,50}\b(?:speak|talk)\b.{0,25}\byou\b/.test(normalized) ||
    /\b(?:speak|talk)\b.{0,25}\byou\b/.test(normalized);
  const wantsImmediateCopy =
    /\b(?:give me|answer me|put (?:that|this|the)? ?text together|copy and paste|paste it in|right now|can'?t you do that|can you do that for me)\b/.test(normalized);

  return Boolean(
    (mentionsMachineWorker && (negatesMachineWorker || negatesTaskFiling) && (wantsConversation || wantsImmediateCopy)) ||
    (negatesTaskFiling && wantsConversation && wantsImmediateCopy)
  );
}

module.exports = {
  hasDirectReplyInsteadOfCodexIntent,
  normalizeDirectReplyGuardText,
};
