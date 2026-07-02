const {
  buildOneTimeExportManifest,
  buildOneTimeInstanceConfig,
} = require('../instances/one-time');

function normalizeProviderReadiness(readiness = {}, provider) {
  const source = readiness && typeof readiness === 'object' ? readiness : {};
  const configured = Boolean(source.configured || source.connected || source.domain_verified);
  const connected = Boolean(source.connected || source.ok || source.domain_verified);
  const blocker = source.blocker || source.error || null;
  return {
    provider,
    configured,
    connected,
    status: configured ? (connected && !blocker ? 'ready_for_preview' : 'configured_with_blocker') : 'needs_credentials',
    mode: source.mode || source.provider_mode || source.domain_verified && 'verified_domain' || 'preview_only',
    account_owner: source.account_owner || source.accountOwner || 'operator_or_partner_decision_required',
    provider_account: source.provider_account || source.providerAccount || null,
    blocker,
  };
}

function buildIntegrationCard(provider, label, readiness, options = {}) {
  const safe = normalizeProviderReadiness(readiness, provider);
  const blockers = [
    safe.blocker,
    ...(options.requiredExternalGates || []),
  ].filter(Boolean);
  return {
    provider,
    label,
    status: safe.status,
    configured: safe.configured,
    connected: safe.connected,
    mode: safe.mode,
    account_owner: safe.account_owner,
    provider_account: safe.provider_account,
    safe_actions: options.safeActions || ['local_readiness_status', 'preview_payload', 'operator_decision_packet'],
    blocked_actions: options.blockedActions || ['live_write_without_operator_approval'],
    blockers,
    test_connection: {
      mode: 'mock',
      result: safe.configured && !safe.blocker ? 'ready' : 'blocked',
      external_write_performed: false,
    },
  };
}

function buildOneTimeIntegrationReadinessCards({
  videoHostingReadiness,
  zoomReadiness,
  resendReadiness,
  stripeReadiness,
} = {}) {
  return [
    buildIntegrationCard('vimeo', 'Vimeo / video hosting', videoHostingReadiness, {
      safeActions: ['readiness_status', 'recording_pipeline_preview', 'video_library_draft'],
      blockedActions: ['video_upload', 'publication_mutation', 'retention_delete'],
      requiredExternalGates: ['Operator must approve partner account, OAuth/token setup, and first real upload.'],
    }),
    buildIntegrationCard('zoom', 'Zoom live classes', zoomReadiness, {
      safeActions: ['readiness_status', 'meeting_preview', 'session_automation_preview'],
      blockedActions: ['meeting_create', 'webhook_mutation', 'attendance_write'],
      requiredExternalGates: ['Operator must approve Zoom account ownership and live meeting creation.'],
    }),
    buildIntegrationCard('resend', 'Resend email', resendReadiness, {
      safeActions: ['readiness_status', 'domain_status', 'email_draft_preview'],
      blockedActions: ['email_send', 'dns_guessing', 'fallback_send_without_approval'],
      requiredExternalGates: ['Exact DNS records and verified sending domain are required before live email.'],
    }),
    buildIntegrationCard('stripe', 'Stripe payments', stripeReadiness, {
      safeActions: ['readiness_status', 'checkout_mock_preview', 'webhook_mock_event'],
      blockedActions: ['live_charge', 'product_write', 'price_write', 'checkout_create', 'refund_write'],
      requiredExternalGates: ['Operator must approve Stripe account ownership, test buyer/session, and rollback path before live billing.'],
    }),
  ];
}

function buildOneTimeIntegrationReadinessPayload(options = {}) {
  const instance = buildOneTimeInstanceConfig(options.instance || {});
  return {
    generated_at: options.checkedAt || new Date().toISOString(),
    workspace_key: instance.instance.workspace_key,
    project_key: instance.instance.project_key,
    instance_slug: instance.instance.slug,
    preview_only: true,
    external_write_performed: false,
    secret_values_included: false,
    cards: buildOneTimeIntegrationReadinessCards(options),
    external_gates: [
      'shared_bna_backend_workspace_scope_audited',
      'partner_domain_dns_configured_for_onetimeonetime_com',
      'vimeo_or_video_hosting_account_authorized',
      'zoom_account_authorized',
      'resend_domain_verified_for_info_onetimeonetime_com',
      'one_time_stripe_test_account_confirmed',
      'explicit_approval_before_live_send_or_charge',
      'live_smoke_after_deploy',
    ],
    instance,
    export_manifest: buildOneTimeExportManifest(instance),
  };
}

module.exports = {
  buildOneTimeIntegrationReadinessCards,
  buildOneTimeIntegrationReadinessPayload,
};
