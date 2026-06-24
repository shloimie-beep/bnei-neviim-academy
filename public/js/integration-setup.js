(function () {
  const statusDefinitions = {
    already_configured: { label: 'Already configured', tone: 'ready' },
    available_with_current_keys: { label: 'Available with current keys', tone: 'ready' },
    mock_tested_only: { label: 'Mock-tested only', tone: 'preview' },
    sandbox_test_only: { label: 'Sandbox/test-only', tone: 'test' },
    preview_only: { label: 'Preview-only', tone: 'preview' },
    missing_credential: { label: 'Missing credential', tone: 'missing' },
    invalid_credential: { label: 'Invalid credential', tone: 'danger' },
    missing_account_permission: { label: 'Missing account permission', tone: 'permission' },
    missing_target: { label: 'Missing target', tone: 'target' },
    owner_approval_required: { label: 'Owner approval required', tone: 'approval' },
    ready_for_live: { label: 'Ready for live', tone: 'ready' },
    live: { label: 'Live', tone: 'live' },
  };

  const store = [
    'C:\\Users\\User\\BNA-Keyholder',
    '.secrets for local development',
    'Railway Variables for deployed services',
  ];

  const cards = [
    ['openai-hosted-ai', 'OpenAI / Hosted AI', 'Default hosted Assistant path for Telegram and website helper replies.', 'missing_credential', 'OPENAI_API_KEY is required server-side.', 'Create or rotate an OpenAI project key, store it safely, then run diagnostics.', 'Shloimie / Codex', 'https://platform.openai.com/api-keys', ['OPENAI_PROJECT', 'OPENAI_ORG', 'OPENAI_MODEL'], ['OPENAI_API_KEY'], 'npm run openai:diagnose'],
    ['kimi-fallback', 'Kimi Fallback', 'Fallback hosted chat/content provider when OpenAI is unavailable or temporary Kimi-primary mode is selected.', 'missing_credential', 'KIMI_API_KEY is missing or unproven.', 'Create or rotate a Kimi key, store it safely, then run one real smoke request.', 'Shloimie / Codex', 'https://platform.kimi.ai/console/api-keys', ['KIMI_MODEL', 'KIMI_BASE_URL', 'BNA_AI_PRIMARY_PROVIDER'], ['KIMI_API_KEY'], 'node scripts/kimi-chat.mjs'],
    ['google-drive', 'Google Drive', 'Drive folders, class recordings, briefs, content library sync, and guarded class-intake diagnostics.', 'missing_credential', 'OAuth client, refresh token, and folder target are not all proven.', 'Select the target folder/file path, approve scope, then run read-only audit.', 'Shloimie / Codex', 'https://console.cloud.google.com/apis/credentials', ['GOOGLE_CLIENT_ID', 'GOOGLE_REDIRECT_URI', 'GOOGLE_SCOPES', 'GOOGLE_DRIVE_PIPELINE_FOLDER_ID'], ['GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'], 'npm run drive:audit'],
    ['google-workspace-addons', 'Google Calendar, Classroom, Business Profile', 'Optional Google workspace features surfaced in Operations.', 'missing_account_permission', 'Default Google scope is identity-only.', 'Select the one feature needed and add only that approved scope.', 'Shloimie / Codex', 'https://console.cloud.google.com/auth/scopes', ['GOOGLE_SCOPES', 'GOOGLE_MAPS_API_KEY', 'GOOGLE_PLACES_API_KEY'], ['GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'], 'npm run drive:audit'],
    ['railway-database', 'Railway / Database', 'BNA web runtime, database, deployment doctor, live smoke, and variable store.', 'missing_credential', 'DATABASE_URL and Railway project token/state are required for live readback or deploy validation.', 'Confirm the exact project/service/environment, then run Railway doctor after approval.', 'Shloimie / Codex', 'https://railway.com/dashboard', ['RAILWAY_SERVICE_NAME', 'RAILWAY_ENVIRONMENT', 'BNA_RAILWAY_PROCESS'], ['DATABASE_URL', 'RAILWAY_TOKEN', 'RAILWAY_API_TOKEN', 'SESSION_SECRET'], 'npm run railway:doctor'],
    ['stripe', 'Stripe', 'One Time checkout previews, sandbox billing validation, product/price IDs, and webhooks.', 'missing_credential', 'Stripe key/webhook secret are not proven; live charges are never allowed from setup checks.', 'Store sandbox keys and webhook secret, then run no-charge sandbox smoke.', 'Shloimie / Codex', 'https://dashboard.stripe.com/apikeys', ['RABBI_STRIPE_MODE', 'STRIPE_MODE', 'STRIPE_ACCOUNT_OWNER', 'product_id', 'price_id'], ['STRIPE_SECRET_KEY', 'RABBI_STRIPE_SECRET_KEY', 'RABBI_STRIPE_WEBHOOK_SECRET'], 'npm run one-time:smoke:resend-vimeo-stripe'],
    ['vimeo', 'Vimeo', 'Private video hosting, manual member-library URL attachment, and future synthetic upload test.', 'preview_only', 'Manual URL attachment and upload previews exist; real app/token/folder/playback proof is not complete.', 'Create/confirm the Vimeo app and token, select a test folder, then approve one synthetic private upload.', 'Shloimie or Vimeo owner / Codex', 'https://developer.vimeo.com/apps', ['VIMEO_ACCOUNT_ID', 'VIMEO_PLAN', 'BNA_VIDEO_HOST_PROVIDER', 'VIMEO_FOLDER'], ['VIMEO_CLIENT_ID', 'VIMEO_CLIENT_SECRET', 'VIMEO_ACCESS_TOKEN', 'VIMEO_WEBHOOK_SECRET'], 'npm run owner-review:external-readiness'],
    ['zoom', 'Zoom', 'Live class meeting previews, future Server-to-Server OAuth meetings, registrants, recordings, and attendance.', 'preview_only', 'Local previews exist; OAuth credentials, scopes, host, and approval are not proven.', 'Create or confirm a Zoom internal app, add scopes, and store credentials server-side.', 'Zoom owner/admin / Codex', 'https://marketplace.zoom.us/develop/create', ['ZOOM_ACCOUNT_ID', 'ZOOM_ACCOUNT_OWNER', 'ZOOM_HOST_USER', 'ZOOM_SCOPES'], ['ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET', 'ZOOM_WEBHOOK_SECRET'], 'node --test tests/one-time-zoom-automation.test.js tests/integrations/w4-onetime-readiness.test.js'],
    ['resend-email', 'Resend / Email', 'Email drafts, sender-domain readiness, DNS tasks, webhook events, and gated production sends.', 'missing_credential', 'Resend API key, sender identity, domain, and webhook secret are not all proven.', 'Create a sending key, add/verify the domain, copy exact DNS records, and store secrets server-side.', 'Shloimie / Codex', 'https://resend.com/api-keys', ['RESEND_DOMAIN', 'RESEND_FROM', 'RESEND_FROM_EMAIL', 'RESEND_ACCOUNT_OWNER'], ['RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET', 'RESEND_SHLOIMIE_API_KEY', 'RESEND_RABBI_API_KEY'], 'npm run email:smoke'],
    ['transcription', 'Transcription', 'Voice/video/document media intake transcription for Telegram, Drive, drop folders, and class recovery.', 'missing_credential', 'OpenAI audio credentials and approved media target are required.', 'Confirm the transcription model and run a small approved media smoke.', 'Shloimie / Codex', 'https://platform.openai.com/api-keys', ['OPENAI_TRANSCRIPTION_MODEL', 'TRANSCRIPTION_MAX_BYTES', 'OPENAI_BASE_URL'], ['OPENAI_API_KEY'], 'npm run owner-review:external-readiness'],
    ['telegram-academy-bot', 'Telegram Academy Bot', 'Primary academy Telegram bridge for Assistant/Codex mode switching, intake, and media capture.', 'missing_target', 'Token, chat ID, and worker target names must be validated safely.', 'Confirm bot token source, allowed chat IDs, bridge profile, and worker process target.', 'Shloimie / Codex', 'https://t.me/BotFather', ['TELEGRAM_BRIDGE_PROFILE', 'TELEGRAM_CHAT_ID_BNA', 'TELEGRAM_PRIMARY_AGENT'], ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_TOKEN_BNA', 'TELEGRAM_WEBHOOK_SECRET'], 'node scripts/telegram-kimi-bridge.mjs --status'],
    ['telegram-rabbi-worker', 'Telegram Rabbi Worker', 'Separate Rabbi Elie Scheller Telegram worker profile for the One Time workspace.', 'missing_target', 'Rabbi worker needs its own token/chat ID and process target.', 'Confirm Rabbi bot token, chat ID, bridge profile, and Railway process selector.', 'Shloimie, Rabbi Scheller / Codex', 'https://t.me/BotFather', ['TELEGRAM_BRIDGE_PROFILE', 'TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER', 'BNA_RAILWAY_PROCESS'], ['TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER', 'RABBI_ELIE_SCHELLER_TELEGRAM_BOT_TOKEN'], 'npm run telegram:rabbi'],
    ['github-actions', 'GitHub Actions / Workflow Scope', 'Independent PR checks, workflow files, release gates, and push validation.', 'missing_account_permission', 'Current GitHub auth is known to lack workflow scope for workflow-file pushes.', 'Grant workflow permission or have a repo admin add the workflow file manually.', 'Shloimie / GitHub admin', 'https://github.com/shloimie-beep/bnei-neviim-academy/actions', ['GITHUB_REPOSITORY', 'branch name', 'workflow file path'], ['GitHub token with workflow scope outside repo'], 'git push origin codex/closeout-operator-walkthrough-20260624'],
    ['buffer-social', 'Buffer Social Scheduler', 'Approved social draft/post scheduling for Facebook, LinkedIn, and YouTube text outputs.', 'missing_credential', 'Buffer needs API key plus organization/channel IDs.', 'Confirm organization and channel IDs, store the API key, then run read-only channel listing.', 'Shloimie / Codex', 'https://buffer.com/publish', ['BUFFER_ORGANIZATION_ID', 'BUFFER_DEFAULT_CHANNEL_IDS', 'BUFFER_FACEBOOK_CHANNEL_ID', 'BUFFER_LINKEDIN_CHANNEL_ID', 'BUFFER_YOUTUBE_CHANNEL_ID'], ['BUFFER_API_KEY'], 'node --test tests/communications-integrations-contract.test.js'],
    ['whatsapp-wapi', 'WhatsApp / WAPI / Whapi', 'WhatsApp history sync, phonebook grouping, CRM correction previews, and gated sends.', 'missing_credential', 'WAPI_API_TOKEN or WHAPI_API_TOKEN is required before provider readback.', 'Confirm linked WhatsApp number/channel, store the token, and run no-send validation.', 'Shloimie / Codex', 'https://whapi.cloud/docs', ['WAPI_API_BASE_URL', 'WHAPI_API_BASE_URL', 'BNA_WHATSAPP_NUMBER'], ['WAPI_API_TOKEN', 'WHAPI_API_TOKEN', 'WAPI_WEBHOOK_SECRET'], 'node --test tests/wapi-phonebook-report.test.js tests/whapi-log-sync-contract.test.js'],
    ['green-invoice', 'Green Invoice', 'Alternate billing provider option surfaced in accounting/payment settings.', 'owner_approval_required', 'Provider choice, credentials, API key, and approval are unresolved.', 'Decide whether Green Invoice is in scope before storing test credentials.', 'Shloimie / billing owner', 'https://www.greeninvoice.co.il/', ['RABBI_GREEN_INVOICE_MODE'], ['GREEN_INVOICE_SECRET', 'RABBI_GREEN_INVOICE_SECRET', 'RABBI_GREEN_INVOICE_API_KEY'], 'node --test tests/rabbi-scheller-audit-docs.test.js'],
  ];

  const fallbackCatalog = {
    generatedAt: 'static-fallback',
    statusDefinitions,
    safeLoggedOutState: true,
    secretValuesIncluded: false,
    cards: cards.map(([id, name, purpose, status, reason, next, actor, externalHref, identifiers, secrets, command]) => ({
      id,
      name,
      purpose,
      currentSafeStatus: status,
      statusLabel: statusDefinitions[status].label,
      statusReason: reason,
      exactNextAction: next,
      whoMustAct: actor,
      internalPageLink: { label: 'Open setup page', href: `#${id}`, operationsHref: '/operations?view=integrations&section=readiness' },
      externalAccountLink: { label: 'Open account dashboard', href: externalHref },
      requiredNonSecretIdentifiers: identifiers,
      secretVariables: secrets,
      approvedSecretStore: store,
      validation: {
        label: 'Run validation',
        command,
        expectedResult: 'A precise provider/readiness result or a precise missing credential, target, permission, quota, or rate error.',
        externalEffects: 'Static checklist mode performs no external action. Read the walkthrough before running provider commands.',
      },
      liveAcceptanceCriteria: [
        'Secret values are stored only in approved secret storage.',
        'Validation result is recorded with timestamp and evidence.',
        'Live writes require explicit owner approval and rollback proof.',
      ],
      lastValidationTimestamp: 'not_validated_in_static_catalog',
      evidenceLink: `docs/operator-walkthroughs/integrations/${id}.md`,
      walkthroughPath: `docs/operator-walkthroughs/integrations/${id}.md`,
    })),
  };

  const state = {
    catalog: fallbackCatalog,
    query: '',
    status: '',
    owner: '',
  };

  const el = (id) => document.getElementById(id);

  function escapeText(value) {
    return String(value == null ? '' : value);
  }

  function showToast(message) {
    const toast = el('toast');
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('visible'), 1600);
  }

  async function copyText(value, label) {
    const text = String(value || '');
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label || 'Value'} copied`);
    } catch {
      showToast('Copy unavailable in this browser');
    }
  }

  function chip(value) {
    const span = document.createElement('span');
    span.className = 'chip';
    span.textContent = value;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Copy';
    button.addEventListener('click', () => copyText(value, 'Variable name'));
    span.appendChild(button);
    return span;
  }

  function addLink(container, label, href) {
    if (!href) return;
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    a.rel = href.startsWith('http') ? 'noreferrer' : '';
    a.target = href.startsWith('http') ? '_blank' : '';
    container.appendChild(a);
  }

  function cardMatches(card) {
    const query = state.query.trim().toLowerCase();
    const owner = state.owner;
    const status = state.status;
    if (status && card.currentSafeStatus !== status) return false;
    if (owner && card.whoMustAct !== owner) return false;
    if (!query) return true;
    return JSON.stringify(card).toLowerCase().includes(query);
  }

  function renderCounts(cardsToCount) {
    const counts = new Map();
    for (const card of cardsToCount) {
      const key = card.currentSafeStatus;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const target = el('stateCounts');
    target.replaceChildren();
    for (const [status, count] of [...counts.entries()].sort()) {
      const item = document.createElement('span');
      item.className = 'count-chip';
      item.textContent = `${statusDefinitions[status]?.label || status}: ${count}`;
      target.appendChild(item);
    }
  }

  function renderFilters() {
    const statusSelect = el('statusFilter');
    const ownerSelect = el('ownerFilter');
    if (statusSelect.options.length === 1) {
      for (const status of Object.keys(statusDefinitions)) {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = statusDefinitions[status].label;
        statusSelect.appendChild(option);
      }
    }
    const owners = [...new Set(state.catalog.cards.map((card) => card.whoMustAct).filter(Boolean))].sort();
    ownerSelect.replaceChildren(new Option('All owners', ''));
    for (const owner of owners) ownerSelect.appendChild(new Option(owner, owner));
  }

  function renderCards() {
    renderFilters();
    const target = el('setupCards');
    const template = el('cardTemplate');
    const filtered = state.catalog.cards.filter(cardMatches);
    target.replaceChildren();
    renderCounts(state.catalog.cards);
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'setup-card';
      empty.textContent = 'No integrations match the current filters.';
      target.appendChild(empty);
      return;
    }
    for (const card of filtered) {
      const node = template.content.firstElementChild.cloneNode(true);
      node.id = card.id;
      node.querySelector('h2').textContent = card.name;
      node.querySelector('.purpose').textContent = card.purpose;
      const status = node.querySelector('.status-pill');
      const statusMeta = statusDefinitions[card.currentSafeStatus] || {};
      status.textContent = statusMeta.label || card.currentSafeStatus;
      status.dataset.tone = statusMeta.tone || 'missing';
      node.querySelector('[data-field="reason"]').textContent = card.statusReason;
      node.querySelector('[data-field="next"]').textContent = card.exactNextAction;
      node.querySelector('[data-field="actor"]').textContent = card.whoMustAct;
      node.querySelector('[data-field="lastValidation"]').textContent = card.lastValidationTimestamp || 'not recorded';

      const links = node.querySelector('[data-field="links"]');
      addLink(links, 'Open setup page', card.internalPageLink?.href || `#${card.id}`);
      addLink(links, 'Open Operations', card.internalPageLink?.operationsHref);
      addLink(links, card.externalAccountLink?.label || 'Open account', card.externalAccountLink?.href);
      addLink(links, 'Evidence', card.evidenceLink);
      const run = document.createElement('button');
      run.type = 'button';
      run.textContent = 'Run validation';
      run.addEventListener('click', () => copyText(card.validation?.command || '', 'Validation command'));
      links.appendChild(run);

      const identifiers = node.querySelector('[data-field="identifiers"]');
      (card.requiredNonSecretIdentifiers || []).forEach((value) => identifiers.appendChild(chip(value)));
      const secrets = node.querySelector('[data-field="secrets"]');
      (card.secretVariables || []).forEach((value) => secrets.appendChild(chip(value)));
      (card.approvedSecretStore || []).forEach((value) => secrets.appendChild(chip(value)));

      node.querySelector('[data-field="command"]').textContent = card.validation?.command || 'See walkthrough';
      node.querySelector('[data-field="expected"]').textContent = `Expected result: ${escapeText(card.expectedResult || card.validation?.expectedResult)}`;
      node.querySelector('[data-field="effects"]').textContent = `External effects: ${escapeText(card.externalEffectsOfTest || card.validation?.externalEffects)}`;
      const criteria = node.querySelector('[data-field="criteria"]');
      (card.liveAcceptanceCriteria || []).forEach((value) => {
        const li = document.createElement('li');
        li.textContent = value;
        criteria.appendChild(li);
      });
      target.appendChild(node);
    }
  }

  async function loadCatalog() {
    try {
      const response = await fetch('/api/bna/integration-setup/readiness', {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const live = await response.json();
        if (Array.isArray(live.cards)) {
          state.catalog = { ...fallbackCatalog, ...live };
          el('catalogState').textContent = 'Authenticated readiness loaded';
          el('catalogMeta').textContent = `Generated ${live.generatedAt || 'now'}; secret values included: ${live.secretValuesIncluded ? 'yes' : 'no'}.`;
          renderCards();
          return;
        }
      }
      el('catalogState').textContent = response.status === 401 || response.status === 403
        ? 'Signed out: static checklist shown'
        : 'Shared readiness endpoint not wired yet';
      el('catalogMeta').textContent = 'Use Operations login for live readiness after the shared patch is applied.';
    } catch {
      el('catalogState').textContent = 'Offline/static checklist shown';
      el('catalogMeta').textContent = 'The setup center remains usable without credentials or server wiring.';
    }
    renderCards();
  }

  function bindEvents() {
    el('searchInput').addEventListener('input', (event) => {
      state.query = event.target.value;
      renderCards();
    });
    el('statusFilter').addEventListener('change', (event) => {
      state.status = event.target.value;
      renderCards();
    });
    el('ownerFilter').addEventListener('change', (event) => {
      state.owner = event.target.value;
      renderCards();
    });
    el('printChecklist').addEventListener('click', () => window.print());
    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        el('searchInput').focus();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    renderCards();
    loadCatalog();
  });
}());
