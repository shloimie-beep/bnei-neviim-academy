(function () {
  'use strict';

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
    const escapeHtml = helpers.escapeHtml || fallbackEscapeHtml;
    const inboxAddress = helpers.ONE_TIME_INBOX_ADDRESS || 'info@onetimeonetime.com';
    return {
      escapeHtml,
      ONE_TIME_INBOX_ADDRESS: inboxAddress,
      oneTimeLaunchDisplay: helpers.oneTimeLaunchDisplay || ((value, fallback = '') => String(value || '').trim() || fallback),
      oneTimeRoleLink: helpers.oneTimeRoleLink || ((links = {}, key, liveFallback, reviewFallback) => links[key] || liveFallback || reviewFallback || '#'),
      oneTimeReviewHref: helpers.oneTimeReviewHref || ((value, fallback = '#') => escapeHtml(value || fallback)),
      oneTimeMaybeFitStatusPill: helpers.oneTimeMaybeFitStatusPill || ((value) => `<span class="status-pill">${escapeHtml(value)}</span>`),
    };
  }

  function renderOneTimeProviderActionBar(data = {}, helpers = {}) {
    const h = helpersFor(helpers);
    const links = data.links || {};
    return `
      <div class="button-row one-time-crm-toolbar">
        <button class="btn primary" type="button" data-action-id="ACTION-PROVIDER-SECTION-NAVIGATION" data-provider-nav="mailbox" data-one-time-action-state="navigate">Open Inbox</button>
        <a class="btn" href="${h.oneTimeReviewHref(links.email_preview, '/one-time-email-review.html')}" data-one-time-action-state="navigate">Preview Email</a>
        <button class="btn" type="button" data-action-id="ACTION-PROVIDER-SECTION-NAVIGATION" data-provider-nav="communications" data-one-time-action-state="navigate">Draft Message</button>
        <a class="btn" href="${h.oneTimeReviewHref(links.parent, '/parent.html?review=one-time')}" data-one-time-action-state="navigate">Parent View</a>
        <a class="btn" href="${h.oneTimeReviewHref(links.student, '/student.html?review=one-time')}" data-one-time-action-state="navigate">Student View</a>
      </div>
    `;
  }

  function render(data = {}, helpers = {}) {
    const h = helpersFor(helpers);
    const parent = data.parent || {};
    const student = data.student || {};
    const supportTicket = data.support_ticket || {};
    const privateQuestion = data.private_question || {};
    const records = data.crm_workspace?.current_records || {};
    const parentCount = Number(records.parents || 0);
    const studentCount = Number(records.students || 0);
    const supportCount = Number(records.support_items || (supportTicket.title ? 1 : 0));
    const parentName = h.oneTimeLaunchDisplay(parent.name || parent.display_name, 'Parent records');
    const studentName = h.oneTimeLaunchDisplay(student.display_name || student.name, 'Student records');
    const parentEmail = h.oneTimeLaunchDisplay(parent.email || parent.contact_email, '');
    const parentHasContact = Boolean(h.oneTimeLaunchDisplay(parent.name || parent.display_name, '') || parentEmail);
    const studentLabel = h.oneTimeLaunchDisplay(student.display_name || student.name, 'linked student records');
    const supportTitle = h.oneTimeLaunchDisplay(supportTicket.title, 'Support tickets');
    const supportBody = h.oneTimeLaunchDisplay(supportTicket.latest_activity, 'Parent support requests, worksheet questions, login issues, and billing questions are tracked from the same contact record.');
    const privateQuestionTitle = h.oneTimeLaunchDisplay(privateQuestion.title, 'Private Rabbi questions');
    const privateQuestionBody = h.oneTimeLaunchDisplay(privateQuestion.body, 'Student questions can stay private for Rabbi review or be approved for the public classroom feed when appropriate.');
    const crmRecords = [
      {
        type: 'Parent',
        title: parentName,
        body: parentHasContact
          ? `Linked to ${studentLabel}. ${parentEmail ? `Email: ${parentEmail}.` : 'Email thread captured in the One Time inbox.'}`
          : `${parentCount} parent record${parentCount === 1 ? '' : 's'} in this workspace. Open the inbox to review captured email threads and follow-up notes.`,
        meta: [parentEmail || h.ONE_TIME_INBOX_ADDRESS, `${parentCount || 0} parent record${parentCount === 1 ? '' : 's'}`],
        action: 'Open Inbox',
        target: 'mailbox',
      },
      {
        type: 'Student',
        title: studentName,
        body: h.oneTimeLaunchDisplay(student.display_name || student.name, '')
          ? 'Class access, attendance, library progress, private questions, badges, and reward history stay connected here.'
          : `${studentCount} student record${studentCount === 1 ? '' : 's'} connected to parent accounts, attendance, library progress, questions, and rewards.`,
        meta: ['Attendance', 'Library', 'Questions'],
        action: 'Student View',
        target: 'student',
        href: h.oneTimeRoleLink(data.links || {}, 'student', '/student/login', '/student.html?review=one-time'),
      },
      {
        type: 'Support',
        title: supportTitle,
        body: supportBody,
        meta: [`${supportCount || 0} support item${supportCount === 1 ? '' : 's'}`, supportTicket.status || 'Needs follow-up'],
        action: 'Open Messages',
        target: 'communications',
      },
      {
        type: 'Private question',
        title: privateQuestionTitle,
        body: privateQuestionBody,
        meta: [privateQuestion.status || 'Rabbi review', 'Publish only after approval'],
        action: 'Classroom',
        href: h.oneTimeRoleLink(data.links || {}, 'classroom', '/one-time-classroom.html', '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS'),
      },
    ];
    const recordHtml = crmRecords.map((record) => `
      <article class="one-time-crm-record" data-one-time-crm-record="${h.escapeHtml(record.type.toLowerCase().replace(/\s+/g, '-'))}">
        <div class="one-time-crm-record-top">
          <strong>${h.escapeHtml(record.title)}</strong>
          <span class="status-pill">${h.escapeHtml(record.type)}</span>
        </div>
        <p class="small">${h.escapeHtml(record.body)}</p>
        <div class="one-time-crm-record-meta">
          ${(record.meta || []).filter(Boolean).map((item) => h.oneTimeMaybeFitStatusPill(item)).join('')}
        </div>
        ${record.href
          ? `<a class="btn" href="${h.escapeHtml(record.href)}" data-one-time-action-state="navigate">${h.escapeHtml(record.action)}</a>`
          : `<button class="btn" type="button" data-action-id="ACTION-PROVIDER-SECTION-NAVIGATION" data-provider-nav="${h.escapeHtml(record.target || 'crm')}" data-one-time-action-state="navigate">${h.escapeHtml(record.action)}</button>`}
      </article>
    `).join('');
    return `
      <section class="one-time-crm-shell" data-one-time-provider-crm-shell data-route-module="one-time-provider-crm-route" aria-label="One Time CRM workbench">
        <div class="one-time-crm-header">
          <div>
            <h3>One Time CRM Inbox</h3>
            <p class="small one-time-fit-copy">Emails to ${h.escapeHtml(h.ONE_TIME_INBOX_ADDRESS)}, parent/student records, notes, support tickets, and private Rabbi questions are connected here inside the Rabbi Sheller workspace.</p>
            <div class="one-time-crm-summary-grid">
              <span class="status-pill">${h.escapeHtml(String(parentCount || 0))} parent${parentCount === 1 ? '' : 's'}</span>
              <span class="status-pill">${h.escapeHtml(String(studentCount || 0))} student${studentCount === 1 ? '' : 's'}</span>
              <span class="status-pill">${h.escapeHtml(String(supportCount || 0))} support item${supportCount === 1 ? '' : 's'}</span>
            </div>
          </div>
          ${renderOneTimeProviderActionBar(data, h)}
        </div>
        <div class="one-time-crm-workbench">
          <div class="one-time-crm-list" aria-label="CRM records">
            <div class="one-time-crm-list-head">
              <span>Records</span>
              <span>Rabbi workspace</span>
            </div>
            ${recordHtml}
          </div>
          <aside class="one-time-crm-detail" aria-label="Selected CRM record">
            <div>
              <h3>Selected CRM view</h3>
              <p class="small">Open a record from the list to work from the person, not from a loose card. The Rabbi sees contact context, conversation history, notes, class access, and pending actions in one place.</p>
            </div>
            <div class="one-time-crm-detail-grid">
              <div class="one-time-crm-summary">
                <strong>Conversation</strong>
                <p class="small">Inbox and WhatsApp context stay tied to the parent/student contact.</p>
              </div>
              <div class="one-time-crm-summary">
                <strong>Notes</strong>
                <p class="small">Rabbi notes stay inside this One Time workspace and do not expose platform setup cards.</p>
              </div>
              <div class="one-time-crm-summary">
                <strong>Class access</strong>
                <p class="small">Parent and student portal links, schedule, library progress, and attendance are visible when attached.</p>
              </div>
              <div class="one-time-crm-summary">
                <strong>Next action</strong>
                <p class="small">Draft reply, open the mailbox, preview templates, or review the student/parent view from the same workspace.</p>
              </div>
            </div>
            ${renderOneTimeProviderActionBar(data, h)}
          </aside>
        </div>
      </section>
    `;
  }

  window.OneTimeProviderCrmRoute = {
    module_id: 'one-time-provider-crm-route',
    render,
  };
  window.OneTimeProviderRouteModules = window.OneTimeProviderRouteModules || {};
  window.OneTimeProviderRouteModules.crm = window.OneTimeProviderCrmRoute;
  document.documentElement.dataset.oneTimeProviderCrmRouteModule = 'loaded';
})();
