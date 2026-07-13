(function () {
  'use strict';

  const MODULE_ID = 'one-time-provider-agents-route';
  const STYLE_ID = 'one-time-provider-agents-route-style';
  const INDEX_TABS = ['Communication Agents', 'Knowledge', 'Channels', 'Test', 'Activity'];
  const WORKSPACE_TABS = ['Overview', 'Instructions', 'Knowledge', 'Channels', 'Permissions', 'Test', 'Activity'];

  const state = {
    screen: 'index',
    indexTab: 'Communication Agents',
    workspaceTab: 'Overview',
    testOutput: '',
  };

  function fallbackEscapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    })[char]);
  }

  function helpersFor(helpers = {}) {
    return {
      escapeHtml: helpers.escapeHtml || fallbackEscapeHtml,
    };
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .communication-agents-shell { display: grid; gap: 16px; max-width: 100%; }
      .communication-agents-page-header { align-items: center; display: flex; gap: 14px; justify-content: space-between; min-height: 72px; }
      .communication-agents-page-header h3, .communication-agent-workspace-header h3 { margin-bottom: 4px; }
      .communication-agents-nav, .communication-agent-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin; }
      .communication-agents-nav button, .communication-agent-tabs button { background: #fff; border: 1px solid rgba(17,17,17,.14); border-radius: 8px; color: #111; cursor: pointer; flex: 0 0 auto; font-weight: 900; min-height: 44px; padding: 10px 12px; }
      .communication-agents-nav button[aria-selected="true"], .communication-agent-tabs button[aria-selected="true"] { background: #ede518; border-color: rgba(17,17,17,.3); }
      .communication-agent-card-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); }
      .communication-agent-card { background: #fff; border: 1px solid rgba(17,17,17,.14); border-radius: 8px; color: #111; cursor: pointer; display: grid; gap: 10px; min-height: 112px; padding: 14px; text-align: left; width: 100%; }
      .communication-agent-card:hover, .communication-agent-card:focus-visible { border-color: rgba(17,17,17,.38); outline: none; }
      .communication-agent-card h4 { font-size: 18px; line-height: 1.2; margin: 0; }
      .communication-agent-card p, .communication-agent-panel p { margin-bottom: 0; }
      .communication-agent-meta, .communication-agent-channel-grid, .communication-agent-fact-grid { display: flex; flex-wrap: wrap; gap: 7px; }
      .communication-agent-panels { display: grid; gap: 12px; }
      .communication-agent-panel { background: #fff; border: 1px solid rgba(17,17,17,.14); border-radius: 8px; display: grid; gap: 10px; padding: 14px; }
      .communication-agent-workspace-header { align-items: center; display: flex; gap: 12px; justify-content: space-between; min-height: 80px; }
      .communication-agent-back { min-height: 40px; }
      .communication-agent-two-col { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .communication-agent-channel-card { background: #fff; border: 1px solid rgba(17,17,17,.14); border-radius: 8px; display: grid; gap: 9px; padding: 14px; }
      .communication-agent-test-form { display: grid; gap: 10px; }
      .communication-agent-test-result { border: 1px solid rgba(214,169,45,.34); border-radius: 8px; background: rgba(255,250,240,.92); padding: 12px; }
      .communication-agent-muted-button[disabled] { cursor: not-allowed; opacity: .62; }
      @media (max-width: 720px) {
        .communication-agents-page-header, .communication-agent-workspace-header { align-items: stretch; display: grid; }
        .communication-agent-two-col { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function defaultAgent() {
    return {
      agent_key: 'one_time_parent_information_agent',
      display_name: "Rabbi Scheller's Digital Assistant",
      description: 'Public One Time parent information, class-link consent, and lead capture assistant.',
      status: 'Published',
      active_version: '2026-07-13-v3',
      knowledge_snapshot: 'one-time-public-knowledge-2026-07-13-v3',
      assigned_channels: ['WhatsApp', 'Email'],
      last_activity: 'Inbound capture ready; owner-only live sends wait for secure test aliases.',
      facts: [
        'One Time Mishnayos with Rabbi Eli Scheller',
        'Live every day at 7:00 p.m. Israel time',
        'HaGaon MiVilna 8, Ramat Beit Shemesh Alef',
        'Public signup: /one-time/signup',
        'Portal, library, member, parent-login, and student-login access are not being granted yet',
      ],
      prohibited: [
        'No stale price, trial, portal, library, member-access, or current-learning claims',
        'No raw class link in model context or logs',
        'No payments, access grants, credentials, bulk sends, or arbitrary task creation',
      ],
      channels: [
        {
          label: 'WhatsApp',
          provider: 'WAPI',
          health: 'Readiness gated',
          version: '2026-07-13-v3',
          reply: 'Live only after readiness passes',
          current_mode: 'Capture only',
          capture: 'On',
          tasks: 'Off',
          last_inbound: 'Captured through One Time WAPI webhook',
          last_outbound: 'Owner-only test blocked until secure alias exists',
          error: 'No raw provider error exposed',
        },
        {
          label: 'Email',
          provider: 'Resend inbound',
          health: 'Ready for drafts',
          version: '2026-07-13-v3',
          reply: 'Draft',
          current_mode: 'Draft',
          capture: 'On',
          tasks: 'Off',
          last_inbound: 'Inbound email uses the shared CRM pipeline',
          last_outbound: 'External sends use the approved outbox path',
          error: 'No raw provider error exposed',
        },
      ],
      activity: [
        'Published One Time public knowledge snapshot 2026-07-13-v3.',
        'Assigned the same agent version to WhatsApp and inbound email.',
        'Set WhatsApp contact capture on, automatic tasks off, reply gated by readiness.',
        'Set email contact capture on, automatic tasks off, reply mode draft.',
      ],
    };
  }

  function agentFrom(data = {}) {
    const agent = Array.isArray(data.communication_agents) && data.communication_agents[0]
      ? data.communication_agents[0]
      : defaultAgent();
    return { ...defaultAgent(), ...agent };
  }

  function pill(h, value) {
    return `<span class="status-pill">${h.escapeHtml(value)}</span>`;
  }

  function actionButton(label, actionId, attrs = '') {
    return `<button class="btn communication-agent-muted-button" type="button" data-action-id="${actionId}" ${attrs}>${label}</button>`;
  }

  function tabRail(tabs, active, attr) {
    return `
      <div class="${attr === 'data-agent-tab' ? 'communication-agent-tabs' : 'communication-agents-nav'}" role="tablist">
        ${tabs.map((tab) => `
          <button type="button" role="tab" ${attr}="${tab}" aria-selected="${tab === active ? 'true' : 'false'}">${tab}</button>
        `).join('')}
      </div>
    `;
  }

  function renderIndexPanel(agent, helpers) {
    const h = helpersFor(helpers);
    if (state.indexTab === 'Knowledge') return renderKnowledgePanel(agent, h, false);
    if (state.indexTab === 'Channels') return renderChannelsPanel(agent, h, false);
    if (state.indexTab === 'Test') return renderTestPanel(agent, h, false);
    if (state.indexTab === 'Activity') return renderActivityPanel(agent, h, false);
    return `
      <div class="communication-agent-card-grid">
        <button class="communication-agent-card" type="button" data-action-id="ACTION-ONETIME-COMMUNICATION-AGENT-OPEN" data-agent-open="${h.escapeHtml(agent.agent_key)}">
          <div>
            <h4>${h.escapeHtml(agent.display_name)}</h4>
            <p class="small">${h.escapeHtml(agent.description)}</p>
          </div>
          <div class="communication-agent-meta">
            ${pill(h, agent.status)}
            ${pill(h, `Active version ${agent.active_version}`)}
            ${pill(h, `Channels: ${agent.assigned_channels.join(', ')}`)}
            ${pill(h, `Last activity: ${agent.last_activity}`)}
          </div>
        </button>
      </div>
    `;
  }

  function render(data = {}, helpers = {}) {
    ensureStyles();
    const h = helpersFor(helpers);
    const agent = agentFrom(data);
    if (state.screen === 'workspace') return renderWorkspace(agent, h);
    return `
      <section class="communication-agents-shell" data-one-time-provider-agents-route data-route-module="${MODULE_ID}" aria-label="One Time Communication Agents">
        <header class="communication-agents-page-header">
          <div>
            <h3>Communication Agents</h3>
            <p class="small">One Time channel-assigned assistants, knowledge, bindings, tests, and activity stay separate from Build and QA agents.</p>
          </div>
          <button class="btn communication-agent-muted-button" type="button" data-action-id="ACTION-ONETIME-COMMUNICATION-AGENT-ADD" disabled title="New agent creation requires the Super Admin publication workflow.">Add Agent</button>
        </header>
        ${tabRail(INDEX_TABS, state.indexTab, 'data-agents-index-tab')}
        <div class="communication-agent-panels">
          ${renderIndexPanel(agent, h)}
        </div>
      </section>
    `;
  }

  function renderWorkspace(agent, h) {
    return `
      <section class="communication-agents-shell" data-one-time-provider-agents-route data-route-module="${MODULE_ID}" aria-label="One Time Communication Agent Workspace">
        <button class="btn communication-agent-back" type="button" data-action-id="ACTION-ONETIME-COMMUNICATION-AGENT-BACK" data-agent-back>Back to Agents</button>
        <header class="communication-agent-workspace-header">
          <div>
            <h3>${h.escapeHtml(agent.display_name)}</h3>
            <p class="small">${h.escapeHtml(agent.description)}</p>
            <div class="communication-agent-meta">${pill(h, agent.status)}${pill(h, `Version ${agent.active_version}`)}${pill(h, agent.knowledge_snapshot)}</div>
          </div>
          <div class="button-row">
            ${actionButton('Save Draft', 'ACTION-ONETIME-COMMUNICATION-AGENT-SAVE-DRAFT', 'disabled title="Draft editing is not enabled in the Rabbi provider workspace yet."')}
            ${actionButton('Publish Version', 'ACTION-ONETIME-COMMUNICATION-AGENT-PUBLISH', 'disabled title="Publishing requires Super Admin release approval."')}
            ${actionButton('Pause Agent', 'ACTION-ONETIME-COMMUNICATION-AGENT-PAUSE', 'disabled title="Pausing live bindings requires Super Admin release approval."')}
          </div>
        </header>
        ${tabRail(WORKSPACE_TABS, state.workspaceTab, 'data-agent-tab')}
        <div class="communication-agent-panels">
          ${renderWorkspacePanel(agent, h)}
        </div>
      </section>
    `;
  }

  function renderWorkspacePanel(agent, h) {
    if (state.workspaceTab === 'Instructions') return renderInstructionsPanel(agent, h);
    if (state.workspaceTab === 'Knowledge') return renderKnowledgePanel(agent, h, true);
    if (state.workspaceTab === 'Channels') return renderChannelsPanel(agent, h, true);
    if (state.workspaceTab === 'Permissions') return renderPermissionsPanel(agent, h);
    if (state.workspaceTab === 'Test') return renderTestPanel(agent, h, true);
    if (state.workspaceTab === 'Activity') return renderActivityPanel(agent, h, true);
    return `
      <section class="communication-agent-panel">
        <h4>Overview</h4>
        <p class="small">This communication agent is channel independent. WhatsApp and email own their formatting, reply mode, and capture policy through channel bindings.</p>
        <div class="communication-agent-fact-grid">
          ${pill(h, 'Workspace: One Time')}
          ${pill(h, 'Contact capture: On')}
          ${pill(h, 'Automatic tasks: Off')}
          ${pill(h, 'Shared knowledge snapshot')}
          ${pill(h, 'No raw secrets')}
        </div>
      </section>
    `;
  }

  function renderInstructionsPanel(agent, h) {
    return `
      <div class="communication-agent-two-col">
        <section class="communication-agent-panel">
          <h4>Instructions</h4>
          <p class="small">Help public families and schools understand the class, signup, schedule, local address, reminder options, and how to receive class information. Ask one signup question at a time.</p>
          <h4>Tone</h4>
          <p class="small">Warm, concise, parent-friendly, student-safe, and clear that the assistant is not Rabbi Scheller.</p>
        </section>
        <section class="communication-agent-panel">
          <h4>Escalation and Prohibited Behavior</h4>
          ${(agent.prohibited || []).map((item) => `<p class="small">${h.escapeHtml(item)}</p>`).join('')}
          <div class="button-row">
            <button class="btn communication-agent-muted-button" type="button" data-action-id="ACTION-ONETIME-COMMUNICATION-AGENT-COMPARE" disabled title="Version comparison opens after editable drafts are enabled.">Compare Version</button>
            <button class="btn communication-agent-muted-button" type="button" data-action-id="ACTION-ONETIME-COMMUNICATION-AGENT-RESTORE" disabled title="Restore requires Super Admin publication approval.">Restore Prior Version</button>
          </div>
        </section>
      </div>
    `;
  }

  function renderKnowledgePanel(agent, h) {
    return `
      <section class="communication-agent-panel">
        <div class="service-head">
          <div>
            <h4>Knowledge</h4>
            <p class="small">Approved public facts are shared by WhatsApp and email. Unknown facts route to a human instead of being invented.</p>
          </div>
          <button class="btn communication-agent-muted-button" type="button" data-action-id="ACTION-ONETIME-COMMUNICATION-KNOWLEDGE-ADD" disabled title="Knowledge additions require review before publication.">Add Knowledge Source</button>
        </div>
        <div class="communication-agent-fact-grid">${(agent.facts || []).map((fact) => pill(h, fact)).join('')}</div>
      </section>
    `;
  }

  function renderChannelsPanel(agent, h) {
    return `
      <div class="communication-agent-channel-grid">
        ${(agent.channels || []).map((channel) => `
          <article class="communication-agent-channel-card">
            <div class="service-head">
              <div>
                <h4>${h.escapeHtml(channel.label)}</h4>
                <p class="small">${h.escapeHtml(channel.provider)} / ${h.escapeHtml(channel.health)}</p>
              </div>
              ${pill(h, channel.current_mode)}
            </div>
            <div class="communication-agent-meta">
              ${pill(h, `Agent version: ${channel.version}`)}
              ${pill(h, `Contact capture: ${channel.capture}`)}
              ${pill(h, `Automatic tasks: ${channel.tasks}`)}
              ${pill(h, `Agent reply: ${channel.reply}`)}
            </div>
            <p class="small">Last inbound event: ${h.escapeHtml(channel.last_inbound)}</p>
            <p class="small">Last outbound event: ${h.escapeHtml(channel.last_outbound)}</p>
            <p class="small">Redacted error: ${h.escapeHtml(channel.error)}</p>
            <div class="button-row">
              <button class="btn" type="button" data-action-id="ACTION-ONETIME-COMMUNICATION-BINDING-TEST" data-agents-run-test="${h.escapeHtml(channel.label)}">Test Binding</button>
              <button class="btn communication-agent-muted-button" type="button" data-action-id="ACTION-ONETIME-COMMUNICATION-BINDING-EDIT" disabled title="Binding edits require Super Admin release approval.">Edit Binding</button>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderPermissionsPanel(agent, h) {
    return `
      <section class="communication-agent-panel">
        <h4>Permissions</h4>
        <div class="communication-agent-fact-grid">
          ${pill(h, 'Can answer approved public facts')}
          ${pill(h, 'Can request class-info permission')}
          ${pill(h, 'Can create or resolve One Time contacts through the server pipeline')}
          ${pill(h, 'Cannot view private Rabbi Telegram knowledge')}
          ${pill(h, 'Cannot view BNA contacts')}
          ${pill(h, 'Cannot send through unassigned channels')}
          ${pill(h, 'Cannot create tasks automatically')}
        </div>
      </section>
    `;
  }

  function safePreview(text, channel) {
    const value = String(text || '').toLowerCase();
    if (/portal|login|library|member/.test(value)) {
      return 'We are not giving portal access yet. The One Time team will verify access before any private link or login is provided.';
    }
    if (/time|schedule|when/.test(value)) {
      return 'One Time Mishnayos is live every day at 7:00 p.m. Israel time. What city are you in so I can help with the local time?';
    }
    if (/where|address|location/.test(value)) {
      return 'The local class location is HaGaon MiVilna 8, Ramat Beit Shemesh Alef.';
    }
    if (/link|zoom|join/.test(value)) {
      return 'I can help send the current class details after saving your contact and permission to receive class information.';
    }
    return channel === 'Email'
      ? 'Subject: One Time Mishnayos class information\n\nHi, thanks for reaching out. I can help with the schedule, signup, local class, reminder options, or route a question to Rabbi Scheller.'
      : 'Hi, I can help with the schedule, signup, local class, reminder options, or route a question to Rabbi Scheller. What would you like to know?';
  }

  function renderTestPanel(agent, h) {
    return `
      <section class="communication-agent-panel">
        <h4>Test</h4>
        <form class="communication-agent-test-form" data-agent-test-form>
          <label>Channel
            <select name="channel">
              <option value="WhatsApp">WhatsApp</option>
              <option value="Email">Email</option>
            </select>
          </label>
          <label>Simulated contact context
            <input name="contact" value="Public family inquiry">
          </label>
          <label>Message
            <textarea name="message" required placeholder="Ask about schedule, signup, class link, or portal access."></textarea>
          </label>
          <button class="btn primary" type="submit" data-action-id="ACTION-ONETIME-COMMUNICATION-AGENT-RUN-TEST">Run No-Send Test</button>
        </form>
        ${state.testOutput ? `<div class="communication-agent-test-result">${state.testOutput}</div>` : '<p class="small">No external send. The test shows the generated response, retrieved knowledge, proposed actions, and blocked actions.</p>'}
      </section>
    `;
  }

  function renderActivityPanel(agent, h) {
    return `
      <section class="communication-agent-panel">
        <h4>Activity</h4>
        ${(agent.activity || []).map((item) => `<p class="small">${h.escapeHtml(item)}</p>`).join('')}
        <p class="small">Model runs, fallback events, human handoffs, and reply-queue events are shown here without raw secrets.</p>
      </section>
    `;
  }

  function renderPlaceholder(message = 'Communication Agents load when this section opens.', helpers = {}) {
    const h = helpersFor(helpers);
    return `
      <section class="service-card" data-one-time-provider-agents-route-placeholder data-route-module="${MODULE_ID}">
        <div class="service-head">
          <div>
            <h3>Communication Agents</h3>
            <p class="small">${h.escapeHtml(message)}</p>
          </div>
          <span class="status-pill">Route module</span>
        </div>
      </section>
    `;
  }

  function mount(target, data, helpers) {
    if (!target) return;
    target.innerHTML = render(data, helpers);
  }

  function hydrate(data = {}, helpers = {}) {
    const target = document.getElementById('providerAgents');
    if (!target) return;
    mount(target, data, helpers);
    if (target.dataset.agentsRouteBound === 'true') return;
    target.dataset.agentsRouteBound = 'true';
    target.addEventListener('click', (event) => {
      const indexTab = event.target.closest('[data-agents-index-tab]');
      if (indexTab) {
        state.indexTab = indexTab.dataset.agentsIndexTab;
        state.screen = 'index';
        mount(target, data, helpers);
        return;
      }
      const open = event.target.closest('[data-agent-open]');
      if (open) {
        state.screen = 'workspace';
        state.workspaceTab = 'Overview';
        mount(target, data, helpers);
        return;
      }
      if (event.target.closest('[data-agent-back]')) {
        state.screen = 'index';
        mount(target, data, helpers);
        return;
      }
      const workspaceTab = event.target.closest('[data-agent-tab]');
      if (workspaceTab) {
        state.workspaceTab = workspaceTab.dataset.agentTab;
        mount(target, data, helpers);
        return;
      }
      const testBinding = event.target.closest('[data-agents-run-test]');
      if (testBinding) {
        state.screen = 'workspace';
        state.workspaceTab = 'Test';
        state.testOutput = `<strong>${helpersFor(helpers).escapeHtml(testBinding.dataset.agentsRunTest)} binding test ready.</strong><p class="small">No external send was performed. Contact capture is on, automatic tasks are off, and channel replies remain governed by readiness.</p>`;
        mount(target, data, helpers);
      }
    });
    target.addEventListener('submit', (event) => {
      const form = event.target.closest('[data-agent-test-form]');
      if (!form) return;
      event.preventDefault();
      const h = helpersFor(helpers);
      const formData = new FormData(form);
      const channel = String(formData.get('channel') || 'WhatsApp');
      const message = String(formData.get('message') || '');
      const response = safePreview(message, channel);
      state.testOutput = `
        <strong>Generated response</strong>
        <p class="small">${h.escapeHtml(response)}</p>
        <strong>Retrieved knowledge</strong>
        <p class="small">Schedule, local address, signup route, and portal-not-granted policy.</p>
        <strong>Proposed actions</strong>
        <p class="small">Resolve or create One Time contact; mark thread unread; no automatic task.</p>
        <strong>Blocked actions</strong>
        <p class="small">No raw class link in model context, no external send, no portal access, no payment, no credentials.</p>
      `;
      mount(target, data, helpers);
    });
  }

  window.OneTimeProviderAgentsRoute = {
    module_id: MODULE_ID,
    render,
    renderPlaceholder,
    hydrate,
  };
  window.OneTimeProviderRouteModules = window.OneTimeProviderRouteModules || {};
  window.OneTimeProviderRouteModules.agents = window.OneTimeProviderAgentsRoute;
  document.documentElement.dataset.oneTimeProviderAgentsRouteModule = 'loaded';
})();
