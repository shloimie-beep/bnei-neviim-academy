function rabbiTemplateSubject(templateKey, context = {}) {
  const program = context.programName || 'One Time Mishnayos';
  const titles = {
    receipt_access: `${program} access is ready`,
    payment_pending: `${program} payment is pending`,
    failed_checkout: `${program} checkout needs attention`,
    abandoned_checkout_followup: `Finish your ${program} checkout`,
    manual_grant: `${program} access was added`,
    parent_trial_invite: `Your ${program} 30-day trial starts now`,
    revoke_expiry: `${program} access update`,
    magic_login: `${program} member login link`,
  };
  return titles[templateKey] || `${program} update`;
}

function rabbiTemplateBody(templateKey, context = {}) {
  const name = context.recipientName || context.memberName || 'there';
  const program = context.programName || 'One Time Mishnayos';
  const loginUrl = context.loginUrl || context.memberUrl || '';
  const lines = {
    receipt_access: [
      `Hi ${name},`,
      '',
      `Your ${program} access is ready.`,
      loginUrl ? `Member login: ${loginUrl}` : 'You can request a fresh member login link from the member page.',
    ],
    payment_pending: [
      `Hi ${name},`,
      '',
      `Your ${program} payment is still pending. Access will be available once payment is confirmed.`,
    ],
    failed_checkout: [
      `Hi ${name},`,
      '',
      `Your ${program} checkout did not complete. Reply here if you need help.`,
    ],
    abandoned_checkout_followup: [
      `Hi ${name},`,
      '',
      `You started ${program} checkout but did not finish. You can return to the preview page when ready.`,
    ],
    manual_grant: [
      `Hi ${name},`,
      '',
      `${program} access was added manually by the office.`,
      loginUrl ? `Member login: ${loginUrl}` : '',
    ],
    parent_trial_invite: [
      `Hi ${name},`,
      '',
      `Welcome to ${program}. Your 30-day trial starts now.`,
      context.studentName ? `Student: ${context.studentName}` : '',
      '',
      context.passwordSetupUrl ? `Set your parent password here: ${context.passwordSetupUrl}` : '',
      context.liveClassUrl ? `Tonight's live shiur Zoom link: ${context.liveClassUrl}` : '',
      context.memberLibraryUrl ? `Open the class library here: ${context.memberLibraryUrl}` : '',
      context.classroomUrl ? `Open the classroom here: ${context.classroomUrl}` : '',
      '',
      'After you set your parent password, you can open the parent portal and set or reset the student login.',
      `If anything looks wrong, reply to this email and ${context.supportName || 'OneTimeOneTime'} will help.`,
    ],
    revoke_expiry: [
      `Hi ${name},`,
      '',
      `There was an update to your ${program} access. Reply here if this looks wrong.`,
    ],
    magic_login: [
      `Hi ${name},`,
      '',
      `Use this private link to open your ${program} member area:`,
      loginUrl,
      '',
      'If you did not request this link, you can ignore this email.',
    ],
  };
  return (lines[templateKey] || [`Hi ${name},`, '', `${program} update.`]).filter(Boolean).join('\n');
}

function buildRabbiEmailTemplate(templateKey, context = {}) {
  const subject = context.subject || rabbiTemplateSubject(templateKey, context);
  const text = context.text || rabbiTemplateBody(templateKey, context);
  const html = context.html || text.split('\n').map((line) => line ? `<p>${escapeHtml(line)}</p>` : '<br>').join('');
  return { subject, text, html };
}

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  rabbiTemplateSubject,
  rabbiTemplateBody,
  buildRabbiEmailTemplate,
};
