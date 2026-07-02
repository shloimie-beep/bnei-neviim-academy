const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildOneTimeResendOutboxPreview,
  buildOneTimeResendTemplate,
} = require('../src/platform/integrations/resend-local-outbox');
const {
  buildOneTimeIntegrationReadinessPayload,
} = require('../src/platform/integrations/readiness');

test('One Time Resend local outbox renders templates without sending', () => {
  const preview = buildOneTimeResendOutboxPreview([
    {
      template_key: 'receipt_access',
      to: 'parent@example.test',
      recipient_name: 'Test Parent',
      service_email_consent: true,
      context: { loginUrl: 'https://example.test/member' },
      raw_id: 'RAW-20260620-EMAIL-001',
    },
    {
      template_key: 'class_reminder',
      to: 'member@example.test',
      recipient_name: 'Member Parent',
      service_email_consent: true,
      context: { classTitle: 'Mishnah Berachos 1:1', startAt: 'Sunday 7:00 PM Israel' },
    },
  ], {
    checkedAt: '2026-06-20T00:00:00.000Z',
    resendReadiness: { configured: true, connected: true, domain_verified: false },
  });

  assert.equal(preview.preview_only, true);
  assert.equal(preview.external_write_performed, false);
  assert.equal(preview.email_send_performed, false);
  assert.equal(preview.secret_values_included, false);
  assert.equal(preview.counts.total, 2);
  assert.equal(preview.counts.draft_ready_no_send, 2);
  assert.ok(preview.drafts.every((draft) => draft.send_performed === false));
  assert.ok(preview.drafts.every((draft) => draft.blockers.includes('send_not_operator_approved')));
  assert.ok(preview.drafts.every((draft) => draft.blockers.includes('resend_domain_not_verified_for_live_send')));
  assert.match(preview.drafts[0].subject, /access is ready/);
  assert.match(preview.drafts[1].text, /Mishnah Berachos 1:1/);
  assert.equal(preview.drafts[0].metadata.source_raw_id, 'RAW-20260620-EMAIL-001');
});

test('One Time Resend outbox honors suppression and consent before live send', () => {
  const preview = buildOneTimeResendOutboxPreview([
    {
      template_key: 'marketing_announcement',
      to: 'market@example.test',
      recipient_name: 'Marketing Parent',
      service_email_consent: true,
      marketing_consent: false,
      body: 'Registration is open.',
    },
    {
      template_key: 'parent_update',
      to: 'suppressed@example.test',
      recipient_name: 'Suppressed Parent',
      service_email_consent: true,
      summary: 'Private update draft.',
    },
    {
      template_key: 'magic_login',
      to: '',
      recipient_name: 'Missing Email',
      service_email_consent: true,
    },
  ], {
    checkedAt: '2026-06-20T00:00:00.000Z',
    suppression_list: ['suppressed@example.test'],
    resendReadiness: { configured: true, connected: true, domain_verified: true },
  });

  assert.equal(preview.counts.blocked_needs_review, 3);
  assert.equal(preview.counts.suppressed, 1);
  assert.ok(preview.drafts[0].blockers.includes('missing_consent:marketing_consent'));
  assert.equal(preview.drafts[0].unsubscribe_required, true);
  assert.equal(preview.drafts[0].unsubscribe_url_placeholder, '{{one_time_unsubscribe_url}}');
  assert.ok(preview.drafts[1].blockers.includes('recipient_suppressed'));
  assert.ok(preview.drafts[2].blockers.includes('missing_recipient_email'));
  assert.ok(preview.guardrails.includes('suppression_list_honored'));
});

test('One Time Resend template and readiness contracts expose draft-only behavior', () => {
  const template = buildOneTimeResendTemplate('worksheet_ready', {
    recipientName: 'Test Parent',
    worksheetTitle: 'Berachos worksheet',
  });
  const readiness = buildOneTimeIntegrationReadinessPayload({
    resendReadiness: { configured: true, connected: true, domain_verified: false, blocker: 'Domain is not verified.' },
  });
  const resend = readiness.cards.find((card) => card.provider === 'resend');

  assert.equal(template.template_key, 'worksheet_ready');
  assert.equal(template.requires_service_email_consent, true);
  assert.equal(template.requires_marketing_consent, false);
  assert.match(template.subject, /Berachos worksheet/);
  assert.ok(resend);
  assert.ok(resend.safe_actions.includes('email_draft_preview'));
  assert.ok(resend.blocked_actions.includes('email_send'));
  assert.equal(resend.test_connection.external_write_performed, false);
});
