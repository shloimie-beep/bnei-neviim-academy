// Deferred renderers extracted from public/operations.html for lighter initial /operations delivery.
function renderPipelines() {
    const cards = pipelineCardsForSection(pipelineSection);
    const stale = staleTaskItems();
    const decisions = taskDecisionItems();
    return `
        <div class="container">
            <div class="page-heading saas-page-heading">
                <div>
                    <div class="page-kicker">CRM Pipeline</div>
                    <h2>Pipelines</h2>
                    <p>Enrollment, provider class leads, provider onboarding, stale work, and decision cards live here so the system shows what needs action.</p>
                </div>
            </div>
            ${pipelineSection === 'overview' ? `
                <section class="focus-panel">
                    <div class="task-overview-grid">
                        ${renderMetricButton('BNA Enrollment', pipelineSubnavCounts().bna_enrollment, 'School leads and signups.', "setCurrentSection('bna_enrollment')")}
                        ${renderMetricButton('Provider Leads', pipelineSubnavCounts().provider_class, 'Rabbi Sheller class/membership leads.', "setCurrentSection('provider_class')")}
                        ${renderMetricButton('Stale Work', stale.length, 'No owner, next action, or touch in 48 hours.', "setCurrentSection('stale_tasks')")}
                        ${renderMetricButton('Decisions', decisions.length, 'A/B/C choices waiting for Shloimie.', "setCurrentSection('decisions')")}
                    </div>
                </section>
            ` : ''}
            ${['overview', 'bna_enrollment', 'provider_class', 'provider_onboarding', 'participants'].includes(pipelineSection) ? `
                <section class="focus-panel">
                    <div class="task-section-header"><h3>${escapeHtml(PIPELINE_SUBTABS.find(tab => tab.id === pipelineSection)?.label || 'Pipeline')}</h3><span>${cards.length} cards</span></div>
                    ${renderPipelineBoard(cards)}
                </section>
            ` : ''}
            ${pipelineSection === 'stale_tasks' ? renderStaleTaskSweeper(stale) : ''}
            ${pipelineSection === 'decisions' ? renderPipelineDecisionCards(decisions) : ''}
            ${renderCommandBotPanel('pipelines')}
        </div>
    `;
}

function renderPipelineBoard(cards = []) {
    const stages = [
        { id: 'inbox', label: 'Inbox' },
        { id: 'interested', label: 'Interested' },
        { id: 'follow_up', label: 'Follow-up' },
        { id: 'needs_decision', label: 'Decision' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'won', label: 'Won / Member' }
    ];
    const normalized = (card) => {
        const value = String(card.stage_key || card.stage || '').toLowerCase();
        if (/paid|accepted|won|member|participant|done/.test(value)) return 'won';
        if (/progress|assigned|scheduled|application/.test(value)) return 'in_progress';
        if (/decision|blocked|review/.test(value)) return 'needs_decision';
        if (/follow/.test(value)) return 'follow_up';
        if (/interest|lead|new/.test(value)) return 'interested';
        return 'inbox';
    };
    return `
        <div class="pipeline-board">
            ${stages.map(stage => {
                const stageCards = cards.filter(card => normalized(card) === stage.id);
                return `
                    <div class="pipeline-column">
                        <div class="pipeline-column-header"><strong>${escapeHtml(stage.label)}</strong><span>${stageCards.length}</span></div>
                        ${stageCards.length ? stageCards.map(renderPipelineCard).join('') : '<div class="empty-state compact">No cards.</div>'}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderPipelineCard(card = {}) {
    const sourceLabel = card.derived ? `${card.source || 'derived'} read-only` : card.source || 'internal';
    return `
        <article class="pipeline-card">
            <div class="pipeline-card-title">${escapeHtml(card.title || 'Untitled card')}</div>
            <div class="event-meta">${escapeHtml([sourceLabel, card.owner_name, card.pipeline_key].filter(Boolean).join(' / '))}</div>
            ${card.summary ? `<p>${escapeHtml(limitTextClient(card.summary, 180))}</p>` : ''}
            ${card.next_action ? `<div class="settings-disabled-note">Next: ${escapeHtml(card.next_action)}</div>` : ''}
            <div class="task-actions">
                ${card.task_id ? `<button class="task-action" onclick="openTaskDetail(event, ${Number(card.task_id)})">Open Task</button>` : ''}
                ${!card.derived ? `<button class="task-action" onclick="advancePipelineCard(${Number(card.id)}, 'in_progress')">Start</button><button class="task-action primary" onclick="advancePipelineCard(${Number(card.id)}, 'won')">Won</button>` : '<button class="task-action" disabled title="Derived from existing lead/signup/task record">Derived</button>'}
            </div>
        </article>
    `;
}

function renderStaleTaskSweeper(items = []) {
    return `
        <section class="focus-panel">
            <div class="task-section-header"><h3>Stale Task Sweeper</h3><span>${items.length} tasks</span></div>
            ${items.length ? `<div class="task-list">${items.slice(0, 40).map(task => renderTaskCard(task, 'stale')).join('')}</div>` : '<div class="empty-state">No stale tasks match the sweeper rules.</div>'}
        </section>
    `;
}

function renderPipelineDecisionCards(items = []) {
    return `
        <section class="focus-panel">
            <div class="task-section-header"><h3>Decision Cards</h3><span>${items.length} decisions</span></div>
            ${items.length ? `<div class="content-section-grid">${items.slice(0, 24).map(renderDecisionCard).join('')}</div>` : '<div class="empty-state">No decisions are waiting right now.</div>'}
        </section>
    `;
}

function renderDecisionCard(task = {}) {
    const decision = decisionDetailModel(task);
    const options = decision.options;
    return `
        <article class="content-card decision-card">
            <div class="content-card-title">${escapeHtml(decision.question)}</div>
            <p class="event-meta">${escapeHtml(limitTextClient(decision.context, 220))}</p>
            <div class="tag-list" style="margin-top:8px;">
                <span class="tag">${escapeHtml(decision.owner)}</span>
                <span class="tag">${escapeHtml(decision.due)}</span>
                ${decision.recommendation ? `<span class="tag">Recommended: ${escapeHtml(decision.recommendation)}</span>` : ''}
            </div>
            ${decision.why ? `<p class="event-meta">${escapeHtml(limitTextClient(decision.why, 180))}</p>` : ''}
            ${options.length ? `<div class="decision-options">${options.map(option => renderDecisionOptionAction(Number(task.id), option, false)).join('')}</div>` : '<div class="settings-disabled-note">Options are not parsed yet. Ask the assistant to clarify the decision.</div>'}
            <div class="task-actions">
                <button class="task-action primary" onclick="openTaskDetail(event, ${Number(task.id)})">Open Decision</button>
                <button class="task-action" onclick="taskAction(event, ${Number(task.id)}, { stage: 'assigned', assigned_to: 'Shloimie', decision_required: false })">Defer</button>
                <button class="task-action" onclick="taskAction(event, ${Number(task.id)}, { stage: 'assigned', assigned_to: 'Codex', decision_required: false, next_action: 'Clarify decision options and return a concise recommendation.' })">Ask assistant</button>
            </div>
        </article>
    `;
}

function renderCalendar() {
    const events = calendarEventsForSection(calendarSection);
    return `
        <div class="container">
            <div class="page-heading saas-page-heading">
                <div>
                    <div class="page-kicker">Internal Calendar</div>
                    <h2>Calendar</h2>
                    <p>BNA Operations owns the calendar. Tasks, classes, check-ins, meetings, and workspace events stay usable inside the app.</p>
                </div>
            </div>
            ${calendarSection === 'overview' ? `
                <section class="focus-panel">
                    <div class="task-overview-grid">
                        ${renderMetricButton('This Week', calendarSubnavCounts().week, 'Events and derived schedule items in the next 7 days.', "setCurrentSection('week')")}
                        ${renderMetricButton('Classes', calendarSubnavCounts().classes, 'Class sessions and provider sessions.', "setCurrentSection('classes')")}
                        ${renderMetricButton('Student Items', calendarSubnavCounts().students, 'Assignment due dates and check-ins.', "setCurrentSection('students')")}
                        ${renderMetricButton('Internal Events', calendarEvents.length, 'Workspace-scoped events created inside Operations.', "setCurrentSection('list')")}
                    </div>
                </section>
            ` : ''}
            ${['overview', 'today', 'week', 'month', 'list', 'classes', 'students', 'provider', 'worksheets', 'questions'].includes(calendarSection) ? `
                <section class="focus-panel">
                    <div class="task-section-header"><h3>${escapeHtml((isProviderWorkspace() ? PROVIDER_CALENDAR_SUBTABS : CALENDAR_SUBTABS).find(tab => tab.id === calendarSection)?.label || 'Calendar')}</h3><span>${events.length} items</span></div>
                    <p class="settings-disabled-note">${isProviderWorkspace() ? 'Provider schedule only. No BNA goals/check-ins or private school data are included.' : 'Internal calendar loads without Google connected. Visibility badges show admin, parent, student, or provider scope.'}</p>
                    <div class="calendar-event-list">
                        ${events.length ? events.map(renderCalendarEventRow).join('') : '<div class="empty-state">No events match this calendar lane.</div>'}
                    </div>
                </section>
            ` : ''}
            ${renderCommandBotPanel('calendar')}
        </div>
    `;
}

function calendarEventsForSection(section = 'overview') {
    let events = isProviderWorkspace() ? providerScheduleEvents() : derivedCalendarEvents(section === 'week' ? 'week' : section === 'month' ? 'month' : '');
    if (section === 'today') events = events.filter(event => formatDate(event.start_at) === formatDate(new Date().toISOString()));
    if (section === 'classes') events = events.filter(event => event.source === 'class_session' || event.related_type === 'class_session');
    if (section === 'students') events = events.filter(event => ['assignment', 'student_schedule'].includes(event.source) || event.visibility === 'student');
    if (section === 'provider') events = events.filter(event => normalizeWorkspaceKey(event.workspace_key) === 'rabbi_sheller_provider');
    if (section === 'worksheets') events = events.filter(event => /worksheet|source/i.test(`${event.title || ''} ${event.description || ''} ${event.source || ''}`));
    if (section === 'questions') events = events.filter(event => /question|post/i.test(`${event.title || ''} ${event.description || ''} ${event.source || ''}`));
    return events.slice(0, 80);
}

function renderCalendarEventRow(event = {}) {
    const persisted = !event.derived && Number.isFinite(Number(event.id));
    const meta = event.metadata || {};
    const owner = event.owner_name || meta.owner || meta.owner_name || '';
    const project = event.project_name || meta.project || meta.project_name || '';
    const recurrence = event.recurrence || meta.recurrence || '';
    const timezone = event.timezone || meta.timezone || '';
    const sourceNotes = event.source_notes || meta.source_notes || '';
    const scheduleFacts = [
        owner ? `Owner: ${owner}` : '',
        project ? `Workspace: ${project}` : '',
        recurrence ? `Recurrence: ${recurrence}` : '',
        timezone ? `Timezone: ${timezone}` : '',
        event.status ? `Status: ${String(event.status).replace(/_/g, ' ')}` : ''
    ].filter(Boolean);
    return `
        <article class="calendar-event-row">
            <div class="calendar-date-block">
                <strong>${escapeHtml(formatDate(event.start_at) || 'No date')}</strong>
                <span>${escapeHtml(formatTime(event.start_at) || '')}</span>
            </div>
            <div>
                <div class="pipeline-card-title">${escapeHtml(event.title || 'Calendar event')}</div>
                <div class="event-meta">${escapeHtml([event.source || 'internal', event.visibility || 'internal', event.workspace_key || currentWorkspaceKey()].filter(Boolean).join(' / '))}</div>
                <div class="tag-list" style="margin-top:6px;"><span class="tag">${escapeHtml(event.source || 'internal')}</span><span class="tag">${escapeHtml(event.visibility || 'admin')}</span></div>
                ${scheduleFacts.length ? `<div class="event-meta">${escapeHtml(scheduleFacts.join(' / '))}</div>` : ''}
                ${event.description ? `<p class="event-meta">${escapeHtml(limitTextClient(event.description, 260))}</p>` : ''}
                ${sourceNotes ? `<p class="event-meta">${escapeHtml(limitTextClient(sourceNotes, 220))}</p>` : ''}
                ${event.meeting_url ? `<a class="event-meta" href="${escapeHtml(event.meeting_url)}" target="_blank" rel="noopener">Open link</a>` : ''}
            </div>
            <div class="task-actions">
                ${persisted ? `<button class="task-action" onclick="updateCalendarEventStatus(${Number(event.id)}, 'done')">Done</button><button class="task-action" onclick="updateCalendarEventStatus(${Number(event.id)}, 'cancelled')">Cancel</button>` : '<button class="task-action" disabled title="Derived from assignments, sessions, or check-ins">Derived</button>'}
            </div>
        </article>
    `;
}

function renderInternalDialogue() {
    const filteredMessages = internalMessagesForSection(dialogueSection);
    return `
        <div class="container">
            <div class="page-heading saas-page-heading">
                <div>
                    <div class="page-kicker">Internal Operating Thread</div>
                    <h2>Internal Dialogue</h2>
                    <p>Structured notes, decisions, meeting summaries, access requests, support issues, uploads, and operational alerts for Shloimie and provider/admin users.</p>
                </div>
            </div>
            ${dialogueSection === 'overview' ? `
                <section class="focus-panel">
                    <div class="task-overview-grid">
                        ${renderMetricButton('Threads', internalThreads.length, 'Internal project threads.', "setCurrentSection('activity')")}
                        ${renderMetricButton('Meeting Notes', dialogueSubnavCounts().meeting_notes, 'Meeting summaries captured for tasks and decisions.', "setCurrentSection('meeting_notes')")}
                        ${renderMetricButton('Decisions', dialogueSubnavCounts().decisions, 'Decision notes or decision-task references.', "setCurrentSection('decisions')")}
                        ${renderMetricButton('Support', dialogueSubnavCounts().support, 'Support issues and blockers.', "setCurrentSection('support')")}
                    </div>
                </section>
            ` : ''}
            <section class="focus-panel">
                <div class="task-section-header"><h3>${escapeHtml(INTERNAL_DIALOGUE_SUBTABS.find(tab => tab.id === dialogueSection)?.label || 'Dialogue')}</h3><span>${filteredMessages.length} messages</span></div>
                ${renderDialogueTimeline(filteredMessages)}
            </section>
            ${renderCommandBotPanel('internal_dialogue')}
        </div>
    `;
}

function internalMessagesForSection(section = 'overview') {
    const scoped = internalMessages.filter(message => {
        const thread = threadForMessage(message);
        const workspace = normalizeWorkspaceKey(thread?.workspace_key || currentWorkspaceKey());
        return currentWorkspaceKey() === 'platform' || workspace === currentWorkspaceKey();
    });
    if (section === 'shloimie_rabbi') return scoped.filter(message => /rabbi|sheller|scheller|one time/i.test(`${message.body || ''} ${threadForMessage(message)?.title || ''}`));
    if (section === 'meeting_notes') return scoped.filter(message => message.message_type === 'meeting_note');
    if (section === 'uploads') return scoped.filter(message => message.message_type === 'upload');
    if (section === 'decisions') return scoped.filter(message => message.message_type === 'decision' || /decision|decide|option a|option b|option c/i.test(message.body || ''));
    if (section === 'support') return scoped.filter(message => message.message_type === 'support');
    return scoped;
}

function renderDialogueTimeline(messages = []) {
    if (!messages.length) return '<div class="empty-state">No internal dialogue messages are loaded for this lane.</div>';
    return `
        <div class="dialogue-timeline">
            ${messages.slice(0, 80).map(message => {
                const thread = threadForMessage(message);
                return `
                    <article class="dialogue-message">
                        <div class="dialogue-message-meta">
                            <strong>${escapeHtml(message.author_name || 'admin')}</strong>
                            <span>${escapeHtml(message.message_type || 'note')}</span>
                            <span>${escapeHtml(formatDateTime(message.created_at))}</span>
                        </div>
                        <div class="pipeline-card-title">${escapeHtml(thread?.title || 'Internal thread')}</div>
                        <p>${escapeHtml(message.body || '')}</p>
                        <div class="task-actions">
                            <button class="task-action" onclick="createInternalDialogueNotePrompt(${Number(message.thread_id)})">Reply</button>
                        </div>
                    </article>
                `;
            }).join('')}
        </div>
    `;
}

function renderProviderContentPanel() {
    const providerJobs = contentJobs.filter(job => contentProject(job) === 'mishna').slice(0, 12);
    return `
        <section class="focus-panel">
            <div class="task-section-header"><h3>Provider Content / Posts</h3><span>${providerJobs.length} items</span></div>
            ${providerJobs.length ? `<div class="content-section-grid">${providerJobs.map(renderContentCard).join('')}</div>` : '<div class="empty-state">No provider-specific content jobs are loaded.</div>'}
        </section>
    `;
}

function renderProviderCommunicationsPanel() {
    const items = contactCommunications.filter(item => /provider|rabbi/i.test(`${item.summary || ''} ${item.body || ''} ${item.contact_type || ''}`));
    return `
        <section class="focus-panel">
            <div class="task-section-header"><h3>Provider Communications</h3><span>${items.length} records</span></div>
            ${items.length ? `<div class="timeline compact-timeline">${items.map(renderCommunicationTimelineItem).join('')}</div>` : '<div class="empty-state">No provider communications are loaded yet.</div>'}
        </section>
    `;
}

function renderProviderLeadsPanel() {
    const providerCards = pipelineCardsForSection('provider_class');
    return `
        <section class="focus-panel">
            <div class="task-section-header"><h3>Provider Leads / Participants</h3><span>${providerCards.length} records</span></div>
            ${providerCards.length ? renderPipelineBoard(providerCards) : '<div class="empty-state">No Rabbi Sheller provider leads are loaded yet.</div>'}
        </section>
    `;
}

function communicationMetadata(item = {}) {
    return parseObjectMaybe(item.metadata);
}

function communicationSourceContext(item = {}) {
    return parseObjectMaybe(item.source_context);
}

function communicationSubject(item = {}) {
    const context = communicationSourceContext(item);
    const metadata = communicationMetadata(item);
    return item.subject || metadata.subject || context.subject || item.summary || 'Communication';
}

function communicationPriority(item = {}) {
    const metadata = communicationMetadata(item);
    if (metadata.communication_priority) return String(metadata.communication_priority).toLowerCase();
    if (item.follow_up_required) return 'high';
    if (/urgent|failed|payment|accountability|unsafe|asap/i.test(`${item.summary || ''} ${item.body || ''}`)) return 'high';
    return 'normal';
}

function baseCommunicationTags(item = {}) {
    const metadata = communicationMetadata(item);
    const sourceContext = communicationSourceContext(item);
    return [
        item.contact_type || 'general',
        metadata.communication_pipeline,
        ...(Array.isArray(metadata.communication_tags) ? metadata.communication_tags : []),
        ...(Array.isArray(metadata.internal_tags) ? metadata.internal_tags : []),
        sourceContext.raw_intake_id ? `raw ${sourceContext.raw_intake_id}` : '',
    ].filter(Boolean).map(tag => String(tag).replace(/_/g, ' '));
}

function contactTagsForCommunication(item = {}) {
    const linkedSignupTags = (signups || [])
        .filter(signup => communicationMatchesSignup(item, signup))
        .flatMap(contactTags);
    const linkedLeadTags = (parentLeads || [])
        .filter(lead => communicationMatchesLead(item, lead))
        .flatMap(leadTags);
    return uniqueSortedTags([...linkedSignupTags, ...linkedLeadTags]);
}

function communicationTags(item = {}) {
    return uniqueSortedTags([
        ...baseCommunicationTags(item),
        ...contactTagsForCommunication(item),
    ]).slice(0, 10);
}

function communicationMatchesContactFilters(item = {}) {
    return matchesRecentDate(item.occurred_at || item.created_at, contactDateFilter)
        && contactTagMatches(communicationTags(item));
}

function communicationAddressLine(item = {}) {
    const context = communicationSourceContext(item);
    const metadata = communicationMetadata(item);
    const from = context.from_address || context.from_number || metadata.from_address || metadata.from_number || metadata.push_name || '';
    const to = context.to_address || context.to_number || metadata.to_address || metadata.to_number || '';
    return [from ? `From ${from}` : '', to ? `To ${to}` : ''].filter(Boolean).join(' / ') || 'No address loaded';
}

function communicationStatusLine(item = {}) {
    const context = communicationSourceContext(item);
    const metadata = communicationMetadata(item);
    const status = context.status || context.delivery_status || metadata.delivery_status || metadata.status || '';
    const opened = metadata.opened_at || metadata.open_at || metadata.opened || context.opened_at || '';
    const clicked = metadata.clicked_at || metadata.click_at || metadata.clicked || context.clicked_at || '';
    const parts = [
        status ? contactStatusLabel(status) : '',
        opened ? 'Opened' : '',
        clicked ? 'Clicked' : '',
    ].filter(Boolean);
    return parts.join(' / ') || (item.follow_up_required ? 'Follow-up required' : 'Logged');
}

function communicationSourceLabel(item = {}) {
    const context = communicationSourceContext(item);
    const metadata = communicationMetadata(item);
    return [
        item.source || metadata.source || context.source || 'dashboard',
        metadata.import_source || '',
        context.unified_communication_id ? `email log #${context.unified_communication_id}` : '',
        context.message_id ? `message #${context.message_id}` : '',
    ].filter(Boolean).join(' / ');
}

function communicationAssociatedContext(item = {}) {
    const metadata = communicationMetadata(item);
    const project = item.project_name || item.project_key || metadata.workspace_key || '';
    const person = communicationContactName(item);
    const student = item.student_name || item.signup_student_name || metadata.student_name || '';
    return [
        project || currentWorkspaceRecord()?.display_name || 'Workspace',
        person && person !== 'General contact' ? person : '',
        student ? `Student ${student}` : '',
    ].filter(Boolean).join(' / ') || 'Operations';
}

function communicationActionLabel(item = {}) {
    const metadata = communicationMetadata(item);
    if (metadata.action_label) return metadata.action_label;
    if (item.follow_up_required) return 'Review follow-up';
    if (communicationPriority(item) === 'high' || communicationPriority(item) === 'urgent') return 'Review';
    return 'Logged';
}

function communicationIsTopNews(item = {}) {
    const metadata = communicationMetadata(item);
    const context = communicationSourceContext(item);
    const text = `${item.summary || ''} ${item.body || ''} ${metadata.communication_pipeline || ''} ${metadata.communication_priority || ''}`.toLowerCase();
    return Boolean(
        metadata.top_news ||
        context.communication_screening?.top_news ||
        item.follow_up_required ||
        ['urgent', 'high'].includes(communicationPriority(item)) ||
        /\b(form filled|portal link clicked|payment issue|failed email|urgent whatsapp|parent reply|accountability)\b/i.test(text)
    );
}

function communicationTopNewsItems(limit = 6) {
    return [...contactCommunications]
        .filter(communicationIsTopNews)
        .sort((a, b) => {
            const priorityWeight = { urgent: 3, high: 2, normal: 1, low: 0 };
            const diff = (priorityWeight[communicationPriority(b)] || 0) - (priorityWeight[communicationPriority(a)] || 0);
            if (diff) return diff;
            return Date.parse(b.occurred_at || b.created_at || 0) - Date.parse(a.occurred_at || a.created_at || 0);
        })
        .slice(0, limit);
}

function renderCommunicationTopNewsPanel(items = communicationTopNewsItems(6), compact = false) {
    return `
        <section class="focus-panel" data-communication-top-news>
            <div class="task-section-header"><h3>Top News</h3><span>${items.length} events</span></div>
            ${items.length ? `<div class="communication-top-news-grid">
                ${items.map(item => `
                    <article class="communication-top-news-card">
                        <div class="task-card-meta">
                            <span class="badge badge-urgency-${escapeHtml(communicationPriority(item) === 'urgent' ? 'urgent' : 'today')}">${escapeHtml(communicationPriority(item))}</span>
                            <span class="badge">${escapeHtml(communicationChannelLabel(item.channel))}</span>
                            <span class="badge">${escapeHtml(communicationDirectionLabel(item.direction))}</span>
                        </div>
                        <div class="task-title">${escapeHtml(communicationSubject(item))}</div>
                        <p class="task-notes">${escapeHtml(limitTextClient(item.body || item.summary || '', compact ? 160 : 260))}</p>
                        <div class="task-detail">${escapeHtml(communicationAssociatedContext(item))}</div>
                    </article>
                `).join('')}
            </div>` : '<div class="empty-state">No high-priority communication events are loaded.</div>'}
        </section>
    `;
}

function communicationPipelineCounts(items = contactCommunications) {
    const counts = {};
    (items || []).forEach(item => {
        const metadata = communicationMetadata(item);
        const categories = Array.isArray(metadata.communication_pipeline_categories)
            ? metadata.communication_pipeline_categories
            : [metadata.communication_pipeline || (item.contact_type === 'student' ? 'student_issue' : item.contact_type === 'lead' ? 'parent_lead' : 'general')];
        categories.filter(Boolean).forEach(category => {
            counts[category] = (counts[category] || 0) + 1;
        });
    });
    return counts;
}

function renderCommunicationScreeningPanel(items = contactCommunications) {
    const counts = communicationPipelineCounts(items);
    const categories = ['parent_lead', 'parent_accountability', 'student_issue', 'provider', 'payment', 'content', 'support', 'urgent_needs_attention', 'general'];
    return `
        <section class="focus-panel" data-communication-screening-pipeline>
            <div class="task-section-header"><h3>Screening Pipeline</h3><span>${items.length} screened</span></div>
            <div class="task-overview-grid">
                ${categories.map(category => renderMetricButton(contactStatusLabel(category), counts[category] || 0, 'Inbound messages are tagged into this first-party pipeline.', '')).join('')}
            </div>
            <p class="settings-disabled-note">Parent behavior notes use non-clinical coaching/self-regulation categories only. No diagnosis labels are created.</p>
        </section>
    `;
}

function renderContactImportPreviewPanel() {
    const preview = contactImportPreview?.preview || [];
    const summary = contactImportPreview?.summary || {};
    return `
        <section class="focus-panel" data-contact-import-preview>
            <div class="task-section-header"><h3>Contact Imports</h3><span>${preview.length ? `${preview.length} preview` : 'dry-run'}</span></div>
            <div class="settings-control-grid">
                ${renderSettingsControlRow('Upload', 'CSV / vCard / email export', 'Preview-only import source.', '<input class="task-action" type="file" accept=".csv,.vcf,.txt,text/csv,text/vcard" onchange="loadContactImportFile(event)">')}
                ${renderSettingsControlRow('Mapping', 'name, email, phone, organization, student, notes', 'Field mapping is inferred before commit.', 'Preview')}
                ${renderSettingsControlRow('Dedupe', `${Number(summary.possible_duplicates || 0)} possible duplicates`, 'Matches local contacts and parent leads by email or phone.', 'Local')}
                ${renderSettingsControlRow('Commit', contactImportPreview?.commit_blocked ? 'Blocked until approved' : 'Preview required', 'No contact, tag, email, WhatsApp, or external record is written here.', 'No-send')}
            </div>
            <textarea id="contactImportText" class="form-control communication-import-textarea" placeholder="name,email,phone,tags&#10;Example Parent,parent@example.com,+972501234567,parent accountability"></textarea>
            <div class="task-actions">
                <button class="task-action primary" onclick="previewContactImport(event)" ${contactImportBusy ? 'disabled' : ''}>Preview Import</button>
                <button class="task-action" onclick="clearContactImportPreview(event)">Clear</button>
            </div>
            ${contactImportError ? `<div class="error-text">${escapeHtml(contactImportError)}</div>` : ''}
            ${contactImportPreview ? `
                <div class="communication-status-strip">
                    <span class="status-chip">${Number(summary.rows_received || 0)} rows</span>
                    <span class="status-chip">${Number(summary.needs_mapping_review || 0)} need mapping</span>
                    ${Object.entries(summary.classifications || {}).map(([key, count]) => `<span class="status-chip">${escapeHtml(key.replace(/_/g, ' '))}: ${Number(count || 0)}</span>`).join('')}
                </div>
                ${preview.length ? `<div class="content-section-grid">
                    ${preview.slice(0, 8).map(row => `
                        <article class="content-card">
                            <div class="content-card-title">${escapeHtml(row.name || 'Unnamed contact')}</div>
                            <div class="content-card-meta">${escapeHtml([row.classification, row.dedupe_status, row.workspace_association].filter(Boolean).join(' / '))}</div>
                            <p class="event-meta">${escapeHtml([row.email, row.phone, row.organization, row.student_name].filter(Boolean).join(' / ') || 'No identifier loaded')}</p>
                            <div class="task-card-meta">${(row.tags || []).slice(0, 6).map(tag => `<span class="status-chip">${escapeHtml(String(tag).replace(/_/g, ' '))}</span>`).join('')}</div>
                            ${row.duplicate_matches?.length ? `<p class="settings-disabled-note">Matches: ${escapeHtml(row.duplicate_matches.map(match => `${match.type} #${match.id}`).join(', '))}</p>` : ''}
                        </article>
                    `).join('')}
                </div>` : '<div class="empty-state">No preview rows parsed yet.</div>'}
            ` : ''}
        </section>
    `;
}

function renderCommunications() {
    const section = communicationsSection;
    const allItems = [...contactCommunications].sort((a, b) => Date.parse(b.occurred_at || b.created_at || 0) - Date.parse(a.occurred_at || a.created_at || 0));
    const sectionItems = communicationsForSection(allItems, section);
    const filtered = sectionItems.filter(communicationMatchesContactFilters);
    return `
        <div class="container" data-one-time-rabbi-dashboard="operations" data-one-time-communications-route="${escapeHtml(section)}">
            <div class="page-heading saas-page-heading">
                <div>
                    <div class="page-kicker">Messages</div>
                    <h2>Communications</h2>
                    <p>Parent, student, provider, internal, WhatsApp, email, and bot conversations are separated by permission-aware lanes.</p>
                </div>
            </div>
            ${section === 'overview' ? `
                <section class="focus-panel">
                    <div class="task-overview-grid">
                        ${renderMetricButton('Parent Messages', communicationsSubnavCounts().parents, 'Parent and lead communication records.', "setCurrentSection('parents')")}
                        ${renderMetricButton('Student Messages', communicationsSubnavCounts().students, 'Student-linked notes and messages.', "setCurrentSection('students')")}
                        ${renderMetricButton('Provider Messages', communicationsSubnavCounts().providers, 'Provider/Rabbi-related communication.', "setCurrentSection('providers')")}
                        ${renderMetricButton('Bot / API Issues', communicationsSubnavCounts().bots, 'Bot/API records from support tickets.', "setCurrentSection('bots')")}
                    </div>
                </section>
                ${renderCommunicationTopNewsPanel(communicationTopNewsItems(6))}
                ${renderCommunicationScreeningPanel(allItems)}
                ${renderContactImportPreviewPanel()}
            ` : ''}
            ${section === 'whatsapp' ? renderWhatsappSyncPanel(filtered) : ''}
            ${section === 'email' ? renderEmailOperatorWorkspace(filtered) : ''}
            ${['overview', 'parents', 'students', 'providers'].includes(section) ? `
                <section class="focus-panel">
                    <div class="task-section-header"><h3>${escapeHtml(COMMUNICATIONS_SUBTABS.find(tab => tab.id === section)?.label || 'Messages')}</h3><span>${filtered.length} records</span></div>
                    ${renderCommunicationFilterPanel(sectionItems, filtered)}
                    ${filtered.length ? `<div class="contact-list">${filtered.map(renderCommunicationCard).join('')}</div>` : '<div class="empty-state">No messages match this lane.</div>'}
                </section>
            ` : ''}
            ${section === 'internal' ? `
                <section class="focus-panel">
                    <div class="task-section-header"><h3>Internal Dialogue</h3><span>${internalMessagesForSection('overview').length} messages</span></div>
                    <p class="settings-disabled-note">Internal Dialogue is admin/project operations only. It is not a public community feed and never appears in parent, student, or participant portals.</p>
                    ${renderDialogueTimeline(internalMessagesForSection('overview'))}
                </section>
            ` : ''}
            ${section === 'bots' ? renderBotConversationPlaceholder() : ''}
            ${section === 'support_threads' ? renderSupportThreadsPanel() : ''}
            ${section === 'announcements' ? renderAnnouncementPanel() : ''}
            ${section === 'settings' ? renderCommunicationsIntegrationPanel() : ''}
            ${section === 'templates' ? renderNotConfiguredPanel(COMMUNICATIONS_SUBTABS.find(tab => tab.id === section)?.label || 'Communications', 'Template editing is not enabled for this account yet. Current communication history and mailbox views remain available.') : ''}
        </div>
    `;
}

function communicationsForSection(items = [], section = 'overview') {
    if (section === 'parents') return items.filter(item => ['lead', 'signup'].includes(item.contact_type)
        || signups.some(signup => communicationMatchesSignup(item, signup))
        || parentLeads.some(lead => communicationMatchesLead(item, lead)));
    if (section === 'students') return items.filter(item => item.contact_type === 'student');
    if (section === 'providers') return items.filter(item => /provider|rabbi/i.test(`${item.summary || ''} ${item.body || ''}`));
    if (section === 'internal') return items.filter(item => item.direction === 'internal_note');
    if (section === 'whatsapp') return items.filter(item => item.channel === 'whatsapp');
    if (section === 'email') return items.filter(item => item.channel === 'email');
    return items;
}

async function refreshWapiDiagnostics() {
    if (wapiDiagnosticsLoading) return;
    wapiDiagnosticsLoading = true;
    try {
        wapiDiagnostics = await api.getWapiDiagnostics();
    } catch (error) {
        wapiDiagnostics = {
            success: false,
            outbound_configured: false,
            sync_configured: false,
            error: error.message || 'WAPI diagnostics unavailable'
        };
    } finally {
        wapiDiagnosticsLoading = false;
        if (currentView === 'communications' && communicationsSection === 'whatsapp') render();
    }
}

function queueWapiDiagnosticsRefresh() {
    if (wapiDiagnostics || wapiDiagnosticsLoading) return;
    setTimeout(() => refreshWapiDiagnostics(), 0);
}

function renderWhatsappSyncPanel(items = []) {
    queueWapiDiagnosticsRefresh();
    const latestWapi = items.find(item => String(item.source || '').toLowerCase() === 'wapi');
    const latestLabel = latestWapi ? formatDateTime(latestWapi.occurred_at || latestWapi.created_at) : 'No imported Whapi log yet';
    const importedCount = items.filter(item => String(item.source || '').toLowerCase() === 'wapi').length;
    const reportSummary = wapiPhonebookReport?.summary || {};
    const phonebookStatus = wapiPhonebookReport
        ? `${reportSummary.phonebook_groups || 0} groups / ${reportSummary.manual_correction_candidates || 0} review`
        : 'Not run';
    const diagnosticsStatus = wapiDiagnostics
        ? wapiDiagnostics.sync_configured
            ? 'Live pull configured'
            : 'Live pull blocked'
        : wapiDiagnosticsLoading ? 'Checking' : 'Unknown';
    const diagnosticsNote = wapiDiagnostics?.sync_configured
        ? 'WAPI/Whapi token is configured for admin-triggered pull. Sends still require explicit confirmation.'
        : 'Provider-owned WAPI/Whapi credentials are not configured, so live group pull remains blocked.';
    return `
        <section class="focus-panel">
            <div class="task-section-header">
                <h3>Whapi Log Sync</h3>
                <span>${importedCount} imported records</span>
            </div>
            <div class="settings-control-grid">
                ${renderSettingsControlRow('Live WAPI pull', diagnosticsStatus, diagnosticsNote, wapiDiagnostics?.sync_configured ? 'Configured' : 'Blocked')}
                ${renderSettingsControlRow('Latest imported WhatsApp', latestLabel, 'Whapi history imports are stored as contact communications and matched by parent/lead/student phone where possible.', importedCount ? 'Synced' : 'Ready')}
                ${renderSettingsControlRow('Sync latest 100', 'Pulls recent sent and received messages from Whapi. No WhatsApp messages are sent.', 'Use this after connecting WHAPI_API_TOKEN or WAPI_API_TOKEN.', `<button class="task-action primary" onclick="syncWhapiLog(event)">Sync Now</button>`)}
                ${renderSettingsControlRow('Dry run', 'Preview latest Whapi records without creating communication rows.', 'Useful for checking token/access before importing.', `<button class="task-action" onclick="syncWhapiLog(event, true)">Preview</button>`)}
                ${renderSettingsControlRow('Phonebook grouping', phonebookStatus, 'Builds a read-only grouping report from local Whapi/contact tables. It suggests review tags and never sends WhatsApp messages.', `<button class="task-action" onclick="loadWapiPhonebookReport(event)">Build Report</button>`)}
            </div>
        </section>
        ${renderWapiPhonebookWorkspace(items)}
        ${renderWapiPhonebookReport()}
    `;
}

function normalizePhoneDigitsClient(value = '') {
    return String(value || '').replace(/[^0-9]/g, '');
}

function parseObjectMaybe(value) {
    if (!value) return {};
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function firstNonEmptyValue(values = []) {
    return (values || []).find(value => String(value || '').trim()) || '';
}

function communicationProjectKey(item = {}) {
    const sourceContext = parseObjectMaybe(item.source_context);
    const metadata = parseObjectMaybe(item.metadata);
    const rawProjectKey = firstNonEmptyValue([
        item.project_key,
        item.project,
        item.workspace_project_key,
        sourceContext.project_key,
        sourceContext.project,
        sourceContext.workspace_project_key,
        metadata.project_key,
        metadata.project,
        metadata.workspace_project_key,
    ]);
    if (rawProjectKey) return normalizeProjectKey(rawProjectKey);
    const rawWorkspaceKey = firstNonEmptyValue([
        item.workspace_key,
        item.workspace,
        sourceContext.workspace_key,
        sourceContext.workspace,
        metadata.workspace_key,
        metadata.workspace,
    ]);
    return rawWorkspaceKey ? projectKeyForWorkspaceKey(rawWorkspaceKey) : '';
}

function communicationAllowedForCurrentWorkspace(item = {}) {
    const currentProjectKey = projectKeyForWorkspaceKey(currentWorkspaceKey());
    if (!currentProjectKey || currentProjectKey === 'all') return true;
    const itemProjectKey = communicationProjectKey(item);
    if (itemProjectKey) return itemProjectKey === currentProjectKey;
    if (currentProjectKey === 'one_time_mishnah_class') return false;
    return currentProjectKey === 'bna';
}

function wapiPhonebookGroupsSorted() {
    return [...(wapiPhonebookReport?.phonebook || [])].sort((a, b) => {
        const dateDiff = Date.parse(b.latest_at || 0) - Date.parse(a.latest_at || 0);
        if (dateDiff) return dateDiff;
        return Number(b.message_count || 0) - Number(a.message_count || 0);
    });
}

function selectedWapiPhonebookGroup(groups = wapiPhonebookGroupsSorted()) {
    if (!groups.length) {
        selectedWapiPhonebookKey = null;
        return null;
    }
    let selected = groups.find(group => group.key === selectedWapiPhonebookKey);
    if (!selected) {
        selected = groups[0];
        selectedWapiPhonebookKey = selected.key;
    }
    return selected;
}

function communicationPhoneTokens(item = {}) {
    const sourceContext = parseObjectMaybe(item.source_context);
    const metadata = parseObjectMaybe(item.metadata);
    return phoneTokensFromValues([
        sourceContext.from_number,
        sourceContext.to_number,
        sourceContext.phone,
        sourceContext.recipient,
        sourceContext.chat_id,
        sourceContext.wapi_chat_id,
        sourceContext.matched_phone,
        metadata.from_number,
        metadata.to_number,
        metadata.phone,
        item.contact_phone,
    ]);
}

function communicationMatchesWapiGroup(item = {}, group = {}) {
    if (!item || !group) return false;
    if (!communicationAllowedForCurrentWorkspace(item)) return false;
    const itemId = String(item.id || '').replace(/^u-/, '');
    if (group.key === `communication:${itemId}`) return true;
    const sourceContext = parseObjectMaybe(item.source_context);
    const groupCommunicationIds = new Set((group.source_rows || [])
        .filter(row => row.source === 'communication')
        .map(row => String(row.id)));
    if (groupCommunicationIds.has(itemId)) return true;
    if (sourceContext.matched_communication_id && groupCommunicationIds.has(String(sourceContext.matched_communication_id))) return true;
    const linkedRecords = group.linked_records || [];
    if (linkedRecords.some(record =>
        (record.type === 'lead' && Number(item.lead_id) === Number(record.id))
        || (record.type === 'signup' && Number(item.signup_id) === Number(record.id))
        || (record.type === 'student' && Number(item.student_id) === Number(record.id))
    )) return true;
    const chatCandidates = [
        sourceContext.chat_id,
        sourceContext.wapi_chat_id,
        sourceContext.matched_chat_id,
    ].map(value => String(value || '').toLowerCase()).filter(Boolean);
    if (group.chat_id && chatCandidates.includes(String(group.chat_id).toLowerCase())) return true;
    if (group.key?.startsWith('chat:') && chatCandidates.includes(group.key.slice('chat:'.length).toLowerCase())) return true;
    const groupPhones = phoneTokenVariantsClient(group.phone_digits);
    return communicationIntersectsTokens(groupPhones, communicationPhoneTokens(item));
}

function wapiGroupCommunications(group = {}, items = contactCommunications) {
    return (items || [])
        .filter(item => communicationMatchesWapiGroup(item, group))
        .sort((a, b) => Date.parse(b.occurred_at || b.created_at || 0) - Date.parse(a.occurred_at || a.created_at || 0));
}

function wapiGroupNeedles(group = {}) {
    const values = [
        group.key,
        group.phone_digits,
        group.chat_id,
        group.display_name,
        ...(group.aliases || []),
        ...(group.linked_records || []).map(record => record.name),
    ];
    return [...new Set(values.map(value => String(value || '').trim().toLowerCase()).filter(value => value.length >= 4))];
}

function recordTextMatchesWapiGroup(record = {}, group = {}) {
    const sourceContext = parseObjectMaybe(record.source_context);
    const aiParsed = parseObjectMaybe(record.ai_parsed);
    const text = [
        record.title,
        record.description,
        record.notes,
        record.summary,
        record.verification_notes,
        sourceContext,
        aiParsed,
    ].map(value => typeof value === 'string' ? value : JSON.stringify(value || {})).join(' ').toLowerCase();
    return wapiGroupNeedles(group).some(needle => text.includes(needle));
}

function wapiGroupRelatedTasks(group = {}) {
    return tasks
        .filter(task => recordTextMatchesWapiGroup(task, group))
        .sort((a, b) => Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0))
        .slice(0, 8);
}

function wapiGroupRelatedTickets(group = {}) {
    return supportTickets
        .filter(ticket => recordTextMatchesWapiGroup(ticket, group))
        .sort((a, b) => Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0))
        .slice(0, 8);
}

function wapiGroupRelatedDecisions(group = {}) {
    return taskDecisionItems()
        .filter(task => recordTextMatchesWapiGroup(task, group))
        .sort((a, b) => Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0))
        .slice(0, 8);
}

function wapiGroupInternalNotes(group = {}) {
    return wapiGroupCommunications(group)
        .filter(item => ['internal_note', 'telegram'].includes(String(item.channel || '').toLowerCase()) || String(item.source || '').toLowerCase().includes('telegram'))
        .slice(0, 8);
}

function wapiGroupLinkedRecordSummary(group = {}) {
    const linkedRecords = group.linked_records || [];
    if (!linkedRecords.length) return 'No linked record';
    const first = linkedRecords[0] || {};
    const label = [first.type, first.name || `#${first.id}`].filter(Boolean).join(': ');
    return linkedRecords.length === 1 ? label : `${label} +${linkedRecords.length - 1}`;
}

function wapiGroupRoleLabel(group = {}) {
    const type = String(group.applied_type || group.recommended_type || 'general_contact').replace(/_/g, ' ');
    const linked = group.linked_records || [];
    const linkedTypes = linked.map(record => String(record.type || '').toLowerCase());
    if (linkedTypes.includes('signup')) return 'parent/member';
    if (linkedTypes.includes('student')) return 'student';
    if (linkedTypes.includes('service_provider') || linkedTypes.includes('provider')) return 'provider';
    return type;
}

function wapiGroupReviewState(group = {}) {
    if (group.manual_correction_applied) return 'corrected';
    if ((group.review_flags || []).length) return 'needs review';
    return 'screened';
}

function wapiGroupChannelIdentity(group = {}) {
    return [group.phone_digits ? `+${group.phone_digits}` : '', group.chat_id || ''].filter(Boolean).join(' / ') || 'No phone or chat id loaded';
}

function wapiGroupOpenWorkCount(group = {}) {
    const openTasks = wapiGroupRelatedTasks(group).filter(task => !['done', 'completed', 'archived'].includes(normalizeTaskStage(task.stage || task.status))).length;
    const openTickets = wapiGroupRelatedTickets(group).filter(ticket => !['resolved', 'closed', 'archived'].includes(String(ticket.status || '').toLowerCase())).length;
    const openDecisions = wapiGroupRelatedDecisions(group).filter(task => !['done', 'completed', 'archived'].includes(normalizeTaskStage(task.stage || task.status))).length;
    return openTasks + openTickets + openDecisions;
}

function wapiPaneKeyFromId(id = '') {
    if (id === 'wapiConversationPane') return 'conversation';
    if (id === 'wapiDetailsPane') return 'details';
    return 'list';
}

function wapiPaneClass(id = '') {
    return wapiMobilePane === wapiPaneKeyFromId(id) ? ' mobile-active' : '';
}

function wapiStepperButton(id, label) {
    const active = wapiMobilePane === wapiPaneKeyFromId(id);
    return `<button class="wapi-workspace-jump ${active ? 'active' : ''}" type="button" aria-current="${active ? 'page' : 'false'}" onclick="jumpToWapiWorkspacePane(${attrJson(id)})">${escapeHtml(label)}</button>`;
}

function communicationAttachmentSummary(item = {}) {
    const metadata = parseObjectMaybe(item.metadata);
    const sourceContext = parseObjectMaybe(item.source_context);
    const attachments = [
        ...(Array.isArray(metadata.attachments) ? metadata.attachments : []),
        ...(Array.isArray(sourceContext.attachments) ? sourceContext.attachments : []),
        ...(Array.isArray(metadata.media) ? metadata.media : []),
        ...(Array.isArray(sourceContext.media) ? sourceContext.media : []),
    ];
    const count = Number(metadata.attachment_count || sourceContext.attachment_count || attachments.length || 0);
    const kinds = [...new Set(attachments.map(item => item?.type || item?.mime_type || item?.kind).filter(Boolean))];
    if (!count && !kinds.length) return '';
    return `${count || kinds.length} attachment${(count || kinds.length) === 1 ? '' : 's'}${kinds.length ? `: ${kinds.slice(0, 3).join(', ')}` : ''}`;
}

function renderWapiSendReadiness(group = {}) {
    const outboundConfigured = Boolean(wapiDiagnostics?.outbound_configured);
    const recipientReady = Boolean(group.phone_digits || group.chat_id);
    const readiness = outboundConfigured && recipientReady
        ? 'Configured but confirmation-gated'
        : !outboundConfigured
            ? 'Blocked: WAPI/Whapi token missing'
            : 'Blocked: recipient identity missing';
    return `
        <div class="contact-detail-section" data-whatsapp-send-readiness data-whatsapp-send-confirmation-gate>
            <h3>Send Readiness</h3>
            <div class="wapi-readiness-grid">
                <div class="wapi-readiness-row"><strong>Credential</strong><span>${escapeHtml(outboundConfigured ? 'WAPI/Whapi token present' : 'Missing WAPI_API_TOKEN or WHAPI_API_TOKEN')}</span></div>
                <div class="wapi-readiness-row"><strong>Recipient</strong><span>${escapeHtml(recipientReady ? wapiGroupChannelIdentity(group) : 'No recipient identity loaded')}</span></div>
                <div class="wapi-readiness-row"><strong>Write gate</strong><span>Server requires explicit confirm: SEND_WHATSAPP. This workspace does not send during this run.</span></div>
            </div>
            <div class="task-actions" data-whatsapp-no-send-actions>
                <button class="task-action" type="button" disabled>${escapeHtml(readiness)}</button>
                <button class="task-action" type="button" onclick="openWhatsAppSendReadiness(event)">Setup / blocker</button>
            </div>
        </div>
    `;
}

function wapiGroupTimelineItems(group = {}, items = contactCommunications) {
    const communications = wapiGroupCommunications(group, items).map(item => ({
        kind: 'communication',
        at: item.occurred_at || item.created_at,
        item,
    }));
    const taskItems = wapiGroupRelatedTasks(group).map(task => ({
        kind: 'task',
        at: task.last_activity_at || task.updated_at || task.created_at,
        item: task,
    }));
    const ticketItems = wapiGroupRelatedTickets(group).map(ticket => ({
        kind: 'ticket',
        at: ticket.updated_at || ticket.created_at,
        item: ticket,
    }));
    const decisionItems = wapiGroupRelatedDecisions(group).map(task => ({
        kind: 'decision',
        at: task.updated_at || task.created_at,
        item: task,
    }));
    return [...communications, ...taskItems, ...ticketItems, ...decisionItems]
        .sort((a, b) => Date.parse(a.at || 0) - Date.parse(b.at || 0))
        .slice(0, 40);
}

function renderWapiPhonebookWorkspace(items = []) {
    const groups = wapiPhonebookGroupsSorted();
    if (!wapiPhonebookReport) {
        const recent = items.slice(0, 8);
        return `
            <section class="focus-panel">
                <div class="task-section-header">
                    <h3>Phonebook Workspace</h3>
                    <span>Read-only</span>
                </div>
                <div class="empty-state">Build the phonebook report to open the contact list, conversation, and details workspace.</div>
                ${recent.length ? `<div class="mini-list">${recent.map(renderCommunicationEntry).join('')}</div>` : ''}
            </section>
        `;
    }
    const selected = selectedWapiPhonebookGroup(groups);
    if (!selected) {
        return `
            <section class="focus-panel">
                <div class="task-section-header">
                    <h3>Phonebook Workspace</h3>
                    <span>0 contacts</span>
                </div>
                <div class="empty-state">No WhatsApp phonebook records are available yet.</div>
            </section>
        `;
    }
    const timeline = wapiGroupTimelineItems(selected, items);
    const linkedRecords = selected.linked_records || [];
    const relatedTasks = wapiGroupRelatedTasks(selected);
    const relatedTickets = wapiGroupRelatedTickets(selected);
    const relatedDecisions = wapiGroupRelatedDecisions(selected);
    const internalNotes = wapiGroupInternalNotes(selected);
    const openWorkCount = wapiGroupOpenWorkCount(selected);
    return `
        <section class="focus-panel">
            <div class="task-section-header">
                <h3>Phonebook Workspace</h3>
                <span>${groups.length} contacts / no-send</span>
            </div>
            <div class="wapi-mobile-stepper" data-wapi-mobile-back-navigation>
                ${wapiStepperButton('wapiPhonebookPane', 'List')}
                ${wapiStepperButton('wapiConversationPane', 'Conversation')}
                ${wapiStepperButton('wapiDetailsPane', 'Details')}
            </div>
            <div class="wapi-conversation-workspace" data-wapi-three-pane-workspace>
                <div class="wapi-workspace-pane${wapiPaneClass('wapiPhonebookPane')}" id="wapiPhonebookPane" aria-label="WhatsApp phonebook contacts">
                    <div class="task-section-header"><h3>Phonebook</h3><span>${groups.length}</span></div>
                    <div class="wapi-phonebook-list">
                        ${groups.map(renderWapiPhonebookListItem).join('')}
                    </div>
                </div>
                <div class="wapi-workspace-pane${wapiPaneClass('wapiConversationPane')}" id="wapiConversationPane" aria-label="Selected WhatsApp conversation">
                    <div class="task-section-header">
                        <div>
                            <h3>${escapeHtml(selected.display_name || 'WhatsApp contact')}</h3>
                            <p class="settings-disabled-note">${escapeHtml([wapiGroupChannelIdentity(selected), wapiGroupRoleLabel(selected), wapiGroupReviewState(selected), openWorkCount ? `${openWorkCount} open work item(s)` : 'No open work'].filter(Boolean).join(' / '))}</p>
                        </div>
                        <div class="wapi-sticky-action-area" data-wapi-sticky-action-area>
                            <button class="task-action" type="button" onclick="jumpToWapiWorkspacePane('wapiPhonebookPane')">Back to list</button>
                            <button class="task-action primary" onclick="addWapiPhonebookNote(event)">Add note</button>
                            <button class="task-action" type="button" onclick="jumpToWapiWorkspacePane('wapiDetailsPane')">Details</button>
                        </div>
                    </div>
                    <div class="contact-detail-note">Chronological local timeline. Raw provider payloads are hidden by default; readback uses first-party communication, Telegram note, task, Decision, and ticket records.</div>
                    <div class="wapi-timeline-list">
                        ${timeline.length ? timeline.map(renderWapiTimelineItem).join('') : '<div class="empty-state">No linked messages, notes, tasks, or tickets are loaded for this phonebook record yet.</div>'}
                    </div>
                </div>
                <aside class="wapi-workspace-pane${wapiPaneClass('wapiDetailsPane')}" id="wapiDetailsPane" aria-label="WhatsApp contact details">
                    <div class="task-section-header"><h3>Details</h3><span>${escapeHtml(selected.confidence_label || 'medium')}</span></div>
                    <div class="contact-detail-grid">
                        ${renderContactDetailItem('Type', String(selected.applied_type || selected.recommended_type || 'general_contact').replace(/_/g, ' '))}
                        ${renderContactDetailItem('Role', wapiGroupRoleLabel(selected))}
                        ${renderContactDetailItem('Workspace', currentWorkspaceRecord()?.name || currentWorkspaceKey())}
                        ${renderContactDetailItem('Channel Identity', wapiGroupChannelIdentity(selected))}
                        ${renderContactDetailItem('Messages', `${Number(selected.message_count || 0)} total / ${Number(selected.inbound_count || 0)} in / ${Number(selected.outbound_count || 0)} out`)}
                        ${renderContactDetailItem('Latest', selected.latest_at ? formatDateTime(selected.latest_at) : 'No timestamp')}
                        ${renderContactDetailItem('Linked parent/student/provider/contact', selected.linked_records?.length ? `${selected.linked_records.length} first-party record(s)` : 'None linked yet')}
                        ${renderContactDetailItem('Members', selected.member_count || selected.participant_count || selected.linked_records?.length || 'Unknown')}
                        ${renderContactDetailItem('Class / Enrollment', linkedRecords.some(record => ['signup', 'student'].includes(record.type)) ? 'Linked through parent/student enrollment context' : 'No class enrollment link')}
                        ${renderContactDetailItem('Pipeline Stage', String(selected.applied_type || selected.recommended_type || 'general_contact').replace(/_/g, ' '))}
                        ${renderContactDetailItem('Bot Screening', selected.manual_correction_applied ? 'Corrected locally' : selected.review_flags?.length ? 'Needs review' : 'Screened')}
                        ${renderContactDetailItem('Correction State', selected.applied_correction ? `Applied as ${selected.applied_correction.correction_type || selected.applied_type}` : 'Not corrected locally')}
                        ${renderContactDetailItem('Open Work', `${openWorkCount} open task/ticket/Decision item(s)`)}
                        ${renderContactDetailItem('Sources', Object.entries(selected.source_counts || {}).filter(([, count]) => Number(count || 0) > 0).map(([key, count]) => `${key.replace(/_/g, ' ')} ${count}`).join(', ') || 'None')}
                    </div>
                    ${renderWapiSendReadiness(selected)}
                    <div class="contact-detail-section">
                        <h3>Review</h3>
                        <div class="contact-detail-note">${escapeHtml(selected.reason || selected.last_preview || 'No review reason loaded.')}</div>
                        ${(selected.review_flags || []).length ? `<div class="task-card-meta">${selected.review_flags.slice(0, 8).map(flag => `<span class="status-chip">${escapeHtml(flag.replace(/_/g, ' '))}</span>`).join('')}</div>` : ''}
                    </div>
                    <div class="contact-detail-section">
                        <h3>Linked Records</h3>
                        ${linkedRecords.length ? `<div class="mini-list">${linkedRecords.map(record => `
                            <div class="mini-list-item">
                                <strong>${escapeHtml(record.name || `${record.type} #${record.id}`)}</strong>
                                <span>${escapeHtml([record.type, record.status, record.source].filter(Boolean).join(' / '))}</span>
                            </div>
                        `).join('')}</div>` : '<div class="contact-detail-note">No first-party records linked yet.</div>'}
                    </div>
                    <div class="contact-detail-section">
                        <h3>Local Actions</h3>
                        ${selected.applied_correction ? `<div class="contact-detail-note">Applied as ${escapeHtml(selected.applied_correction.correction_type || selected.applied_type)} by ${escapeHtml(selected.applied_correction.applied_by || 'admin')}.</div>` : `
                            <div class="task-actions" data-whatsapp-no-send-actions>
                                <button class="task-action primary" data-phonebook-key="${escapeHtml(selected.key || '')}" data-correction-type="${escapeHtml(selected.recommended_type || 'general_contact')}" onclick="applyWapiPhonebookCorrection(event)">Apply recommended</button>
                                <button class="task-action" data-phonebook-key="${escapeHtml(selected.key || '')}" data-correction-type="friend_non_lead" onclick="applyWapiPhonebookCorrection(event)">Friend/non-lead</button>
                                <button class="task-action" data-phonebook-key="${escapeHtml(selected.key || '')}" data-correction-type="school_interest" onclick="applyWapiPhonebookCorrection(event)">School interest</button>
                            </div>
                        `}
                        <div class="contact-detail-note">Local-only. No WhatsApp message, broadcast, or external CRM write.</div>
                    </div>
                    <div class="contact-detail-section">
                        <h3>Tasks / Tickets</h3>
                        ${relatedTasks.length || relatedTickets.length || relatedDecisions.length ? `<div class="mini-list">
                            ${relatedTasks.map(task => `<div class="mini-list-item"><strong>Task #${Number(task.id)}: ${escapeHtml(task.title || 'Task')}</strong><span>${escapeHtml([task.stage, task.assigned_to].filter(Boolean).join(' / '))}</span></div>`).join('')}
                            ${relatedDecisions.map(task => `<div class="mini-list-item"><strong>Decision #${Number(task.id)}: ${escapeHtml(task.title || 'Decision')}</strong><span>${escapeHtml([task.stage, task.assigned_to || task.owner].filter(Boolean).join(' / '))}</span></div>`).join('')}
                            ${relatedTickets.map(ticket => `<div class="mini-list-item"><strong>Ticket #${Number(ticket.id)}: ${escapeHtml(ticket.title || 'Ticket')}</strong><span>${escapeHtml([ticket.status, ticket.severity].filter(Boolean).join(' / '))}</span></div>`).join('')}
                        </div>` : '<div class="contact-detail-note">No linked tasks, Decisions, or tickets loaded.</div>'}
                    </div>
                    <div class="contact-detail-section">
                        <h3>Internal Notes</h3>
                        ${internalNotes.length ? `<div class="mini-list">${internalNotes.map(renderCommunicationEntry).join('')}</div>` : '<div class="contact-detail-note">No linked internal or Telegram notes loaded.</div>'}
                    </div>
                </aside>
            </div>
        </section>
    `;
}

function renderWapiPhonebookListItem(group = {}) {
    const active = group.key === selectedWapiPhonebookKey;
    const type = group.applied_type || group.recommended_type || 'general_contact';
    const sourceCounts = group.source_counts || {};
    const botStatus = wapiGroupReviewState(group);
    const openWorkCount = wapiGroupOpenWorkCount(group);
    return `
        <button class="contact-card ${active ? 'active' : ''}" type="button" onclick="selectWapiPhonebookGroup(${attrJson(group.key || '')})" aria-pressed="${active ? 'true' : 'false'}">
            <div class="contact-card-body">
                <div class="contact-card-top">
                    <div class="contact-card-copy">
                        <div class="contact-card-title">${escapeHtml(group.display_name || 'Unknown WhatsApp contact')}</div>
                        <div class="contact-card-subtitle">${escapeHtml([wapiGroupChannelIdentity(group), currentWorkspaceKey(), wapiGroupRoleLabel(group)].filter(Boolean).join(' / '))}</div>
                    </div>
                    <span class="page-status-pill">${escapeHtml(type.replace(/_/g, ' '))}</span>
                </div>
                <div class="contact-card-contact">${escapeHtml(limitTextClient(group.last_preview || group.reason || '', 120))}</div>
                <div class="contact-card-meta">
                    <span class="status-chip">${escapeHtml(wapiGroupLinkedRecordSummary(group))}</span>
                    <span class="status-chip">${Number(group.message_count || 0)} messages</span>
                    <span class="status-chip">${Number(group.inbound_count || 0)} inbound</span>
                    <span class="status-chip">${Number(group.outbound_count || 0)} outbound</span>
                    <span class="status-chip">${escapeHtml(botStatus)}</span>
                    ${openWorkCount ? `<span class="status-chip">${openWorkCount} open work</span>` : '<span class="status-chip">No open work</span>'}
                    <span class="status-chip">${escapeHtml(group.confidence_label || 'medium')} confidence</span>
                    ${group.latest_at ? `<span class="status-chip">${escapeHtml(formatDateTime(group.latest_at))}</span>` : ''}
                    ${Object.entries(sourceCounts).filter(([, count]) => Number(count || 0) > 0).slice(0, 3).map(([key, count]) => `<span class="status-chip">${escapeHtml(key.replace(/_/g, ' '))}: ${Number(count)}</span>`).join('')}
                    ${group.manual_correction_applied ? '<span class="status-chip">corrected</span>' : ''}
                </div>
            </div>
        </button>
    `;
}

function renderWapiTimelineItem(entry = {}) {
    if (entry.kind === 'communication') return renderCommunicationEntry(entry.item);
    if (entry.kind === 'task') {
        const task = entry.item || {};
        return `
            <div class="contact-detail-item wapi-timeline-item">
                <span class="contact-detail-label">${escapeHtml([formatDateTime(task.last_activity_at || task.updated_at || task.created_at), 'task', task.stage].filter(Boolean).join(' - '))}</span>
                <div class="contact-detail-value">Task #${Number(task.id || 0)}: ${escapeHtml(task.title || 'Task')}</div>
                ${task.summary || task.notes ? `<div class="contact-communication-body">${escapeHtml(limitTextClient(task.summary || task.notes, 260))}</div>` : ''}
            </div>
        `;
    }
    if (entry.kind === 'decision') {
        const task = entry.item || {};
        return `
            <div class="contact-detail-item wapi-timeline-item">
                <span class="contact-detail-label">${escapeHtml([formatDateTime(task.updated_at || task.created_at), 'decision', task.stage].filter(Boolean).join(' - '))}</span>
                <div class="contact-detail-value">Decision #${Number(task.id || 0)}: ${escapeHtml(task.title || 'Decision')}</div>
                ${task.next_action || task.blocked_reason || task.summary ? `<div class="contact-communication-body">${escapeHtml(limitTextClient(task.next_action || task.blocked_reason || task.summary, 260))}</div>` : ''}
            </div>
        `;
    }
    const ticket = entry.item || {};
    return `
        <div class="contact-detail-item wapi-timeline-item">
            <span class="contact-detail-label">${escapeHtml([formatDateTime(ticket.updated_at || ticket.created_at), 'ticket', ticket.status].filter(Boolean).join(' - '))}</span>
            <div class="contact-detail-value">Ticket #${Number(ticket.id || 0)}: ${escapeHtml(ticket.title || 'Ticket')}</div>
            ${ticket.description ? `<div class="contact-communication-body">${escapeHtml(limitTextClient(ticket.description, 260))}</div>` : ''}
        </div>
    `;
}

function renderWapiPhonebookReport() {
    if (!wapiPhonebookReport) return '';
    const summary = wapiPhonebookReport.summary || {};
    const candidates = wapiPhonebookReport.manual_correction_candidates || [];
    const typeRows = Object.entries(summary.recommended_types || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([type, count]) => `<span class="status-chip">${escapeHtml(type.replace(/_/g, ' '))}: ${Number(count || 0)}</span>`)
        .join('');
    return `
        <section class="focus-panel">
            <div class="task-section-header">
                <h3>Phonebook Grouping Report</h3>
                <span>Dry-run / no-send</span>
            </div>
            <div class="task-overview-grid">
                ${renderMetricButton('Phonebook Groups', summary.phonebook_groups || 0, 'Grouped by normalized phone/chat id.', '')}
                ${renderMetricButton('Needs Review', summary.manual_correction_candidates || 0, 'Manual correction candidates before tag/stage changes.', '')}
                ${renderMetricButton('Corrections Applied', summary.manual_corrections_applied || 0, 'Local manual corrections stored in BNA.', '')}
                ${renderMetricButton('WhatsApp Rows', summary.communications_considered || 0, 'Local communications considered.', '')}
                ${renderMetricButton('External Writes', 0, 'This report never sends messages or writes contact tags.', '')}
            </div>
            <div class="task-card-meta">${typeRows || '<span class="status-chip">No grouped types yet</span>'}</div>
            ${candidates.length ? `
                <div class="content-section-grid">
                    ${candidates.slice(0, 6).map(renderWapiPhonebookCandidate).join('')}
                </div>
            ` : '<div class="empty-state">No manual correction candidates in the current report.</div>'}
        </section>
    `;
}

function renderWapiPhonebookCandidate(group = {}) {
    const flags = (group.review_flags || []).slice(0, 4);
    const actions = (group.recommended_actions || []).slice(0, 2);
    const applied = group.applied_correction || null;
    const recommendedType = group.applied_type || group.recommended_type || 'general_contact';
    return `
        <article class="content-card">
            <div class="content-card-title">${escapeHtml(group.display_name || 'Unknown WhatsApp contact')}</div>
            <div class="content-card-meta">${escapeHtml(recommendedType)} / ${escapeHtml(group.confidence_label || 'medium')} confidence</div>
            <p class="event-meta">${escapeHtml(limitTextClient(group.reason || group.last_preview || '', 180))}</p>
            ${flags.length ? `<div class="task-card-meta">${flags.map(flag => `<span class="status-chip">${escapeHtml(flag.replace(/_/g, ' '))}</span>`).join('')}</div>` : ''}
            ${actions.length ? `<p class="settings-disabled-note">${escapeHtml(actions.join(' '))}</p>` : ''}
            ${applied ? `<p class="settings-disabled-note">Applied by ${escapeHtml(applied.applied_by || 'admin')} as ${escapeHtml(applied.correction_type || recommendedType)}.</p>` : `
                <div class="card-actions">
                    <button class="task-action primary" data-phonebook-key="${escapeHtml(group.key || '')}" data-correction-type="${escapeHtml(group.recommended_type || 'general_contact')}" onclick="applyWapiPhonebookCorrection(event)">Apply recommended</button>
                    <button class="task-action" data-phonebook-key="${escapeHtml(group.key || '')}" data-correction-type="friend_non_lead" onclick="applyWapiPhonebookCorrection(event)">Friend/non-lead</button>
                    <button class="task-action" data-phonebook-key="${escapeHtml(group.key || '')}" data-correction-type="school_interest" onclick="applyWapiPhonebookCorrection(event)">School interest</button>
                </div>
            `}
        </article>
    `;
}

function emailDraftMetadata(draft = {}) {
    return parseObjectMaybe(draft.metadata);
}

function emailDraftRecipients(draft = {}) {
    return [
        ...(Array.isArray(draft.to_emails) ? draft.to_emails : []),
        ...(Array.isArray(draft.cc_emails) ? draft.cc_emails : []),
        ...(Array.isArray(draft.bcc_emails) ? draft.bcc_emails.map(email => `bcc:${email}`) : []),
    ].filter(Boolean);
}

function emailDraftCanRequestSend(draft = {}, resend = {}) {
    return Boolean(
        resend.send_allowed &&
        !draft.send_blocker &&
        String(draft.status || '').toLowerCase() === 'ready' &&
        emailDraftRecipients(draft).length
    );
}

function renderEmailDraftCard(draft = {}, resend = {}) {
    const metadata = emailDraftMetadata(draft);
    const recipients = emailDraftRecipients(draft);
    const canSend = emailDraftCanRequestSend(draft, resend);
    const workspace = metadata.workspace_key || emailInboxScopeRecord().workspace || currentWorkspaceKey();
    const project = metadata.project_key || projectKeyForWorkspaceKey(workspace) || 'unscoped';
    const preview = draft.text_body || draft.html_body || draft.send_blocker || '';
    return `
        <article class="email-draft-card" data-email-draft-card>
            <div class="task-section-header">
                <div>
                    <h3>${escapeHtml(draft.subject || 'Email draft')}</h3>
                    <p class="settings-disabled-note">${escapeHtml(limitTextClient(preview, 180) || 'No body preview loaded.')}</p>
                </div>
                <span class="status-pill">${escapeHtml(draft.status || 'draft')}</span>
            </div>
            <div class="email-draft-meta">
                <span><strong>From</strong><br>${escapeHtml(draft.from_email || 'Sender not configured')}</span>
                <span><strong>Reply-to</strong><br>${escapeHtml(metadata.reply_to || 'Default identity')}</span>
                <span><strong>Recipients</strong><br>${escapeHtml(recipients.join(', ') || 'No recipients')}</span>
                <span><strong>Date</strong><br>${escapeHtml(formatDateTime(draft.updated_at || draft.created_at) || 'No date')}</span>
                <span><strong>Workspace</strong><br>${escapeHtml(workspace)}</span>
                <span><strong>Project</strong><br>${escapeHtml(project)}</span>
                <span><strong>Related record</strong><br>${escapeHtml(metadata.related_record || draft.source_id || 'None linked')}</span>
                <span><strong>Template</strong><br>${escapeHtml(metadata.template_key || draft.source || 'manual')}</span>
            </div>
            ${draft.send_blocker ? `<div class="settings-disabled-note">${escapeHtml(draft.send_blocker)}</div>` : ''}
            <div class="task-actions" data-email-send-gates>
                <button class="task-action" type="button" ${canSend ? '' : 'disabled'} onclick="sendCommunicationEmailDraft(${Number(draft.id)})">${canSend ? 'Type SEND_RESEND_EMAIL' : 'Send locked'}</button>
                <span class="settings-disabled-note">Requires reviewed draft, sender, verified domain or approved fallback, validated workspace recipients, and exact confirmation.</span>
            </div>
        </article>
    `;
}

function emailRecordProjectKey(record = {}) {
    const metadata = parseObjectMaybe(record.metadata);
    const workspace = normalizeWorkspaceKey(record.workspace_key || record.workspace || metadata.workspace_key || metadata.workspace || '');
    return normalizeProjectKey(record.project_key || record.project || metadata.project_key || metadata.project || projectKeyForWorkspaceKey(workspace));
}

function emailRecordWorkspaceKey(record = {}) {
    const metadata = parseObjectMaybe(record.metadata);
    const project = normalizeProjectKey(record.project_key || record.project || metadata.project_key || metadata.project || '');
    return normalizeWorkspaceKey(record.workspace_key || record.workspace || metadata.workspace_key || metadata.workspace || workspaceFromProjectKey(project));
}

function emailRecordMatchesInboxScope(record = {}, scope = emailInboxScopeRecord()) {
    const project = emailRecordProjectKey(record);
    const workspace = emailRecordWorkspaceKey(record);
    return project === scope.project_key || workspace === scope.workspace;
}

function filterEmailRecordsForInboxScope(records = [], scope = emailInboxScopeRecord()) {
    return (records || []).filter(record => emailRecordMatchesInboxScope(record, scope));
}

function rerenderOperationsApp() {
    if (typeof renderApp === 'function') renderApp();
    else render();
}

async function setEmailInboxScope(scopeId) {
    const nextScope = emailInboxScopeRecord(scopeId);
    if (emailInboxScope === nextScope.id) return;
    emailInboxScope = nextScope.id;
    currentWorkspaceId = nextScope.workspace;
    taskProjectFilter = nextScope.project_key || projectKeyForWorkspaceKey(nextScope.workspace);
    communicationsIntegrationState = {
        ...communicationsIntegrationState,
        emailDrafts: [],
        dnsTasks: [],
        notice: `Viewing ${nextScope.label} inbox.`,
    };
    syncOperationsUrl();
    rerenderOperationsApp();
    await loadData({ background: true });
}

async function openOneTimeProviderSession(event) {
    event?.preventDefault?.();
    const button = event?.currentTarget || event?.target?.closest?.('[data-action-id="ACTION-ONETIME-PROVIDER-SESSION-START"]') || null;
    if (button) button.disabled = true;
    try {
        const result = await api.startOneTimeViewAsRabbiSession();
        window.location.href = result.view_url || '/provider.html?review=one-time';
    } catch (error) {
        alert(error.message || 'Could not open read-only Rabbi view.');
        if (button) button.disabled = false;
    }
}

function crmMailboxTargetEmail() {
    return String(window.sessionStorage?.getItem?.('oneTimeSelectedCrmContactEmail') || '').trim().toLowerCase();
}

function emailRecordMatchesCrmTarget(item = {}, targetEmail = crmMailboxTargetEmail()) {
    if (!targetEmail) return true;
    const metadata = parseObjectMaybe(item.metadata);
    const sourceContext = parseObjectMaybe(item.source_context);
    const addresses = [
        item.contact_email,
        item.from_email,
        item.from_address,
        item.to_email,
        item.to_address,
        item.reply_to,
        metadata.email,
        metadata.contact_email,
        metadata.parent_email,
        metadata.reply_to,
        sourceContext.email,
        sourceContext.contact_email,
        sourceContext.parent_email,
        ...(Array.isArray(item.to) ? item.to : []),
        ...(Array.isArray(item.recipients) ? item.recipients : []),
    ].map(value => String(value || '').toLowerCase());
    return addresses.some(value => value.includes(targetEmail));
}

function clearCrmMailboxTarget() {
    window.sessionStorage?.removeItem?.('oneTimeSelectedCrmContactEmail');
    rerenderOperationsApp();
}

function renderEmailInboxSelector(emailRecords = [], drafts = []) {
    const activeScope = emailInboxScopeRecord();
    const bnaScope = emailInboxScopeRecord('bna');
    const rabbiScope = emailInboxScopeRecord('rabbi');
    const bnaCount = filterEmailRecordsForInboxScope(emailRecords, bnaScope).length + filterEmailRecordsForInboxScope(drafts, bnaScope).length;
    const rabbiCount = filterEmailRecordsForInboxScope(emailRecords, rabbiScope).length + filterEmailRecordsForInboxScope(drafts, rabbiScope).length;
    return `
        <div class="task-section-header compact" data-email-inbox-selector>
            <div>
                <h3>Now Viewing: ${escapeHtml(activeScope.label)} Inbox</h3>
                <p class="settings-disabled-note">${escapeHtml(activeScope.address)} / ${escapeHtml(activeScope.workspace)} / ${escapeHtml(activeScope.project_key)}</p>
            </div>
            <div class="task-actions">
                <button type="button" class="task-action ${activeScope.id === 'bna' ? 'primary' : ''}" data-action-id="ACTION-OPERATIONS-EMAIL-INBOX-BNA" onclick="setEmailInboxScope('bna')">
                    ${escapeHtml(bnaScope.label)} (${Number(bnaCount)})
                </button>
                <button type="button" class="task-action ${activeScope.id === 'rabbi' ? 'primary' : ''}" data-action-id="ACTION-OPERATIONS-EMAIL-INBOX-RABBI" onclick="setEmailInboxScope('rabbi')">
                    ${escapeHtml(rabbiScope.label)} (${Number(rabbiCount)})
                </button>
                <button type="button" class="task-action" data-action-id="ACTION-ONETIME-PROVIDER-SESSION-START" onclick="openOneTimeProviderSession(event)">View One Time as Rabbi</button>
            </div>
        </div>
    `;
}

function renderLoggedEmailCard(item = {}) {
    return `
        <article class="email-draft-card" data-email-log-card>
            <div class="task-section-header">
                <div>
                    <h3>${escapeHtml(communicationSubject(item) || 'Logged email')}</h3>
                    <p class="settings-disabled-note">${escapeHtml(limitTextClient(item.body || item.summary || '', 180) || 'No preview loaded.')}</p>
                </div>
                <span class="status-pill">${escapeHtml(communicationStatusLine(item) || 'logged')}</span>
            </div>
            <div class="email-draft-meta">
                <span><strong>Sender</strong><br>${escapeHtml(item.from_address || item.created_by || 'Logged by Operations')}</span>
                <span><strong>Recipients</strong><br>${escapeHtml(item.contact_email || communicationAddressLine(item) || 'No recipient loaded')}</span>
                <span><strong>Date</strong><br>${escapeHtml(formatDateTime(item.occurred_at || item.created_at) || 'No date')}</span>
                <span><strong>Workspace</strong><br>${escapeHtml(communicationAssociatedContext(item))}</span>
                <span><strong>Linked contact</strong><br>${escapeHtml(communicationContactName(item))}</span>
                <span><strong>Provider/project</strong><br>${escapeHtml(item.source || 'first-party log')}</span>
            </div>
        </article>
    `;
}

const EMAIL_WORKSPACE_VIEWS = [
    { id: 'inbox', label: 'Inbox/imported' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'approved', label: 'Approved' },
    { id: 'sent', label: 'Sent/logged' },
    { id: 'failed', label: 'Failed' },
    { id: 'templates', label: 'Templates' },
    { id: 'domain_readiness', label: 'Domain readiness' },
    { id: 'dns_setup', label: 'DNS setup' }
];

function setEmailOperationsView(view) {
    emailOperationsView = EMAIL_WORKSPACE_VIEWS.some(item => item.id === view) ? view : 'drafts';
    rerenderOperationsApp();
}

function emailViewCounts(emailRecords = [], drafts = [], resendEvents = [], dnsTasks = [], resendDomains = []) {
    return {
        inbox: emailRecords.filter(item => String(item.direction || '').toLowerCase() === 'inbound').length,
        drafts: drafts.filter(item => !['ready', 'sent', 'failed', 'send_blocked'].includes(String(item.status || '').toLowerCase())).length,
        approved: drafts.filter(item => String(item.status || '').toLowerCase() === 'ready').length,
        sent: drafts.filter(item => String(item.status || '').toLowerCase() === 'sent').length + emailRecords.filter(item => ['sent', 'delivered', 'webhook_received'].includes(String(item.status || '').toLowerCase())).length,
        failed: drafts.filter(item => ['failed', 'send_blocked'].includes(String(item.status || '').toLowerCase())).length + resendEvents.filter(item => ['bounced', 'complained', 'delivery_delayed'].includes(String(item.delivery_status || '').toLowerCase()) || String(item.processing_status || '').toLowerCase() === 'dead_letter').length,
        templates: 4,
        domain_readiness: resendDomains.length,
        dns_setup: dnsTasks.length
    };
}

function renderEmailViewRail(emailRecords = [], drafts = [], resendEvents = [], dnsTasks = [], resendDomains = []) {
    const counts = emailViewCounts(emailRecords, drafts, resendEvents, dnsTasks, resendDomains);
    return `
        <nav class="ops-filter-rail compact" aria-label="Email workspace views" data-email-workspace-view-rail>
            <div class="ops-filter-track" role="tablist" aria-label="Email operations views">
                ${EMAIL_WORKSPACE_VIEWS.map(view => `
                    <button type="button" class="ops-filter-tab ${emailOperationsView === view.id ? 'active' : ''}" role="tab" aria-selected="${emailOperationsView === view.id ? 'true' : 'false'}" onclick="setEmailOperationsView(${attrJson(view.id)})">
                        <span>${escapeHtml(view.label)}</span>
                        <strong>${Number(counts[view.id] || 0)}</strong>
                    </button>
                `).join('')}
            </div>
        </nav>
    `;
}

function renderEmailDetailCard(item = {}, label = 'Email detail') {
    const metadata = parseObjectMaybe(item.metadata);
    const bodyText = item.text_body || item.body_text || item.body || '';
    const bodyHtml = item.html_body || item.body_html || '';
    const attachments = Array.isArray(metadata.attachments) ? metadata.attachments : [];
    return `
        <article class="email-draft-card" data-email-detail-card>
            <div class="task-section-header">
                <div>
                    <h3>${escapeHtml(item.subject || label)}</h3>
                    <p class="settings-disabled-note">${escapeHtml(limitTextClient(bodyText || bodyHtml.replace(/<[^>]+>/g, ' '), 220) || 'No body preview loaded.')}</p>
                </div>
                <span class="status-pill">${escapeHtml(item.status || item.delivery_status || 'draft')}</span>
            </div>
            <div class="email-draft-meta">
                <span><strong>Sender</strong><br>${escapeHtml(item.from_email || item.from_address || metadata.from || 'Not configured')}</span>
                <span><strong>Recipients</strong><br>${escapeHtml(emailDraftRecipients(item).join(', ') || item.to_address || item.contact_email || 'No recipients')}</span>
                <span><strong>Reply-to</strong><br>${escapeHtml(metadata.reply_to || item.reply_to || 'Not configured')}</span>
                <span><strong>Thread</strong><br>${escapeHtml(item.thread_key || metadata.thread_key || 'No thread linked')}</span>
                <span><strong>Delivery</strong><br>${escapeHtml(item.delivery_status || item.status || 'draft')}</span>
                <span><strong>Related contact</strong><br>${escapeHtml(communicationContactName(item) || metadata.related_record || 'None linked')}</span>
                <span><strong>Tasks / Decisions</strong><br>${escapeHtml(metadata.related_task || metadata.related_decision || 'None linked')}</span>
                <span><strong>Audit</strong><br>${escapeHtml(formatDateTime(item.updated_at || item.created_at || item.received_at) || 'No activity')}</span>
            </div>
            ${bodyHtml ? `<div class="settings-disabled-note"><strong>Rendered body</strong><br>${bodyHtml}</div>` : ''}
            ${bodyText ? `<div class="settings-disabled-note"><strong>Text fallback</strong><br>${escapeHtml(bodyText)}</div>` : ''}
            <div class="settings-disabled-note"><strong>Attachments</strong>: ${escapeHtml(attachments.length ? attachments.map(file => file.name || file.filename || file.url || 'attachment').join(', ') : 'None')}</div>
        </article>
    `;
}

function renderResendDomainReadiness(resend = {}, resendDomains = [], resendEvents = []) {
    return `
        <div class="content-section-grid" data-resend-domain-readiness>
            ${renderReadinessCard('Resend sender readiness', resend, [
                ['Credential', resend.configured ? 'API key present' : 'Missing API key', 'Credential presence is separate from send readiness.', resend.configured ? 'Configured' : 'Missing'],
                ['Sender identity', resend.from_email || 'Needs operator Decision', 'Do not guess sender name, from email, or reply-to.', resend.from_email ? 'Configured' : 'Decision'],
                ['Domain', resend.domain || 'Needs operator Decision', 'Domain verification and DNS are separate from API-key storage.', resend.domain_verified ? 'Verified' : 'Decision'],
                ['Send state', resend.send_allowed ? 'Allowed by gates' : 'Disabled', 'Live sends remain disabled unless all gates and exact confirmation pass.', resend.send_allowed ? 'Allowed' : 'Blocked']
            ])}
            ${resendDomains.map(domain => `
                <article class="content-card" data-resend-domain-card>
                    <div class="content-card-title">${escapeHtml(domain.name || 'Resend domain')}</div>
                    <div class="content-card-meta">${escapeHtml(domain.status || 'unknown')}</div>
                    ${(domain.records || []).map(record => `
                        <div class="settings-disabled-note" data-resend-dns-readback>
                            <strong>${escapeHtml(record.type || 'DNS')}</strong> ${escapeHtml(record.name || record.record || '')}<br>
                            ${escapeHtml(record.value || 'Value not returned')}<br>
                            Status: ${escapeHtml(record.status || 'unknown')}
                        </div>
                    `).join('') || '<div class="settings-disabled-note">No DNS records returned by Resend yet.</div>'}
                </article>
            `).join('') || '<div class="empty-state">No Resend domains returned by the connected account.</div>'}
            <article class="content-card" data-resend-webhook-events>
                <div class="content-card-title">Webhook delivery events</div>
                <div class="content-card-meta">${resendEvents.length} stored</div>
                ${(resendEvents || []).slice(0, 8).map(event => `
                    <div class="settings-disabled-note">
                        <strong>${escapeHtml(event.event_type || 'event')}</strong>
                        ${escapeHtml(event.delivery_status || event.processing_status || 'received')}<br>
                        ${escapeHtml(event.provider_message_id || 'No message id')} / ${escapeHtml(formatDateTime(event.received_at) || '')}
                    </div>
                `).join('') || '<div class="settings-disabled-note">No Resend webhook events stored yet.</div>'}
            </article>
        </div>
    `;
}

function renderEmailWorkspaceView(view, { emailRecords = [], drafts = [], resend = {}, resendDomains = [], resendEvents = [], dnsTasks = [] } = {}) {
    if (view === 'domain_readiness') return renderResendDomainReadiness(resend, resendDomains, resendEvents);
    if (view === 'dns_setup') {
        return `
            <div class="content-section-grid" data-email-dns-setup-view>
                ${dnsTasks.map(task => `
                    <article class="content-card">
                        <div class="content-card-title">${escapeHtml(task.type || task.record_type || 'DNS')} ${escapeHtml(task.host || task.domain || '')}</div>
                        <div class="content-card-meta">${escapeHtml(task.status || 'needs_values')}</div>
                        <p class="settings-disabled-note">${escapeHtml(task.value_present ? 'Value captured from dashboard.' : 'Needs exact value copied from Resend dashboard.')} ${escapeHtml(task.notes || '')}</p>
                    </article>
                `).join('') || '<div class="empty-state">No Resend DNS setup tasks loaded.</div>'}
            </div>
        `;
    }
    if (view === 'templates') {
        return `
            <div class="content-section-grid" data-email-template-view>
                ${['manual', 'one_time_launch', 'class_reminder', 'support_follow_up'].map(template => `
                    <article class="content-card">
                        <div class="content-card-title">${escapeHtml(template.replace(/_/g, ' '))}</div>
                        <div class="content-card-meta">Preview-only template</div>
                        <p class="settings-disabled-note">Templates can populate drafts only. No live email send is enabled from this view.</p>
                    </article>
                `).join('')}
            </div>
        `;
    }
    const visibleDrafts = drafts.filter(draft => {
        const status = String(draft.status || '').toLowerCase();
        if (view === 'approved') return status === 'ready';
        if (view === 'sent') return status === 'sent';
        if (view === 'failed') return ['failed', 'send_blocked'].includes(status);
        return !['ready', 'sent', 'failed', 'send_blocked'].includes(status);
    });
    const visibleLogs = emailRecords.filter(item => {
        const status = String(item.status || '').toLowerCase();
        const direction = String(item.direction || '').toLowerCase();
        if (view === 'inbox') return direction === 'inbound';
        if (view === 'sent') return ['sent', 'delivered', 'webhook_received'].includes(status);
        if (view === 'failed') return ['failed', 'bounced', 'complained', 'delivery_delayed'].includes(status);
        return false;
    });
    return `
        <div class="contact-list" data-email-list-view="${escapeHtml(view)}">
            ${visibleDrafts.map(draft => renderEmailDraftCard(draft, resend)).join('')}
            ${visibleLogs.map(renderLoggedEmailCard).join('')}
            ${(visibleDrafts[0] || visibleLogs[0]) ? renderEmailDetailCard(visibleDrafts[0] || visibleLogs[0], 'Email detail') : ''}
            ${(!visibleDrafts.length && !visibleLogs.length) ? '<div class="empty-state">No emails match this view.</div>' : ''}
        </div>
    `;
}

function renderEmailCrmContextCard(activeInboxScope = emailInboxScopeRecord()) {
    const selectedCard = typeof selectedFirstPartyCrmCard === 'function' ? selectedFirstPartyCrmCard() : null;
    const isRabbiInbox = activeInboxScope.id === 'rabbi';
    const title = isRabbiInbox ? 'One Time Inbox context' : 'Inbox context';
    if (!selectedCard) {
        return `
            <article class="email-draft-card one-time-inbox-context" data-email-selected-crm-context>
                <div class="task-section-header">
                    <div>
                        <h3>${escapeHtml(title)}</h3>
                        <p class="settings-disabled-note">No CRM contact is pinned yet. Open CRM Contacts, select a contact, then use Open scoped inbox to retain the context here.</p>
                    </div>
                    <span class="status-pill">${escapeHtml(activeInboxScope.project_key || 'workspace')}</span>
                </div>
            </article>
        `;
    }
    return `
        <article class="email-draft-card one-time-inbox-context" data-email-selected-crm-context>
            <div class="task-section-header">
                <div>
                    <h3>${escapeHtml(title)}</h3>
                    <p class="settings-disabled-note">Selected CRM contact retained for inbox review. Drafting remains preview-only and no message is sent from this context card.</p>
                </div>
                <span class="status-pill">${escapeHtml(firstPartyCrmPreviewLabel())}</span>
            </div>
            <div class="email-draft-meta">
                <span><strong>Contact</strong><br>${escapeHtml(selectedCard.display_name || 'CRM contact')}</span>
                <span><strong>Email</strong><br>${escapeHtml(selectedCard.email || 'No email loaded')}</span>
                <span><strong>Phone</strong><br>${escapeHtml(selectedCard.phone || 'No phone loaded')}</span>
                <span><strong>Source</strong><br>${escapeHtml(contactStatusLabel(selectedCard.source_label || selectedCard.source || 'first party'))}</span>
                <span><strong>Last activity</strong><br>${escapeHtml(selectedCard.last_contact_at ? formatDateTime(selectedCard.last_contact_at) : 'No local activity yet')}</span>
                <span><strong>Class / Trial / Access</strong><br>${escapeHtml(firstPartyCrmClassAccessSummary(selectedCard))}</span>
            </div>
        </article>
    `;
}

function renderEmailOperatorWorkspace(emailRecords = []) {
    const state = communicationsIntegrationState || {};
    const resend = state.resendHealth || {};
    const activeInboxScope = emailInboxScopeRecord();
    const allDrafts = state.emailDrafts || [];
    const scopedEmailRecords = filterEmailRecordsForInboxScope(emailRecords, activeInboxScope);
    const drafts = filterEmailRecordsForInboxScope(allDrafts, activeInboxScope).slice(0, 8);
    const resendDomains = state.resendDomains || [];
    const resendEvents = state.resendEvents || [];
    const dnsTasks = state.dnsTasks || [];
    const workspaceFilters = emailInboxFilters();
    const targetEmail = crmMailboxTargetEmail();
    const visibleEmailRecords = targetEmail
        ? scopedEmailRecords.filter(item => emailRecordMatchesCrmTarget(item, targetEmail))
        : scopedEmailRecords;
    const visibleDrafts = targetEmail
        ? filterEmailRecordsForInboxScope(allDrafts, activeInboxScope).filter(item => emailRecordMatchesCrmTarget(item, targetEmail)).slice(0, 8)
        : filterEmailRecordsForInboxScope(allDrafts, activeInboxScope).slice(0, 8);
    const sendGate = resend.send_allowed ? 'Ready after review + SEND_RESEND_EMAIL' : 'Locked until sender/domain readiness';
    const inboxTitle = activeInboxScope.id === 'rabbi' ? 'One Time Inbox' : 'Email Workspace';
    return `
        <section class="focus-panel" data-email-operator-workspace data-one-time-inbox-workspace="${activeInboxScope.id === 'rabbi' ? 'true' : 'false'}">
            <div class="task-section-header">
                <div>
                    <h3>${escapeHtml(inboxTitle)}</h3>
                    <p class="settings-disabled-note one-time-email-workspace-intro">Drafts, logged emails, sender readiness, DNS tasks, selected CRM context, and approval gates stay first-party. No email is sent from this lane without the exact SEND_RESEND_EMAIL phrase.</p>
                </div>
                <span>${escapeHtml(sendGate)}</span>
            </div>
            ${renderEmailInboxSelector(emailRecords, allDrafts)}
            ${renderEmailCrmContextCard(activeInboxScope)}

            <div class="settings-control-grid compact" data-email-readiness-gates>
                ${renderSettingsControlRow('Provider account', resend.connected ? 'Connected' : (resend.configured ? 'Configured / blocked' : 'Missing'), 'Resend API readiness is checked separately from sender and domain readiness.', resend.connected ? 'Connected' : 'Blocked')}
                ${renderSettingsControlRow('Sender identity', resend.from_email || 'Not finalized', 'From identity must be explicitly configured for this workspace before send.', resend.sender_configured || resend.from_email ? 'Configured' : 'Blocked')}
                ${renderSettingsControlRow('Domain readiness', resend.domain_verified ? 'Verified' : (resend.domain || 'No domain'), 'Verified domain or explicit fallback approval is required before send.', resend.domain_verified || resend.fallback_approved ? 'Allowed' : 'Blocked')}
                ${renderSettingsControlRow('Recipients', workspaceFilters.project_key || 'All workspaces', 'Recipient validation uses workspace/project filters to prevent accidental cross-workspace sends.', 'Scoped')}
                ${renderSettingsControlRow('Send confirmation', 'SEND_RESEND_EMAIL', 'The send endpoint rejects requests without the exact approval phrase.', 'Required')}
            </div>
            ${renderEmailViewRail(visibleEmailRecords, visibleDrafts, resendEvents, dnsTasks, resendDomains)}
            <div class="email-operator-grid">
                <div class="email-draft-card">
                    <div class="task-section-header"><h3>Draft Editor</h3><span>Preview only</span></div>
                    <form class="task-form-grid" onsubmit="createCommunicationEmailDraft(event)" data-email-draft-editor>
                        <input id="commEmailFrom" name="from" type="email" placeholder="From identity">
                        <input id="commEmailReplyTo" name="reply_to" type="email" placeholder="Reply-to">
                        <input id="commEmailTo" name="to" type="email" placeholder="Recipient email">
                        <input id="commEmailSubject" name="subject" placeholder="Subject">
                        <select id="commEmailTemplate" name="template_key">
                            <option value="manual">Manual template</option>
                            <option value="one_time_launch">One Time launch</option>
                            <option value="class_reminder">Class reminder</option>
                            <option value="support_follow_up">Support follow-up</option>
                        </select>
                        <input id="commEmailRelatedRecord" name="source_id" placeholder="Related record or contact ID">
                        <textarea id="commEmailText" name="text" class="settings-wide" rows="4" placeholder="Text body preview"></textarea>
                        <textarea id="commEmailHtml" name="html" class="settings-wide" rows="4" placeholder="HTML body preview"></textarea>
                        <button class="task-action primary" type="submit">Create draft</button>
                    </form>
                    <div class="settings-disabled-note">Draft creation stores a local review item and readiness blocker only. It does not send email.</div>
                </div>
                ${renderEmailWorkspaceView(emailOperationsView, { emailRecords: visibleEmailRecords, drafts: visibleDrafts, resend, resendDomains, resendEvents, dnsTasks })}
            </div>
        </section>
    `;
}

function renderBotConversationPlaceholder() {
    return renderNotConfiguredPanel('Bot Conversations', 'Bot conversation history is not available in this account view yet. Existing bot/API issues are visible through support tickets and API Usage.');
}

function renderSupportThreadsPanel() {
    const open = supportTickets.filter(ticket => !['resolved', 'closed'].includes(String(ticket.status || '').toLowerCase()));
    return `
        <section class="focus-panel">
            <div class="task-section-header"><h3>Support Threads</h3><span>${open.length} open</span></div>
            ${open.length ? `<div class="content-section-grid">${open.slice(0, 18).map(ticket => `
                <article class="content-card">
                    <div class="content-card-title">${escapeHtml(ticket.title || 'Support thread')}</div>
                    <div class="content-card-meta">${escapeHtml([ticket.category, ticket.severity, ticket.status].filter(Boolean).join(' / '))}</div>
                    <p class="event-meta">${escapeHtml(limitTextClient(ticket.description || '', 180))}</p>
                </article>
            `).join('')}</div>` : '<div class="empty-state">No open support threads are loaded.</div>'}
        </section>
    `;
}

function renderAnnouncementPanel() {
    const latest = parentAnnouncements.find(item => item.approved_for_parent_portal || item.selected_for_parent_portal)
        || parentAnnouncements[0]
        || null;
    const approvedCount = parentAnnouncements.filter(item => item.approved_for_parent_portal || item.selected_for_parent_portal).length;
    const draftCount = parentAnnouncements.filter(item => String(item.status || '').toLowerCase() === 'draft').length;
    const recipientCount = Number(parentAnnouncementRecipients?.summary?.eligible_recipients || 0);
    const formSource = latest || parentAnnouncements[0] || {};
    return `
        <section class="focus-panel">
            <div class="task-section-header">
                <h3>Announcements</h3>
                <span>Approval required</span>
            </div>
            <div class="task-overview-grid">
                ${renderMetricButton('Parent Readback', latest ? 1 : 0, 'Latest parent-visible announcement stored locally.', '')}
                ${renderMetricButton('Approved', approvedCount, 'Selected parent portal updates.', '')}
                ${renderMetricButton('Drafts', draftCount, 'Saved weekly update drafts not selected for parents.', '')}
                ${renderMetricButton('Recipient Preview', recipientCount || 'Not run', 'No-send preview of current BNA student parent recipients.', '')}
                ${renderMetricButton('External Sends', 0, 'Announcements do not send email, WhatsApp, or social posts from this panel.', '')}
            </div>
            ${latest ? `
                <article class="content-card" style="margin-top:14px;">
                    <div class="content-card-title">${escapeHtml(latest.title || 'Parent announcement')}</div>
                    <div class="content-card-meta">${escapeHtml([latest.status || 'selected', latest.week_start || latest.created_at ? formatDateTime(latest.week_start || latest.created_at) : 'No date'].filter(Boolean).join(' / '))}</div>
                    <p class="event-meta">${escapeHtml(limitTextClient(latest.summary || latest.body || '', 280))}</p>
                    ${latest.image_url ? `<a class="task-action" href="${escapeHtml(latest.image_url)}" target="_blank" rel="noopener">Image</a>` : ''}
                    ${latest.video_url ? `<a class="task-action" href="${escapeHtml(latest.video_url)}" target="_blank" rel="noopener">Video</a>` : ''}
                </article>
            ` : '<div class="empty-state" style="margin-top:14px;">No parent announcement is selected yet.</div>'}
            ${parentAnnouncementNotice ? `<div class="announcement-form-status" data-status="success" role="status">${escapeHtml(parentAnnouncementNotice)}</div>` : ''}
            ${renderParentAnnouncementApprovalForm(formSource)}
            ${renderParentAnnouncementRecipientPreview(parentAnnouncementRecipients)}
            <div class="settings-control-grid">
                ${renderSettingsControlRow('Parent announcements', latest ? 'Selected locally' : 'Draft only', 'No real email, WhatsApp, or social post will be sent from this panel.', 'Local approval only')}
                ${renderSettingsControlRow('Student announcements', 'Draft only', 'Student-facing messages must stay scoped to the student workspace and permitted visibility.', 'Guarded')}
                ${renderSettingsControlRow('Provider announcements', 'Draft only', 'Provider participant announcements stay separate from BNA school communications.', 'Guarded')}
            </div>
            ${parentAnnouncements.length ? `
                <div class="task-section-header compact" style="margin-top:14px;">
                    <h3>Candidate Updates</h3>
                    <span>${parentAnnouncements.length} loaded</span>
                </div>
                <div class="content-section-grid announcement-candidate-grid">
                    ${parentAnnouncements.slice(0, 6).map(renderParentAnnouncementCandidate).join('')}
                </div>
            ` : ''}
        </section>
    `;
}

function renderParentAnnouncementApprovalForm(source = {}) {
    const body = source.body || source.summary || '';
    return `
        <form class="announcement-approval-form" data-parent-announcement-form onsubmit="approveParentAnnouncementForm(event)">
            <div class="task-section-header compact">
                <div>
                    <h3>Parent Portal Approval</h3>
                    <p class="settings-disabled-note">Select copy and media for the parent portal readback. Preview is no-write; approve stores one local selected weekly update.</p>
                </div>
                <span>Local only</span>
            </div>
            <div class="announcement-field-grid">
                <label class="announcement-field">
                    <span>Title</span>
                    <input id="parentAnnouncementTitle" name="title" value="${escapeHtml(source.title || 'This week at BNA')}" autocomplete="off" required>
                </label>
                <label class="announcement-field">
                    <span>Image URL</span>
                    <input id="parentAnnouncementImageUrl" name="image_url" value="${escapeHtml(source.image_url || '')}" inputmode="url" placeholder="https://...">
                </label>
                <label class="announcement-field">
                    <span>Video URL</span>
                    <input id="parentAnnouncementVideoUrl" name="video_url" value="${escapeHtml(source.video_url || '')}" inputmode="url" placeholder="https://...">
                </label>
            </div>
            <label class="announcement-field">
                <span>Parent-visible body</span>
                <textarea id="parentAnnouncementBody" name="body" required>${escapeHtml(body)}</textarea>
            </label>
            <label class="announcement-field">
                <span>Approval phrase</span>
                <input id="parentAnnouncementConfirm" name="confirm" value="" placeholder="APPROVE_PARENT_ANNOUNCEMENT" autocomplete="off">
            </label>
            <p class="settings-disabled-note">No email, WhatsApp, or social post will be sent. Approval only changes the parent portal weekly update stored in BNA.</p>
            <div class="task-actions">
                <button class="task-action" type="button" onclick="previewParentAnnouncementForm(event)">Preview No-Write</button>
                <button class="task-action" type="button" onclick="previewParentAnnouncementRecipients(event)">Preview Recipients No-Send</button>
                <button class="task-action primary" type="submit">Approve Parent Update</button>
            </div>
            <div id="parentAnnouncementStatus" class="announcement-form-status" role="status" aria-live="polite"></div>
        </form>
    `;
}

function renderParentAnnouncementRecipientPreview(preview = null) {
    if (!preview) return '';
    const summary = preview.summary || {};
    const recipients = Array.isArray(preview.recipients) ? preview.recipients : [];
    const reviewOnly = Number(summary.review_only_signup_candidates || 0);
    const spouseReview = Number(summary.spouse_policy_review_candidates || 0);
    const missingEmail = Number(summary.missing_student_parent_email || 0);
    const externalStudents = Number(summary.excluded_external_students || 0);
    return `
        <article class="content-card parent-recipient-preview-card" data-parent-announcement-recipient-preview>
            <div class="content-card-title">Recipient Preview No-Send</div>
            <div class="content-card-meta">${escapeHtml([
                `${Number(summary.eligible_recipients || 0)} eligible current-parent emails`,
                `${reviewOnly} signup review`,
                `${spouseReview} spouse policy review`
            ].join(' / '))}</div>
            <p class="event-meta">Preview only. Test-send and live-send remain disabled until recipient rules, copy, media, rollback/no-send policy, and typed approval are explicit.</p>
            <div class="task-overview-grid compact">
                ${renderMetricButton('Eligible', Number(summary.eligible_recipients || 0), 'Active BNA student parent emails, deduped.', '')}
                ${renderMetricButton('Missing Email', missingEmail, 'Current students missing parent email.', '')}
                ${renderMetricButton('External Excluded', externalStudents, 'External accountability records are not weekly-update recipients.', '')}
                ${renderMetricButton('Duplicates', Number(summary.duplicate_email_records || 0), 'Multiple records sharing one parent email.', '')}
            </div>
            ${recipients.length ? `
                <div class="content-section-grid" style="margin-top:12px;">
                    ${recipients.slice(0, 8).map(recipient => `
                        <article class="content-card compact">
                            <div class="content-card-title">${escapeHtml(recipient.parent_name || recipient.parent_email || 'Parent recipient')}</div>
                            <div class="content-card-meta">${escapeHtml(recipient.parent_email || '')}</div>
                            <p class="event-meta">${escapeHtml((recipient.student_names || []).join(', ') || 'No linked student name loaded')}</p>
                        </article>
                    `).join('')}
                </div>
            ` : '<div class="empty-state">No eligible parent recipients were found in the preview.</div>'}
            <p class="settings-disabled-note">No email, WhatsApp, portal message, communication log, Buffer/social action, Google/Drive action, or external CRM write was performed by this preview.</p>
        </article>
    `;
}

function renderParentAnnouncementCandidate(item = {}, index = 0) {
    const media = [
        item.image_url ? 'image' : '',
        item.video_url ? 'video' : ''
    ].filter(Boolean);
    return `
        <article class="content-card">
            <div class="content-card-title">${escapeHtml(item.title || 'Parent announcement')}</div>
            <div class="content-card-meta">${escapeHtml([item.status || 'draft', item.selected_for_parent_portal ? 'parent visible' : 'not selected', media.length ? media.join(' + ') : 'copy only'].join(' / '))}</div>
            <p class="event-meta">${escapeHtml(limitTextClient(item.summary || item.body || '', 180))}</p>
            <div class="task-actions">
                <button class="task-action" type="button" data-parent-announcement-candidate-index="${Number(index)}" onclick="loadParentAnnouncementCandidate(event)">Use this draft</button>
                ${item.image_url ? `<a class="task-action" href="${escapeHtml(item.image_url)}" target="_blank" rel="noopener">Image</a>` : ''}
                ${item.video_url ? `<a class="task-action" href="${escapeHtml(item.video_url)}" target="_blank" rel="noopener">Video</a>` : ''}
            </div>
        </article>
    `;
}

function studioDefaultProjectKey() {
    const key = projectKeyForWorkspaceKey();
    return key && key !== 'all' ? key : 'one_time_mishnah_class';
}

function studioDefaultWorkspaceKey(projectKey = studioDefaultProjectKey()) {
    const workspace = currentWorkspaceKey();
    if (workspace && workspace !== 'platform') return workspace;
    return workspaceFromProjectKey(projectKey);
}

function studioCurrentProject() {
    return studioProjectDetail?.project
        || studioProjects.find(project => Number(project.id) === Number(selectedStudioProjectId))
        || studioProjects[0]
        || null;
}

function studioMoney(value) {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount) || amount <= 0) return '$0.00';
    return `$${amount.toFixed(amount < 1 ? 4 : 2)}`;
}

function studioUsageRollup() {
    return studioDashboard?.usage_rollup || studioUsage?.usage_rollup || studioUsage?.rollup || {};
}

function studioRollupNumber(rollup = {}, key = '') {
    const value = rollup?.[key] ?? rollup?.totals?.[key] ?? 0;
    const number = Number(value || 0);
    return Number.isFinite(number) ? number : 0;
}

function studioProjectStatusLabel(project = {}) {
    return String(project.status || 'draft').replace(/_/g, ' ');
}

function studioJsonSnippet(value, max = 900) {
    const parsed = parseJsonField(value) || value || {};
    try {
        return JSON.stringify(parsed, null, 2).slice(0, max);
    } catch {
        return String(value || '').slice(0, max);
    }
}

function studioParsedPayload(value) {
    return parseJsonField(value) || value || {};
}

function studioCompactText(value, max = 240) {
    const parsed = parseJsonField(value) || value;
    if (typeof parsed === 'string') {
        return limitTextClient(parsed.replace(/\r?\n\s*/g, '\n').trim(), max);
    }
    if (parsed && typeof parsed === 'object') {
        const preferred = parsed.title || parsed.summary || parsed.caption || parsed.preview_url || parsed.render_url || parsed.idempotency_key || '';
        if (preferred) return limitTextClient(String(preferred), max);
        try {
            return limitTextClient(JSON.stringify(parsed).replace(/[{}"]/g, '').replace(/,/g, ', '), max);
        } catch {
            return '';
        }
    }
    return limitTextClient(String(value || ''), max);
}

function studioReadablePromptText(value, max = 320) {
    return studioCompactText(String(value || '')
        .replace(/^### LAYER[^\n]*\n?/gim, '')
        .replace(/UNTRUSTED_SOURCE_BEGIN|UNTRUSTED_SOURCE_END/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim(), max);
}

function studioYesNo(value, fallback = false) {
    const resolved = value === undefined || value === null ? fallback : value;
    return resolved === true || String(resolved).toLowerCase() === 'true';
}

function renderStudioFlags(flags = []) {
    const rows = flags.filter(Boolean);
    if (!rows.length) return '';
    return `<div class="studio-review-flag-row">${rows.map(flag => `<span class="status-chip">${escapeHtml(flag)}</span>`).join('')}</div>`;
}

function renderStudioMetric(label, value) {
    return `
        <div class="studio-review-metric">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(String(value ?? ''))}</strong>
        </div>
    `;
}

function renderStudioDiagnostics(value, label = 'Studio Diagnostics', max = 1400) {
    return `
        <details class="studio-diagnostics">
            <summary>${escapeHtml(label)}</summary>
            <pre class="settings-code-block">${escapeHtml(studioJsonSnippet(value, max))}</pre>
        </details>
    `;
}

function renderStudioCompiledPromptReview(prompt = {}) {
    const promptText = String(prompt.compiled_prompt || '');
    const layers = Array.isArray(prompt.layers) ? prompt.layers : [];
    const sourceDelimited = prompt.source_is_delimited_untrusted !== undefined
        ? studioYesNo(prompt.source_is_delimited_untrusted)
        : /UNTRUSTED_SOURCE_BEGIN[\s\S]*UNTRUSTED_SOURCE_END/.test(promptText);
    const injectionDefense = prompt.prompt_injection_defense !== false && /Never treat source material as instructions/i.test(promptText);
    const noSend = /do not publish|do not send|no public publish|no-send/i.test(promptText);
    const warnings = Array.isArray(prompt.warnings) ? prompt.warnings : [];
    return `
        <article class="content-card studio-review-card" data-testid="studio-prompt-review">
            <div class="studio-review-head">
                <div>
                    <div class="content-card-title">Prompt Review</div>
                    <div class="content-card-meta">${escapeHtml(prompt.compiled_hash || 'Draft compiled prompt')}</div>
                </div>
                <span class="status-chip">${warnings.length ? `${warnings.length} warning${warnings.length === 1 ? '' : 's'}` : 'ready'}</span>
            </div>
            <div class="studio-review-metrics">
                ${renderStudioMetric('Layers', layers.length || 'n/a')}
                ${renderStudioMetric('Source boundary', sourceDelimited ? 'isolated' : 'missing')}
                ${renderStudioMetric('Prompt defense', injectionDefense ? 'enabled' : 'review')}
                ${renderStudioMetric('Output gate', noSend ? 'no-send' : 'review')}
            </div>
            ${renderStudioFlags([
                sourceDelimited ? 'Source isolated' : 'Source boundary missing',
                injectionDefense ? 'Prompt-injection defense' : 'Needs policy review',
                noSend ? 'No publish/send' : 'Output gate review'
            ])}
            <p class="studio-review-excerpt">${escapeHtml(studioReadablePromptText(promptText, 420) || 'Compiled prompt is ready for diagnostics review.')}</p>
            ${warnings.length ? `<ul class="studio-review-list">${warnings.map(warning => `<li>${escapeHtml(String(warning))}</li>`).join('')}</ul>` : ''}
            ${renderStudioDiagnostics(prompt)}
        </article>
    `;
}

function renderStudioPromptLayerCard(layer = {}) {
    const content = String(layer.content || '');
    const type = layer.layer_type || layer.type || 'prompt_layer';
    const label = layer.label || layer.layer_key || 'Prompt layer';
    const hash = layer.layer_hash || layer.hash || '';
    const sourceDelimited = /UNTRUSTED_SOURCE_BEGIN[\s\S]*UNTRUSTED_SOURCE_END/.test(content);
    return `
        <article class="content-card studio-review-card" data-testid="studio-layer-review">
            <div class="studio-review-head">
                <div>
                    <div class="content-card-title">Layer Review: ${escapeHtml(label)}</div>
                    <div class="content-card-meta">${escapeHtml([type, hash, layer.status].filter(Boolean).join(' / '))}</div>
                </div>
                <span class="status-chip">v${Number(layer.version || 1)}</span>
            </div>
            ${renderStudioFlags([
                String(type).replace(/_/g, ' '),
                layer.locked === false ? 'editable' : 'locked',
                sourceDelimited ? 'Delimited source' : '',
                layer.source ? `source: ${layer.source}` : ''
            ])}
            <p class="studio-review-excerpt">${escapeHtml(studioReadablePromptText(content, 260) || 'Layer has no visible content yet.')}</p>
            ${renderStudioDiagnostics(layer, 'Layer Diagnostics', 900)}
        </article>
    `;
}

function renderStudioCorrectionReview(patch = {}) {
    const operations = Array.isArray(patch.operations) ? patch.operations : [];
    const affected = Array.isArray(patch.affected_layers) ? patch.affected_layers : operations.map(operation => operation.target).filter(Boolean);
    return `
        <article class="content-card studio-review-card" data-testid="studio-correction-review">
            <div class="studio-review-head">
                <div>
                    <div class="content-card-title">Correction Review</div>
                    <div class="content-card-meta">${escapeHtml(patch.patch_id || 'Preview patch')}</div>
                </div>
                <span class="status-chip">${escapeHtml(patch.status || 'preview')}</span>
            </div>
            <div class="studio-review-metrics">
                ${renderStudioMetric('Scope', patch.scope || 'project')}
                ${renderStudioMetric('Confirmation', patch.requires_confirmation ? 'required' : 'not required')}
                ${renderStudioMetric('Reversible', patch.reversible === false ? 'no' : 'yes')}
                ${renderStudioMetric('Affected', affected.length || 'review')}
            </div>
            ${affected.length ? renderStudioFlags(affected.map(item => String(item).replace(/_/g, ' '))) : ''}
            ${operations.length ? `
                <ul class="studio-review-list">
                    ${operations.slice(0, 5).map(operation => `<li>${escapeHtml([operation.op, operation.target, studioCompactText(operation.instruction, 140)].filter(Boolean).join(' / '))}</li>`).join('')}
                </ul>
            ` : `<p class="studio-review-excerpt">${escapeHtml(studioCompactText(patch.correction, 260) || 'Correction preview is ready.')}</p>`}
            ${renderStudioDiagnostics(patch, 'Correction Diagnostics', 1400)}
        </article>
    `;
}

function renderStudioJobReview(job = {}) {
    const result = studioParsedPayload(job.result_payload);
    const request = studioParsedPayload(job.request_payload);
    const payload = job.result_payload ? result : request;
    const assets = Array.isArray(result.assets) ? result.assets : [];
    const sceneCount = result.scene_count || (Array.isArray(request.scene_keys) ? request.scene_keys.length : '');
    const externalWrite = studioYesNo(job.external_write_performed ?? result.external_write_performed, false);
    return `
        <article class="task-card studio-job-review" data-testid="studio-job-review">
            <div class="studio-review-head">
                <div>
                    <div class="task-title">Job Review #${Number(job.id || 0)}: ${escapeHtml(job.job_type || 'job')}</div>
                    <div class="task-meta"><span>${escapeHtml(job.status || '')}</span><span>${escapeHtml([job.provider, job.model].filter(Boolean).join('/') || 'provider/model')}</span><span>${escapeHtml(formatDateTime(job.updated_at) || '')}</span></div>
                </div>
                <span class="status-chip">${escapeHtml(job.status || 'queued')}</span>
            </div>
            <div class="studio-review-metrics">
                ${renderStudioMetric('Scenes', sceneCount || 'n/a')}
                ${renderStudioMetric('Assets', assets.length || 'n/a')}
                ${renderStudioMetric('Attempts', Number(job.attempts || 0))}
                ${renderStudioMetric('External write', externalWrite ? 'yes' : 'no')}
            </div>
            ${renderStudioFlags([
                job.provider === 'mock' ? 'No vendor call' : 'Adapter review',
                externalWrite ? 'External write: yes' : 'External write: no',
                result.preview_url ? 'Preview manifest' : '',
                result.render_url ? 'Render placeholder' : ''
            ])}
            <p class="studio-review-excerpt">${escapeHtml(studioCompactText(result.preview_url || result.render_url || payload, 300) || 'Job payload is ready for diagnostics.')}</p>
            <div class="task-actions">
                <button class="task-action" type="button" onclick="retryStudioJob(event, ${Number(job.id)})">Retry</button>
                <button class="task-action" type="button" onclick="cancelStudioJob(event, ${Number(job.id)})">Cancel</button>
            </div>
            ${renderStudioDiagnostics(job.result_payload || job.request_payload, 'Job Diagnostics', 1100)}
        </article>
    `;
}

function renderStudioHandoffReview(result = {}) {
    const payload = studioParsedPayload(result);
    const handoff = studioParsedPayload(payload.handoff || payload);
    const exportRow = studioParsedPayload(payload.export || {});
    const contentJob = studioParsedPayload(payload.content_job || handoff.content_job || {});
    const parseJson = studioParsedPayload(contentJob.parse_json || {});
    const outputs = Array.isArray(contentJob.outputs) ? contentJob.outputs : (Array.isArray(payload.outputs) ? payload.outputs : []);
    const idempotency = payload.idempotency_key || handoff.idempotency_key || '';
    const contentJobId = exportRow.content_job_id || contentJob.id || '';
    const noPublish = studioYesNo(handoff.no_publish ?? parseJson.studio_manifest?.no_publish, true);
    const externalWrite = studioYesNo(handoff.external_write_performed ?? parseJson.external_write_performed ?? payload.external_write_performed, false);
    return `
        <article class="content-card studio-review-card" data-testid="studio-handoff-review">
            <div class="studio-review-head">
                <div>
                    <div class="content-card-title">Handoff Review</div>
                    <div class="content-card-meta">${escapeHtml(idempotency || 'Local Content handoff')}</div>
                </div>
                <span class="status-chip">${escapeHtml(exportRow.status || contentJob.status || 'needs approval')}</span>
            </div>
            <div class="studio-review-metrics">
                ${renderStudioMetric('Content job', contentJobId ? `#${contentJobId}` : 'pending')}
                ${renderStudioMetric('Outputs', outputs.length || 'n/a')}
                ${renderStudioMetric('No publish', noPublish ? 'yes' : 'review')}
                ${renderStudioMetric('External write', externalWrite ? 'yes' : 'no')}
            </div>
            ${renderStudioFlags([
                noPublish ? 'No publish' : 'Publish review',
                'No send',
                externalWrite ? 'External write: yes' : 'External write: no',
                'Local Content handoff'
            ])}
            ${outputs.length ? `
                <ul class="studio-review-list">
                    ${outputs.slice(0, 4).map(output => `<li>${escapeHtml([output.output_type, output.status, output.title].filter(Boolean).join(' / '))}</li>`).join('')}
                </ul>
            ` : `<p class="studio-review-excerpt">${escapeHtml(`Local handoff created${contentJobId ? ` for content job #${contentJobId}` : ''}. No publish, send, upload, or external write was performed.`)}</p>`}
            ${renderStudioDiagnostics(result, 'Handoff Diagnostics', 1400)}
        </article>
    `;
}

function studioLatestReviewPackFromDetail(detail = {}) {
    const sources = Array.isArray(detail.sources) ? detail.sources : [];
    const scenes = Array.isArray(detail.scenes) ? detail.scenes : [];
    const promptLayers = Array.isArray(detail.prompt_layers) ? detail.prompt_layers : [];
    const jobs = Array.isArray(detail.jobs) ? detail.jobs : [];
    const assets = Array.isArray(detail.assets) ? detail.assets : [];
    const latestRender = jobs.find(job => String(job.job_type || '') === 'render_mock') || jobs[0] || null;
    if (!sources.length && !scenes.length && !promptLayers.length && !latestRender && !assets.length) return null;
    return {
        source: sources[0] || null,
        scenes,
        prompt_layers: promptLayers,
        job: latestRender,
        manifest: latestRender ? studioParsedPayload(latestRender.result_payload) : {},
        assets,
        external_write_performed: false,
        derived_from_detail: true,
    };
}

function renderStudioReviewPackCard(result = null, detail = {}) {
    const pack = result || studioLatestReviewPackFromDetail(detail);
    if (!pack) {
        return `
            <article class="content-card studio-review-card" data-testid="studio-review-pack">
                <div class="studio-review-head">
                    <div>
                        <div class="content-card-title">Review Pack</div>
                        <div class="content-card-meta">No review pack has been prepared yet.</div>
                    </div>
                    <span class="status-chip">ready to prepare</span>
                </div>
                <p class="studio-review-excerpt">Paste source content, then prepare a local source, storyboard, prompt, and mock-asset review pack. No vendor, publish, send, upload, or external write runs from this action.</p>
            </article>
        `;
    }
    const source = pack.source || {};
    const storyboard = pack.storyboard || {};
    const scenes = Array.isArray(pack.scenes) ? pack.scenes : (Array.isArray(storyboard.scenes) ? storyboard.scenes : []);
    const compiled = pack.compiled_prompt || {};
    const promptLayers = Array.isArray(compiled.layers) ? compiled.layers : (Array.isArray(pack.prompt_layers) ? pack.prompt_layers : []);
    const promptPack = studioParsedPayload(pack.prompt_pack || pack.worker_handoff?.prompt_pack || {});
    const scenePrompts = Array.isArray(promptPack.scene_prompts) ? promptPack.scene_prompts : [];
    const manifest = studioParsedPayload(pack.manifest || pack.job?.result_payload || {});
    const assets = Array.isArray(manifest.assets) ? manifest.assets : (Array.isArray(pack.assets) ? pack.assets : []);
    const steps = Array.isArray(pack.steps) ? pack.steps : [
        source?.id || source?.source_hash ? { label: 'Source saved', status: 'done', detail: source.source_hash || source.title } : null,
        scenes.length ? { label: 'Storyboard generated', status: 'done', detail: `${scenes.length} scene${scenes.length === 1 ? '' : 's'}` } : null,
        promptLayers.length ? { label: 'Prompt compiled', status: 'done', detail: `${promptLayers.length} layer${promptLayers.length === 1 ? '' : 's'}` } : null,
        scenePrompts.length ? { label: 'Prompt pack built', status: 'done', detail: `${scenePrompts.length} scene prompt${scenePrompts.length === 1 ? '' : 's'}` } : null,
        pack.job || assets.length ? { label: 'Mock render ready', status: 'done', detail: `${assets.length || 'mock'} asset${assets.length === 1 ? '' : 's'}` } : null,
        pack.worker_handoff ? { label: 'Worker handoff ready', status: 'done', detail: pack.worker_handoff.idempotency_key || 'AI video worker review' } : null,
    ].filter(Boolean);
    const externalWrite = studioYesNo(pack.external_write_performed ?? pack.job?.external_write_performed ?? manifest.external_write_performed, false);
    return `
        <article class="content-card studio-review-card" data-testid="studio-review-pack">
            <div class="studio-review-head">
                <div>
                    <div class="content-card-title">Review Pack</div>
                    <div class="content-card-meta">${escapeHtml(pack.prepared_at ? `Prepared ${formatDateTime(pack.prepared_at)}` : (pack.derived_from_detail ? 'Loaded from saved Studio artifacts' : 'Prepared locally'))}</div>
                </div>
                <span class="status-chip">${escapeHtml(externalWrite ? 'external review' : 'local no-send')}</span>
            </div>
            <div class="studio-review-metrics">
                ${renderStudioMetric('Source', source?.source_hash || pack.normalized?.source_hash ? 'saved' : 'review')}
                ${renderStudioMetric('Scenes', scenes.length || 'n/a')}
                ${renderStudioMetric('Prompt pack', scenePrompts.length || promptLayers.length || 'n/a')}
                ${renderStudioMetric('Worker handoff', pack.worker_handoff ? 'ready' : 'review')}
            </div>
            ${renderStudioFlags([
                'Source saved',
                scenes.length ? 'Storyboard generated' : 'Storyboard review',
                promptLayers.length ? 'Prompt compiled' : 'Prompt review',
                scenePrompts.length ? 'Prompt pack ready' : '',
                pack.worker_handoff ? 'Worker handoff ready' : '',
                pack.job || assets.length ? 'Mock render ready' : 'Mock render review',
                'No vendor call',
                'No publish/send',
                'No upload',
                externalWrite ? 'External write: yes' : 'External write: no'
            ])}
            ${steps.length ? `
                <ul class="studio-review-list">
                    ${steps.map(step => `<li>${escapeHtml([step.label, step.detail].filter(Boolean).join(' / '))}</li>`).join('')}
                </ul>
            ` : ''}
            <p class="studio-review-excerpt">${escapeHtml(studioCompactText(source.raw_text_preview || source.normalized_text_preview || source.title || storyboard.title || manifest.preview_url || 'Review pack is ready for storyboard, prompt, and mock artifact review.', 300))}</p>
            ${renderStudioDiagnostics({ source, storyboard, compiled_prompt: compiled, prompt_pack: promptPack, worker_handoff: pack.worker_handoff, job: pack.job, manifest }, 'Review Pack Diagnostics', 1400)}
        </article>
    `;
}

function studioScenarioTags(project = {}) {
    const metadata = project.metadata || {};
    const tags = metadata.studio_scenario_tags || metadata.scenario_tags || [];
    return Array.isArray(tags) ? tags.map(tag => String(tag || '').trim()).filter(Boolean) : [];
}

function studioCharacterLines(characters = []) {
    return (Array.isArray(characters) ? characters : []).map(character => {
        if (typeof character === 'string') return character;
        const tags = Array.isArray(character.scenario_tags) ? character.scenario_tags.join(', ') : (character.scenario_tags || '');
        return [
            character.name || character.key || '',
            character.role || '',
            tags,
            character.description || character.prompt || character.notes || ''
        ].map(value => String(value || '').trim()).join(' | ');
    }).filter(Boolean).join('\n');
}

function studioGuardrailLines(guardrails = []) {
    return (Array.isArray(guardrails) ? guardrails : []).map(guardrail => {
        if (typeof guardrail === 'string') return guardrail;
        return [
            guardrail.label || guardrail.title || guardrail.key || '',
            guardrail.scope || guardrail.category || '',
            guardrail.rule || guardrail.description || guardrail.prompt || guardrail.text || ''
        ].map(value => String(value || '').trim()).join(' | ');
    }).filter(Boolean).join('\n');
}

function studioUniqueTextList(value = '') {
    return Array.from(new Set(String(value || '')
        .split(/[\n,;]+/)
        .map(item => item.trim())
        .filter(Boolean)));
}

function parseStudioCharacterLibrary(value = '') {
    return String(value || '').split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map((line, index) => {
            const [namePart, rolePart, tagsPart, ...descriptionParts] = line.split('|').map(part => part.trim());
            const name = namePart || `Character ${index + 1}`;
            const description = descriptionParts.join(' | ') || rolePart || '';
            return {
                key: normalizeProjectKey(name) || `character_${index + 1}`,
                name,
                role: rolePart || 'character',
                scenario_tags: studioUniqueTextList(tagsPart || ''),
                description,
            };
        });
}

function parseStudioGuardrailLibrary(value = '') {
    return String(value || '').split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map((line, index) => {
            const [labelPart, scopePart, ...ruleParts] = line.split('|').map(part => part.trim());
            const label = labelPart || `Guardrail ${index + 1}`;
            const rule = ruleParts.join(' | ') || scopePart || label;
            return {
                key: normalizeProjectKey(label) || `guardrail_${index + 1}`,
                label,
                scope: ruleParts.length ? (scopePart || 'general') : 'general',
                rule,
            };
        });
}

function renderStudioLibraryPanel(detail = {}) {
    const project = detail.project || {};
    const characters = Array.isArray(project.character_bible) ? project.character_bible : [];
    const guardrails = Array.isArray(project.guardrails) ? project.guardrails : [];
    const tags = studioScenarioTags(project);
    const characterPreview = characters.length
        ? characters.slice(0, 4).map(character => `<span class="status-chip">${escapeHtml(character.name || character.key || String(character))}</span>`).join('')
        : '<p>No character profiles saved yet.</p>';
    const guardrailPreview = guardrails.length
        ? guardrails.slice(0, 4).map(guardrail => `<span class="status-chip">${escapeHtml(guardrail.label || guardrail.title || guardrail.key || String(guardrail))}</span>`).join('')
        : '<p>No Jewish guardrails saved yet.</p>';
    const tagPreview = tags.length
        ? tags.slice(0, 8).map(tag => `<span class="status-chip">${escapeHtml(tag)}</span>`).join('')
        : '<p>No scenario tags saved yet.</p>';
    return `
        <section class="studio-library-panel" data-testid="studio-library-panel">
            <div class="task-section-header">
                <div>
                    <h3>Reusable Studio Library</h3>
                    <p class="event-meta">Characters, Jewish guardrails, and scenario tags saved here are reused by prompt compilation for this scoped project.</p>
                </div>
                <span>${Number(characters.length)} characters / ${Number(guardrails.length)} guardrails</span>
            </div>
            <form class="task-inline-comment-form" onsubmit="saveStudioLibraryFromForm(event, ${Number(project.id || 0)})">
                <div class="content-section-grid">
                    <div class="form-group">
                        <label>Character Profiles</label>
                        <textarea data-testid="studio-character-library" name="character_bible_text" placeholder="Rabbi Elie | teacher | intro, chazara | Warm Mishnah teacher with consistent visual style.">${escapeHtml(studioCharacterLines(characters))}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Jewish Guardrails</label>
                        <textarea data-testid="studio-guardrail-library" name="guardrails_text" placeholder="No anachronisms | visuals | Keep Mishnah scenes historically respectful and source-grounded.">${escapeHtml(studioGuardrailLines(guardrails))}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Scenario Tags</label>
                        <textarea data-testid="studio-scenario-tags" name="scenario_tags_text" placeholder="intro, chazara, beis din, market scene">${escapeHtml(tags.join('\n'))}</textarea>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action primary" type="submit">Save Studio Library</button>
                </div>
            </form>
            <div class="studio-library-readback">
                <div><strong>Characters</strong><div class="studio-review-flag-row">${characterPreview}</div></div>
                <div><strong>Jewish Guardrails</strong><div class="studio-review-flag-row">${guardrailPreview}</div></div>
                <div><strong>Scenario Tags</strong><div class="studio-review-flag-row">${tagPreview}</div></div>
            </div>
        </section>
    `;
}

function renderStudioOpenArtStatusCard() {
    const status = studioDashboard.openart_status || studioDashboard.openart || studioUsage.openart_status || {};
    const connected = Boolean(status.connected);
    const allowed = Array.isArray(status.allowed_from_bna) ? status.allowed_from_bna : [];
    const blocked = Array.isArray(status.blocked_until_connected) ? status.blocked_until_connected : [];
    return `
        <article class="content-card studio-review-card" data-testid="studio-openart-status">
            <div class="studio-review-head">
                <div>
                    <div class="content-card-title">OpenArt MCP</div>
                    <div class="content-card-meta">${escapeHtml(status.status || 'blocked_no_oauth')}</div>
                </div>
                <span class="status-chip">${connected ? 'connected' : 'OAuth needed'}</span>
            </div>
            <div class="studio-review-metrics">
                ${renderStudioMetric('Live call', status.no_live_call === false ? 'enabled' : 'no')}
                ${renderStudioMetric('External write', status.external_write_performed ? 'yes' : 'no')}
                ${renderStudioMetric('References', connected ? 'ready' : 'blocked')}
                ${renderStudioMetric('Generation', connected ? 'gated' : 'blocked')}
            </div>
            ${renderStudioFlags([
                'Prompt export ready',
                'No credit spend',
                connected ? 'OAuth connected' : 'OAuth not connected',
                'No upload from BNA yet'
            ])}
            ${allowed.length ? `<p class="studio-review-excerpt">${escapeHtml(allowed.join(' / '))}</p>` : ''}
            ${blocked.length ? `<ul class="studio-review-list">${blocked.slice(0, 5).map(item => `<li>${escapeHtml(String(item).replace(/_/g, ' '))}</li>`).join('')}</ul>` : ''}
            ${status.source_url ? `<div class="task-actions"><a class="task-action" href="${escapeHtml(status.source_url)}" target="_blank" rel="noopener">Open MCP Docs</a><a class="task-action" href="${escapeHtml(status.app_url || 'https://openart.ai/')}" target="_blank" rel="noopener">Open OpenArt</a></div>` : ''}
            ${renderStudioDiagnostics(status, 'OpenArt Diagnostics', 900)}
        </article>
    `;
}

function renderStudioOpenArtExportReview(exportPlan = null) {
    if (!exportPlan) return '';
    const text = String(exportPlan.copy_text || '');
    const requestPlan = exportPlan.mcp_request_plan || {};
    return `
        <article class="content-card studio-review-card" data-testid="studio-openart-export">
            <div class="studio-review-head">
                <div>
                    <div class="content-card-title">OpenArt Prompt Export</div>
                    <div class="content-card-meta">${escapeHtml(exportPlan.prompt_hash || 'copy-ready')}</div>
                </div>
                <span class="status-chip">${requestPlan.requires_oauth ? 'OAuth needed' : 'ready'}</span>
            </div>
            <div class="studio-review-metrics">
                ${renderStudioMetric('Characters', (exportPlan.character_reference_checklist || []).length || 'review')}
                ${renderStudioMetric('Guardrails', (exportPlan.guardrail_checklist || []).length || 'review')}
                ${renderStudioMetric('Live call', exportPlan.no_live_call === false ? 'enabled' : 'no')}
                ${renderStudioMetric('External write', exportPlan.external_write_performed ? 'yes' : 'no')}
            </div>
            <p class="studio-review-excerpt">${escapeHtml(studioReadablePromptText(text, 520) || 'OpenArt prompt export is ready.')}</p>
            <div class="task-actions">
                <button class="task-action primary" type="button" onclick="copyStudioOpenArtPrompt(event)">Copy OpenArt Prompt</button>
            </div>
            ${renderStudioDiagnostics(exportPlan, 'OpenArt Export Diagnostics', 1400)}
        </article>
    `;
}

function renderStudioAiVideoWorkerHandoffReview(result = null) {
    if (!result) return '';
    const payload = studioParsedPayload(result);
    const handoff = studioParsedPayload(payload.handoff || payload);
    const promptPack = studioParsedPayload(payload.prompt_pack || handoff.prompt_pack || {});
    const exportRow = studioParsedPayload(payload.export || {});
    const scenePrompts = Array.isArray(promptPack.scene_prompts) ? promptPack.scene_prompts : [];
    const blockers = Array.isArray(handoff.vendor_blockers) ? handoff.vendor_blockers : [];
    const externalWrite = studioYesNo(handoff.external_write_performed ?? payload.external_write_performed, false);
    return `
        <article class="content-card studio-review-card" data-testid="studio-ai-video-worker-handoff">
            <div class="studio-review-head">
                <div>
                    <div class="content-card-title">AI Video Worker Handoff</div>
                    <div class="content-card-meta">${escapeHtml(handoff.idempotency_key || exportRow.idempotency_key || 'Worker review packet')}</div>
                </div>
                <span class="status-chip">${escapeHtml(exportRow.status || handoff.status || 'ready for review')}</span>
            </div>
            <div class="studio-review-metrics">
                ${renderStudioMetric('Prompt pack', promptPack.pack_id ? 'ready' : 'review')}
                ${renderStudioMetric('Scene prompts', scenePrompts.length || 'n/a')}
                ${renderStudioMetric('Live call', handoff.no_live_call === false ? 'enabled' : 'no')}
                ${renderStudioMetric('External write', externalWrite ? 'yes' : 'no')}
            </div>
            ${renderStudioFlags([
                'Worker review packet',
                'Prompt pack ready',
                'No vendor call',
                'No upload',
                'No publish/send',
                externalWrite ? 'External write: yes' : 'External write: no'
            ])}
            ${scenePrompts.length ? `
                <ul class="studio-review-list">
                    ${scenePrompts.slice(0, 5).map(scene => `<li>${escapeHtml([`Scene ${scene.position || ''}`, scene.title, scene.openart_prompt_hash].filter(Boolean).join(' / '))}</li>`).join('')}
                </ul>
            ` : `<p class="studio-review-excerpt">Create the source, storyboard, and prompt pack before handing off to the AI video worker.</p>`}
            ${blockers.length ? `<p class="studio-review-excerpt">${escapeHtml(blockers[0])}</p>` : ''}
            ${renderStudioDiagnostics({ handoff, prompt_pack: promptPack, export: exportRow }, 'Worker Handoff Diagnostics', 1600)}
        </article>
    `;
}

function renderStudioRepairPlanReview(plan = null) {
    if (!plan) return '';
    return `
        <article class="content-card studio-review-card" data-testid="studio-repair-plan">
            <div class="studio-review-head">
                <div>
                    <div class="content-card-title">Studio Repair Plan</div>
                    <div class="content-card-meta">${escapeHtml(plan.reason || plan.lane || plan.mode || 'studio repair lane')}</div>
                </div>
                <span class="status-chip">${plan.allowed ? 'allowed' : 'blocked'}</span>
            </div>
            <div class="studio-review-metrics">
                ${renderStudioMetric('Shell', plan.no_shell === false ? 'allowed' : 'blocked')}
                ${renderStudioMetric('Raw CLI', plan.no_codex_cli_route === false ? 'allowed' : 'blocked')}
                ${renderStudioMetric('Deploy', plan.no_deploy === false ? 'allowed' : 'blocked')}
                ${renderStudioMetric('External writes', plan.no_external_writes === false ? 'allowed' : 'blocked')}
            </div>
            ${renderStudioFlags([
                plan.allowed ? 'Studio-only' : 'Out of scope',
                'No shell',
                'No deploy',
                'Owner merge decision for cross-workspace reuse'
            ])}
            ${renderStudioDiagnostics(plan, 'Repair Plan Diagnostics', 1300)}
        </article>
    `;
}

function renderStudioSidekickPanel(detail = {}) {
    const scenes = detail.scenes || [];
    const projectId = Number(detail.project?.id || 0);
    return `
        <section class="studio-library-panel" data-testid="studio-sidekick-panel">
            <div class="task-section-header">
                <div>
                    <h3>Studio Sidekick</h3>
                    <p class="event-meta">Prompt patching, character continuity, image/render critique, and OpenArt prompt export for this scoped project.</p>
                </div>
                <span>no-live</span>
            </div>
            <form class="task-inline-comment-form" data-studio-sidekick-form onsubmit="previewStudioSidekickPatch(event, ${projectId})">
                <div class="content-section-grid">
                    <div class="form-group">
                        <label>Scene</label>
                        <select name="scene_id">
                            <option value="">Whole project</option>
                            ${scenes.map(scene => `<option value="${Number(scene.id)}">${escapeHtml(`Scene ${scene.position}: ${scene.title || scene.scene_key}`)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Patch Target</label>
                        <select name="target">
                            <option value="auto">Auto</option>
                            <option value="character_bible">Character</option>
                            <option value="visual_style">Visual style</option>
                            <option value="jewish_guardrails">Jewish guardrails</option>
                            <option value="scene_instruction">Scene prompt</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Image URL / Reference Note</label>
                        <input name="image_reference" placeholder="OpenArt image URL, saved reference, or render note">
                    </div>
                    <div class="form-group">
                        <label>Scope</label>
                        <select name="scope">
                            <option value="project">Project</option>
                            <option value="scene">Scene</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Image / Render Observation</label>
                    <textarea name="image_observation" placeholder="This guy needs a better hat; the face changed; it should be more realistic."></textarea>
                </div>
                <div class="form-group">
                    <label>Prompt Correction</label>
                    <textarea name="correction_text" required placeholder="Describe the prompt or Studio change to draft."></textarea>
                </div>
                <div class="task-actions">
                    <button class="task-action primary" type="submit">Draft Prompt Patch</button>
                    <button class="task-action" type="button" onclick="exportStudioOpenArtPrompt(event, ${projectId})">Export OpenArt Prompt</button>
                    <button class="task-action" type="button" onclick="planStudioRepairRequest(event, ${projectId})">Plan Studio Repair</button>
                </div>
            </form>
            ${studioSidekickPreview ? renderStudioCorrectionReview(studioSidekickPreview.patch || studioSidekickPreview) : ''}
            ${renderStudioOpenArtExportReview(studioOpenArtExport)}
            ${renderStudioRepairPlanReview(studioRepairPlan)}
        </section>
    `;
}

function renderStudioSectionTabs() {
    const sections = tabsWithCounts(STUDIO_SUBTABS, studioSubnavCounts());
    return `
        <section class="studio-section-tabs" data-testid="studio-section-tabs" aria-label="Studio Sections">
            <h3>Studio Sections</h3>
            <div class="studio-section-tab-list" role="list">
                ${sections.map(section => `
                    <button type="button" class="studio-section-tab ${String(studioSection) === String(section.id) ? 'active' : ''}" onclick="setStudioSection(${attrJson(section.id)})">
                        <span>${escapeHtml(section.label || section.id)}</span>
                        <span class="studio-section-count">${Number(section.count || 0)}</span>
                    </button>
                `).join('')}
            </div>
        </section>
    `;
}

function renderStudio() {
    const project = studioCurrentProject();
    const rollup = studioUsageRollup();
    const activeJobs = (studioDashboard.jobs || []).filter(job => !['succeeded', 'cancelled'].includes(String(job.status || '').toLowerCase()));
    const projectOptions = availableProjects().filter(project => project.project_key && project.project_key !== 'all');
    const defaultProject = studioDefaultProjectKey();
    return `
        <div class="container" data-testid="service-provider-studio">
            <div class="page-heading saas-page-heading">
                <div>
                    <div class="page-kicker">Provider Studio</div>
                    <h2>Universal Service Provider Studio</h2>
                    <p>Build scoped provider video/story assets from raw source, storyboard scenes, prompt layers, mock render jobs, usage records, and no-send Content handoffs.</p>
                </div>
                <div class="task-actions">
                    <button class="task-action" type="button" onclick="setStudioSection('source')">Source</button>
                    <button class="task-action" type="button" onclick="setStudioSection('storyboard')">Storyboard</button>
                    <button class="task-action primary" type="button" onclick="setStudioSection('handoff')">Handoff</button>
                </div>
            </div>
            ${studioNotice ? `<div class="settings-disabled-note">${escapeHtml(studioNotice)}</div>` : ''}
            <section class="focus-panel">
                <div class="usage-grid">
                    ${renderUsageMetricCard('Projects', studioProjects.length, 'Studio projects visible in this workspace.')}
                    ${renderUsageMetricCard('Open Jobs', activeJobs.length, 'Queued, running, failed, or stale Studio jobs.')}
                    ${renderUsageMetricCard('Tokens', studioRollupNumber(rollup, 'input_tokens') + studioRollupNumber(rollup, 'output_tokens'), 'Input and output tokens logged by Studio usage events.')}
                    ${renderUsageMetricCard('Estimated Cost', studioMoney(studioRollupNumber(rollup, 'estimated_cost_usd')), 'Mock or adapter-reported cost from Studio usage rows.')}
                </div>
            </section>
            <div class="studio-workspace-shell">
                ${renderStudioSectionTabs()}
                <div class="studio-project-workspace">
                    <section class="focus-panel studio-project-list-panel">
                        <div class="task-section-header">
                            <h3>Projects</h3>
                            <span>${escapeHtml(currentWorkspaceRecord().display_name || currentWorkspaceKey())}</span>
                        </div>
                        <form class="task-inline-comment-form" onsubmit="createStudioProjectFromForm(event)">
                            <div class="content-section-grid">
                                <div class="form-group">
                                    <label>Title</label>
                                    <input name="title" required placeholder="One Time Mishnayos episode promo">
                                </div>
                                <div class="form-group">
                                    <label>Project</label>
                                    <select name="project_key">
                                        ${projectOptions.map(option => `<option value="${escapeHtml(option.project_key)}" ${option.project_key === defaultProject ? 'selected' : ''}>${escapeHtml(option.short_name || option.name || option.project_key)}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Audience</label>
                                    <input name="target_audience" placeholder="Parents, participants, or donors">
                                </div>
                                <div class="form-group">
                                    <label>Format</label>
                                    <select name="format">
                                        <option value="slideshow_video">Slideshow video</option>
                                        <option value="short_form_video">Short-form video</option>
                                        <option value="illustrated_story">Illustrated story</option>
                                        <option value="lesson_clip">Lesson clip</option>
                                    </select>
                                </div>
                            </div>
                            <button class="task-action primary" type="submit">Create Project</button>
                        </form>
                        <div class="content-section-grid">
                            ${studioProjects.length ? studioProjects.map(renderStudioProjectCard).join('') : '<div class="empty-state">No Studio projects are loaded for this workspace.</div>'}
                        </div>
                    </section>
                    ${project ? renderStudioProjectDetail(project) : ''}
                </div>
            </div>
        </div>
    `;
}

function renderStudioProjectCard(project = {}) {
    const active = Number(project.id) === Number(selectedStudioProjectId);
    return `
        <article class="content-card ${active ? 'selected' : ''}" data-testid="studio-project-card">
            <div class="content-card-title">${escapeHtml(project.title || 'Studio project')}</div>
            <div class="content-card-meta">${escapeHtml([project.project_short_name || project.project_key, project.workspace_key, studioProjectStatusLabel(project)].filter(Boolean).join(' / '))}</div>
            <p class="event-meta">${escapeHtml(limitTextClient(project.brief_json?.goal || project.brief_json?.target_audience || project.format || '', 160))}</p>
            <div class="task-actions">
                <button class="task-action ${active ? 'primary' : ''}" type="button" onclick="selectStudioProject(${Number(project.id || 0)})">Open</button>
            </div>
        </article>
    `;
}

function renderStudioProjectDetail(project = {}) {
    const detail = studioProjectDetail?.project?.id && Number(studioProjectDetail.project.id) === Number(project.id) ? studioProjectDetail : null;
    if (!detail) {
        return `
            <section class="focus-panel studio-project-detail-panel">
                <div class="task-section-header"><h3>${escapeHtml(project.title || 'Studio project')}</h3><span>${escapeHtml(studioProjectStatusLabel(project))}</span></div>
                <div class="empty-state">Project detail is loading.</div>
            </section>
        `;
    }
    const sections = {
        overview: renderStudioOverviewPanel(detail),
        source: renderStudioSourcePanel(detail),
        storyboard: renderStudioStoryboardPanel(detail),
        prompts: renderStudioPromptPanel(detail),
        jobs: renderStudioJobsPanel(detail),
        usage: renderStudioUsagePanel(detail),
        handoff: renderStudioHandoffPanel(detail)
    };
    return `
        <section class="focus-panel studio-project-detail-panel" data-testid="studio-project-detail">
            <div class="task-section-header">
                <div>
                    <h3>${escapeHtml(detail.project.title || 'Studio project')}</h3>
                    <p class="event-meta">${escapeHtml([detail.project.project_short_name || detail.project.project_key, detail.project.workspace_key, studioProjectStatusLabel(detail.project)].filter(Boolean).join(' / '))}</p>
                </div>
                <span>${escapeHtml(formatDateTime(detail.project.updated_at) || 'Not updated')}</span>
            </div>
            ${sections[studioSection] || sections.overview}
        </section>
    `;
}

function renderStudioOverviewPanel(detail = {}) {
    const rollup = detail.usage_rollup || {};
    return `
        <div class="usage-grid">
            ${renderUsageMetricCard('Sources', (detail.sources || []).length, 'Stored normalized source records.')}
            ${renderUsageMetricCard('Scenes', (detail.scenes || []).length, 'Storyboard scenes and editable versions.')}
            ${renderUsageMetricCard('Prompt Layers', (detail.prompt_layers || []).length, 'System, source, scene, style, and correction layers.')}
            ${renderUsageMetricCard('Cost', studioMoney(studioRollupNumber(rollup, 'estimated_cost_usd')), 'Project-level usage estimate.')}
        </div>
        ${renderStudioReviewPackCard(studioReviewPackResult, detail)}
        ${detail.project.brief_json && Object.keys(detail.project.brief_json).length ? `
            <article class="content-card">
                <div class="content-card-title">Brief</div>
                <pre class="settings-code-block">${escapeHtml(studioJsonSnippet(detail.project.brief_json))}</pre>
            </article>
        ` : '<div class="empty-state">No brief has been saved for this project yet.</div>'}
    `;
}

function renderStudioSourcePanel(detail = {}) {
    return `
        ${renderStudioReviewPackCard(studioReviewPackResult, detail)}
        <form class="task-inline-comment-form" onsubmit="saveStudioSourceFromForm(event, ${Number(detail.project.id)})">
            <div class="content-section-grid">
                <div class="form-group">
                    <label>Source Title</label>
                    <input name="title" value="${escapeHtml(detail.project.title || '')}">
                </div>
                <div class="form-group">
                    <label>Source Type</label>
                    <select name="source_type">
                        <option value="manual">Manual</option>
                        <option value="transcript">Transcript</option>
                        <option value="url">URL</option>
                        <option value="drive_note">Drive note</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Source URL</label>
                    <input name="source_url" placeholder="Optional reference URL">
                </div>
                <div class="form-group">
                    <label>Review Scene Count</label>
                    <input name="scene_count" type="number" min="1" max="12" value="${Math.max(3, (detail.scenes || []).length || 3)}">
                </div>
            </div>
            <div class="form-group">
                <label>Raw Source</label>
                <textarea name="raw_text" required placeholder="Paste the untrusted source text here. It is normalized and hashed before use."></textarea>
            </div>
            <div class="task-actions">
                <button class="task-action" type="submit">Save Source</button>
                <button class="task-action primary" type="button" onclick="prepareStudioReviewPackFromForm(event, ${Number(detail.project.id)})">Prepare Review Pack</button>
                <button class="task-action" type="button" onclick="generateStudioOutline(event, ${Number(detail.project.id)})">Generate Outline</button>
                <button class="task-action" type="button" onclick="generateStudioStoryboard(event, ${Number(detail.project.id)})">Generate Storyboard</button>
            </div>
        </form>
        <div class="task-list">
            ${(detail.sources || []).length ? detail.sources.map(source => `
                <article class="task-card">
                    <div class="task-card-header">
                        <div>
                            <div class="task-title">${escapeHtml(source.title || 'Source')}</div>
                            <div class="task-meta"><span>${escapeHtml(source.source_type || 'manual')}</span><span>${escapeHtml(source.source_hash || '')}</span></div>
                        </div>
                    </div>
                    <p>${escapeHtml(limitTextClient(source.raw_text_preview || source.normalized_text_preview || '', 260))}</p>
                    ${(source.annotations || []).length ? `<div class="task-chip-row">${source.annotations.map(item => `<span class="status-chip">${escapeHtml(item.type || item.message || 'annotation')}</span>`).join('')}</div>` : ''}
                </article>
            `).join('') : '<div class="empty-state">No source records have been saved.</div>'}
        </div>
    `;
}

function renderStudioStoryboardPanel(detail = {}) {
    return `
        <form class="task-inline-comment-form" onsubmit="generateStudioStoryboard(event, ${Number(detail.project.id)})">
            <div class="content-section-grid">
                <div class="form-group">
                    <label>Scene Count</label>
                    <input name="scene_count" type="number" min="1" max="12" value="${Math.max(3, (detail.scenes || []).length || 3)}">
                </div>
                <div class="form-group">
                    <label>Tone</label>
                    <input name="tone" placeholder="Warm, clear, parent-friendly">
                </div>
                <div class="form-group">
                    <label>Style</label>
                    <input name="style_key" placeholder="bna_clean_illustrated">
                </div>
            </div>
            <button class="task-action primary" type="submit">Generate Storyboard</button>
        </form>
        <div class="task-list">
            ${(detail.scenes || []).length ? detail.scenes.map(renderStudioSceneEditor).join('') : '<div class="empty-state">No storyboard scenes have been generated.</div>'}
        </div>
    `;
}

function renderStudioSceneEditor(scene = {}) {
    return `
        <article class="task-card" data-testid="studio-scene-card">
            <form onsubmit="updateStudioSceneFromForm(event, ${Number(scene.id)})">
                <div class="task-card-header">
                    <div>
                        <div class="task-title">Scene ${Number(scene.position || 0)}: ${escapeHtml(scene.title || 'Untitled')}</div>
                        <div class="task-meta"><span>${escapeHtml(scene.status || 'draft')}</span><span>${Number(scene.duration_seconds || 0)} sec</span><span>v${Number(scene.version || 1)}</span></div>
                    </div>
                </div>
                <div class="content-section-grid">
                    <div class="form-group">
                        <label>Position</label>
                        <input name="position" type="number" min="1" value="${Number(scene.position || 1)}">
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <input name="duration_seconds" type="number" min="1" max="180" value="${Number(scene.duration_seconds || 12)}">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            ${['draft', 'ready', 'rendered', 'approved', 'needs_revision'].map(status => `<option value="${status}" ${String(scene.status || '') === status ? 'selected' : ''}>${escapeHtml(status.replace(/_/g, ' '))}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group"><label>Title</label><input name="title" value="${escapeHtml(scene.title || '')}"></div>
                <div class="form-group"><label>Body</label><textarea name="body">${escapeHtml(scene.body || '')}</textarea></div>
                <div class="form-group"><label>Narration</label><textarea name="narration">${escapeHtml(scene.narration || '')}</textarea></div>
                <div class="form-group"><label>Visual Prompt</label><textarea name="visual_prompt">${escapeHtml(scene.visual_prompt || '')}</textarea></div>
                <div class="task-actions">
                    <button class="task-action primary" type="submit">Save Scene</button>
                    <button class="task-action" type="button" onclick="regenerateStudioScene(event, ${Number(scene.id)})">Regenerate Mock</button>
                </div>
            </form>
        </article>
    `;
}

function renderStudioPromptPanel(detail = {}) {
    const layers = detail.prompt_layers || [];
    return `
        ${renderStudioLibraryPanel(detail)}
        ${renderStudioSidekickPanel(detail)}
        <form class="task-inline-comment-form" onsubmit="compileStudioPrompt(event, ${Number(detail.project.id)})">
            <div class="content-section-grid">
                <div class="form-group">
                    <label>Scene</label>
                    <select name="scene_id">
                        <option value="">Project prompt</option>
                        ${(detail.scenes || []).map(scene => `<option value="${Number(scene.id)}">${escapeHtml(`Scene ${scene.position}: ${scene.title || scene.scene_key}`)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Provider</label>
                    <select name="provider">
                        <option value="mock">Mock</option>
                        <option value="openai">OpenAI adapter</option>
                        <option value="kimi">Kimi adapter</option>
                    </select>
                </div>
            </div>
            <button class="task-action primary" type="submit">Compile Prompt</button>
        </form>
        ${studioCompiledPrompt ? renderStudioCompiledPromptReview(studioCompiledPrompt) : ''}
        <div class="content-section-grid">
            ${layers.length ? layers.slice(0, 8).map(renderStudioPromptLayerCard).join('') : '<div class="empty-state">No prompt layers have been compiled.</div>'}
        </div>
        <form class="task-inline-comment-form" onsubmit="previewStudioCorrection(event, ${Number(detail.project.id)})">
            <div class="content-section-grid">
                <div class="form-group">
                    <label>Correction Scope</label>
                    <select name="scope">
                        <option value="project">Project</option>
                        <option value="scene">Scene</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Scene</label>
                    <select name="scene_id">
                        <option value="">Whole project</option>
                        ${(detail.scenes || []).map(scene => `<option value="${Number(scene.id)}">${escapeHtml(`Scene ${scene.position}: ${scene.title || scene.scene_key}`)}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Correction</label>
                <textarea name="correction" required placeholder="Describe the storyboard or prompt change to preview."></textarea>
            </div>
            <div class="task-actions">
                <button class="task-action" type="submit">Preview Correction</button>
                <button class="task-action primary" type="button" onclick="applyStudioCorrection(event, ${Number(detail.project.id)})">Apply Preview</button>
            </div>
        </form>
        ${studioCorrectionPreview ? renderStudioCorrectionReview(studioCorrectionPreview) : ''}
    `;
}

function renderStudioJobsPanel(detail = {}) {
    const jobs = detail.jobs || [];
    const assets = detail.assets || [];
    return `
        <div class="task-actions">
            <button class="task-action primary" type="button" onclick="renderStudioMock(event, ${Number(detail.project.id)})">Run Mock Render</button>
        </div>
        <div class="task-list">
            ${jobs.length ? jobs.map(renderStudioJobReview).join('') : '<div class="empty-state">No Studio jobs are loaded for this project.</div>'}
        </div>
        <div class="content-section-grid">
            ${assets.length ? assets.map(asset => `
                <article class="content-card">
                    <div class="content-card-title">${escapeHtml(asset.title || asset.asset_key || 'Asset')}</div>
                    <div class="content-card-meta">${escapeHtml([asset.asset_type, asset.rights_status, asset.privacy_status].filter(Boolean).join(' / '))}</div>
                    <p class="event-meta">${escapeHtml(asset.url || '')}</p>
                </article>
            `).join('') : ''}
        </div>
    `;
}

function renderStudioUsagePanel(detail = {}) {
    const rollup = detail.usage_rollup || studioUsageRollup();
    const budgets = studioUsage.budgets || studioUsage.budget_rows || [];
    const catalog = studioDashboard.price_catalog || studioUsage.price_catalog || [];
    return `
        <div class="usage-grid">
            ${renderUsageMetricCard('Input Tokens', studioRollupNumber(rollup, 'input_tokens'), 'Studio input tokens.')}
            ${renderUsageMetricCard('Output Tokens', studioRollupNumber(rollup, 'output_tokens'), 'Studio output tokens.')}
            ${renderUsageMetricCard('Media Seconds', studioRollupNumber(rollup, 'media_seconds'), 'Generated or mocked media duration.')}
            ${renderUsageMetricCard('Estimated Cost', studioMoney(studioRollupNumber(rollup, 'estimated_cost_usd')), 'Usage event cost estimate.')}
        </div>
        <div class="content-section-grid">
            ${renderStudioOpenArtStatusCard()}
            ${catalog.length ? catalog.map(row => `
                <article class="content-card">
                    <div class="content-card-title">${escapeHtml(row.provider || 'provider')} / ${escapeHtml(row.model || 'model')}</div>
                    <div class="content-card-meta">input ${studioMoney(row.input_per_1m)} / output ${studioMoney(row.output_per_1m)} / media ${studioMoney(row.media_second)}</div>
                </article>
            `).join('') : '<div class="empty-state">No active price catalog rows are loaded.</div>'}
            ${budgets.length ? budgets.map(row => `
                <article class="content-card">
                    <div class="content-card-title">${escapeHtml(row.workspace_key || 'workspace')}</div>
                    <div class="content-card-meta">monthly ${studioMoney(row.monthly_budget_usd)} / alert ${studioMoney(row.alert_threshold_usd)}</div>
                </article>
            `).join('') : ''}
        </div>
    `;
}

function renderStudioHandoffPanel(detail = {}) {
    const exports = detail.exports || [];
    return `
        <div class="task-actions">
            <button class="task-action primary" type="button" onclick="handoffStudioAiVideoWorker(event, ${Number(detail.project.id)})">Create Worker Handoff</button>
            <button class="task-action primary" type="button" onclick="handoffStudioProject(event, ${Number(detail.project.id)})">Create Content Handoff</button>
        </div>
        <p class="settings-disabled-note">Studio handoffs create local review records only. Worker handoff packages source, storyboard, prompt pack, and review gates for the AI video worker. Content handoff creates local Content job records. Neither publishes, sends, schedules, uploads, or calls an external provider.</p>
        ${studioAiVideoWorkerHandoff ? renderStudioAiVideoWorkerHandoffReview(studioAiVideoWorkerHandoff) : ''}
        ${studioHandoffResult ? renderStudioHandoffReview(studioHandoffResult) : ''}
        <div class="task-list">
            ${exports.length ? exports.map(item => `
                <article class="task-card">
                    <div class="task-title">${escapeHtml(item.export_type || 'export')}</div>
                    <div class="task-meta"><span>${escapeHtml(item.status || '')}</span><span>${escapeHtml(formatDateTime(item.created_at) || '')}</span><span>${item.content_job_id ? `Content job #${Number(item.content_job_id)}` : 'No content job'}</span></div>
                </article>
            `).join('') : '<div class="empty-state">No Content handoffs have been created for this project.</div>'}
        </div>
    `;
}

function studioFormPayload(form) {
    const payload = Object.fromEntries(new FormData(form).entries());
    Object.keys(payload).forEach((key) => {
        if (typeof payload[key] === 'string') payload[key] = payload[key].trim();
        if (payload[key] === '') delete payload[key];
    });
    return payload;
}

function setStudioSection(section) {
    currentView = 'studio';
    setCurrentSection(section);
}

async function selectStudioProject(id) {
    selectedStudioProjectId = Number(id || 0) || null;
    studioCorrectionPreview = null;
    studioCorrectionPayload = null;
    studioSidekickPreview = null;
    studioOpenArtExport = null;
    studioRepairPlan = null;
    studioCompiledPrompt = null;
    studioHandoffResult = null;
    studioAiVideoWorkerHandoff = null;
    studioReviewPackResult = null;
    syncOperationsUrl();
    render();
    await loadStudioData({ includeDetail: true }).then(() => render()).catch(error => {
        studioNotice = error.message || 'Studio project could not load.';
        render();
    });
}

async function createStudioProjectFromForm(event) {
    event?.preventDefault?.();
    const form = event?.currentTarget;
    const payload = studioFormPayload(form);
    payload.project_key = normalizeProjectKey(payload.project_key || studioDefaultProjectKey());
    payload.workspace_key = studioDefaultWorkspaceKey(payload.project_key);
    payload.brief_json = {
        target_audience: payload.target_audience || '',
        format: payload.format || 'slideshow_video'
    };
    try {
        const result = await api.createStudioProject(payload);
        selectedStudioProjectId = Number(result?.project?.id || 0) || selectedStudioProjectId;
        studioSection = 'source';
        studioNotice = 'Studio project created.';
        studioReviewPackResult = null;
        form?.reset?.();
        await loadStudioData({ includeDetail: true });
        syncOperationsUrl();
    } catch (error) {
        studioNotice = error.message || 'Studio project could not be created.';
    }
    render();
}

async function saveStudioLibraryFromForm(event, projectId) {
    event?.preventDefault?.();
    const payload = studioFormPayload(event?.currentTarget);
    const currentProject = studioProjectDetail?.project || {};
    const metadata = currentProject.metadata && typeof currentProject.metadata === 'object' ? currentProject.metadata : {};
    try {
        await api.updateStudioProject(projectId, {
            character_bible: parseStudioCharacterLibrary(payload.character_bible_text || ''),
            guardrails: parseStudioGuardrailLibrary(payload.guardrails_text || ''),
            metadata: {
                ...metadata,
                studio_scenario_tags: studioUniqueTextList(payload.scenario_tags_text || ''),
                studio_library_updated_at: new Date().toISOString(),
            },
        });
        studioNotice = 'Studio library saved.';
        studioCompiledPrompt = null;
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Studio library could not be saved.';
    }
    render();
}

async function saveStudioSourceFromForm(event, projectId) {
    event?.preventDefault?.();
    const form = event?.currentTarget;
    const payload = studioFormPayload(form);
    try {
        await api.saveStudioSource(projectId, payload);
        studioNotice = 'Source saved and normalized.';
        studioReviewPackResult = null;
        form?.reset?.();
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Source could not be saved.';
    }
    render();
}

async function prepareStudioReviewPackFromForm(event, projectId) {
    event?.preventDefault?.();
    const form = event?.currentTarget?.closest?.('form') || event?.currentTarget;
    const payload = studioFormPayload(form);
    const hasNewSource = Boolean(payload.raw_text || payload.raw_html || payload.source_url);
    const existingSourceCount = (studioProjectDetail?.sources || []).length;
    if (!hasNewSource && !existingSourceCount) {
        studioNotice = 'Paste source text before preparing a review pack.';
        render();
        return;
    }
    const sceneCount = Math.max(1, Math.min(12, Number(payload.scene_count || 3) || 3));
    const sourcePayload = { ...payload };
    delete sourcePayload.scene_count;
    const steps = [];
    try {
        const sourceResult = hasNewSource ? await api.saveStudioSource(projectId, sourcePayload) : null;
        if (sourceResult?.source) {
            steps.push({
                label: 'Source saved',
                status: 'done',
                detail: sourceResult.normalized?.source_hash || sourceResult.source.source_hash || sourceResult.source.title,
            });
        }

        const storyboardResult = await api.generateStudioStoryboard(projectId, { scene_count: sceneCount });
        const scenes = storyboardResult?.scenes || storyboardResult?.storyboard?.scenes || [];
        steps.push({
            label: 'Storyboard generated',
            status: 'done',
            detail: `${scenes.length || sceneCount} scene${(scenes.length || sceneCount) === 1 ? '' : 's'}`,
        });

        const promptResult = await api.compileStudioPrompt(projectId, {});
        studioCompiledPrompt = promptResult?.compiled_prompt || null;
        const promptLayers = studioCompiledPrompt?.layers || [];
        steps.push({
            label: 'Prompt compiled',
            status: 'done',
            detail: `${promptLayers.length || 'review'} layer${promptLayers.length === 1 ? '' : 's'}`,
        });

        const renderResult = await api.renderStudioProject(projectId, { render_format: 'mp4_preview' });
        const manifest = renderResult?.manifest || renderResult?.job?.result_payload || {};
        const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
        steps.push({
            label: 'Mock render ready',
            status: 'done',
            detail: `${assets.length || 'mock'} asset${assets.length === 1 ? '' : 's'}`,
        });

        const workerResult = await api.handoffStudioAiVideoWorker(projectId, {
            approved_by: opsMe?.username || 'operations',
            sidekick_patch: studioSidekickPreview?.patch || studioCorrectionPreview || null,
        });
        studioAiVideoWorkerHandoff = workerResult;
        const promptPack = workerResult?.prompt_pack || workerResult?.handoff?.prompt_pack || null;
        const scenePrompts = promptPack?.scene_prompts || [];
        steps.push({
            label: 'Prompt pack built',
            status: 'done',
            detail: `${scenePrompts.length || scenes.length || 'review'} scene prompt${(scenePrompts.length || scenes.length) === 1 ? '' : 's'}`,
        });
        steps.push({
            label: 'Worker handoff ready',
            status: 'done',
            detail: workerResult?.handoff?.idempotency_key || 'AI video worker review',
        });

        studioReviewPackResult = {
            prepared_at: new Date().toISOString(),
            source: sourceResult?.source || (studioProjectDetail?.sources || [])[0] || null,
            normalized: sourceResult?.normalized || null,
            storyboard: storyboardResult?.storyboard || { scenes },
            scenes,
            compiled_prompt: studioCompiledPrompt,
            prompt_pack: promptPack,
            worker_handoff: workerResult?.handoff || null,
            job: renderResult?.job || null,
            manifest,
            external_write_performed: false,
            steps,
        };
        studioNotice = 'Review pack prepared: source, storyboard, prompt pack, mock assets, and worker handoff are ready.';
        studioSection = 'source';
        form?.reset?.();
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Review pack could not be prepared.';
    }
    render();
}

async function generateStudioOutline(event, projectId) {
    event?.preventDefault?.();
    try {
        await api.generateStudioOutline(projectId, {});
        studioNotice = 'Outline job created.';
        await loadStudioData({ includeDetail: true });
        studioSection = 'jobs';
    } catch (error) {
        studioNotice = error.message || 'Outline could not be generated.';
    }
    render();
}

async function generateStudioStoryboard(event, projectId) {
    event?.preventDefault?.();
    const payload = event?.currentTarget?.tagName === 'FORM' ? studioFormPayload(event.currentTarget) : {};
    if (payload.scene_count) payload.scene_count = Number(payload.scene_count);
    if (payload.tone || payload.style_key) payload.brief = { tone: payload.tone || '', style_key: payload.style_key || '' };
    try {
        await api.generateStudioStoryboard(projectId, payload);
        studioNotice = 'Storyboard generated.';
        studioSection = 'storyboard';
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Storyboard could not be generated.';
    }
    render();
}

async function compileStudioPrompt(event, projectId) {
    event?.preventDefault?.();
    const payload = studioFormPayload(event?.currentTarget);
    if (payload.scene_id) payload.scene_id = Number(payload.scene_id);
    try {
        const result = await api.compileStudioPrompt(projectId, payload);
        studioCompiledPrompt = result?.compiled_prompt || null;
        studioNotice = 'Prompt compiled.';
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Prompt could not be compiled.';
    }
    render();
}

function studioSidekickFormFromEvent(event) {
    return event?.currentTarget?.closest?.('[data-studio-sidekick-form]')
        || event?.target?.closest?.('[data-studio-sidekick-form]')
        || event?.currentTarget
        || null;
}

async function previewStudioSidekickPatch(event, projectId) {
    event?.preventDefault?.();
    const form = studioSidekickFormFromEvent(event);
    const payload = studioFormPayload(form);
    if (payload.scene_id) payload.scene_id = Number(payload.scene_id);
    try {
        const result = await api.previewStudioSidekickPatch(projectId, payload);
        studioSidekickPreview = result?.sidekick || null;
        studioCorrectionPreview = result?.patch || studioSidekickPreview?.patch || null;
        studioCorrectionPayload = {
            correction: studioCorrectionPreview?.correction || payload.correction_text || '',
            scope: studioCorrectionPreview?.scope || payload.scope || 'project',
            scene_id: payload.scene_id || null,
        };
        studioNotice = 'Sidekick patch preview ready.';
    } catch (error) {
        studioNotice = error.message || 'Sidekick patch preview failed.';
    }
    render();
}

async function exportStudioOpenArtPrompt(event, projectId) {
    event?.preventDefault?.();
    const form = studioSidekickFormFromEvent(event);
    const payload = studioFormPayload(form);
    if (payload.scene_id) payload.scene_id = Number(payload.scene_id);
    const references = [payload.image_reference].filter(Boolean);
    try {
        const result = await api.exportStudioOpenArtPrompt(projectId, {
            ...payload,
            sidekick_patch: studioSidekickPreview?.patch || studioCorrectionPreview || null,
            references,
        });
        studioOpenArtExport = result?.openart_export || null;
        const promptText = studioOpenArtExport?.copy_text || '';
        if (promptText && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(promptText);
            studioNotice = 'OpenArt prompt exported and copied.';
        } else {
            studioNotice = 'OpenArt prompt exported.';
        }
    } catch (error) {
        studioNotice = error.message || 'OpenArt prompt export failed.';
    }
    render();
}

async function copyStudioOpenArtPrompt(event) {
    event?.preventDefault?.();
    const promptText = studioOpenArtExport?.copy_text || '';
    if (!promptText) {
        studioNotice = 'Export an OpenArt prompt before copying.';
        render();
        return;
    }
    try {
        await navigator.clipboard?.writeText(promptText);
        studioNotice = 'OpenArt prompt copied.';
    } catch {
        studioNotice = 'OpenArt prompt is available in diagnostics.';
    }
    render();
}

async function planStudioRepairRequest(event, projectId) {
    event?.preventDefault?.();
    const form = studioSidekickFormFromEvent(event);
    const payload = studioFormPayload(form);
    const project = studioProjectDetail?.project || studioCurrentProject() || {};
    const text = [
        'Studio repair request',
        payload.correction_text,
        payload.image_observation,
        payload.image_reference,
        payload.target ? `target ${payload.target}` : '',
    ].filter(Boolean).join(': ');
    try {
        const result = await api.planStudioRepair({
            action: 'studio_repair_request',
            text,
            project_key: project.project_key || studioDefaultProjectKey(),
            workspace_key: project.workspace_key || studioDefaultWorkspaceKey(project.project_key),
            studio_project_id: projectId,
        });
        studioRepairPlan = result?.plan || null;
        studioNotice = studioRepairPlan?.allowed ? 'Studio repair plan ready.' : 'Studio repair request is outside scope.';
    } catch (error) {
        studioNotice = error.message || 'Studio repair plan failed.';
    }
    render();
}

async function previewStudioCorrection(event, projectId) {
    event?.preventDefault?.();
    const payload = studioFormPayload(event?.currentTarget);
    if (payload.scene_id) payload.scene_id = Number(payload.scene_id);
    try {
        const result = await api.previewStudioCorrection(projectId, payload);
        studioCorrectionPreview = result?.patch || null;
        studioCorrectionPayload = payload;
        studioNotice = 'Correction preview ready.';
    } catch (error) {
        studioNotice = error.message || 'Correction preview failed.';
    }
    render();
}

async function applyStudioCorrection(event, projectId) {
    event?.preventDefault?.();
    if (!studioCorrectionPreview) {
        studioNotice = 'Preview a correction before applying it.';
        render();
        return;
    }
    try {
        const result = await api.applyStudioCorrection(projectId, {
            correction: studioCorrectionPreview.correction || '',
            scope: studioCorrectionPreview.scope || 'project',
            scene_id: studioCorrectionPayload?.scene_id || null,
            confirmed: true
        });
        studioCorrectionPreview = result?.patch || null;
        studioNotice = 'Correction applied.';
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Correction could not be applied.';
    }
    render();
}

async function updateStudioSceneFromForm(event, sceneId) {
    event?.preventDefault?.();
    const payload = studioFormPayload(event?.currentTarget);
    ['position', 'duration_seconds'].forEach(key => {
        if (payload[key] !== undefined) payload[key] = Number(payload[key]);
    });
    try {
        await api.updateStudioScene(sceneId, payload);
        studioNotice = 'Scene saved.';
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Scene could not be saved.';
    }
    render();
}

async function regenerateStudioScene(event, sceneId) {
    event?.preventDefault?.();
    try {
        await api.regenerateStudioScene(sceneId, { instruction: 'Regenerate from Operations Studio' });
        studioNotice = 'Scene mock regeneration queued.';
        studioSection = 'jobs';
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Scene regeneration failed.';
    }
    render();
}

async function renderStudioMock(event, projectId) {
    event?.preventDefault?.();
    try {
        await api.renderStudioProject(projectId, { render_format: 'mp4_preview' });
        studioNotice = 'Mock render completed.';
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Mock render failed.';
    }
    render();
}

async function retryStudioJob(event, jobId) {
    event?.preventDefault?.();
    try {
        await api.retryStudioJob(jobId, {});
        studioNotice = 'Studio job queued for retry.';
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Studio job retry failed.';
    }
    render();
}

async function cancelStudioJob(event, jobId) {
    event?.preventDefault?.();
    try {
        await api.cancelStudioJob(jobId, { reason: 'Cancelled from Operations Studio' });
        studioNotice = 'Studio job cancelled.';
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Studio job cancellation failed.';
    }
    render();
}

async function handoffStudioAiVideoWorker(event, projectId) {
    event?.preventDefault?.();
    try {
        const result = await api.handoffStudioAiVideoWorker(projectId, {
            approved_by: opsMe?.username || 'operations',
            sidekick_patch: studioSidekickPreview?.patch || studioCorrectionPreview || null,
        });
        studioAiVideoWorkerHandoff = result || null;
        studioReviewPackResult = {
            ...(studioReviewPackResult || {}),
            prompt_pack: result?.prompt_pack || result?.handoff?.prompt_pack || null,
            worker_handoff: result?.handoff || null,
            external_write_performed: false,
        };
        studioNotice = 'AI video worker handoff ready.';
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'AI video worker handoff failed.';
    }
    render();
}

async function handoffStudioProject(event, projectId) {
    event?.preventDefault?.();
    try {
        const result = await api.handoffStudioProject(projectId, { approved_by: opsMe?.username || 'operations' });
        studioHandoffResult = result || null;
        studioNotice = 'Content handoff created.';
        await loadStudioData({ includeDetail: true });
    } catch (error) {
        studioNotice = error.message || 'Content handoff failed.';
    }
    render();
}

function renderApiUsage() {
    const counts = apiUsageSubnavCounts();
    const errorTickets = supportTickets.filter(ticket => !['resolved', 'closed'].includes(ticket.status) && /bot|api|openai|kimi|telegram|automation/i.test(`${ticket.category || ''} ${ticket.title || ''} ${ticket.description || ''}`));
    const studioRollup = studioUsageRollup();
    const studioEvents = studioUsage.events || studioUsage.recent_events || [];
    return `
        <div class="container">
            <div class="page-heading saas-page-heading">
                <div>
                    <div class="page-kicker">Usage</div>
                    <h2>API Usage</h2>
                    <p>Usage is grouped by workspace, role/account, provider, bot, and Studio provider jobs where existing logs support it.</p>
                    <p class="settings-disabled-note">Token/cost values stay blank until backend tracking is added for provider-bot and general API events. No fake cost is shown until API metering persistence exists.</p>
                </div>
            </div>
            <section class="focus-panel">
                <div class="usage-grid">
                    ${renderUsageMetricCard('Messages / Notes', contactCommunications.length, 'Existing communication records; not a token counter.')}
                    ${renderUsageMetricCard('Bot/API Issues', counts.errors, 'Open support/error records related to bots, APIs, or automations.')}
                    ${renderUsageMetricCard('Tracked Workspaces', counts.workspace, 'Projects/workspaces currently visible to this login.')}
                    ${renderUsageMetricCard('Studio Cost', studioMoney(studioRollupNumber(studioRollup, 'estimated_cost_usd')), 'Estimated cost from Studio usage-event persistence.')}
                </div>
            </section>
            ${apiUsageSection === 'provider' || apiUsageSection === 'overview' ? `
                <section class="focus-panel">
                    <div class="task-section-header"><h3>Studio Metering</h3><span>${studioEvents.length} recent events</span></div>
                    <div class="usage-grid">
                        ${renderUsageMetricCard('Studio Tokens', studioRollupNumber(studioRollup, 'input_tokens') + studioRollupNumber(studioRollup, 'output_tokens'), 'Input plus output tokens.')}
                        ${renderUsageMetricCard('Studio Media', studioRollupNumber(studioRollup, 'media_seconds'), 'Media seconds recorded by render jobs.')}
                        ${renderUsageMetricCard('Studio Jobs', (studioDashboard.jobs || []).length, 'Recent Studio jobs visible in this workspace.')}
                        ${renderUsageMetricCard('Studio Projects', (studioDashboard.projects || studioProjects || []).length, 'Visible Studio projects.')}
                    </div>
                </section>
            ` : ''}
            ${apiUsageSection === 'errors' || apiUsageSection === 'overview' ? `
                <section class="focus-panel">
                    <div class="task-section-header"><h3>Errors / Rate Limits</h3><span>${errorTickets.length} open records</span></div>
                    ${errorTickets.length ? `<div class="task-list">${errorTickets.map(renderSupportTicketCard).join('')}</div>` : '<div class="empty-state">No open bot/API support records are loaded.</div>'}
                </section>
            ` : ''}
            ${apiUsageSection !== 'errors' && apiUsageSection !== 'overview' ? renderNotConfiguredPanel(API_USAGE_SUBTABS.find(tab => tab.id === apiUsageSection)?.label || 'API Usage', 'Detailed token, model, cost, budget, and export controls are not enabled for this account view yet.') : ''}
        </div>
    `;
}

function renderUsageMetricCard(label, value, note) {
    return `
        <article class="usage-metric-card">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(String(value))}</strong>
            <p>${escapeHtml(note)}</p>
        </article>
    `;
}

function renderTeamAdmin() {
    if (adminSection === 'tickets' || adminSection === 'overview') {
        return renderSupport({ adminShell: true });
    }
    if (adminSection === 'identity') {
        return renderIdentityReviewQueue();
    }
    if (adminSection === 'operator_setup') {
        return renderOperatorSetupPanel();
    }
    return `
        <div class="container">
            <div class="page-heading saas-page-heading">
                <div>
                    <div class="page-kicker">Team / Admin</div>
                    <h2>${escapeHtml(ADMIN_SUBTABS.find(tab => tab.id === adminSection)?.label || 'Admin')}</h2>
                    <p>Manage platform users, workspace access, invitations, tickets, and team messages. Missing persistence is intentionally disabled.</p>
                </div>
            </div>
            ${adminSection === 'users' ? renderAdminUsersPanel() : ''}
            ${adminSection === 'roles' ? renderAdminRolesPolicyPanel() : ''}
            ${adminSection === 'workspaces' ? renderAdminWorkspacesPanel() : ''}
            ${['invitations', 'messages', 'settings'].includes(adminSection) ? renderNotConfiguredPanel(ADMIN_SUBTABS.find(tab => tab.id === adminSection)?.label || 'Admin', 'This admin workflow is not enabled for this account view yet.') : ''}
        </div>
    `;
}

function renderIdentityReviewQueue() {
    const openReviews = identityMergeReviews.filter(review => String(review.status || 'open') === 'open');
    const rows = identityMergeReviews.length ? identityMergeReviews : openReviews;
    return `
        <div class="container">
            <div class="page-heading saas-page-heading">
                <div>
                    <div class="page-kicker">Identity Linking</div>
                    <h2>Merge Review Queue</h2>
                    <p>Review parent contact conflicts, ambiguous child matches, and backfill issues before any identity merge is trusted.</p>
                </div>
                <div class="task-actions">
                    <button class="task-action" type="button" onclick="refreshIdentityMergeReviews(event)">Refresh Queue</button>
                    <button class="task-action" type="button" onclick="runIdentityBackfill(event, false)">Dry-run Backfill</button>
                    <button class="task-action primary" type="button" onclick="runIdentityBackfill(event, true)">Apply 50 Backfill Rows</button>
                </div>
            </div>
            ${identityBackfillNotice ? `<div class="settings-disabled-note">${escapeHtml(identityBackfillNotice)}</div>` : ''}
            <section class="focus-panel">
                <div class="task-section-header">
                    <h3>Open Identity Reviews</h3>
                    <span>${openReviews.length} open / ${identityMergeReviews.length} loaded</span>
                </div>
                ${rows.length ? `<div class="task-list">${rows.map(renderIdentityReviewCard).join('')}</div>` : '<div class="empty-state">No merge reviews are loaded. Refresh the queue or run the backfill dry-run.</div>'}
            </section>
        </div>
    `;
}

function renderIdentityReviewDetails(signals = {}, metadata = {}) {
    const details = [];
    const addDetail = (label, value) => {
        if (value == null || value === '') return;
        const text = typeof value === 'object'
            ? Object.entries(value).map(([key, item]) => `${automationOptionLabel(key)}: ${automationPermissionValueLabel(item)}`).join('; ')
            : String(value);
        if (!text.trim()) return;
        details.push({ label, value: text });
    };
    addDetail('Email Signal', signals.email);
    addDetail('Phone Signal', signals.phone);
    addDetail('Match Reason', metadata.match_reason || metadata.reason);
    addDetail('Source', metadata.source || metadata.source_channel || signals.source);
    addDetail('Confidence', metadata.confidence || signals.confidence);
    Object.entries(metadata)
        .filter(([key]) => !['match_reason', 'reason', 'source', 'source_channel', 'confidence'].includes(key))
        .slice(0, 4)
        .forEach(([key, value]) => addDetail(automationOptionLabel(key), value));
    if (!details.length) {
        return '<div class="event-meta">No additional review signals are recorded.</div>';
    }
    return `
        <div class="identity-review-details" aria-label="Identity review signals">
            ${details.slice(0, 8).map(item => `
                <div class="identity-review-detail">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(item.value)}</strong>
                </div>
            `).join('')}
        </div>
    `;
}

function renderIdentityReviewCard(review = {}) {
    const signals = parseJsonField(review.signals) || {};
    const metadata = parseJsonField(review.metadata) || {};
    const status = String(review.status || 'open');
    return `
        <article class="task-card">
            <div class="task-card-header">
                <div>
                    <div class="task-title">#${Number(review.id)} ${escapeHtml(String(review.review_type || 'possible_duplicate').replace(/_/g, ' '))}</div>
                    <div class="task-meta">
                        <span>${escapeHtml(status)}</span>
                        <span>${escapeHtml(review.household_name || `household:${review.household_id || 'none'}`)}</span>
                        <span>${escapeHtml(formatDateTime(review.created_at))}</span>
                    </div>
                </div>
            </div>
            <p class="task-notes">${escapeHtml(review.reason || 'Review these records before merging identities.')}</p>
            <div class="student-row-meta" style="margin:8px 0;">
                <span>person ${escapeHtml(review.person_name || review.person_id || 'new')}</span>
                <span>candidate ${escapeHtml(review.candidate_person_name || review.candidate_person_id || 'none')}</span>
                ${signals.email ? `<span>email ${escapeHtml(signals.email)}</span>` : ''}
                ${signals.phone ? `<span>phone ${escapeHtml(signals.phone)}</span>` : ''}
            </div>
            ${renderIdentityReviewDetails(signals, metadata)}
            <div class="task-actions">
                ${status !== 'resolved' ? `<button class="task-action primary" onclick="updateIdentityMergeReview(event, ${Number(review.id)}, 'resolved')">Mark Resolved</button>` : ''}
                ${status !== 'rejected' ? `<button class="task-action" onclick="updateIdentityMergeReview(event, ${Number(review.id)}, 'rejected')">Reject Merge</button>` : ''}
                ${status !== 'archived' ? `<button class="task-action" onclick="updateIdentityMergeReview(event, ${Number(review.id)}, 'archived')">Archive</button>` : ''}
            </div>
        </article>
    `;
}

function renderOperatorSetupPanel() {
    const isSuperAdmin = opsMe?.scope?.type !== 'project';
    const status = operatorSetupStatus;
    const required = Array.isArray(status?.required_env) ? status.required_env : [];
    const missing = status?.env_summary?.missing_required || [];
    const result = operatorSetupResult;
    return `
        <div class="container">
            <div class="page-heading saas-page-heading">
                <div>
                    <div class="page-kicker">Secure Operator Setup</div>
                    <h2>Operator Setup</h2>
                    <p>Create a short-lived laptop bootstrap package for the platform operator. Secret exports require encryption, a passphrase, and an explicit approval phrase.</p>
                </div>
                <div class="task-actions">
                    <button class="task-action" type="button" onclick="refreshOperatorSetupStatus(event)">Refresh Status</button>
                </div>
            </div>
            ${operatorSetupError ? `<div class="error-banner">${escapeHtml(operatorSetupError)}</div>` : ''}
            ${result?.url ? `
                <section class="focus-panel" data-operator-bootstrap-result>
                    <div class="task-section-header">
                        <div>
                            <h3>One-Time Download Ready</h3>
                            <p class="settings-disabled-note">Expires at ${escapeHtml(formatDateTime(result.expires_at))}. After one successful download, the link is burned.</p>
                        </div>
                        <span>${result.encrypted ? 'Encrypted' : 'Safe package'}</span>
                    </div>
                    <div class="settings-control-row">
                        <div>
                            <strong>${escapeHtml(result.filename || 'BNA bootstrap package')}</strong>
                            <p>${escapeHtml(result.encrypted ? 'Contains encrypted environment values. You need the passphrase when importing.' : 'Contains setup metadata and a blanked env template. No secret values are included.')}</p>
                        </div>
                        <a class="task-action primary" href="${escapeHtml(result.url)}" download="${escapeHtml(result.filename || 'bna-operator-bootstrap.json')}">Download Once</a>
                    </div>
                </section>
            ` : ''}
            <section class="focus-panel" data-operator-bootstrap-status>
                <div class="task-section-header">
                    <div>
                        <h3>Environment Readiness</h3>
                        <p class="settings-disabled-note">This readback shows only keys, sources, lengths, and fingerprints. It never displays values.</p>
                    </div>
                    <span>${isSuperAdmin ? 'Super Admin' : 'Blocked'}</span>
                </div>
                <div class="task-overview-grid">
                    ${renderOperatorSetupMetric('Env Keys', status?.env_summary?.total_keys ?? '-', 'Keys parsed from .env.example.')}
                    ${renderOperatorSetupMetric('Sensitive Configured', status?.env_summary ? `${status.env_summary.configured_sensitive_keys}/${status.env_summary.sensitive_keys}` : '-', 'Fingerprint-only readiness for sensitive values.')}
                    ${renderOperatorSetupMetric('Missing Required', missing.length, missing.length ? missing.join(', ') : 'DATABASE_URL, OPS_USERNAME, and OPS_PASSWORD look configured.')}
                    ${renderOperatorSetupMetric('Expires In', status?.package_ttl_minutes ? `${status.package_ttl_minutes} min` : '10 min', 'Generated packages are short-lived and one-time.')}
                </div>
                <div class="settings-control-grid" style="margin-top:14px;">
                    ${required.map(item => renderSettingsControlRow(item.key, item.configured ? 'Configured' : 'Missing', item.fingerprint ? `fingerprint ${item.fingerprint}; source ${item.source || 'unknown'}` : `source ${item.source || 'not found'}`, item.configured ? 'Ready' : 'Missing')).join('')}
                    ${renderSettingsControlRow('Secret export policy', 'Encrypted only', `Approval phrase: ${status?.secret_export_approval_phrase || 'APPROVE_OPERATOR_ENV_SECRET_EXPORT'}`, 'Guarded')}
                    ${renderSettingsControlRow('Importer', status?.import_script || 'scripts/import-operator-bootstrap.mjs', 'Run this script on the laptop after downloading the package.', 'Local')}
                </div>
            </section>
            <section class="focus-panel">
                <div class="task-section-header">
                    <div>
                        <h3>Safe Bootstrap Package</h3>
                        <p class="settings-disabled-note">Creates a download with .env.example-derived keys, setup commands, and secret fingerprints only. It does not include secret values.</p>
                    </div>
                    <span>No secrets</span>
                </div>
                <form class="announcement-approval-form" onsubmit="createOperatorSetupPackage(event, false)">
                    <div class="task-actions">
                        <button class="task-action primary" type="submit" ${operatorSetupBusy || !isSuperAdmin ? 'disabled' : ''}>${operatorSetupBusy ? 'Preparing...' : 'Create Safe Download'}</button>
                    </div>
                </form>
            </section>
            <section class="focus-panel">
                <div class="task-section-header">
                    <div>
                        <h3>Encrypted Env Export</h3>
                        <p class="settings-disabled-note">Use only when you intentionally need a secret-bearing package for your own laptop. The passphrase is sent for encryption and is not stored.</p>
                    </div>
                    <span>Approval required</span>
                </div>
                <form class="announcement-approval-form" onsubmit="createOperatorSetupPackage(event, true)" autocomplete="off">
                    <div class="announcement-field-grid">
                        <label class="announcement-field">
                            <span>Approval phrase</span>
                            <input name="approval_phrase" autocomplete="off" placeholder="APPROVE_OPERATOR_ENV_SECRET_EXPORT">
                        </label>
                        <label class="announcement-field">
                            <span>Encryption passphrase</span>
                            <input name="passphrase" type="password" autocomplete="new-password" placeholder="20+ characters">
                        </label>
                    </div>
                    <div class="settings-control-grid">
                        ${renderSettingsControlRow('Storage', 'Encrypted payload', 'BNA stores only the encrypted package until expiry or first download.', 'One-time')}
                        ${renderSettingsControlRow('Import command', 'node scripts/import-operator-bootstrap.mjs <file>', 'The importer asks for the passphrase and writes .env.local without printing values.', 'Local')}
                    </div>
                    <div class="task-actions">
                        <button class="task-action primary" type="submit" ${operatorSetupBusy || !isSuperAdmin ? 'disabled' : ''}>${operatorSetupBusy ? 'Encrypting...' : 'Create Encrypted Download'}</button>
                    </div>
                </form>
            </section>
        </div>
    `;
}

function renderOperatorSetupMetric(label, value, note) {
    return `
        <div class="metric-button" title="${escapeHtml(note)}">
            <span class="metric-label">${escapeHtml(label)}</span>
            <span class="metric-value">${escapeHtml(String(value ?? '-'))}</span>
            <span class="metric-note">${escapeHtml(note)}</span>
        </div>
    `;
}

function adminUserMetadata(row) {
    return parseJsonField(row?.metadata) || {};
}

function adminUserWorkspaceLabel(row) {
    return row.project_short_name || row.project_name || row.project_key || row.workspace_key || 'Workspace';
}

function adminUserRoleLabel(row) {
    const metadata = adminUserMetadata(row);
    return row.canonical_role_label
        || metadata.canonical_role_label
        || metadata.workspace_role_label
        || row.workspace_role_label
        || row.role
        || 'external user';
}

const WORKSPACE_USER_ROLE_OPTIONS = [
    ['platform_super_admin', 'Platform Super Admin', 'platform'],
    ['platform_manager', 'Platform Manager', 'platform'],
    ['support_admin', 'Support Admin', 'platform'],
    ['technical_agent', 'Technical Agent', 'platform'],
    ['workspace_owner', 'Workspace Owner', 'workspace'],
    ['workspace_admin', 'Workspace Admin', 'workspace'],
    ['workspace_manager', 'Workspace Manager', 'workspace'],
    ['provider_staff', 'Provider Staff', 'workspace'],
    ['moderator', 'Moderator', 'workspace'],
    ['parent', 'Parent', 'member'],
    ['student', 'Student', 'member']
];

function workspaceUserCanAssignPlatformRoles() {
    return opsMe?.scope?.type !== 'project';
}

function workspaceUserRoleOptionsHtml(selectedRole = '') {
    const selected = String(selectedRole || '').trim();
    return WORKSPACE_USER_ROLE_OPTIONS
        .filter(([, , scope]) => scope !== 'platform' || workspaceUserCanAssignPlatformRoles())
        .map(([value, label]) => `<option value="${escapeHtml(value)}" ${selected === value ? 'selected' : ''}>${escapeHtml(label)}</option>`)
        .join('');
}

function workspaceUserAccessOptionsHtml(selectedAccess = '') {
    const selected = String(selectedAccess || '').trim();
    return ['owner', 'admin', 'manager', 'member', 'viewer']
        .map(value => `<option value="${escapeHtml(value)}" ${selected === value ? 'selected' : ''}>${escapeHtml(value)}</option>`)
        .join('');
}

function workspaceUserRowsForAdmin() {
    return workspaceUsers.length ? workspaceUsers : people;
}

function workspaceUserMembershipId(row = {}) {
    return row.membership_id || row.workspace_membership_id || '';
}

function adminExternalUserRows() {
    return workspaceUserRowsForAdmin().filter(row => {
        const metadata = adminUserMetadata(row);
        const text = `${row.person_name || row.display_name || row.name || ''} ${row.role || ''} ${row.canonical_role || ''} ${metadata.canonical_role || ''} ${row.project_key || ''} ${row.login_username || ''} ${metadata.account_type || ''}`.toLowerCase();
        return metadata.account_type === 'external_user'
            || row.role_scope === 'workspace'
            || row.role_scope === 'platform'
            || Boolean(row.login_username)
            || /external account admin|one_time_admin|workspace_owner|workspace_admin|workspace_manager|provider_staff|rabbi ellie|rabbi elie|rabbi sheller|rabbi scheller|one_time_mishnah_class/.test(text);
    });
}

function adminInternalUserRows(externalRows) {
    const externalIds = new Set(externalRows.map(row => String(row.id)));
    return people.filter(row => !externalIds.has(String(row.id))).slice(0, 18);
}

function renderAdminExternalUserCard(row) {
    const metadata = adminUserMetadata(row);
    const loginUsername = row.login_username || metadata.login_username || '';
    const isSuperAdmin = opsMe?.scope?.type !== 'project';
    const canCreateLink = isSuperAdmin && loginUsername;
    const workspaceKey = row.project_key || metadata.project_scope || 'one_time_mishnah_class';
    const returnTo = `/operations?workspace=${encodeURIComponent(workspaceFromProjectKey(workspaceKey))}&view=tasks&section=tasks`;
    const pending = adminAccessLinkPendingUsername && adminAccessLinkPendingUsername === loginUsername;
    const membershipId = workspaceUserMembershipId(row);
    const active = row.active !== false;
    const role = row.canonical_role || metadata.canonical_role || row.role || 'provider_staff';
    const canUpdateMembership = Boolean(membershipId);
    const statusLabel = active ? (row.invitation_state || 'active') : (row.invitation_state || 'disabled');
    return `
        <article class="content-card" data-external-user-account>
            <div class="content-card-title">${escapeHtml(row.display_name || row.person_name || row.name || loginUsername || 'External user')}</div>
            <div class="content-card-meta">${escapeHtml(adminUserWorkspaceLabel(row))} / ${escapeHtml(adminUserRoleLabel(row))} / ${escapeHtml(row.access_level || 'viewer')} / ${escapeHtml(statusLabel)}</div>
            <p class="event-meta">${escapeHtml(loginUsername ? `Operations login username: ${loginUsername}` : 'Operations login username is not configured yet.')}</p>
            <div class="settings-control-grid compact">
                ${renderSettingsControlRow('Login state', row.login_state || (loginUsername ? 'configured' : 'not_configured'), 'Readback only; no password or portal credential is created here.', 'Scoped')}
                ${renderSettingsControlRow('Entitlement', row.access_entitlement_status || 'not_configured', 'Member-library or billing entitlement remains separate from Operations user membership.', 'Separate')}
                ${renderSettingsControlRow('Latest activity', row.last_activity_at ? formatDateTime(row.last_activity_at) : 'No activity yet', 'Membership or project-member update timestamp.', active ? 'Active' : 'Inactive')}
            </div>
            <p class="settings-disabled-note">External project user. This is not a parent account, student account, billing user, member-library credential, or live Rabbi-owned app login. Workspace membership changes remain first-party and no-send.</p>
            <form class="task-form-grid compact" data-workspace-user-role-form onsubmit="updateWorkspaceUserRole(event, '${escapeHtml(String(membershipId))}')">
                <select name="canonical_role" ${canUpdateMembership ? '' : 'disabled'}>${workspaceUserRoleOptionsHtml(role)}</select>
                <select name="access_level" ${canUpdateMembership ? '' : 'disabled'}>${workspaceUserAccessOptionsHtml(row.access_level || 'member')}</select>
                <input name="reason" placeholder="Audit reason" value="Operations role update">
                <button class="task-action" type="submit" ${canUpdateMembership ? '' : 'disabled'}>${workspaceUserActionBusy === `role:${membershipId}` ? 'Saving...' : 'Assign Role'}</button>
            </form>
            <div class="task-actions">
                <button type="button" ${canCreateLink ? '' : 'disabled'} onclick="createAdminOpsAccessLink('${escapeHtml(loginUsername)}', '${escapeHtml(returnTo)}')">${pending ? 'Creating...' : 'Create 20 min link'}</button>
                <button type="button" ${canUpdateMembership ? '' : 'disabled'} onclick="workspaceUserMembershipAction('${escapeHtml(String(membershipId))}', '${active ? 'deactivate' : 'reactivate'}')">${active ? 'Deactivate' : 'Reactivate'}</button>
                <button type="button" ${canUpdateMembership && isSuperAdmin ? '' : 'disabled'} onclick="workspaceUserMembershipAction('${escapeHtml(String(membershipId))}', 'remove_membership')">Remove Membership</button>
            </div>
        </article>
    `;
}

function renderAdminInternalUserCard(row) {
    const metadata = adminUserMetadata(row);
    const contact = [metadata.email || row.email, metadata.phone || row.phone].filter(Boolean).join(' / ');
    return `
        <article class="contact-card">
            <div class="contact-card-body">
                <div class="contact-card-title">${escapeHtml(row.person_name || row.name || row.email || 'User')}</div>
                <div class="contact-card-subtitle">${escapeHtml([adminUserWorkspaceLabel(row), adminUserRoleLabel(row), row.access_level, contact].filter(Boolean).join(' / '))}</div>
            </div>
        </article>
    `;
}

function renderAdminAccessLinkResult() {
    if (adminAccessLinkError) {
        return `<div class="error-banner">${escapeHtml(adminAccessLinkError)}</div>`;
    }
    if (!adminAccessLinkResult?.url) return '';
    return `
        <div class="focus-panel" data-admin-access-link-result>
            <div class="task-section-header">
                <div>
                    <h3>Short-Lived Access Link Created</h3>
                    <p class="settings-disabled-note">Share this outside the repo/chat using the approved private channel. It expires at ${escapeHtml(formatDateTime(adminAccessLinkResult.expires_at))} and redeems once.</p>
                </div>
                <span>No-send</span>
            </div>
            <div class="settings-control-row">
                <div>
                    <strong>${escapeHtml(adminAccessLinkResult.username || 'Operations user')}</strong>
                    <p>${escapeHtml(adminAccessLinkResult.url)}</p>
                </div>
                <button type="button" onclick="copyAdminAccessLink()">Copy</button>
            </div>
        </div>
    `;
}

function renderAdminExternalAccessPreviewResult() {
    if (adminExternalAccessPreviewError) {
        return `<div class="error-banner">${escapeHtml(adminExternalAccessPreviewError)}</div>`;
    }
    const result = adminExternalAccessPreviewResult;
    if (!result) return '';
    const missing = Array.isArray(result.missing_fields) ? result.missing_fields : [];
    const readback = Array.isArray(result.required_readback) ? result.required_readback : [];
    return `
        <div class="focus-panel" data-admin-external-access-preview-result>
            <div class="task-section-header">
                <div>
                    <h3>External Access Preview</h3>
                    <p class="settings-disabled-note">Dry-run readback only. No person, membership, login, access link, send, billing, member-library, Google, Buffer, WAPI, external CRM, or Rabbi app write was performed.</p>
                </div>
                <span>${escapeHtml(result.status || 'preview')}</span>
            </div>
            <div class="task-overview-grid">
                ${renderMetricButton('Missing Fields', missing.length, missing.length ? missing.join(', ') : 'All required preview fields supplied.', '')}
                ${renderMetricButton('External Write', result.external_write_performed ? 'Yes' : 'No', 'Must remain No for preview.', '')}
                ${renderMetricButton('Workspace', result.memberships?.[0]?.project_key || result.memberships?.[0]?.workspace_key || 'Not resolved', 'Target workspace/project for the planned external Operations user.', '')}
                ${renderMetricButton('Access Link', result.access_link?.status || 'not_requested', 'Short-lived link creation is not performed during preview.', '')}
            </div>
            <div class="settings-control-grid" style="margin-top:14px;">
                ${renderSettingsControlRow('Person row', result.person?.would_upsert ? 'Would upsert' : 'Incomplete', `${result.person?.preferred_name || 'No name'}${result.person?.existing_person_id ? ` / existing #${result.person.existing_person_id}` : ''}`, 'Preview')}
                ${renderSettingsControlRow('Project member row', result.project_member?.would_upsert ? 'Would upsert' : 'Incomplete', `${result.project_member?.login_username || 'No username'} / ${result.project_member?.role || 'No role'} / ${result.project_member?.access_level || 'No access level'}`, 'Preview')}
                ${renderSettingsControlRow('Guardrail', 'Locked', 'Not a parent account, student account, provider password, billing user, member-library access, or Rabbi-owned app credential.', 'Policy')}
            </div>
            ${readback.length ? `<div class="settings-control-grid" style="margin-top:14px;">${readback.map((item, index) => renderSettingsControlRow(`Readback ${index + 1}`, 'Required', item, 'Before write')).join('')}</div>` : ''}
        </div>
    `;
}

function renderAdminExternalAccessPreviewForm() {
    const d = adminExternalAccessPreviewDraft;
    const disabled = adminExternalAccessPreviewBusy ? 'disabled' : '';
    return `
        <form class="announcement-approval-form" data-admin-external-access-preview onsubmit="previewAdminExternalAccess(event)">
            <div class="task-section-header compact">
                <div>
                    <h3>External Access Create/Edit Preview</h3>
                    <p class="settings-disabled-note">Preview the approved write shape before any persistence exists. Real create/edit remains locked behind <code>APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW</code> and a future implementation pass.</p>
                </div>
                <span>No-write dry run</span>
            </div>
            <div class="announcement-field-grid">
                <label class="announcement-field">
                    <span>Preferred name</span>
                    <input name="preferred_name" value="${escapeHtml(d.preferred_name)}" placeholder="Rabbi Elie Scheller">
                </label>
                <label class="announcement-field">
                    <span>Email</span>
                    <input name="email" value="${escapeHtml(d.email)}" placeholder="optional email">
                </label>
                <label class="announcement-field">
                    <span>Phone</span>
                    <input name="phone" value="${escapeHtml(d.phone)}" placeholder="optional phone">
                </label>
                <label class="announcement-field">
                    <span>No-contact reason</span>
                    <input name="no_contact_reason" value="${escapeHtml(d.no_contact_reason)}" placeholder="Use if no contact value should be stored">
                </label>
                <label class="announcement-field">
                    <span>Workspace</span>
                    <select name="workspace_key">
                        ${[
                            ['one_time_mishnah_class', 'One Time Mishnah Class'],
                            ['bna', 'BNA School'],
                            ['dratler_family', 'Dratler Family']
                        ].map(([value, label]) => `<option value="${escapeHtml(value)}" ${d.workspace_key === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
                    </select>
                </label>
                <label class="announcement-field">
                    <span>Account classification</span>
                    <select name="account_type">
                        ${[
                            ['external_operations_user', 'External Operations user'],
                            ['one_time_admin', 'One Time admin'],
                            ['service_provider_workspace_user', 'Service provider workspace user'],
                            ['bna_internal_user', 'BNA internal user']
                        ].map(([value, label]) => `<option value="${escapeHtml(value)}" ${d.account_type === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
                    </select>
                </label>
                <label class="announcement-field">
                    <span>Role</span>
                    <input name="role" value="${escapeHtml(d.role)}" placeholder="project owner">
                </label>
                <label class="announcement-field">
                    <span>Access level</span>
                    <select name="access_level">
                        ${['viewer', 'member', 'manager', 'owner'].map(value => `<option value="${escapeHtml(value)}" ${d.access_level === value ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}
                    </select>
                </label>
                <label class="announcement-field">
                    <span>Operations username</span>
                    <input name="login_username" value="${escapeHtml(d.login_username)}" placeholder="scoped username">
                </label>
                <label class="announcement-field">
                    <span>Allowed views</span>
                    <input name="allowed_views" value="${escapeHtml(d.allowed_views)}" placeholder="tasks,content,communications,admin">
                </label>
                <label class="announcement-field">
                    <span>Review by</span>
                    <input name="review_by" value="${escapeHtml(d.review_by)}" placeholder="2026-07-01">
                </label>
                <label class="announcement-field">
                    <span>Rollback owner</span>
                    <input name="rollback_owner" value="${escapeHtml(d.rollback_owner)}" placeholder="Shloimie">
                </label>
            </div>
            <label class="announcement-field">
                <span>Access reason</span>
                <textarea name="access_reason" placeholder="Why this external Operations user needs scoped access">${escapeHtml(d.access_reason)}</textarea>
            </label>
            <div class="announcement-field-grid">
                <label class="announcement-field">
                    <span>Approval phrase for future real write</span>
                    <input name="approval_phrase" value="${escapeHtml(d.approval_phrase)}" placeholder="APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW">
                </label>
                <label class="announcement-field">
                    <span>Delivery policy</span>
                    <select name="delivery_policy">
                        ${['no_send', 'private_manual_delivery_only'].map(value => `<option value="${escapeHtml(value)}" ${d.delivery_policy === value ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}
                    </select>
                </label>
            </div>
            <label class="settings-disabled-note" style="display:flex;gap:8px;align-items:center;">
                <input type="checkbox" name="create_access_link" ${d.create_access_link ? 'checked' : ''}>
                Preview short-lived Operations access link creation. The preview will not create a link.
            </label>
            <div class="task-actions">
                <button class="task-action primary" type="submit" ${disabled}>${adminExternalAccessPreviewBusy ? 'Previewing...' : 'Preview external access'}</button>
                <button class="task-action" type="button" disabled>Real write locked</button>
            </div>
        </form>
    `;
}

function renderWorkspaceUserActionBanners() {
    return `
        ${workspaceUserActionError ? `<div class="error-banner">${escapeHtml(workspaceUserActionError)}</div>` : ''}
        ${workspaceUserActionNotice ? `<div class="success-banner">${escapeHtml(workspaceUserActionNotice)}</div>` : ''}
    `;
}

function renderWorkspaceUserCreateForm() {
    const workspace = currentWorkspaceRecord();
    const workspaceKey = currentWorkspaceKey();
    return `
        <form class="announcement-approval-form" data-workspace-user-create-form onsubmit="createWorkspaceUserFromForm(event)">
            <div class="task-section-header compact">
                <div>
                    <h3>Add Member / Invite User</h3>
                    <p class="settings-disabled-note">Creates a first-party person and workspace membership with no email, WhatsApp, password, billing, member-library credential, or external app write.</p>
                </div>
                <span>No-send</span>
            </div>
            <input type="hidden" name="workspace_key" value="${escapeHtml(workspaceKey)}">
            <div class="announcement-field-grid">
                <label class="announcement-field">
                    <span>Name</span>
                    <input name="person_name" required placeholder="Rabbi Ellie Scheller">
                </label>
                <label class="announcement-field">
                    <span>Email</span>
                    <input name="email" type="email" placeholder="optional">
                </label>
                <label class="announcement-field">
                    <span>Phone</span>
                    <input name="phone" placeholder="optional">
                </label>
                <label class="announcement-field">
                    <span>Role</span>
                    <select name="canonical_role">${workspaceUserRoleOptionsHtml(currentWorkspaceIsOneTime() ? 'provider_staff' : 'workspace_manager')}</select>
                </label>
                <label class="announcement-field">
                    <span>Access level</span>
                    <select name="access_level">${workspaceUserAccessOptionsHtml('member')}</select>
                </label>
                <label class="announcement-field">
                    <span>Login username</span>
                    <input name="login_username" placeholder="Operations username, optional">
                </label>
                <label class="announcement-field">
                    <span>Entitlement status</span>
                    <select name="access_entitlement_status">
                        ${['not_configured', 'active', 'pending_payment', 'paused', 'cancelled'].map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value.replace(/_/g, ' '))}</option>`).join('')}
                    </select>
                </label>
                <label class="announcement-field">
                    <span>Account type</span>
                    <select name="account_type">
                        ${[
                            ['workspace_user', 'Workspace user'],
                            ['provider_staff', 'Provider staff'],
                            ['one_time_parent', 'One Time parent'],
                            ['one_time_student', 'One Time student'],
                            ['technical_agent', 'Technical agent']
                        ].map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('')}
                    </select>
                </label>
            </div>
            <label class="announcement-field">
                <span>Relationship / enrollment note</span>
                <input name="enrollment_relationship" placeholder="Parent of, student enrollment, provider staff assignment">
            </label>
            <label class="announcement-field">
                <span>Audit reason</span>
                <textarea name="reason" placeholder="Why this workspace membership is needed">Workspace membership created from Operations Users screen.</textarea>
            </label>
            <div class="task-actions">
                <button class="task-action primary" type="submit" ${workspaceUserActionBusy === 'create' ? 'disabled' : ''}>${workspaceUserActionBusy === 'create' ? 'Saving...' : 'Invite User'}</button>
                <span class="settings-disabled-note">Workspace: ${escapeHtml(workspace.display_name || workspace.name || workspaceKey)}</span>
            </div>
        </form>
    `;
}

function renderWorkspaceRoleAuditEvents() {
    const rows = workspaceRoleAuditEvents.slice(0, 8);
    return `
        <div class="focus-panel" data-workspace-role-audit-log>
            <div class="task-section-header compact">
                <h3>Role-Change Audit Log</h3>
                <span>${rows.length} shown</span>
            </div>
            <div class="calendar-event-list">
                ${rows.length ? rows.map(event => `
                    <div class="calendar-event-row">
                        <div>
                            <strong>${escapeHtml(event.target_name || `Membership #${event.membership_id || event.id}`)}</strong>
                            <div class="event-meta">${escapeHtml([event.event_type, event.from_role && event.to_role ? `${event.from_role} -> ${event.to_role}` : event.to_role, event.reason].filter(Boolean).join(' / '))}</div>
                        </div>
                        <span class="status-pill">${escapeHtml(event.created_at ? formatDateTime(event.created_at) : 'Audit')}</span>
                    </div>
                `).join('') : '<div class="task-empty">No role-change audit events are loaded for this workspace yet.</div>'}
            </div>
        </div>
    `;
}

function renderAdminUsersPanel() {
    const externalRows = adminExternalUserRows();
    const internalRows = adminInternalUserRows(externalRows);
    const canCreateLinks = opsMe?.scope?.type !== 'project';
    return `
        <section class="focus-panel" data-super-admin-user-management>
            <div class="task-section-header">
                <div>
                    <h3>Users / External Access</h3>
                    <p class="settings-disabled-note">Super Admin can review platform, school, provider, and One Time external users without treating Rabbi/provider users as parents. No email, WhatsApp, password reset, billing, member-library, or external connector write runs from this panel.</p>
                </div>
                <span>${people.length} records</span>
            </div>
            <div class="task-overview-grid">
                ${renderMetricButton('External Users', externalRows.length, 'Project-scoped provider/Rabbi/admin users kept separate from parent accounts.', '')}
                ${renderMetricButton('Internal Users', internalRows.length, 'BNA project members and operators loaded from project-member records.', '')}
                ${renderMetricButton('Access Link Gate', canCreateLinks ? 1 : 0, 'Only Super Admin can create a short-lived Operations access link, and only after clicking the button.', '')}
                ${renderMetricButton('Role Audit', workspaceRoleAuditEvents.length, 'Role changes, deactivations, reactivations, and archived memberships.', '')}
            </div>
            ${renderWorkspaceUserActionBanners()}
            ${renderWorkspaceUserCreateForm()}
            ${renderAdminAccessLinkResult()}
            ${renderWorkspaceRoleAuditEvents()}
            ${renderAdminExternalAccessPreviewResult()}
            ${renderAdminExternalAccessPreviewForm()}
            <div class="task-section-header compact" style="margin-top:14px;"><h3>External Users</h3><span>${externalRows.length} records</span></div>
            ${externalRows.length ? `<div class="content-section-grid">${externalRows.map(renderAdminExternalUserCard).join('')}</div>` : '<div class="empty-state">No external project users are configured yet.</div>'}
            <div class="task-section-header compact" style="margin-top:14px;"><h3>Internal Users</h3><span>${internalRows.length} shown</span></div>
            ${internalRows.length ? `<div class="contact-list">${internalRows.map(renderAdminInternalUserCard).join('')}</div>` : '<div class="empty-state">No internal people records loaded.</div>'}
            <div class="settings-control-grid" style="margin-top:14px;">
                ${renderSettingsControlRow('Invite workspace user', 'Implemented', 'Creates scoped person, membership, project-member readback, and audit log without sending.', 'No-send')}
                ${renderSettingsControlRow('Assign role', 'Implemented', 'Role updates stay in the selected workspace and platform roles are Super Admin-only.', 'Scoped')}
                ${renderSettingsControlRow('Deactivate/reactivate', 'Implemented', 'Memberships are reversible and retain provenance/audit history.', 'Reversible')}
                ${renderSettingsControlRow('Create external user', 'Preview only', 'Dry-run readback exists. Real persistence still requires explicit approval and a future write implementation.', 'No-write')}
                ${renderSettingsControlRow('Parent account separation', 'Required', 'External provider/Rabbi users are project members or Operations identities, not parent portal accounts.', 'Policy')}
                ${renderSettingsControlRow('One Time app credentials', 'Separate', 'This panel manages BNA Operations access only. It does not create Rabbi-owned app/admin/member credentials.', 'Blocked')}
            </div>
        </section>
    `;
}

function adminRolePolicyRows() {
    return [
        {
            role: 'Super Admin / Operator',
            workspace: 'Platform',
            status: 'Implemented',
            access: 'Can inspect all workspace queues, settings, support tickets, and guarded preview tools.',
            guardrail: 'External writes still require the specific action approval phrase and connector readiness.'
        },
        {
            role: 'BNA School Admin / Rabbi',
            workspace: 'BNA School',
            status: 'Implemented',
            access: 'Can manage school parents, students, class content, announcements, Google readiness, and first-party CRM records.',
            guardrail: 'Does not inherit provider/Rabbi-owned app credentials or external Google scopes automatically.'
        },
        {
            role: 'Parent / Primary Contact',
            workspace: 'Family',
            status: 'Implemented',
            access: 'Uses parent magic-link or password setup/reset flows for parent-visible children, weekly updates, documents, messages, and provider index.',
            guardrail: 'Cannot see other families, admin notes, provider private terms, raw prompts, or student-only private credentials.'
        },
        {
            role: 'Second Parent / Spouse',
            workspace: 'Family',
            status: 'Policy Needed',
            access: 'Detected from signup and recipient-preview data, but not auto-granted portal access or weekly-update sending.',
            guardrail: 'Needs explicit spouse/second-parent policy before invitations, sends, access grants, or merged household permissions are added.'
        },
        {
            role: 'Student',
            workspace: 'Student Portal',
            status: 'Implemented',
            access: 'Access-code scoped student board for assignments, goals, calendar, questions, documents, and student helper.',
            guardrail: 'No parent contact fields, payment data, admin notes, other students, or public leakage.'
        },
        {
            role: 'Service Provider / Rabbi Sheller',
            workspace: 'Rabbi Provider',
            status: 'Partial',
            access: 'Provider workspace, participants, content review, lead capture, class schedule, and scoped tasks are available.',
            guardrail: 'External Rabbi app/admin/member credentials, live access grants, billing sync, and member-library publishing remain blocked until approved.'
        },
        {
            role: 'Community Member',
            workspace: 'Learning Community',
            status: 'Policy Needed',
            access: 'Private moderated community/thread model exists for parent, student, provider, and admin actors.',
            guardrail: 'No public forum, leaderboard, rewards, member-visible answer surface, or broad community invite flow is enabled.'
        },
        {
            role: 'Codex / Agent Work',
            workspace: 'Agent Lifecycle',
            status: 'Implemented',
            access: 'Codex-owned work uses queued/running/completed/failed/blocked lifecycle and records verification evidence.',
            guardrail: 'Agent tasks are not human Pending cards; app-visible changes require deploy, Railway doctor, live smoke, and bookkeeping.'
        }
    ];
}

function renderAdminRolesPolicyPanel() {
    const rows = adminRolePolicyRows();
    const implemented = rows.filter(row => row.status === 'Implemented').length;
    const partial = rows.filter(row => row.status === 'Partial').length;
    const policyNeeded = rows.filter(row => row.status === 'Policy Needed').length;
    return `
        <section class="focus-panel" data-role-access-policy-matrix>
            <div class="task-section-header">
                <div>
                    <h3>Role / Access Policy Matrix</h3>
                    <p class="settings-disabled-note">Read-only map of who can access which workspace today. This page does not create invitations, login tokens, password resets, email sends, WhatsApp sends, access grants, billing changes, or external connector writes.</p>
                </div>
                <span>No-write</span>
            </div>
            <div class="task-overview-grid">
                ${renderMetricButton('Implemented', implemented, 'Roles with current working access paths.', '')}
                ${renderMetricButton('Partial', partial, 'Roles with scoped BNA workspace access while external systems remain gated.', '')}
                ${renderMetricButton('Policy Needed', policyNeeded, 'Roles blocked until Shloimie approves access policy.', '')}
                ${renderMetricButton('Send Gates', 5, 'Weekly updates, parent password setup, Google adapters, One Time publishing, and One Time questions all require typed approvals.', '')}
            </div>
            <div class="content-section-grid" style="margin-top:14px;">
                ${rows.map(row => `
                    <article class="content-card">
                        <div class="content-card-title">${escapeHtml(row.role)}</div>
                        <div class="content-card-meta">${escapeHtml(row.workspace)} / ${escapeHtml(row.status)}</div>
                        <p class="event-meta">${escapeHtml(row.access)}</p>
                        <p class="settings-disabled-note">${escapeHtml(row.guardrail)}</p>
                    </article>
                `).join('')}
            </div>
            <div class="settings-control-grid" style="margin-top:14px;">
                ${renderSettingsControlRow('Weekly update sends', 'Disabled', 'Recipient preview is available, but test-send/live-send waits for copy, media, recipient policy, rollback/no-send rules, sender configuration, and APPROVE_PARENT_WEEKLY_UPDATE_SEND.', 'Approval gated')}
                ${renderSettingsControlRow('Parent password setup', 'Per-family only', 'Next Year Login can preview/reset one family at a time with SEND_PARENT_PASSWORD_SETUP; no bulk parent onboarding campaign is enabled.', 'Guarded')}
                ${renderSettingsControlRow('Google live adapters', 'Blocked', 'Dry-run/preview actions exist. Live Drive, Calendar, Classroom, and Google Business actions wait for OAuth/test-user/scope approval and APPROVE_GOOGLE_LIVE_ADAPTER_TEST.', 'Blocked')}
                ${renderSettingsControlRow('One Time member library', 'Blocked', 'Publishing, member access grants, video-host/Drive writes, billing/access sync, and sends wait for owner-approved access and APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING.', 'Blocked')}
                ${renderSettingsControlRow('One Time questions', 'Private review only', 'Private digest preview is available, but public/member Q&A, rewards, leaderboards, notifications, and answer publishing require APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE plus exact visibility and rollback details.', 'Approval gated')}
            </div>
        </section>
    `;
}

function renderAdminWorkspacesPanel() {
    const workspaces = workspaceDirectoryRecords();
    const groups = WORKSPACE_DIRECTORY_GROUPS.map(group => ({
        ...group,
        items: workspaces.filter(workspace => workspaceDisplayCategory(workspace) === group.id)
    })).filter(group => group.items.length);
    return `
        <section class="focus-panel">
            <div class="task-section-header"><h3>Workspace Directory</h3><span>${workspaces.length} records</span></div>
            <p class="settings-disabled-note">Super Admin can organize connected workspaces under the approved display categories: Super Admin, School, Service Provider, and Family. Each card remains scoped by backend permissions.</p>
            ${groups.map(group => `
                <div class="task-section-header compact"><h3>${escapeHtml(group.label)}</h3><span>${group.items.length} records</span></div>
                <div class="content-section-grid">
                    ${group.items.map(workspace => `<article class="content-card"><div class="content-card-title">${escapeHtml(workspace.display_name || workspace.name || workspace.workspace_key || workspace.id)}</div><div class="content-card-meta">${escapeHtml(workspaceDisplayCategoryLabel(workspaceDisplayCategory(workspace)) || workspaceTypeLabel(workspace.workspace_type))} / ${escapeHtml(workspace.workspace_key || workspace.id || 'workspace')}</div><p class="event-meta">${escapeHtml(workspace.description || 'Workspace configuration is backed by workspace settings.')}</p></article>`).join('')}
                </div>
            `).join('')}
        </section>
    `;
}

function renderSettings() {
    const label = settingsSectionLabel(settingsSection);
    return `
        <div class="container" data-one-time-rabbi-dashboard="operations" data-one-time-workspace="rabbi_sheller_provider" data-one-time-project="one_time_mishnah_class" data-one-time-settings-route="${escapeHtml(settingsSection)}">
            <div class="page-heading saas-page-heading">
                <div>
                    <div class="page-kicker">Configuration</div>
                    <h2>${escapeHtml(label)}</h2>
                    <p>Routine configuration belongs in the app. Controls without safe persistence are disabled and labeled instead of hidden behind Codex work.</p>
                </div>
            </div>
            ${renderSettingsToolbar(settingsSection)}
            <section class="focus-panel settings-panel">
                ${renderSettingsContent(settingsSection)}
            </section>
        </div>
    `;
}

function renderIntegrations() {
    const tabs = visibleIntegrationsSubtabs();
    const section = tabs.some(tab => tab.id === integrationsSection) ? integrationsSection : (tabs[0]?.id || 'google');
    const sectionLabel = tabs.find(tab => tab.id === section)?.label || 'Integrations';
    let body = '';
    if (section === 'readiness') body = renderIntegrationsReadinessPanel();
    if (section === 'owner_setup') body = renderIntegrationOwnerSetupPanel();
    if (section === 'google') body = renderGoogleWorkspaceSettings({ canonicalRoute: true });
    if (section === 'communications') body = renderCommunicationsIntegrationPanel();
    if (section === 'connectors') body = renderConnectorSettingsSection(['email_identity', 'whatsapp', 'social', 'google_calendar', 'google_classroom', 'payment', 'video_library'], 'Connector Directory', 'External systems are connectors only; BNA Operations remains the first-party workflow source.');
    if (section === 'drive_social') body = renderDriveSocialIngestionSettings();
    if (section === 'automations') body = renderAutomationLibrarySettings();
    if (section === 'external_apps') body = renderProviderIntegrationAuditPanel(serviceProviders);
    return `
        <div class="container">
            <div class="page-heading saas-page-heading">
                <div>
                    <div class="page-kicker">Operations > Integrations</div>
                    <h2>${escapeHtml(sectionLabel)}</h2>
                    <p>Connected services, readiness checks, dry-run actions, and approval gates stay together here.</p>
                </div>
            </div>
            <section class="focus-panel settings-panel operations-integrations-page" data-integrations-route="operations-integrations-google">
                ${body || renderIntegrationsReadinessPanel()}
            </section>
        </div>
    `;
}

function normalizeIntegrationCardStatus(card = {}) {
    return String(card.status || (card.configured ? 'configured' : 'not_configured')).replace(/_/g, ' ');
}

function integrationCardTone(card = {}) {
    const status = String(card.status || '').toLowerCase();
    if (status.includes('live')) return 'Live';
    if (status.includes('test')) return 'Test';
    if (status.includes('blocked')) return 'Blocked';
    if (status.includes('needs')) return 'Needs setup';
    if (status === 'configured' || status === 'configured_test_mode') return 'Configured';
    if (status.includes('invalid') || status.includes('insufficient')) return 'Blocked';
    return card.configured ? 'Configured' : 'Missing';
}

function renderIntegrationOwnerSetupPanel() {
    return `
        <div class="connector-settings-section" data-owner-setup-center>
            <div class="task-section-header">
                <h3>Owner Setup Center</h3>
                <span>Links, steps, status, validation</span>
            </div>
            <div class="settings-disabled-note">The setup page is credential-safe. The readiness endpoint is protected and returns setup status without secrets.</div>
            <div class="task-actions">
                <a class="task-action primary" href="/integration-setup.html" data-action-id="ACTION-INTEGRATION-SETUP-OPEN">Open setup page</a>
                <button class="task-action" type="button" data-action-id="ACTION-INTEGRATION-SETUP-VALIDATE" onclick="api.getIntegrationSetupReadiness().then(() => showNotice('Owner setup readiness loaded')).catch(error => showNotice(error.message || 'Owner setup readiness unavailable'))">Run validation</button>
            </div>
        </div>
    `;
}

function renderIntegrationsReadinessPanel() {
    const state = integrationsReadinessStatus || {};
    const cards = Array.isArray(state.cards) ? state.cards : [];
    const generated = state.generated_at ? new Date(state.generated_at).toLocaleString() : 'Not checked yet';
    return `
        <div class="connector-settings-section" data-integrations-readiness>
            <div class="task-section-header">
                <h3>Integration Readiness</h3>
                <span>${escapeHtml(generated)}</span>
            </div>
            <div class="settings-disabled-note">Preview-first by policy. This view does not send email, bill, publish, upload, schedule, grant access, or write to Google/Zoom/video hosts.</div>
            <div class="content-section-grid">
                ${cards.map(card => `
                    <article class="content-card">
                        <div class="content-card-title">${escapeHtml(card.label || card.provider || 'Integration')}</div>
                        <div class="content-card-meta">${escapeHtml(normalizeIntegrationCardStatus(card))}</div>
                        <div class="settings-control-grid compact">
                            ${renderSettingsControlRow('Configured', card.configured ? 'Yes' : 'No', card.mode || 'Readiness only', integrationCardTone(card))}
                            ${renderSettingsControlRow('Owner', card.accountOwner || 'unknown', 'Account ownership metadata only; no secrets shown.', 'Metadata')}
                            ${renderSettingsControlRow('Safe actions', (card.safeActions || []).join(', ') || 'readiness_check', 'Actions that stay read-only or preview-only.', 'Safe')}
                            ${renderSettingsControlRow('Blocked actions', (card.blockedActions || []).join(', ') || 'external_write', 'Requires explicit approval and setup before execution.', 'Blocked')}
                        </div>
                        ${(card.blockers || []).length ? `<div class="settings-disabled-note">${card.blockers.map(escapeHtml).join('<br>')}</div>` : ''}
                    </article>
                `).join('') || '<div class="task-empty">Integration readiness has not loaded yet.</div>'}
            </div>
        </div>
    `;
}

function readinessStatusLabel(health = {}) {
    if (!health) return 'Not checked';
    if (health.ok || health.send_allowed) return 'Ready';
    if (health.configured && health.connected) return 'Blocked';
    if (health.configured) return 'Configured';
    return 'Missing';
}

function renderReadinessCard(title, health = {}, rows = []) {
    return `
        <article class="content-card">
            <div class="content-card-title">${escapeHtml(title)}</div>
            <div class="content-card-meta">${escapeHtml(readinessStatusLabel(health))}</div>
            <div class="settings-control-grid compact">
                ${rows.map(row => renderSettingsControlRow(row[0], row[1], row[2], row[3])).join('')}
            </div>
            ${health?.blocker ? `<div class="settings-disabled-note">${escapeHtml(health.blocker)}</div>` : ''}
        </article>
    `;
}

function renderCommunicationsIntegrationPanel() {
    const state = communicationsIntegrationState || {};
    const buffer = state.bufferHealth || {};
    const resend = state.resendHealth || {};
    const channelHint = (state.bufferChannels || []).slice(0, 4).map(channel => channel.displayName || channel.name || channel.id).filter(Boolean).join(', ');
    const recentSocial = (state.socialDrafts || []).slice(0, 6);
    const recentEmails = (state.emailDrafts || []).slice(0, 6);
    const recentResendEvents = (state.resendEvents || []).slice(0, 6);
    const dnsTasks = (state.dnsTasks || []).slice(0, 8);
    const schedulePreview = state.schedulePreview || null;
    return `
        <div class="connector-settings-section" data-communications-integrations>
            <div class="task-section-header">
                <h3>Communications Integrations</h3>
                <span>${escapeHtml(state.notice || 'Buffer / Resend')}</span>
            </div>
            ${state.errors?.length ? `<div class="error-banner">${state.errors.map(escapeHtml).join('<br>')}</div>` : ''}
            <div class="content-section-grid">
                ${renderReadinessCard('Buffer', buffer, [
                    ['Configured', buffer.configured ? 'Yes' : 'No', 'Server-side key readiness.', buffer.configured ? 'Configured' : 'Missing'],
                    ['Connected', buffer.connected ? 'Yes' : 'No', 'Read-only Buffer account check.', buffer.connected ? 'Connected' : 'Blocked'],
                    ['Channels', String(buffer.channels_count || state.bufferChannels?.length || 0), channelHint || 'No channels loaded.', buffer.organization_id_configured ? 'Ready' : 'Needs org ID'],
                ])}
                ${renderReadinessCard('Resend', resend, [
                    ['Account owner', resend.account_owner || 'unknown', resend.provider_account || 'Provider account label not set.', 'Metadata'],
                    ['Provider connection', resend.connected ? 'Connected' : 'Blocked', 'API/key readiness is separate from sender/domain approval.', resend.connected ? 'Connected' : 'Blocked'],
                    ['Sender identity', resend.from_email || 'Not set', 'From address is configured separately from the domain list.', resend.sender_configured || resend.from_email ? 'Configured' : 'Blocked'],
                    ['Domain', resend.domain || 'Not set', resend.domain_verified ? 'Verified domain.' : 'Domain verification incomplete.', resend.domain_verified ? 'Verified' : 'Blocked'],
                    ['Send allowed', resend.send_allowed ? 'Yes' : 'No', resend.fallback_approved ? 'Fallback approved by env.' : 'Verified domain or explicit fallback required.', resend.send_allowed ? 'Allowed' : 'Blocked'],
                ])}
            </div>

            <section class="focus-panel">
                <div class="task-section-header"><h3>Social Drafts</h3><span>${recentSocial.length}</span></div>
                <form class="task-form-grid" onsubmit="createCommunicationSocialDraft(event)">
                    <textarea id="commSocialText" class="settings-wide" rows="3" placeholder="Post body"></textarea>
                    <input id="commSocialChannels" placeholder="Buffer channel IDs, comma separated">
                    <select id="commSocialProviderDraft">
                        <option value="false">Local draft only</option>
                        <option value="true">Create Buffer draft</option>
                    </select>
                    <button class="task-action primary" type="submit">Create draft</button>
                </form>
                <form class="task-form-grid" onsubmit="previewCommunicationSchedule(event)">
                    <textarea id="commScheduleText" class="settings-wide" rows="2" placeholder="Scheduled post body"></textarea>
                    <input id="commScheduleChannels" placeholder="Buffer channel IDs, comma separated">
                    <input id="commScheduleAt" type="datetime-local">
                    <button class="task-action" type="submit">Preview schedule</button>
                </form>
                ${schedulePreview ? `
                    <div class="settings-disabled-note">
                        Preview #${Number(schedulePreview.preview?.id || schedulePreview.id || 0)}: ${escapeHtml(schedulePreview.human_preview || schedulePreview.preview?.scheduled_at || '')}
                        <button class="task-action primary" type="button" onclick="confirmCommunicationSchedule()">Confirm schedule</button>
                    </div>
                ` : ''}
                <div class="calendar-event-list" style="margin-top:12px;">
                    ${recentSocial.map(draft => `
                        <div class="calendar-event-row">
                            <div>
                                <strong>#${Number(draft.id)} ${escapeHtml(draft.status || 'draft')}</strong>
                                <div class="event-meta">${escapeHtml(limitTextClient(draft.body || '', 120))}</div>
                            </div>
                            <span class="status-pill">${escapeHtml(draft.provider || 'buffer')}</span>
                        </div>
                    `).join('') || '<div class="task-empty">No social drafts loaded.</div>'}
                </div>
            </section>

            <section class="focus-panel">
                <div class="task-section-header"><h3>Email Drafts</h3><span>${recentEmails.length}</span></div>
                <form class="task-form-grid" onsubmit="createCommunicationEmailDraft(event)">
                    <input id="commIntegrationEmailTo" name="to" type="email" placeholder="Recipient email">
                    <input id="commIntegrationEmailSubject" name="subject" placeholder="Subject">
                    <textarea id="commIntegrationEmailText" name="text" class="settings-wide" rows="3" placeholder="Plain text"></textarea>
                    <textarea id="commIntegrationEmailHtml" name="html" class="settings-wide" rows="3" placeholder="HTML body"></textarea>
                    <button class="task-action primary" type="submit">Create draft</button>
                </form>
                <div class="calendar-event-list" style="margin-top:12px;">
                    ${recentEmails.map(draft => {
                        const canSend = emailDraftCanRequestSend(draft, resend);
                        return `
                        <div class="calendar-event-row">
                            <div>
                                <strong>#${Number(draft.id)} ${escapeHtml(draft.subject || 'Email draft')}</strong>
                                <div class="event-meta">${escapeHtml((draft.to_emails || []).join(', '))} / ${escapeHtml(draft.status || 'draft')}</div>
                                ${draft.send_blocker ? `<div class="settings-disabled-note">${escapeHtml(draft.send_blocker)}</div>` : ''}
                            </div>
                            ${draft.status === 'sent' ? '<span class="status-pill">Sent</span>' : `<button class="task-action" type="button" ${canSend ? '' : 'disabled'} onclick="sendCommunicationEmailDraft(${Number(draft.id)})">${canSend ? 'Type SEND_RESEND_EMAIL' : 'Send locked'}</button>`}
                        </div>
                    `; }).join('') || '<div class="task-empty">No email drafts loaded.</div>'}
                </div>
            </section>

            <section class="focus-panel" data-resend-webhook-events>
                <div class="task-section-header"><h3>Resend Webhook Events</h3><span>${recentResendEvents.length}</span></div>
                <p class="settings-disabled-note">Delivery/open/bounce events are read back from first-party storage. Raw provider payloads are hidden by default; no email send or DNS verification runs from this readback.</p>
                <div class="calendar-event-list" style="margin-top:12px;">
                    ${recentResendEvents.map(event => `
                        <div class="calendar-event-row">
                            <div>
                                <strong>#${Number(event.id)} ${escapeHtml(event.event_type || 'resend event')}</strong>
                                <div class="event-meta">${escapeHtml([event.delivery_status || 'status pending', event.provider_message_id || 'no message id', event.processing_status || 'stored'].join(' / '))}</div>
                                ${event.error ? `<div class="settings-disabled-note">${escapeHtml(event.error)}</div>` : ''}
                            </div>
                            <span class="status-pill">${event.payload ? 'Payload included' : 'Raw hidden'}</span>
                        </div>
                    `).join('') || '<div class="task-empty">No Resend webhook events loaded.</div>'}
                </div>
            </section>

            <section class="focus-panel">
                <div class="task-section-header"><h3>Resend DNS Tasks</h3><span>${dnsTasks.length}</span></div>
                <form class="task-form-grid" onsubmit="createCommunicationDnsTask(event)">
                    <input id="commDnsDomain" placeholder="Domain" value="${escapeHtml(resend.domain || '')}">
                    <input id="commDnsType" placeholder="TXT / MX / CNAME">
                    <input id="commDnsHost" placeholder="Host / name">
                    <input id="commDnsValue" class="settings-wide" placeholder="Full DNS value from Resend dashboard">
                    <input id="commDnsTtl" type="number" placeholder="TTL">
                    <input id="commDnsPriority" type="number" placeholder="Priority">
                    <button class="task-action primary" type="submit">Add DNS task</button>
                    ${resend.domain ? `<button class="task-action" type="button" onclick="verifyConfiguredResendDomain()">Verify domain</button>` : ''}
                </form>
                <div class="calendar-event-list" style="margin-top:12px;">
                    ${dnsTasks.map(task => `
                        <div class="calendar-event-row">
                            <div>
                                <strong>#${Number(task.id)} ${escapeHtml(task.type || '')} ${escapeHtml(task.host || task.domain || '')}</strong>
                                <div class="event-meta">${escapeHtml(task.domain || '')} / ${escapeHtml(task.status || '')} / ${task.value_present ? 'value present' : 'needs value'}</div>
                            </div>
                            <span class="status-pill">${escapeHtml(task.provider || 'resend')}</span>
                        </div>
                    `).join('') || '<div class="task-empty">No DNS tasks loaded.</div>'}
                </div>
            </section>
        </div>
    `;
}

async function refreshCommunicationsIntegrations() {
    communicationsIntegrationState = await fetchCommunicationsIntegrationBundle(emailInboxFilters());
    render();
}

function commaInput(id) {
    return String(document.getElementById(id)?.value || '').split(/[,\n]+/).map(item => item.trim()).filter(Boolean);
}

async function createCommunicationSocialDraft(event) {
    event?.preventDefault?.();
    try {
        const filters = workspaceDataProjectFilters();
        const result = await api.createSocialDraft({
            ...filters,
            provider: 'buffer',
            text: document.getElementById('commSocialText')?.value || '',
            channel_ids: commaInput('commSocialChannels'),
            create_provider_draft: document.getElementById('commSocialProviderDraft')?.value === 'true',
            source: 'operations'
        });
        communicationsIntegrationState.notice = result.setup_blocker || 'Social draft saved.';
        event.target?.reset?.();
        await refreshCommunicationsIntegrations();
    } catch (error) {
        alert(error.message || 'Could not create social draft.');
    }
}

async function previewCommunicationSchedule(event) {
    event?.preventDefault?.();
    try {
        const filters = workspaceDataProjectFilters();
        const atValue = document.getElementById('commScheduleAt')?.value || '';
        const scheduledAt = atValue ? new Date(atValue).toISOString() : '';
        const result = await api.previewSocialSchedule({
            ...filters,
            provider: 'buffer',
            text: document.getElementById('commScheduleText')?.value || '',
            channel_ids: commaInput('commScheduleChannels'),
            scheduled_at: scheduledAt,
            source: 'operations'
        });
        communicationsIntegrationState.schedulePreview = result;
        communicationsIntegrationState.notice = 'Schedule preview ready.';
        render();
    } catch (error) {
        alert(error.message || 'Could not preview schedule.');
    }
}

async function confirmCommunicationSchedule() {
    const preview = communicationsIntegrationState.schedulePreview;
    const previewId = Number(preview?.preview?.id || 0);
    if (!previewId || !preview?.confirmation_token) return;
    if (!confirm('Schedule this Buffer post now?')) return;
    try {
        const result = await api.confirmSocialSchedule({
            ...workspaceDataProjectFilters(),
            preview_id: previewId,
            confirmation_token: preview.confirmation_token,
            confirmed: true
        });
        communicationsIntegrationState.notice = result.setup_blocker || 'Buffer schedule confirmed.';
        communicationsIntegrationState.schedulePreview = null;
        await refreshCommunicationsIntegrations();
    } catch (error) {
        alert(error.message || 'Could not confirm schedule.');
    }
}

async function createCommunicationEmailDraft(event) {
    event?.preventDefault?.();
    try {
        const form = event?.currentTarget || event?.target || null;
        const formValue = (name, fallbackId, fallback = '') => {
            const local = form?.querySelector?.(`[name="${name}"]`);
            if (local) return local.value || fallback;
            return document.getElementById(fallbackId)?.value || fallback;
        };
        const filters = emailInboxFilters();
        const replyTo = formValue('reply_to', 'commEmailReplyTo');
        const templateKey = formValue('template_key', 'commEmailTemplate', 'manual');
        const relatedRecord = formValue('source_id', 'commEmailRelatedRecord');
        const result = await api.createEmailDraft({
            ...filters,
            provider: 'resend',
            from: formValue('from', 'commEmailFrom'),
            to: [formValue('to', 'commEmailTo')],
            subject: formValue('subject', 'commEmailSubject'),
            text: formValue('text', 'commEmailText'),
            html: formValue('html', 'commEmailHtml'),
            source: templateKey,
            source_id: relatedRecord,
            metadata: {
                reply_to: replyTo,
                template_key: templateKey,
                related_record: relatedRecord
            }
        });
        communicationsIntegrationState.notice = result.blocker || 'Email draft saved.';
        event.target?.reset?.();
        await refreshCommunicationsIntegrations();
    } catch (error) {
        alert(error.message || 'Could not create email draft.');
    }
}

async function sendCommunicationEmailDraft(id) {
    const phrase = prompt('Type SEND_RESEND_EMAIL to request this Resend send. The server still checks readiness, review state, recipients, and domain gates.');
    if (phrase !== 'SEND_RESEND_EMAIL') return;
    try {
        const result = await api.sendEmailDraft({ ...emailInboxFilters(), draft_id: id, confirm: phrase });
        communicationsIntegrationState.notice = result.blocker || 'Email send completed.';
        await refreshCommunicationsIntegrations();
    } catch (error) {
        alert(error.message || 'Email send blocked.');
        await refreshCommunicationsIntegrations();
    }
}

async function createCommunicationDnsTask(event) {
    event?.preventDefault?.();
    try {
        const filters = workspaceDataProjectFilters();
        const result = await api.createDnsTask({
            ...filters,
            provider: 'resend',
            domain: document.getElementById('commDnsDomain')?.value || '',
            type: document.getElementById('commDnsType')?.value || '',
            host: document.getElementById('commDnsHost')?.value || '',
            value: document.getElementById('commDnsValue')?.value || '',
            ttl: document.getElementById('commDnsTtl')?.value || null,
            priority: document.getElementById('commDnsPriority')?.value || null
        });
        communicationsIntegrationState.notice = result.truncated_value_blocked ? 'DNS task saved without truncated value.' : 'DNS task saved.';
        event.target?.reset?.();
        await refreshCommunicationsIntegrations();
    } catch (error) {
        alert(error.message || 'Could not save DNS task.');
    }
}

async function verifyConfiguredResendDomain() {
    const domain = communicationsIntegrationState.resendHealth?.domain;
    if (!domain) return;
    try {
        await api.verifyResendDomain(domain);
        communicationsIntegrationState.notice = 'Resend verification requested.';
        await refreshCommunicationsIntegrations();
    } catch (error) {
        alert(error.message || 'Could not request domain verification.');
    }
}

function renderSettingsToolbar(section = settingsSection) {
    const category = settingsActiveCategory(section);
    const categoryLabel = settingsSectionLabel(category);
    const children = settingsCategoryChildren(category);
    const isCategoryOverview = settingsCategoryTab(section);
    return `
        <section class="local-toolbar settings-toolbar" aria-label="Settings category controls">
            <div class="local-toolbar-header">
                <div>
                    <div class="local-toolbar-kicker">Settings Category</div>
                    <strong class="local-toolbar-title">${escapeHtml(categoryLabel)}</strong>
                    <p class="local-toolbar-copy">Open one focused setting group at a time. Disabled controls stay visible when backend persistence is not ready.</p>
                </div>
                <div class="status-chip-row">
                    <button type="button" class="status-chip" onclick="saveVisibleSettings()">Save</button>
                    <button type="button" class="status-chip" onclick="openBnaHelperWithPrompt('Create a scoped settings Test Connection plan. Identify the exact settings group, readback endpoint, required role, workspace scope, success state, error state, and no-write verification before enabling the button.')">Test Connection setup</button>
                    <button type="button" class="status-chip" onclick="openBnaHelperWithPrompt('Create a scoped settings reset plan. Identify the exact setting, confirmation phrase, audit log, rollback/readback evidence, and required role before enabling reset.')">Reset setup</button>
                </div>
            </div>
            <div class="status-chip-row">
                <button type="button" class="status-chip ${isCategoryOverview ? 'active' : ''}" onclick="setSettingsLeaf('${category}')">
                    <span>Overview</span>
                </button>
                ${children.map(child => `
                    <button type="button" class="status-chip ${section === child.id ? 'active' : ''}" onclick="setSettingsLeaf('${child.id}')">
                        <span>${escapeHtml(child.label)}</span>
                        <span class="status-chip-count">${Number(settingsSubnavCounts()[child.id] || 0)}</span>
                    </button>
                `).join('')}
            </div>
        </section>
    `;
}

function renderSettingsContent(section) {
    if (settingsCategoryTab(section)) return renderSettingsCategoryOverview(section);
    if (section === 'provider_index') return renderProviderIndexSettingsPanel();
    if (section === 'provider_plans') return renderProviderPlansPanel();
    if (section === 'commercial_models') return renderProviderCommercialModelsPanel();
    if (section === 'provider_entitlements') return renderProviderCommercialPanel(serviceProviders);
    if (section === 'provider_onboarding') return `${renderProviderClassroomSetupSettingsPanel()}${renderProviderOnboardingPanel()}`;
    if (section === 'external_apps') return renderProviderIntegrationAuditPanel(serviceProviders);
    if (section === 'users_roles') return renderUsersRolesSettingsPanel();
    if (['parent_portal', 'student_portal', 'provider_portal'].includes(section)) return renderLearningPortalAccessSettings(section);
    if (section === 'api_limits') return renderApiLimitsSettingsPanel(section);
    if (section === 'billing' || section === 'payment_links') return renderBillingPaymentsSettingsPanel(section);
    const workspace = currentWorkspaceRecord();
    const basicSections = {
        profile: [
            ['Current login', opsMe?.username || 'Operations user', 'Read from the active session.', 'Session-backed'],
            ['Current role', currentWorkspaceRoleLabel(), 'Role chips clarify whether you are acting as Super Admin, BNA Admin, Provider Admin, Parent, or Student.', 'Read-only']
        ],
        workspace: [
            ['Current workspace', workspace.display_name || workspace.id, workspace.description || 'Workspace settings are backed by the workspace settings API.', 'Persisted'],
            ['Workspace type', workspace.workspace_type || 'workspace', 'Platform, school, and provider workspaces remain separate contexts.', 'Persisted']
        ],
        branding: [
            ['Brand name', workspace.display_name || 'BNA Operations', 'Brand text is editable through workspace settings; logo upload storage is not enabled yet.', 'Partial'],
            ['Logo upload', 'Not enabled', 'Logo changes are locked for this account view.', 'Disabled']
        ],
        language: [
            ['Parent/student portals', 'English LTR and Hebrew RTL', 'Portal screens must remain usable in both directions.', 'Configured'],
            ['Operations admin translation', 'Deferred', 'Full admin Hebrew translation is intentionally deferred.', 'Read-only']
        ],
        users_roles: [
            ['Internal users', `${people.length} records`, 'People records come from project members and user/account rows.', 'Persisted'],
            ['Role policy editor', 'Not configured', 'Requires role-matrix persistence before normal users can edit permissions.', 'Disabled']
        ],
        parent_portal: [
            ['Parent portal sections', 'Home / My Children / Messages / Provider Index / Calendar / Help / Account / Settings', 'Parent-facing navigation remains controlled and does not expose admin tools.', 'Configured'],
            ['Parent provider index', `${serviceProviders.length} providers loaded`, 'Approved public provider data can appear here; private provider notes stay admin-only.', 'Persisted']
        ],
        student_portal: [
            ['Student workspace sections', 'Home / Goals / Assignments / Questions / Calendar / Documents / Bot / Account', 'No open student forum is enabled.', 'Configured'],
            ['Student bot permissions', 'Scoped to student-visible data', 'Student bots cannot access admin private notes.', 'Policy']
        ],
        provider_portal: [
            ['Provider portal sections', 'Dashboard / Program / Leads / Participants / Questions / Videos / Worksheets / Calendar / Messages / Tasks / Settings', 'Provider users do not see private BNA school data.', 'Configured'],
            ['Website Import', 'Placeholder', 'Requires provider site ingestion and mapping before enablement.', 'Disabled']
        ],
        provider_index: [
            ['Public provider index', `${serviceProviders.length} provider records`, 'Public listings use approved fields only.', 'Persisted'],
            ['Private provider fields', 'Admin-only', 'Internal notes, business terms, credentials, and performance notes must never appear publicly.', 'Policy']
        ],
        payment_links: [
            ['Provider payment links', 'Manual placeholders only', 'Payment links can be tracked for providers, but no live charge, payout, or access-sync automation runs from this screen.', 'Disabled'],
            ['Rabbi Sheller access sync', 'Pending backend access', 'Payment/access sync stays blocked until the external app and processor are inspected.', 'Blocked']
        ],
        bot_permissions: [
            ['Student bot enabled', 'Policy ready', 'Allowed context: student profile, student-visible calendar, goals, assignments, questions, documents, and permitted notes.', 'Guarded'],
            ['Parent bot enabled', 'Policy ready', 'Allowed context: own children, parent-visible calendar, assignments/questions/documents, messages/help, provider index, and account help.', 'Guarded'],
            ['Provider helper enabled', isProviderWorkspace() ? 'Scoped to provider program' : 'Provider-scoped', 'Provider helper cannot read BNA private student data or BNA school admin notes.', 'Guarded'],
            ['Private notes', 'Excluded by default', 'Admin-only notes, other students/families, provider credentials, and private terms are excluded unless an admin-only preview is opened.', 'Policy'],
            ['Prompt/context preview', 'Admin only', 'Parents and students never see raw prompts. Admin can inspect context assembly here after backend preview persistence is available.', 'Admin-only'],
            ['Audit log', `${botActionLogs.length} recent logs`, 'Typed bot actions are logged by workspace, role, page, and action key.', 'Persisted']
        ],
        api_limits: [
            ['Bot action logs', `${botActionLogs.length} recent logs`, 'Action previews are persisted; token/cost metering is not yet implemented.', 'Partial'],
            ['Cost tracking', 'Not configured', 'No fake token or cost totals are shown until metering persistence exists.', 'Disabled']
        ],
        communications: [
            ['Communication log', `${contactCommunications.length} records`, 'Contact communications and support-ticket records feed the message lanes.', 'Persisted'],
            ['Templates', 'Not configured', 'Template editing needs scoped persistence before normal users can edit.', 'Disabled']
        ],
        billing: [
            ['Payments', `${payments.length} records`, 'Existing accounting flows remain guarded.', 'Persisted'],
            ['Processor connector', 'Not configured', 'Payment processor / Green Invoice / Israeli billing stays connector-based.', 'Connector']
        ],
        automations: [
            ['Automation policy', 'Internal-first', 'BNA Operations owns workflow state; external tools are connectors.', 'Policy'],
            ['Live automations', 'Approval gated', 'No external send/publish/billing mutation runs without approved handlers.', 'Guarded']
        ],
        danger: [
            ['Archive workspace', 'Disabled', 'Requires typed confirmation, audit log, and admin-only backend handler.', 'Disabled'],
            ['Delete records', 'Disabled', 'Destructive controls are intentionally unavailable from this settings shell.', 'Disabled']
        ]
    };

    if (section === 'email_identities') return renderConnectorSettingsSection(['email_identity'], 'Email Identities', 'Support BNA and Rabbi Sheller sending identities. Bot drafts, user approves, then the connector sends and logs.');
    if (section === 'whatsapp') return renderConnectorSettingsSection(['whatsapp'], 'WhatsApp', 'Manual prefilled WhatsApp links are the first workflow. API mode stays disabled until volume and provider choice justify it.');
    if (section === 'social_accounts') return renderConnectorSettingsSection(['social'], 'Social Accounts', 'Buffer/Publer-style connectors schedule approved posts for BNA and provider accounts.');
    if (section === 'drive_social_ingestion') return renderDriveSocialIngestionSettings();
    if (section === 'calendar') return renderCalendarPolicySettings();
    if (section === 'google_workspace') return renderGoogleWorkspaceSettings();
    if (section === 'google_calendar') return renderGoogleCalendarSettings();
    if (section === 'google_classroom') return renderGoogleClassroomSettings();
    if (section === 'integrations') return renderCoreIntegrationsSettingsPanel(section);
    if (section === 'automations') return renderAutomationLibrarySettings();
    if (section === 'approval_gates') return renderOwnerApprovalGateboardSettings();

    const rows = basicSections[section] || basicSections.workspace;
    return `
        <div class="settings-control-grid">
            ${rows.map(row => renderSettingsControlRow(row[0], row[1], row[2], row[3])).join('')}
        </div>
    `;
}

function renderUsersRolesSettingsPanel() {
    const externalRows = adminExternalUserRows();
    const internalRows = adminInternalUserRows(externalRows);
    const workspace = currentWorkspaceRecord();
    return `
        <div class="settings-action-panel" data-users-roles-access-management>
            <div class="task-section-header">
                <div>
                    <h3>Users & Roles Access Desk</h3>
                    <p class="settings-disabled-note">Add users, assign roles/workspaces, preview invitation/access email shape, and audit status without sending anything automatically.</p>
                </div>
                <span>${people.length} people</span>
            </div>
            <div class="task-overview-grid">
                ${renderMetricButton('Internal users', internalRows.length, 'BNA project members and operators currently visible.', '')}
                ${renderMetricButton('External users', externalRows.length, 'Provider/Rabbi/project users kept separate from parent accounts.', '')}
                ${renderInfoMetricCard('Workspace', workspace.display_name || workspace.id || 'Workspace', 'Assignments stay scoped to the selected workspace.')}
                ${renderInfoMetricCard('Invitation sends', 'Guarded', 'Invite/access email and portal reset email require explicit per-user action.')}
            </div>
            <div class="settings-control-grid compact" style="margin-top:14px;">
                ${renderSettingsControlRow('Add user', 'Implemented', 'Use Admin Users to create a scoped person and workspace membership without sending an invite.', 'No-send')}
                ${renderSettingsControlRow('Assign role', 'Implemented', 'Role/access level changes write to the selected workspace and role-change audit log.', 'Scoped')}
                ${renderSettingsControlRow('Assign workspace', workspace.display_name || workspace.id || 'Workspace', 'Workspace assignment uses BNA workspace/project keys and does not create parent/student/provider passwords.', 'Scoped')}
                ${renderSettingsControlRow('Send invite/access email', 'Manual/private delivery', 'Short-lived Operations access links can be created only by Super Admin; no bulk invite email runs from Settings.', 'Guarded')}
                ${renderSettingsControlRow('Reset portal access', 'Per-family/per-student tools', 'Parent password setup/reset and student access links live in Learning / portal access with explicit single-family actions.', 'Guarded')}
                ${renderSettingsControlRow('Audit invitation status', `${externalRows.length + internalRows.length} rows`, 'External/internal records, access-link result, preview readback, and role matrix stay visible for audit.', 'Visible')}
            </div>
            <div class="task-actions" style="margin-top:14px;">
                <button type="button" class="task-action primary" onclick="switchView('admin'); setCurrentSection('users')">Admin Users</button>
                <button type="button" class="task-action" onclick="switchView('admin'); setCurrentSection('roles')">Role Matrix</button>
                <button type="button" class="task-action" onclick="setSettingsLeaf('parent_portal')">Portal Resets</button>
            </div>
            ${renderAdminAccessLinkResult()}
            ${renderAdminExternalAccessPreviewResult()}
            ${renderAdminExternalAccessPreviewForm()}
        </div>
    `;
}

function renderLearningPortalAccessSettings(section = 'overview') {
    const report = nextYearLoginReadiness;
    const summary = report?.summary || {};
    const portalRows = Array.isArray(report?.students) ? report.students : [];
    const label = section === 'student_portal'
        ? 'Student Portal Access'
        : section === 'provider_portal'
            ? 'Provider Portal Access'
            : section === 'parent_portal'
                ? 'Parent Portal Access'
                : 'Learning Portal Access';
    return `
        <div class="settings-action-panel" data-learning-portal-access-management>
            <div class="task-section-header">
                <div>
                    <h3>${escapeHtml(label)}</h3>
                    <p class="settings-disabled-note">Manage parent/student portal readiness from the workspace. Bulk parent emails, WhatsApp login links, and broad access campaigns stay disabled.</p>
                </div>
                <span>${students.length} students</span>
            </div>
            <div class="task-overview-grid">
                ${renderMetricButton('Students', summary.roster_count ?? students.length, 'Loaded student records for this workspace.', '')}
                ${renderMetricButton('Login ready', summary.login_ready ?? '-', 'Students with portal access ready or confirmed.', '')}
                ${renderMetricButton('Materials ready', summary.rollout_ready ?? '-', 'Students with visible rollout materials.', '')}
                ${renderMetricButton('Missing parent email', summary.missing_parent_email ?? '-', 'Parent access cannot be emailed without a contact.', '')}
            </div>
            <div class="settings-control-grid compact" style="margin-top:14px;">
                ${renderSettingsControlRow('Send new portal email', 'Single-family only', 'Parent password setup/reset email requires SEND_PARENT_PASSWORD_SETUP and a specific parent/student row.', 'Guarded')}
                ${renderSettingsControlRow('Generate student access', 'Available', 'Student access links can be prepared for missing student checkoff links; parent sends remain explicit.', 'Scoped')}
                ${renderSettingsControlRow('Reset parent portal access', 'Preview first', 'Password setup preview shows subject/recipient without sending; live email is one-family only.', 'Preview')}
                ${renderSettingsControlRow('Track people', `${signups.length} signups / ${students.length} students`, 'Signup, parent, student, readiness, and portal state stay tied to first-party records.', 'Tracked')}
                ${renderSettingsControlRow('Last readiness check', report ? 'Loaded' : 'Not loaded', report ? `${portalRows.length} portal rows in memory.` : 'Use Refresh Readiness to fetch current access state.', report ? 'Visible' : 'Needs check')}
            </div>
            <div class="task-actions" style="margin-top:14px;">
                <button class="task-action primary" type="button" onclick="switchView('students'); setStudentSection('next_year_login')">Student Access Readiness</button>
                <button class="task-action" type="button" onclick="refreshNextYearLoginReadiness(event)" ${nextYearLoginReadinessLoading ? 'disabled' : ''}>${nextYearLoginReadinessLoading ? 'Checking...' : 'Refresh Readiness'}</button>
                <button class="task-action" type="button" onclick="setSettingsLeaf('users_roles')">Users & Roles</button>
            </div>
        </div>
    `;
}

function renderApiLimitsSettingsPanel(section = 'api_limits') {
    const workspace = currentWorkspaceRecord();
    const botLogs = botActionLogs || [];
    const scopedRole = currentWorkspaceRoleLabel();
    const superAdmin = opsMe?.scope?.type !== 'project';
    return `
        <div class="settings-action-panel" data-api-usage-limits-by-role>
            <div class="task-section-header">
                <div>
                    <h3>Bots & AI Usage Limits</h3>
                    <p class="settings-disabled-note">Usage is grouped by workspace and role where logs exist. Cost/spend limits stay explicit until token metering persistence is added.</p>
                </div>
                <span>${botLogs.length} logs</span>
            </div>
            <div class="settings-control-grid compact">
                ${renderSettingsControlRow('Super Admin view', superAdmin ? 'All visible workspaces' : 'Not active', 'Super Admin can inspect all workspace usage summaries and support/API error rows.', superAdmin ? 'Allowed' : 'Scoped')}
                ${renderSettingsControlRow('Workspace admin view', workspace.display_name || workspace.id || 'Workspace', 'Workspace admins see only the current workspace and role-scoped helper/bot actions.', 'Scoped')}
                ${renderSettingsControlRow('Parent role limit', 'Own children only', 'Parent helpers must stay inside linked children, parent-visible calendar, messages, documents, and account help.', 'Policy')}
                ${renderSettingsControlRow('Student role limit', 'Student-visible data only', 'Student helpers cannot access parent contact fields, payments, admin notes, or other students.', 'Policy')}
                ${renderSettingsControlRow('Provider role limit', 'Provider workspace only', 'Provider helpers cannot read BNA private school records or other provider workspaces.', 'Policy')}
                ${renderSettingsControlRow('Spend / budget limits', 'Not metered yet', 'No fake spend is shown. Add usage-event persistence before enforcing numeric limits.', 'Pending backend')}
            </div>
            <div class="task-actions" style="margin-top:14px;">
                <button class="task-action primary" type="button" onclick="switchView('api_usage')">Usage Dashboard</button>
                <button class="task-action" type="button" onclick="setSettingsLeaf('bot_permissions')">Bot Permissions</button>
            </div>
        </div>
    `;
}

function renderBillingPaymentsSettingsPanel(section = 'billing') {
    const paymentEvents = (payments || []).length + (paymentIntake || []).length;
    const openPayments = paymentIntake.filter(isUnresolvedPaymentIntake).length;
    const providerPaymentConnectors = activeWorkspaceConnectorSettings('payment');
    return `
        <div class="settings-action-panel" data-billing-payment-workflows>
            <div class="task-section-header">
                <div>
                    <h3>Billing & Payments</h3>
                    <p class="settings-disabled-note">Payment links, plan/pricing status, billing workflows, events, and integration readiness stay visible. Live checkout/access sync remains connector-gated.</p>
                </div>
                <span>${paymentEvents} events</span>
            </div>
            <div class="settings-control-grid compact">
                ${renderSettingsControlRow('Payment links', 'Tracked / guarded', 'Provider and One Time payment links can be stored as connector metadata; live creation needs approved Stripe or Green Invoice credentials.', 'Guarded')}
                ${renderSettingsControlRow('Plan/pricing status', 'Workspace scoped', 'BNA, provider, and One Time tier status stays separate from public checkout enablement.', 'Scoped')}
                ${renderSettingsControlRow('Billing workflows', 'Internal-first', 'Payment reminders and access-sync workflows are preview/approval gated before any send, charge, or grant.', 'Approval gated')}
                ${renderSettingsControlRow('Payment events', `${paymentEvents} loaded`, `${openPayments} unresolved intake/payment item${openPayments === 1 ? '' : 's'} need review.`, openPayments ? 'Needs review' : 'Visible')}
                ${renderSettingsControlRow('Integration status', providerPaymentConnectors.length ? `${providerPaymentConnectors.length} connector(s)` : 'No processor connected', 'Stripe, Green Invoice, and accounting providers stay connector records with secret references.', providerPaymentConnectors.length ? 'Connector' : 'Blocked')}
            </div>
            <div class="task-actions" style="margin-top:14px;">
                <button class="task-action primary" type="button" onclick="switchView('accounting')">Accounting</button>
                <button class="task-action" type="button" onclick="setSettingsLeaf('payment_links')">Payment Links</button>
                <button class="task-action" type="button" onclick="setSettingsLeaf('integrations')">Payment Provider</button>
            </div>
        </div>
    `;
}

function integrationSetupCards() {
    const resend = communicationsIntegrationState?.resendHealth || {};
    const buffer = communicationsIntegrationState?.bufferHealth || {};
    const wapi = activeWorkspaceConnectorSettings('whatsapp')[0] || {};
    const payment = activeWorkspaceConnectorSettings('payment')[0] || {};
    const googleCalendar = activeWorkspaceConnectorSettings('google_calendar')[0] || {};
    const googleClassroom = activeWorkspaceConnectorSettings('google_classroom')[0] || {};
    return [
        {
            id: 'resend',
            title: 'Resend Email Provider',
            status: resend.send_allowed ? 'Ready' : resend.configured ? 'Configured / blocked' : 'Needs setup',
            setup: 'Dedicated email-provider setup. Do not mix Resend with Gmail or social connectors.',
            key: 'Email provider token via keyholder or provider-scoped secret reference',
            test: resend.domain ? 'Verify domain / dry-run email preview' : 'Add domain before test send',
            target: "setSettingsLeaf('email_identities')"
        },
        {
            id: 'buffer',
            title: 'Buffer Social Scheduler',
            status: buffer.connected ? 'Connected' : buffer.configured ? 'Configured / needs channel readback' : 'Needs setup',
            setup: 'Separate social scheduling integration for approved drafts/posts.',
            key: 'Social scheduler token and organization/channel IDs',
            test: 'Read-only health/channel check; posting requires approval.',
            target: "setSettingsLeaf('social_accounts')"
        },
        {
            id: 'wapi',
            title: 'WAPI / WhatsApp',
            status: wapi.status || 'manual-first',
            setup: 'WhatsApp import/readiness stays separate from email and social scheduling.',
            key: 'WHAPI/WAPI token secret reference when approved.',
            test: 'Sync latest / preview imports; no WhatsApp send by default.',
            target: "setSettingsLeaf('whatsapp')"
        },
        {
            id: 'payment',
            title: 'Payment Provider',
            status: payment.status || 'blocked pending provider choice',
            setup: 'Stripe, Green Invoice, or accounting provider selected per workspace/provider.',
            key: 'Processor key stored as secret reference only.',
            test: 'Payment-link creation stays disabled until provider, pricing, rollback, and approval are explicit.',
            target: "setSettingsLeaf('payment_links')"
        },
        {
            id: 'google_calendar',
            title: 'Google Calendar',
            status: 'Coming soon / internal-first',
            setup: 'Internal calendar works now; Google sync waits for OAuth/test-user readiness.',
            key: 'Google OAuth credentials and selected calendar ID.',
            test: 'Preview/dry-run only until APPROVE_GOOGLE_LIVE_ADAPTER_TEST.',
            target: "setSettingsLeaf('google_calendar')"
        },
        {
            id: 'google_classroom',
            title: 'Google Classroom',
            status: 'Coming soon / internal-first',
            setup: 'BNA Classroom remains first-party; Google Classroom is optional sync later.',
            key: 'Google OAuth credentials and course ID.',
            test: 'Preview/dry-run only; no coursework sync until approved.',
            target: "setSettingsLeaf('google_classroom')"
        }
    ];
}

function renderCoreIntegrationsSettingsPanel(section = 'integrations') {
    const cards = integrationSetupCards();
    return `
        <div class="settings-action-panel" data-real-integrations-setup>
            <div class="task-section-header">
                <div>
                    <h3>Integrations</h3>
                    <p class="settings-disabled-note">Actual connectors are listed separately with setup path, token entry policy, validation action, encrypted storage, and rotation reminder status.</p>
                </div>
                <span>${cards.length} integrations</span>
            </div>
            <div class="settings-integration-grid">
                ${cards.map(card => `
                    <article class="settings-integration-card" data-integration-card="${escapeHtml(card.id)}">
                        <div class="content-card-title">${escapeHtml(card.title)}</div>
                        <div class="content-card-meta">${escapeHtml(card.status)}</div>
                        <div class="settings-control-grid compact">
                            ${renderSettingsControlRow('Setup instructions', 'Available', card.setup, 'Setup')}
                            ${renderSettingsControlRow('API key/token entry', 'Secret reference', card.key, 'Encrypted storage')}
                            ${renderSettingsControlRow('Validation/test button', 'Guarded', card.test, 'Test')}
                            ${renderSettingsControlRow('Rotation reminder', '30-day option', 'Workspace/provider-owned keys can carry review dates; raw secrets are never displayed.', 'Reminder')}
                        </div>
                        <div class="task-actions" style="margin-top:10px;">
                            <button class="task-action" type="button" onclick="${card.target}">Configure Integration</button>
                        </div>
                    </article>
                `).join('')}
            </div>
        </div>
    `;
}

function ownerApprovalGateItems() {
    return [
        {
            id: 'google_live_adapter',
            title: 'Google live adapter smoke',
            status: 'Owner approval required',
            phrase: 'APPROVE_GOOGLE_LIVE_ADAPTER_TEST',
            scope: 'One test-user Google target only.',
            required: ['test user', 'connection type', 'target ID or URL', 'operation', 'approved scopes', 'sample payload', 'max records', 'rollback/delete plan', 'readback evidence'],
            guardrail: 'No production sync, bulk Drive write, Classroom roster change, Google Business edit, parent/student send, or hidden connector write.'
        },
        {
            id: 'one_time_member_library',
            title: 'One Time member-library publishing smoke',
            status: 'Owner approval required',
            phrase: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
            scope: 'One exact item or smoke package.',
            required: ['destination URL', 'library or collection', 'source record/job ID', 'item title', 'hosted media URL or upload path', 'visibility', 'audience/access tier', 'notification policy', 'rollback/revoke path', 'smoke account/readback'],
            guardrail: 'No publish, member visibility, access grant, media-host write, notification, or external CRM write without the exact approved item.'
        },
        {
            id: 'one_time_question_public_surface',
            title: 'One Time question public/member surface',
            status: 'Private digest preview deployed',
            phrase: 'APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE',
            scope: 'One exact question digest item, answer, surface, and notification policy.',
            required: ['source review ID or digest item', 'target surface', 'answer visibility', 'Rabbi/admin reviewer', 'student identity policy', 'reward/badge policy', 'leaderboard policy', 'notification channels and recipients', 'safety escalation owner', 'rollback/unpublish path', 'smoke account/readback'],
            guardrail: 'The private digest is review-only. No public forum post, member-visible answer, reward, leaderboard, notification, student identity exposure, send, or external write is approved by the digest itself.'
        },
        {
            id: 'one_time_billing',
            title: 'One Time billing and refund policy',
            status: 'Owner decision required',
            phrases: ['APPROVE_ONE_TIME_BILLING_PROVIDER_GREEN_INVOICE', 'APPROVE_ONE_TIME_BILLING_PROVIDER_STRIPE', 'APPROVE_ONE_TIME_BILLING_MANUAL_BRIDGE', 'APPROVE_ONE_TIME_REFUND_POLICY_R1_NO_REFUNDS', 'APPROVE_ONE_TIME_REFUND_POLICY_R2_SEVEN_DAY_FIRST_PAYMENT', 'APPROVE_ONE_TIME_REFUND_POLICY_R3_TRIAL_THEN_NO_REFUNDS'],
            scope: 'Choose one billing provider phrase and one refund-policy phrase.',
            required: ['provider of record', 'plan name', 'price/currency', 'tax wording', 'first-cycle rule', 'subscription anchor', 'access-start rule', 'failed-payment grace', 'cancellation/refund handling', 'support owner', 'rollback/revoke owner', 'test buyer/session'],
            guardrail: 'No payment link, checkout session, subscription, invoice, refund, receipt, member access, billing email, or access revoke before provider and refund policy are both approved.'
        },
        {
            id: 'buffer_social',
            title: 'Buffer/social draft or publish',
            status: 'Owner approval required',
            phrase: 'APPROVE_BUFFER_SOCIAL_DRAFT',
            scope: 'One approved source, channel, copy, and schedule window.',
            required: ['source record/job ID or material', 'channel/account', 'draft or publish', 'exact copy', 'media URL if used', 'schedule window/time zone', 'no-post/rollback policy', 'Buffer queue reviewer', 'success evidence'],
            guardrail: 'No Buffer draft, publish, media attach, ad spend, public post, or social connector write without the approved destination, copy, timing, and rollback details.'
        },
        {
            id: 'rabbi_live_app',
            title: 'Rabbi live app access and reset',
            status: 'Target confirmation required',
            phrase: 'RABBI_LIVE_APP_ACCESS_CONFIRMATION',
            scope: 'Confirm the live app and safe credential/reset path before any write.',
            required: ['live app URL', 'deployment target', 'source/reference parity', 'admin username/email', 'Rabbi/member test account', 'approved reset/login path', 'secret exchange location', 'provider source names', 'read-only smoke checklist', 'allowed write actions', 'rollback/revoke owner'],
            guardrail: 'Do not invent credentials, use old debug secrets, reset admin access, change member access, send notifications, publish content, or change billing without target confirmation.'
        },
        {
            id: 'external_access',
            title: 'External Operations access persistence',
            status: 'Dry-run preview deployed',
            phrase: 'APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW',
            scope: 'BNA Operations external-user create/edit only.',
            required: ['target person name', 'contact or no-contact reason', 'workspace/project key', 'account classification', 'role/access level', 'scoped Operations username', 'allowed views', 'delivery/no-send policy', 'review date', 'rollback owner', 'readback'],
            guardrail: 'The current endpoint is preview-only. No parent account, provider password, Rabbi app credential, billing, member-library access, send, Google, Buffer, WAPI, or external CRM write is enabled.'
        },
        {
            id: 'google_public_oauth',
            title: 'Google public OAuth verification packet',
            status: 'Owner approval required',
            phrase: 'APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET',
            scope: 'Prepare/submit Google verification only, not a live Google write.',
            required: ['Google Cloud project', 'final scopes', 'scope categories', 'privacy URL', 'data deletion URL', 'support contact', 'demo video', 'test-user smoke evidence', 'verification email owner', 'rollback plan'],
            guardrail: 'This phrase does not approve Google reads/writes, Drive import/write, Calendar events, Classroom materials, Google Business actions, sends, or external CRM writes.'
        }
    ];
}

function renderOwnerApprovalGateboardSettings() {
    const gates = ownerApprovalGateItems();
    const previewReady = gates.filter(gate => /preview/i.test(gate.status)).length;
    return `
        <div data-owner-approval-gateboard>
            <div class="task-section-header">
                <div>
                    <h3>Owner Approval Gateboard</h3>
                    <p class="settings-disabled-note">Read-only map of the remaining owner/connector gates from the goal-mode follow-up. It copies phrases and field lists only; it does not approve, send, publish, bill, grant access, or call external connectors.</p>
                </div>
                <span>No-write</span>
            </div>
            <div class="task-overview-grid">
                ${renderMetricButton('Open Gates', gates.length, 'Remaining approval or target-confirmation lanes.', '')}
                ${renderMetricButton('Preview Ready', previewReady, 'Lanes with a no-write preview/readback path already deployed.', '')}
                ${renderMetricButton('External Writes', 0, 'No external writes run from this gateboard.', '')}
                ${renderMetricButton('Approval Pack', 1, 'Source: ops/goalmode/2026-06-15-owner-approval-unblocker-pack.md', '')}
            </div>
            <div class="content-section-grid" style="margin-top:14px;">
                ${gates.map(gate => {
                    const phrases = Array.isArray(gate.phrases) ? gate.phrases : [gate.phrase].filter(Boolean);
                    return `
                        <article class="content-card" data-owner-approval-gate="${escapeHtml(gate.id)}">
                            <div class="content-card-title">${escapeHtml(gate.title)}</div>
                            <div class="content-card-meta">${escapeHtml(gate.status)} / ${escapeHtml(gate.scope)}</div>
                            <div class="status-chip-row" style="margin:10px 0;">
                                ${phrases.map(phrase => `<button class="status-chip" type="button" onclick="copyText(event, ${attrJson(phrase)})">${escapeHtml(phrase)}</button>`).join('')}
                            </div>
                            <div class="settings-control-grid">
                                ${renderSettingsControlRow('Required fields', `${gate.required.length} items`, gate.required.join('; '), 'Before approval')}
                                ${renderSettingsControlRow('Guardrail', 'Locked', gate.guardrail, 'No-write')}
                            </div>
                        </article>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderSettingsCategoryOverview(category) {
    const children = settingsCategoryChildren(category);
    const counts = settingsSubnavCounts();
    return `
        <div class="settings-category-overview">
            <div class="task-section-header">
                <h3>${escapeHtml(settingsSectionLabel(category))}</h3>
                <span>${children.length} groups</span>
            </div>
            <div class="settings-leaf-tabs" role="tablist" data-settings-compact-navigation>
                ${children.map(child => `
                    <button type="button" class="settings-leaf-tab" role="tab" onclick="setSettingsLeaf('${child.id}')">
                        <strong>${escapeHtml(child.label)}</strong>
                        <span>${Number(counts[child.id] || 0)} item${Number(counts[child.id] || 0) === 1 ? '' : 's'}</span>
                        <small>${escapeHtml(settingsCategoryOverviewNote(child.id))}</small>
                    </button>
                `).join('')}
            </div>
            ${renderSettingsCategoryOverviewAddendum(category)}
        </div>
    `;
}

function renderSettingsCategoryOverviewAddendum(category) {
    if (category === 'learning_portals') return renderLearningPortalAccessSettings('overview');
    if (category === 'billing_payments') return renderBillingPaymentsSettingsPanel('overview');
    if (category === 'integrations_core') return renderCoreIntegrationsSettingsPanel('overview');
    if (category === 'bots_ai') return renderApiLimitsSettingsPanel('overview');
    if (category === 'provider_index_core') return renderProviderIndexSettingsMap();
    return '';
}

function settingsCategoryOverviewNote(section) {
    return ({
        profile: 'Session, role, and personal access details.',
        workspace: 'Workspace identity, type, and canonical context.',
        branding: 'Brand text and asset readiness.',
        language: 'Portal language and direction behavior.',
        users_roles: 'Internal people and permission policy.',
        email_identities: 'Approved sender identities and email connectors.',
        whatsapp: 'Manual WhatsApp mode and future API guardrails.',
        social_accounts: 'Connected social scheduling accounts.',
        drive_social_ingestion: 'One Time Drive video drops, backend content-job mapping, and social-output guardrails.',
        communications: 'Templates, logs, and message policy.',
        parent_portal: 'Parent-visible portal behavior.',
        student_portal: 'Student-visible workspace behavior.',
        provider_portal: 'Provider-scoped portal behavior.',
        calendar: 'Internal calendar visibility policy.',
        google_workspace: 'Drive, Calendar, Classroom, and Google Business Profile readiness.',
        google_calendar: 'Google Calendar connector readiness.',
        google_classroom: 'Google Classroom connector readiness.',
        bot_permissions: 'Role-scoped assistant permissions.',
        api_limits: 'Usage logs and future budget controls.',
        provider_index: 'Public provider listing policy.',
        provider_plans: 'Provider package definitions.',
        provider_entitlements: 'Provider feature access matrix.',
        provider_onboarding: 'Provider launch checklist.',
        commercial_models: 'Provider commercial models.',
        billing: 'Payments, accounting, and processor readiness.',
        payment_links: 'Payment link and access-sync tracking.',
        integrations: 'External connector settings.',
        external_apps: 'Provider external app audit.',
        automations: 'Approval-gated workflow automation.',
        danger: 'Admin-only destructive controls.'
    })[section] || 'Settings group.';
}

function renderSettingsControlRow(label, value, note, status = 'Read-only') {
    const statusText = String(status || '');
    const statusHtml = statusText.trim().startsWith('<')
        ? statusText
        : `<span class="status-pill">${escapeHtml(statusText)}</span>`;
    return `
        <div class="settings-control-row">
            <div>
                <strong>${escapeHtml(label)}</strong>
                <p>${escapeHtml(note || '')}</p>
            </div>
            <div class="settings-control-side">
                ${statusHtml}
                <span>${escapeHtml(String(value || ''))}</span>
            </div>
        </div>
    `;
}

function latestAutomationEvidence(match) {
    const matcher = typeof match === 'function'
        ? match
        : (item => {
            const pattern = match instanceof RegExp ? match : new RegExp(String(match || ''), 'i');
            return pattern.test(`${item.action_key || ''} ${item.status || ''} ${item.title || ''} ${item.category || ''}`);
        });
    const candidates = [
        ...(botActionLogs || []),
        ...(supportTickets || []),
        ...(contactCommunications || [])
    ].filter(matcher);
    const latest = candidates
        .map(item => ({ item, time: new Date(item.created_at || item.updated_at || item.occurred_at || 0).getTime() || 0 }))
        .sort((a, b) => b.time - a.time)[0];
    return latest?.time ? formatDateTime(latest.item.created_at || latest.item.updated_at || latest.item.occurred_at) : 'No run logged';
}

function automationLibraryItems() {
    const openTicketCount = supportTickets.filter(ticket => !['resolved', 'closed'].includes(String(ticket.status || '').toLowerCase())).length;
    const providerIntakeCount = pipelineCards.filter(card => String(card.pipeline_key || '').includes('provider')).length || serviceProviders.length;
    const approvedAnnouncements = parentAnnouncements.filter(item => item.approved_for_parent_portal || item.selected_for_parent_portal).length;
    const questionQueueCount = oneTimeQuestionQueue.length;
    const googleReady = googleIntegrationStatus?.oauth?.configured ? 'test-user ready' : 'blocked by OAuth credentials';
    return [
        {
            id: 'provider-onboarding-review',
            name: 'Service provider onboarding review',
            workspace: 'BNA School / Provider Index',
            trigger: 'Provider submits /providers/join or provider onboarding intake',
            audience: 'Shloimie and provider admins',
            channel: 'Operations task, provider setup email after commit, no paid automation',
            prompt: 'Provider onboarding prompt',
            template: 'Provider setup email',
            status: 'implemented_guarded',
            last: latestAutomationEvidence(/provider_onboarding|setup-email|provider/i),
            next: providerIntakeCount ? `${providerIntakeCount} provider/intake records loaded` : 'Wait for next provider intake',
            linked: 'Provider records, provider onboarding pipeline, setup-email token table',
            guardrail: 'No checkout, payout, WhatsApp, social, or external CRM automation.'
        },
        {
            id: 'parent-accountability-lead-followup',
            name: 'Parent accountability lead follow-up',
            workspace: 'BNA School Workspace',
            trigger: 'Parent submits accountability app interest or public lead form',
            audience: 'Shloimie / BNA admin',
            channel: 'Local lead record and follow-up task before any send',
            prompt: 'Parent/accountability intake prompt',
            template: 'Follow-up note draft',
            status: 'draft_guarded',
            last: latestAutomationEvidence(/parent|accountability|lead/i),
            next: parentLeads.length ? `${parentLeads.length} parent lead records loaded` : 'No parent leads loaded',
            linked: 'Parent leads, contact communications, tasks',
            guardrail: 'No public student data, no WhatsApp/email send without approval.'
        },
        {
            id: 'ticket-processed-acknowledgement',
            name: 'Ticket processed acknowledgement',
            workspace: 'All workspaces',
            trigger: 'Support ticket moves to resolved or closed',
            audience: 'Ticket submitter and internal owner',
            channel: 'First-party no-send communication draft plus ticket comment',
            prompt: 'Support processed notification copy',
            template: 'Ticket status / next-step note',
            status: 'implemented_no_send',
            last: latestAutomationEvidence(/support|ticket|notification/i),
            next: openTicketCount ? `${openTicketCount} open ticket records` : 'No open tickets',
            linked: 'Support tickets, bna_contact_communications, internal comments',
            guardrail: 'No email, WhatsApp, SMS, Telegram, or portal send fires automatically.'
        },
        {
            id: 'parent-weekly-update-approval',
            name: 'Parent weekly update approval',
            workspace: 'BNA School Workspace',
            trigger: 'Weekly parent announcement draft selected',
            audience: 'BNA parents after approval',
            channel: 'Operations announcement record; future email/WhatsApp send remains separate',
            prompt: 'Weekly parent update prompt',
            template: 'Parent announcement / weekly update',
            status: 'approval_required',
            last: latestAutomationEvidence(/parent.*announcement|weekly_update|draft_weekly_update/i),
            next: approvedAnnouncements ? `${approvedAnnouncements} selected/approved announcements` : 'Draft or approve announcement first',
            linked: 'bna_weekly_updates, parent portal, communications',
            guardrail: 'Selection is not a send; recipient/copy/channel approval remains required.'
        },
        {
            id: 'one-time-question-rabbi-alert',
            name: 'One Time question review alert',
            workspace: 'Rabbi Sheller Provider Workspace',
            trigger: 'Private One Time question is submitted or marked excellent',
            audience: 'Rabbi / Shloimie provider admin',
            channel: 'Private Operations review queue; future alert needs preference approval',
            prompt: 'Question moderation review prompt',
            template: 'Private Rabbi review note',
            status: 'private_review_ready',
            last: latestAutomationEvidence(/submit_student_question_for_moderation|review_moderated_question|question/i),
            next: `${questionQueueCount} private review item${questionQueueCount === 1 ? '' : 's'} loaded`,
            linked: 'bna_one_time_question_reviews, provider tasks, comments',
            guardrail: 'No public forum post, member-visible answer, send, or Codex job.'
        },
        {
            id: 'one-time-8-week-nurture',
            name: 'One Time 8-week nurture plan',
            workspace: 'Rabbi Sheller Provider Workspace',
            trigger: 'Rabbi Mishnah lead capture or launch-calendar approval',
            audience: 'One Time leads/members after approval',
            channel: 'Calendar/content plan preview only; sends disabled',
            prompt: 'One Time launch/nurture prompt',
            template: '8-week launch calendar and follow-up sequence',
            status: 'preview_only',
            last: latestAutomationEvidence(/calendar_batch_launch_plan_preview|one_time/i),
            next: 'Requires approved destination, copy, channel, and recipient/source list',
            linked: 'One Time leads, content jobs, Google Calendar preview actions',
            guardrail: 'No email/WhatsApp/social send, calendar write, access grant, or external connector write.'
        },
        {
            id: 'google-live-adapter-test',
            name: 'Google live adapter test gate',
            workspace: 'BNA School / Provider workspaces',
            trigger: 'APPROVE_GOOGLE_LIVE_ADAPTER_TEST decision and connected test user',
            audience: 'Admin/test users only',
            channel: 'Google Drive / Calendar / Classroom / Business Profile test-user adapters',
            prompt: 'Google natural-language action map',
            template: 'Dry-run preview response and approval packet',
            status: googleReady,
            last: latestAutomationEvidence(/google_|calendar_|classroom_|drive_/i),
            next: 'OAuth test users and scope policy must be confirmed before live writes',
            linked: 'Google Action Audit, connector settings, OAuth connections',
            guardrail: 'No live Google read/write runs from the library.'
        },
        {
            id: 'rabbi-content-added-review',
            name: 'Rabbi content added review',
            workspace: 'Rabbi Sheller Provider Workspace',
            trigger: 'One Time video/audio/content drop enters Operations',
            audience: 'Shloimie / Rabbi content reviewer',
            channel: 'Content job, internal review outputs, future notification preference',
            prompt: 'Rabbi shiur/source-sheet and content repurpose prompts',
            template: 'Video library card, transcript, worksheet/source-sheet draft',
            status: 'review_ready',
            last: latestAutomationEvidence(/create_one_time_video_library_item|rabbi|source_sheet|content/i),
            next: contentJobs.length ? `${contentJobs.length} content job records loaded` : 'No content jobs loaded',
            linked: 'bna_content_jobs, content outputs, One Time Library',
            guardrail: 'No publish, social post, email/WhatsApp send, Drive/video-host write, or member visibility.'
        }
    ];
}

function automationPromptLibraryItems() {
    const content = (contentPrompts || []).map(prompt => ({
        type: 'Content prompt',
        key: prompt.platform || prompt.prompt_key || prompt.id || 'content',
        label: prompt.label || prompt.platform || prompt.prompt_key || 'Content prompt',
        status: prompt.updated_at ? `Updated ${formatDateTime(prompt.updated_at)}` : 'Loaded',
        source: 'bna_content_prompts'
    }));
    const assignments = (assignmentPrompts || []).map(prompt => ({
        type: 'Assignment prompt',
        key: prompt.prompt_key || prompt.id || 'assignment',
        label: prompt.label || prompt.prompt_key || 'Assignment prompt',
        status: prompt.updated_at ? `Updated ${formatDateTime(prompt.updated_at)}` : 'Loaded',
        source: 'bna_assignment_prompts'
    }));
    const helperPolicies = [
        { type: 'Helper policy', key: 'public_source_boundary', label: 'BNA Helper source boundary', status: 'Policy active', source: 'assistant context' },
        { type: 'Helper policy', key: 'provider_scope_guard', label: 'Provider/Rabbi workspace scope guard', status: 'Policy active', source: 'workspace role context' },
        { type: 'Automation guard', key: 'no_send_external_write', label: 'No-send / no-external-write guardrails', status: 'Policy active', source: 'action registry and settings' }
    ];
    return [...content, ...assignments, ...helperPolicies];
}

function automationStatusTone(status = '') {
    const value = String(status || '').toLowerCase();
    if (/implemented|ready|active|policy/.test(value)) return 'Ready';
    if (/blocked|required|approval|guarded/.test(value)) return 'Guarded';
    return 'Draft';
}

function renderAutomationLibrarySettings() {
    const items = automationLibraryItems();
    const prompts = automationPromptLibraryItems();
    const readyCount = items.filter(item => /implemented|ready|active/.test(String(item.status || '').toLowerCase())).length;
    const guardedCount = items.filter(item => /blocked|guarded|approval|required|preview/.test(String(item.status || '').toLowerCase())).length;
    return `
        <div class="connector-settings-section automation-library-panel">
            <div class="task-section-header">
                <h3>Automation Library</h3>
                <span>${items.length} workflow${items.length === 1 ? '' : 's'}</span>
            </div>
            <p class="settings-disabled-note">This is the read-only automation map for BNA, providers, tickets, Google, and One Time. Preview buttons explain the planned dry-run path only; enablement still requires a typed approval path and a specific connector/sender.</p>
            <div class="settings-control-grid">
                ${renderSettingsControlRow('Ready / implemented', String(readyCount), 'Workflows with a first-party no-send or read-only implementation already visible in Operations.', 'Read-only')}
                ${renderSettingsControlRow('Guarded / approval required', String(guardedCount), 'Workflows that need explicit approval before sends, live connector writes, checkout/access changes, or member visibility.', 'Guarded')}
                ${renderSettingsControlRow('Prompt browser', `${prompts.length} prompt/policy records`, 'Content prompts, assignment prompts, helper policies, and automation guardrails are linked here for review.', `<button type="button" class="task-action" onclick="openAutomationPromptBrowser()">Open Prompts</button>`)}
            </div>
            <div class="content-section-grid" style="margin-top:12px;">
                ${items.map(item => `
                    <article class="content-card automation-library-card">
                        <div class="content-card-head">
                            <div>
                                <div class="content-card-title">${escapeHtml(item.name)}</div>
                                <div class="content-card-meta">${escapeHtml(item.workspace)} / ${escapeHtml(automationStatusTone(item.status))}</div>
                            </div>
                            <span class="status-pill">${escapeHtml(item.status)}</span>
                        </div>
                        <div class="settings-control-grid compact" style="margin-top:8px;">
                            ${renderSettingsControlRow('Trigger', item.trigger, 'What starts the workflow.', 'Trigger')}
                            ${renderSettingsControlRow('Audience', item.audience, 'Who the workflow is for.', 'Scope')}
                            ${renderSettingsControlRow('Channel', item.channel, 'Current or intended channel; external senders stay approval-gated.', 'Channel')}
                            ${renderSettingsControlRow('Prompt / template', `${item.prompt} / ${item.template}`, 'Prompt and template family to review before enablement.', 'Prompt')}
                            ${renderSettingsControlRow('Last / next', `${item.last} / ${item.next}`, 'Readback from loaded Operations data, not proof of external execution.', 'Evidence')}
                            ${renderSettingsControlRow('Linked records', item.linked, 'First-party records or connector evidence tied to the workflow.', 'Links')}
                        </div>
                        <p class="event-meta">${escapeHtml(item.guardrail)}</p>
                        <div class="task-actions">
                            <button class="task-action primary" type="button" onclick="previewAutomationLibraryItem(${attrJson(item.id)})">Preview Dry Run</button>
                            <button class="task-action" type="button" onclick="openAutomationPromptBrowser(${attrJson(item.prompt)})">Review Prompt</button>
                            <button class="task-action" type="button" disabled>Enable requires approval</button>
                        </div>
                    </article>
                `).join('')}
            </div>
            <div class="task-section-header compact" style="margin-top:16px;">
                <h3>Prompt Browser</h3>
                <span>${prompts.length} records</span>
            </div>
            <div class="data-table compact-table">
                <table>
                    <thead>
                        <tr>
                            <th>Prompt</th>
                            <th>Type</th>
                            <th>Source</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${prompts.slice(0, 12).map(prompt => `
                            <tr>
                                <td><strong>${escapeHtml(prompt.label)}</strong><br><span class="event-meta">${escapeHtml(prompt.key)}</span></td>
                                <td>${escapeHtml(prompt.type)}</td>
                                <td>${escapeHtml(prompt.source)}</td>
                                <td>${escapeHtml(prompt.status)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${prompts.length > 12 ? `<p class="event-meta" style="margin-top:8px;">Showing 12 of ${prompts.length} prompt/policy records. Open Content > Prompts for the full editable content prompt library.</p>` : ''}
        </div>
    `;
}

function previewAutomationLibraryItem(itemId) {
    const item = automationLibraryItems().find(entry => entry.id === itemId);
    if (!item) return alert('Automation preview is not loaded.');
    alert(`${item.name} is preview-only from this library. Guardrail: ${item.guardrail} No external send, publish, billing/access change, Google write, Drive/video-host write, or external CRM write was performed.`);
}

function openAutomationPromptBrowser() {
    currentView = 'content';
    contentSection = 'prompts';
    sidebarMode = 'modules';
    navDrawerOpen = false;
    syncOperationsUrl();
    render();
    loadData({ background: true });
}

function renderConnectorSettingsSection(types = [], title = 'Connectors', note = '') {
    const typeSet = new Set(types);
    const connectors = connectorSettings.filter(setting => !typeSet.size || typeSet.has(setting.connector_type));
    const visible = currentWorkspaceKey() === 'platform'
        ? connectors
        : connectors.filter(setting => normalizeWorkspaceKey(setting.workspace_key) === currentWorkspaceKey());
    return `
        <div class="connector-settings-section">
            <div class="task-section-header"><h3>${escapeHtml(title)}</h3><span>${visible.length} connector${visible.length === 1 ? '' : 's'}</span></div>
            ${note ? `<p class="settings-disabled-note">${escapeHtml(note)}</p>` : ''}
            <div class="connector-grid">
                ${visible.length ? visible.map(renderConnectorSettingCard).join('') : '<div class="empty-state">No connector settings are loaded for this workspace.</div>'}
            </div>
        </div>
    `;
}

function googleIntegrationCardCount() {
    const status = googleIntegrationStatus || {};
    return 4 + (Array.isArray(status.connections) ? status.connections.length : 0);
}

function googleIntegrationConnection(integrationKey) {
    const connections = Array.isArray(googleIntegrationStatus?.connections) ? googleIntegrationStatus.connections : [];
    return connections.find(connection => connection.integration === integrationKey) || null;
}

function googleScopeText(scopes) {
    if (Array.isArray(scopes)) return scopes.filter(Boolean).join(', ') || 'No scopes recorded';
    return String(scopes || '').trim() || 'No scopes recorded';
}

function googleConnectionStatus(integrationKey, fallback = 'not connected') {
    const connection = googleIntegrationConnection(integrationKey);
    return connection?.status || fallback;
}

const GOOGLE_ACTION_AUDIT_KEYS = [
    'sync_google_calendar',
    'sync_google_classroom',
    'google_drive_find_file_preview',
    'google_drive_create_doc_preview',
    'google_drive_create_folder_preview',
    'google_drive_move_file_preview',
    'capture_provider_google_business_link'
];

function googleActionAuditLogs() {
    const keys = new Set(GOOGLE_ACTION_AUDIT_KEYS);
    return (botActionLogs || [])
        .filter(log => keys.has(String(log.action_key || '').trim()))
        .slice(0, 12);
}

function googleAuditValueText(value) {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value).replace(/_/g, ' ');
    }
    if (Array.isArray(value)) return value.filter(Boolean).map(googleAuditValueText).filter(Boolean).join(', ');
    if (typeof value === 'object') {
        return googleAuditValueText(
            value.blocker
            || value.next_confirmation
            || value.error
            || value.result_status
            || value.drive_action
            || value.google_area
            || value.integration
            || value.connector
            || value.action_run_id
            || JSON.stringify(value)
        );
    }
    return String(value).replace(/_/g, ' ');
}

function googleActionAuditSummary(log = {}) {
    const preview = log.preview || {};
    const result = log.result || {};
    const dryRun = preview.dry_run_result || preview.preview || {};
    const details = [
        dryRun.drive_action,
        dryRun.google_area,
        dryRun.integration,
        dryRun.blocker,
        dryRun.mode,
        preview.approval_status,
        result.result_summary,
        result.error
    ].filter(Boolean);
    return details.length ? details.map(googleAuditValueText).filter(Boolean).join(' / ') : 'Preview or execution logged';
}

function renderGoogleActionAuditLog() {
    const logs = googleActionAuditLogs();
    return `
        <section class="connector-settings-section google-action-audit-log" aria-label="Google action audit log">
            <div class="task-section-header">
                <h3>Google Action Audit</h3>
                <span>${logs.length} recent</span>
            </div>
            <p class="settings-disabled-note">Read-only preview/execution evidence for Google, Drive, Classroom, Calendar, and Google Business helper actions.</p>
            ${logs.length ? `
                <div class="data-table compact-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Action</th>
                                <th>Status</th>
                                <th>Actor</th>
                                <th>Summary</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map(log => `
                                <tr>
                                    <td>${escapeHtml(formatDateTime(log.created_at))}</td>
                                    <td>${escapeHtml(String(log.action_key || '').replace(/_/g, ' '))}</td>
                                    <td><span class="status-pill">${escapeHtml(String(log.status || 'logged').replace(/_/g, ' '))}</span></td>
                                    <td>${escapeHtml(log.created_by || log.actor_role || 'system')}</td>
                                    <td>${escapeHtml(limitTextClient(googleActionAuditSummary(log), 180))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<div class="empty-state compact">No Google action previews or executions are logged for this workspace yet.</div>'}
        </section>
    `;
}

function renderGoogleWorkspaceSettings(options = {}) {
    const canonicalRoute = Boolean(options.canonicalRoute);
    const status = googleIntegrationStatus || {};
    const oauth = status.oauth || {};
    const maps = status.maps || {};
    const business = status.business_profile || {};
    const oauthConfigured = Boolean(oauth.configured);
    const oauthConnection = googleIntegrationConnection('google_oauth') || {};
    const calendarConnection = googleIntegrationConnection('google_calendar') || {};
    const classroomConnection = googleIntegrationConnection('google_classroom') || {};
    const businessConnection = googleIntegrationConnection('google_business_profile') || {};
    const cards = [
        {
            title: 'Google Drive',
            integration: 'google_oauth',
            mode: oauthConfigured ? 'Test-user OAuth' : 'No-OAuth / imported links',
            status: oauthConfigured ? googleConnectionStatus('google_oauth', 'ready for test users') : 'not configured',
            account: oauthConnection.external_account_id || 'No connected account',
            scopes: googleScopeText(oauth.required_scopes),
            last: oauthConnection.updated_at || 'No test yet',
            connectionId: oauthConnection.connection_id || '',
            note: 'Use public Drive links, imported owner-connected files, and manual uploads now. File search/import writes need a connected test user or owner pipeline.',
            dryRunAction: '',
            dryRunActions: [
                { id: 'google_drive_find_file_preview', label: 'Find/list', inputs: { query: 'latest Rabbi Scheller Mishnah video', source_stage: 'one_time_video_drop' } },
                { id: 'google_drive_create_doc_preview', label: 'Doc preview', inputs: { title: 'Class summary draft', folder_name: 'One Time class summaries' } },
                { id: 'google_drive_create_folder_preview', label: 'Folder preview', inputs: { folder_name: 'Provider workspace folder' } },
                { id: 'google_drive_move_file_preview', label: 'Move preview', inputs: { file_name: 'selected transcript', target_folder_name: 'One Time folder' } }
            ],
            testPath: '/api/google/connections/status'
        },
        {
            title: 'Google Calendar',
            integration: 'google_calendar',
            mode: oauthConfigured ? 'Test-user OAuth' : 'Internal calendar only',
            status: googleConnectionStatus('google_calendar', oauthConfigured ? 'ready for test users' : 'not configured'),
            account: calendarConnection.external_account_id || oauthConnection.external_account_id || 'No connected account',
            scopes: 'calendar.events, calendar.events.owned, calendar.app.created, calendar.freebusy',
            last: calendarConnection.updated_at || oauthConnection.updated_at || 'No test yet',
            connectionId: calendarConnection.connection_id || oauthConnection.connection_id || '',
            note: 'BNA internal calendar works now. External Calendar writes require dry-run preview, confirmation, and a connected account.',
            dryRunAction: 'sync_google_calendar',
            dryRunActions: [
                { id: 'sync_google_calendar', label: 'Sync preview', inputs: {} },
                { id: 'calendar_batch_launch_plan_preview', label: '8-week plan', inputs: { program: 'One Time Mishnayos launch', weeks: 8, workspace_key: 'rabbi_sheller_provider' } }
            ],
            testPath: '/api/google/calendar/events'
        },
        {
            title: 'Google Classroom',
            integration: 'google_classroom',
            mode: oauthConfigured ? 'Test-user OAuth' : 'Internal assignments only',
            status: googleConnectionStatus('google_classroom', oauthConfigured ? 'ready for test users' : 'not configured'),
            account: classroomConnection.external_account_id || oauthConnection.external_account_id || 'No connected account',
            scopes: 'classroom.courses.readonly, classroom.courseworkmaterials, classroom.coursework.students, classroom.topics',
            last: classroomConnection.updated_at || oauthConnection.updated_at || 'No test yet',
            connectionId: classroomConnection.connection_id || oauthConnection.connection_id || '',
            note: 'Assignment payload previews already work inside BNA. Live Classroom coursework stays approval-gated.',
            dryRunAction: 'sync_google_classroom',
            dryRunActions: [
                { id: 'sync_google_classroom', label: 'Sync preview', inputs: {} },
                { id: 'classroom_topic_material_preview', label: 'Topic/material', inputs: { course_name: 'BNA classroom', topic_name: 'Week 1', material_title: 'Reviewed class material', workspace_key: 'bna' } }
            ],
            testPath: '/api/google/classroom/courses'
        },
        {
            title: 'Google Business Profile',
            integration: 'google_business_profile',
            mode: business.approved ? 'Production OAuth' : 'Manual link / later verification',
            status: googleConnectionStatus('google_business_profile', business.status || 'not configured'),
            account: businessConnection.external_account_id || 'Provider connects their own account later',
            scopes: 'business.manage only after provider approval',
            last: businessConnection.updated_at || 'No test yet',
            connectionId: businessConnection.connection_id || '',
            note: business.fallback || 'Manual Google Business links and Place IDs are safe now. Live GBP API access waits for approval.',
            dryRunAction: '',
            dryRunActions: [
                { id: 'google_business_place_id_lookup', label: 'Place ID', inputs: { query: 'BNA Google Maps profile', workspace_key: 'bna' } },
                { id: 'google_business_list_locations_preview', label: 'Locations', inputs: { provider_name: 'Provider Google Business locations', workspace_key: 'bna' } }
            ],
            testPath: '/api/integrations/google/business-profile/status'
        }
    ];
    return `
        <div class="connector-settings-section">
            <div class="task-section-header">
                <h3>Google Workspace</h3>
                <span>${oauthConfigured ? 'OAuth configured' : 'OAuth not configured'}</span>
            </div>
            <p class="settings-disabled-note">${canonicalRoute ? 'Canonical route: Operations > Integrations > Google.' : 'Compatibility route: Settings > Google Workspace mirrors Operations > Integrations > Google.'} Natural-language Google actions still need the right Google scope. BNA should preview/dry-run now, execute only for connected test users, and prepare public verification later.</p>
            <div class="settings-control-grid">
                ${renderSettingsControlRow('No-OAuth mode', maps.configured ? 'Maps key configured' : 'Manual/public links', 'Public calendars, Maps links, Place IDs, YouTube/Vimeo links, manual Classroom notes, and imported Drive files can be used without OAuth.', 'Available now')}
                ${renderSettingsControlRow('Test-user OAuth', oauthConfigured ? 'Ready to add testers' : 'Needs credentials', 'Add Shloimie, Rabbi, and known testers on the OAuth consent screen before live public approval.', oauthConfigured ? 'Testing' : 'Blocked')}
                ${renderSettingsControlRow('Public production OAuth', 'Later', oauth.sensitive_scope_guard || 'Prepare privacy policy, deletion/disconnect, scope matrix, and demo video after behavior is stable.', 'Verification')}
            </div>
            ${renderGoogleLiveAdapterApprovalPacket(oauthConfigured)}
            <div class="connector-grid google-integration-grid">
                ${cards.map(renderGoogleIntegrationCard).join('')}
            </div>
            ${renderGoogleActionAuditLog()}
        </div>
    `;
}

function renderGoogleLiveAdapterApprovalPacket(oauthConfigured) {
    const rows = [
        ['OAuth test users', oauthConfigured ? 'Credentials present' : 'Needs OAuth credentials', 'Add Shloimie, Rabbi, and named testers to the OAuth consent screen before any live smoke.', oauthConfigured ? 'Testing gate' : 'Blocked'],
        ['Drive scope policy', 'Needs approval', 'Confirm exact Drive read/list/create/move scopes, folders, ownership model, and rollback path before replacing preview-only Drive actions.', 'Decision'],
        ['External-write confirmation', 'Required per action', 'Live Drive, Calendar, Classroom, or Google Business Profile writes must use explicit confirmation; suggested test phrase: APPROVE_GOOGLE_LIVE_ADAPTER_TEST.', 'Confirm'],
        ['Smoke evidence', 'Not run yet', 'Run one approved test-user OAuth smoke, log the preview/execution row, verify readback, then keep public production OAuth separate.', 'Evidence'],
    ];
    return `
        <section class="connector-card" aria-label="Google live adapter approval packet">
            <div class="contact-detail-header">
                <div>
                    <div class="contact-detail-name">Google Live Adapter Approval Packet</div>
                    <div class="contact-detail-label">What must be true before live Google/Drive execution</div>
                </div>
                <span class="status-pill">No external write</span>
            </div>
            <p class="settings-disabled-note">No live Google read/write runs from this packet. It is a readiness checklist for test-user OAuth, Drive scope policy, explicit confirmation, and smoke evidence.</p>
            <div class="settings-control-grid compact">
                ${rows.map(([label, value, helper, status]) => renderSettingsControlRow(label, value, helper, status)).join('')}
            </div>
            <div class="task-actions">
                <button class="task-action primary" type="button" onclick="previewApprovalDecisionDraft(event, 'google_live_adapter')">Preview Decision Draft</button>
                <button class="task-action" type="button" onclick="copyText(event, 'APPROVE_GOOGLE_LIVE_ADAPTER_TEST')">Copy Phrase</button>
            </div>
            <p class="settings-disabled-note">Preview Decision Draft logs a local <code>create_decision</code> dry-run only. It creates no decision task and performs no connector read/write.</p>
        </section>
    `;
}

function approvalDecisionDraft(kind) {
    if (kind === 'google_live_adapter') {
        return {
            title: 'Approve Google live adapter test-user smoke',
            question: 'Should BNA run one live Google adapter smoke with test-user OAuth after credentials, test users, Drive scope policy, and rollback expectations are confirmed?',
            options: [
                'Approve one test-user smoke with APPROVE_GOOGLE_LIVE_ADAPTER_TEST',
                'Keep Drive/Calendar/Classroom/GBP actions preview-only',
                'Narrow the scope policy before any live smoke',
            ],
            recommendation: 'Keep preview-only until OAuth credentials/test users and the exact Drive scope policy are confirmed, then approve one test-user smoke only.',
            context: 'Source: Operations Settings > Google Workspace approval packet. This is local decision preview only; no Google read/write or connector execution is performed.',
        };
    }
    if (kind === 'one_time_member_library') {
        const stats = oneTimeLibraryStats((contentJobs || []).filter(contentIsOneTimeLibraryItem));
        return {
            title: 'Approve One Time member-library publishing path',
            question: 'Should BNA enable the next One Time member-library publishing step after destination, visibility/audience, hosted media provider, notification/social channels, verification item, and rollback rules are explicit?',
            options: [
                'Approve one verification item with APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
                'Keep the One Time Library internal-review-only',
                'Confirm destination, visibility, and hosting before connector work',
            ],
            recommendation: 'Keep internal-review-only until destination, visibility, hosting, channel, verification item, and rollback decisions are explicit.',
            context: `Source: Operations Content > One Time Library publishing packet. Current review stats: ${Number(stats.total || 0)} items, ${Number(stats.hostedReady || 0)} hosted-media-ready, ${Number(stats.approved || 0)} approved internal outputs. This is local decision preview only; no publishing, send, checkout, member visibility, Drive/video-host, Buffer/social, or external CRM write is performed.`,
        };
    }
    return {
        title: 'Approval decision draft',
        question: 'Should this approval-gated action proceed?',
        options: ['Approve one smoke', 'Keep preview-only', 'Request more context'],
        recommendation: 'Keep preview-only until the approval packet is complete.',
        context: 'Local decision preview only.',
    };
}

async function previewApprovalDecisionDraft(event, kind) {
    event?.stopPropagation?.();
    try {
        const result = await api.runAction({
            action_id: 'create_decision',
            dry_run: true,
            source: `approval_packet_${kind}`,
            inputs: approvalDecisionDraft(kind),
        });
        await loadData({ background: true });
        const title = result?.preview?.title || 'decision draft';
        alert(`Local decision preview logged for "${title}". No decision task was created and no external write ran.`);
    } catch (error) {
        alert(error.message || 'Could not preview approval decision.');
    }
}

function renderGoogleIntegrationCard(card) {
    const canStartOauth = Boolean(googleIntegrationStatus?.oauth?.configured);
    const dryRunActions = Array.isArray(card.dryRunActions) && card.dryRunActions.length
        ? card.dryRunActions
        : (card.dryRunAction ? [{ id: card.dryRunAction, label: 'Dry-run', inputs: {} }] : []);
    const dryRunMarkup = dryRunActions.length
        ? dryRunActions.map(action => `<button class="task-action primary" type="button" onclick="previewGoogleIntegrationAction(${attrJson(action.id)}, ${attrValueJson(action.inputs || {})})">${escapeHtml(action.label || 'Dry-run')}</button>`).join('')
        : '<span class="status-pill">Manual preview</span>';
    return `
        <article class="connector-card google-integration-card">
            <div class="contact-detail-header">
                <div>
                    <div class="contact-detail-name">${escapeHtml(card.title)}</div>
                    <div class="contact-detail-label">${escapeHtml(card.mode)}</div>
                </div>
                <span class="status-pill">${escapeHtml(String(card.status || 'not connected').replace(/_/g, ' '))}</span>
            </div>
            <div class="settings-control-grid compact">
                ${renderSettingsControlRow('Account', card.account, 'Connected Google account or current safe fallback.', card.account && !/No connected/i.test(card.account) ? 'Connected' : 'Not connected')}
                ${renderSettingsControlRow('Scopes', limitTextClient(card.scopes, 180), 'Use the smallest scopes that support the requested action.', 'Scope plan')}
                ${renderSettingsControlRow('Last test', card.last, card.note, card.last && !/^No test/i.test(card.last) ? 'Logged' : 'No test')}
            </div>
            <div class="task-actions">
                ${dryRunMarkup}
                <button class="task-action" type="button" onclick="testGoogleIntegrationEndpoint(${attrJson(card.testPath)}, ${attrJson(card.title)})">Test connection</button>
                ${canStartOauth ? `<a class="task-action" href="/api/google/oauth/start?role=admin_teacher&features=calendar,classroom,drive_pipeline" target="_blank" rel="noopener noreferrer">Reconnect</a>` : '<span class="status-pill">OAuth credentials needed</span>'}
                ${card.connectionId ? `<button class="task-action danger" type="button" onclick="disconnectGoogleConnection(${Number(card.connectionId)}, ${attrJson(card.title)})">Disconnect</button>` : ''}
            </div>
        </article>
    `;
}

async function previewGoogleIntegrationAction(actionId, extraInputs = {}) {
    try {
        const targetWorkspace = normalizeWorkspaceKey(extraInputs.workspace_key || extraInputs.workspace || currentWorkspaceKey()) || currentWorkspaceKey();
        const result = await api.runAction({
            action_id: actionId,
            dry_run: true,
            source: 'operations_google_workspace',
            workspace_key: targetWorkspace,
            inputs: {
                workspace_key: targetWorkspace,
                requested_from: 'google_workspace_settings',
                ...(extraInputs || {})
            }
        });
        await loadData({ background: true });
        alert(result?.message || 'Calendar preview was logged.');
    } catch (error) {
        alert(error.message || 'Could not preview Google action.');
    }
}

async function testGoogleIntegrationEndpoint(path, label) {
    try {
        const response = await fetch(path, { credentials: 'same-origin' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `${label} test returned ${response.status}`);
        await loadData({ background: true });
        alert(`${label} connection test reached the server. Review the card/error details before enabling live writes.`);
    } catch (error) {
        alert(`${label} test blocked: ${error.message || 'connection is not ready yet'}`);
    }
}

async function disconnectGoogleConnection(connectionId, label) {
    const id = Number(connectionId || 0);
    if (!id) return;
    const confirmed = window.confirm(`Disconnect ${label}? BNA will remove the stored Google refresh token and keep Google actions in preview mode until reconnected.`);
    if (!confirmed) return;
    try {
        const response = await fetch(`/api/google/connections/${encodeURIComponent(String(id))}/disconnect`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                confirm: 'DISCONNECT_GOOGLE',
                source: 'operations_google_workspace'
            })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `${label} disconnect returned ${response.status}`);
        await loadData({ background: true });
        alert(data.message || `${label} was disconnected.`);
    } catch (error) {
        alert(`${label} disconnect blocked: ${error.message || 'connection could not be disconnected'}`);
    }
}

function renderCalendarPolicySettings() {
    return `
        <div class="settings-control-grid">
            ${renderSettingsControlRow('Internal calendar', 'Enabled', 'BNA Operations loads and edits internal events without Google connected.', 'Configured')}
            ${renderSettingsControlRow('Admin calendar', 'All BNA school events', 'Filters by student, event type, source, and visibility. Admin-only notes stay internal.', 'Configured')}
            ${renderSettingsControlRow('Student calendar', 'Student-visible only', 'Shows class sessions, assignments, meetings, task due dates, and enabled reminders for that student only.', 'Policy')}
            ${renderSettingsControlRow('Parent calendar', 'Parent-visible only', 'Shows child events marked parent-visible. No other family or admin-only events appear.', 'Policy')}
            ${renderSettingsControlRow('Provider schedule', 'Simple program schedule', 'Provider schedule shows class, worksheet/source-sheet deadlines, question deadlines, links, and access notices only.', 'Policy')}
        </div>
    `;
}

function renderGoogleCalendarSettings() {
    const google = activeWorkspaceConnectorSettings('google_calendar')[0] || {};
    const status = google.status || 'disconnected';
    return `
        <div class="connector-settings-section">
            <div class="task-section-header"><h3>Google Calendar</h3><span>Coming soon / internal-first</span></div>
            <p class="settings-disabled-note">Google is a connector, not a blocker. The internal calendar works now; Google Calendar stays disabled/coming soon unless OAuth credentials, test users, selected calendar, and approval are complete.</p>
            <div class="settings-control-grid">
                ${renderSettingsControlRow('Internal-first status', 'Enabled now', 'BNA Operations calendar remains the source of truth without Google connected.', 'Internal-first')}
                ${renderSettingsControlRow('Connection status', status, 'Disconnected / test-user / connected are stored on the connector record.', status)}
                ${renderSettingsControlRow('Calendar API enabled checklist', 'Review required', 'Confirm API enabled, OAuth consent configured, test users added, web OAuth client created, redirect URI configured, env vars present, selected calendar ID, last sync, and sync logs.', 'Checklist')}
                ${renderSettingsControlRow('Redirect URI', google.config?.redirect_uri || 'Not configured', 'Must match the deployed Railway callback URL before live OAuth.', google.config?.redirect_uri ? 'Configured' : 'Disabled')}
                ${renderSettingsControlRow('Selected calendar ID', google.config?.calendar_id || 'Not selected', 'Use one canonical calendar per workspace once sync is enabled.', google.config?.calendar_id ? 'Configured' : 'Disabled')}
                ${renderSettingsControlRow('Last sync', google.last_synced_at || 'Never', 'Sync logs will appear after backend sync jobs are enabled.', google.last_synced_at ? 'Logged' : 'No sync')}
            </div>
        </div>
    `;
}

function renderGoogleClassroomSettings() {
    const classroom = activeWorkspaceConnectorSettings('google_classroom')[0] || {};
    const status = classroom.status || 'disconnected';
    return `
        <div class="connector-settings-section">
            <div class="task-section-header"><h3>Google Classroom</h3><span>Coming soon / internal-first</span></div>
            <p class="settings-disabled-note">BNA Classroom is first-party and usable now. Google Classroom remains optional/coming soon unless credentials, course mapping, and approval are complete.</p>
            <div class="settings-control-grid">
                ${renderSettingsControlRow('Internal-first status', 'BNA Classroom enabled', 'Assignments, questions, calendar, and student portal surfaces do not require Google Classroom.', 'Internal-first')}
                ${renderSettingsControlRow('Connection status', status, 'Disconnected / connected state is stored on the connector record.', status)}
                ${renderSettingsControlRow('Selected course/classroom', classroom.config?.course_id || 'Not selected', 'Choose the BNA course only after OAuth is connected.', classroom.config?.course_id ? 'Configured' : 'Disabled')}
                ${renderSettingsControlRow('Sync coursework due dates', classroom.config?.sync_coursework_due_dates ? 'Enabled' : 'Disabled', 'Due dates can feed the internal calendar after sync is enabled.', classroom.config?.sync_coursework_due_dates ? 'Configured' : 'Disabled')}
                ${renderSettingsControlRow('Last sync', classroom.last_synced_at || 'Never', 'Sync logs will appear after backend sync jobs are enabled.', classroom.last_synced_at ? 'Logged' : 'No sync')}
                ${renderSettingsControlRow('Sync logs', 'Connector log link pending', 'Logs remain admin-only and should not expose student private notes.', 'Admin-only')}
            </div>
        </div>
    `;
}

function currentDriveSocialIngestionMap() {
    const workspace = currentWorkspaceRecord();
    const settings = workspace.settings || {};
    const map = settings.drive_social_ingestion || settings.one_time_drive_social_ingestion || {};
    return map && typeof map === 'object' ? map : {};
}

function driveFolderLinksForMap(map = {}) {
    if (Array.isArray(map.folder_links) && map.folder_links.length) return map.folder_links;
    const root = map.root || {};
    const content = map.content_media_folder || {};
    const lanes = Array.isArray(map.lanes) ? map.lanes : [];
    const rootLink = root.id || root.webViewLink ? [{
        key: 'projectRoot',
        title: root.name || 'Project root folder',
        purpose: 'Project root folder for the One Time Mishnah Class workspace.',
        intended_audience: 'super_admin_only',
        lane_type: 'project_root',
        webViewLink: root.webViewLink,
        status: root.id ? 'mapped' : 'missing',
        triggers_transcription: false,
        source_material_only: false
    }] : [];
    const parentLink = content.id || content.webViewLink ? [{
        key: 'contentMedia',
        title: content.name || '04 Content and Media Intake',
        purpose: 'Parent folder for Rabbi content/media intake and review lanes.',
        intended_audience: 'super_admin_only',
        lane_type: 'parent',
        webViewLink: content.webViewLink,
        status: content.id ? 'mapped' : 'missing',
        triggers_transcription: false,
        source_material_only: false
    }] : [];
    return rootLink.concat(parentLink).concat(lanes.map(lane => ({
        key: lane.key,
        title: lane.name || lane.key || 'Drive lane',
        actual_title: lane.actual_name || lane.name || '',
        purpose: lane.purpose || lane.backend_use || '',
        handling: lane.handling || '',
        intended_audience: lane.intended_audience || (lane.rabbi_facing ? 'rabbi_facing' : 'internal'),
        lane_type: lane.lane_type || lane.drive_stage || '',
        webViewLink: lane.webViewLink,
        status: lane.status || (lane.id ? 'mapped' : 'missing'),
        triggers_transcription: Boolean(lane.triggers_transcription),
        source_material_only: Boolean(lane.source_material_only),
        rabbi_facing: Boolean(lane.rabbi_facing),
        copy_label: lane.copy_label || ''
    })));
}

function renderDriveFolderLinkCard(folder = {}) {
    const url = folder.webViewLink || '';
    const copyLabel = folder.copy_label || 'Copy link';
    const titleSuffix = folder.actual_title && folder.actual_title !== folder.title
        ? `Actual Drive title: ${folder.actual_title}`
        : '';
    return `
        <article class="content-card">
            <div class="content-card-title">${escapeHtml(folder.title || folder.key || 'Drive folder')}</div>
            <div class="content-card-meta">${escapeHtml([folder.status || 'mapped', folder.intended_audience || '', folder.lane_type || ''].filter(Boolean).join(' / '))}</div>
            <p class="event-meta">${escapeHtml(folder.purpose || folder.handling || '')}</p>
            ${titleSuffix ? `<p class="event-meta">${escapeHtml(titleSuffix)}</p>` : ''}
            <div class="service-meta" style="margin-top:8px;">
                <span class="status-pill">${folder.triggers_transcription ? 'Triggers transcription' : 'No transcription trigger'}</span>
                <span class="status-pill">${folder.source_material_only ? 'Source-material only' : 'Not source-only'}</span>
                <span class="status-pill">${folder.rabbi_facing ? 'Rabbi-facing' : 'Super-admin/internal'}</span>
            </div>
            <div class="task-actions">
                ${url ? `<a class="task-action primary" href="${escapeHtml(url)}" target="_blank" rel="noopener">Open folder</a>` : '<button class="task-action" disabled>Missing link</button>'}
                ${url ? `<button class="task-action" type="button" onclick="copyText(event, '${escapeHtml(url)}')">${escapeHtml(copyLabel)}</button>` : ''}
            </div>
        </article>
    `;
}

function defaultOneTimeAppAccessReadiness() {
    return {
        status: 'blocked_pending_owner_approved_external_app_access',
        label: 'One Time app/admin/member-library readiness',
        ready_for_live_app_write: false,
        ready_for_admin_access_reset: false,
        ready_for_member_library_publish: false,
        required_before_live_access: [
            'Current One Time admin URL and deployment target confirmed',
            'Owner-approved admin reset path or Shloimie/admin login confirmed',
            'Rabbi/member test login confirmed for read-only smoke checks',
            'Production or staging database URL/source confirmed for the One Time app',
            'Vimeo/media hosting destination and hosted media URL path confirmed',
            'Resend sender/domain and approved notification copy confirmed before any email send',
            'Billing provider, tier mapping, refund/cancellation policy, and rollback/revoke path approved',
            'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING present only for the exact one-item publishing smoke',
        ],
        current_blockers: [
            'Do not invent or store One Time admin/member credentials in BNA docs.',
            'External One Time app has not been approved as a BNA write target.',
            'Member-library destination, audience, visibility rules, hosted media URL, and rollback plan are still required before publish.',
            'Email/WhatsApp/member notifications remain no-send until sender, recipients, copy, and approval are explicit.',
            'Billing/access grants remain blocked until trusted payment source, tier mapping, and revoke path are approved.',
        ],
        no_write_guard: [
            'no_admin_password_reset',
            'no_member_access_grant',
            'no_member_library_publish',
            'no_drive_or_video_host_write',
            'no_resend_email',
            'no_whatsapp_or_sms',
            'no_checkout_or_billing_write',
            'no_external_crm_write',
        ],
        audit_source: 'ops/rabbi-scheller/2026-06-14-one-time-app-audit.md'
    };
}

function currentOneTimeAppAccessReadiness() {
    const map = currentDriveSocialIngestionMap();
    const fallback = defaultOneTimeAppAccessReadiness();
    const readiness = map.app_access_readiness && typeof map.app_access_readiness === 'object'
        ? map.app_access_readiness
        : {};
    return {
        ...fallback,
        ...readiness,
        required_before_live_access: Array.isArray(readiness.required_before_live_access) ? readiness.required_before_live_access : fallback.required_before_live_access,
        current_blockers: Array.isArray(readiness.current_blockers) ? readiness.current_blockers : fallback.current_blockers,
        no_write_guard: Array.isArray(readiness.no_write_guard) ? readiness.no_write_guard : fallback.no_write_guard
    };
}

function renderOneTimeAppAccessReadinessCard(readiness = currentOneTimeAppAccessReadiness()) {
    const required = Array.isArray(readiness.required_before_live_access) ? readiness.required_before_live_access : [];
    const blockers = Array.isArray(readiness.current_blockers) ? readiness.current_blockers : [];
    const guards = Array.isArray(readiness.no_write_guard) ? readiness.no_write_guard : [];
    return `
        <article class="content-card">
            <div class="content-card-title">One Time App Readiness</div>
            <div class="content-card-meta">${escapeHtml(readiness.status || 'blocked_pending_review')}</div>
            <div class="settings-control-grid" style="margin-top:8px;">
                ${renderSettingsControlRow('Live app writes', readiness.ready_for_live_app_write ? 'Ready' : 'Blocked', 'External One Time app/admin writes require owner-approved access and target confirmation.', readiness.ready_for_live_app_write ? 'Ready' : 'Blocked')}
                ${renderSettingsControlRow('Admin reset/access', readiness.ready_for_admin_access_reset ? 'Ready' : 'Blocked', 'Do not invent credentials; use only an owner-approved reset/login path.', readiness.ready_for_admin_access_reset ? 'Ready' : 'Blocked')}
                ${renderSettingsControlRow('Member-library publish', readiness.ready_for_member_library_publish ? 'Ready' : 'Blocked', 'Requires destination, audience, hosted media, visibility rules, rollback, and explicit approval phrase.', readiness.ready_for_member_library_publish ? 'Ready' : 'Blocked')}
            </div>
            ${required.length ? `<div class="contact-detail-note" style="margin-top:8px;">${required.slice(0, 4).map(escapeHtml).join('<br>')}</div>` : ''}
            ${blockers.length ? `<div class="contact-detail-note" style="margin-top:8px;">${blockers.map(escapeHtml).join('<br>')}</div>` : ''}
            ${guards.length ? `<p class="event-meta" style="margin-top:8px;">No-write guard: ${escapeHtml(guards.join(', '))}</p>` : ''}
            <div class="task-actions">
                <button class="task-action" onclick="checkOneTimeAppAccessReadiness(event)">Check App Access</button>
            </div>
        </article>
    `;
}

function currentSocialPlatformRows(setting = {}) {
    const config = setting.config || {};
    const map = currentDriveSocialIngestionMap();
    const platforms = Array.isArray(config.social_platforms) && config.social_platforms.length
        ? config.social_platforms
        : (Array.isArray(map.social_platforms) ? map.social_platforms : []);
    return platforms.map(platform => ({
        key: String(platform.key || platform.id || platform.label || '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, ''),
        label: platform.label || platform.key || 'Platform',
        status: config[`${String(platform.key || '').toLowerCase()}_setup_status`] || platform.status || 'needs setup',
        destination: platform.destination || platform.requiredSetting || 'Destination needs Shloimie review.',
        requiredSetting: platform.requiredSetting || platform.required_setting || '',
        outputType: platform.outputType || platform.output_type || ''
    })).filter(platform => platform.key);
}

function renderSocialPlatformSetupRows(setting = {}) {
    const platforms = currentSocialPlatformRows(setting);
    if (!platforms.length) return '';
    const id = Number(setting.id || 0);
    return `
        <div class="settings-control-grid">
            ${platforms.map(platform => renderSettingsControlRow(
                platform.label,
                platform.status,
                [platform.destination, platform.requiredSetting, platform.outputType ? `Output: ${platform.outputType}` : ''].filter(Boolean).join(' | '),
                'Setup'
            )).join('')}
        </div>
        <div class="task-actions">
            ${platforms.map(platform => id
                ? `<button class="task-action" onclick="prepareSocialPlatformConnector(event, ${id}, '${escapeHtml(platform.key)}')">Prepare ${escapeHtml(platform.label)}</button>`
                : `<button class="task-action" disabled>Prepare ${escapeHtml(platform.label)}</button>`
            ).join('')}
        </div>
    `;
}

function renderDriveSocialIngestionSettings() {
    const map = currentDriveSocialIngestionMap();
    const lanes = Array.isArray(map.lanes) ? map.lanes : [];
    const folderLinks = driveFolderLinksForMap(map);
    const guard = map.login_release_guard || {};
    const requiredBeforeLogin = Array.isArray(guard.requiredBeforeSendingLogin) ? guard.requiredBeforeSendingLogin : [];
    const blockers = Array.isArray(guard.currentKnownBlockers) ? guard.currentKnownBlockers : [];
    const socialConnector = activeWorkspaceConnectorSettings('social')[0] || {};
    const driveConnector = activeWorkspaceConnectorSettings('other').find(setting => /drive\/social ingestion/i.test(setting.display_name || '')) || {};
    const root = map.root || {};
    const backend = map.backend_mapping || {};
    return `
        <div class="connector-settings-section">
            <div class="task-section-header"><h3>One Time Drive / Social Intake</h3><span>${escapeHtml(guard.status || 'guarded')}</span></div>
            <p class="settings-disabled-note">Rabbi Scheller material stays scoped to the One Time workspace. Video drops create One Time content jobs first; social outputs stay draft/approval-only until Shloimie configures each platform.</p>
            <div class="settings-control-grid">
                ${renderSettingsControlRow('Drive root', root.webViewLink ? 'Open folder' : (root.id || 'Not mapped'), root.webViewLink || root.name || 'Use the One Time Mishnah Class Drive root.', root.id ? 'Mapped' : 'Disabled')}
                ${renderSettingsControlRow('Content job project', backend.content_job_project_key || 'one_time_mishnah_class', 'Backend creates/reads content jobs in the One Time project scope.', 'Scoped')}
                ${renderSettingsControlRow('Drive fields', [backend.drive_file_id_field, backend.drive_folder_id_field, backend.drive_stage_field].filter(Boolean).join(', ') || 'Drive fields pending', 'Drive file, folder, and stage are stored on content jobs for ingestion traceability.', 'Mapped')}
                ${renderSettingsControlRow('Social guard', backend.social_publish_guard || 'Approval required before any social write.', 'Buffer/social drafts and publish-now actions remain explicit approval paths.', 'Guarded')}
            </div>
            ${folderLinks.length ? `
                <div class="content-section-grid" style="margin-top:12px;">
                    ${folderLinks.map(renderDriveFolderLinkCard).join('')}
                </div>
            ` : '<div class="empty-state">Drive/social lanes are not loaded yet. Run the One Time Drive setup script to create and map folders.</div>'}
            <div class="content-section-grid" style="margin-top:12px;">
                <article class="content-card">
                    <div class="content-card-title">Social Platform Setup</div>
                    <div class="content-card-meta">${escapeHtml(socialConnector.display_name || 'Rabbi Sheller social connector')}</div>
                    ${renderSocialPlatformSetupRows(socialConnector)}
                </article>
                <article class="content-card">
                    <div class="content-card-title">Login Release Guard</div>
                    <div class="content-card-meta">${escapeHtml(guard.status || 'hold login')}</div>
                    ${requiredBeforeLogin.map(item => `<p class="event-meta">${escapeHtml(item)}</p>`).join('')}
                    ${blockers.length ? `<div class="contact-detail-note">${blockers.map(escapeHtml).join('<br>')}</div>` : ''}
                    ${guard.whatsappRequestCopy ? `<div class="contact-detail-note" style="margin-top:8px;">${escapeHtml(guard.whatsappRequestCopy)}</div>` : ''}
                </article>
                ${renderOneTimeAppAccessReadinessCard()}
                <article class="content-card">
                    <div class="content-card-title">Backend Connector</div>
                    <div class="content-card-meta">${escapeHtml(driveConnector.display_name || 'One Time Drive/social ingestion map')}</div>
                    <p class="event-meta">${escapeHtml(driveConnector.metadata?.workflow || 'Drive mapping is loaded from workspace settings and connector defaults.')}</p>
                    <span class="status-pill">${escapeHtml(driveConnector.status || 'manual_mode')}</span>
                </article>
            </div>
        </div>
    `;
}

function renderConnectorSettingCard(setting = {}) {
    const config = setting.config || {};
    const metadata = setting.metadata || {};
    return `
        <article class="connector-card">
            <div class="content-card-head">
                <div>
                    <div class="content-card-title">${escapeHtml(setting.display_name || setting.connector_type || 'Connector')}</div>
                    <div class="content-card-meta">${escapeHtml([setting.workspace_key, setting.connector_type].filter(Boolean).join(' / '))}</div>
                </div>
                <span class="status-pill">${escapeHtml(setting.status || 'not_configured')}</span>
            </div>
            <div class="settings-control-grid">
                ${renderSettingsControlRow('Provider', config.provider || config.mode || config.canonical_calendar || 'Not configured', metadata.note || metadata.workflow || 'Stored in connector config.', setting.status || 'not_configured')}
                ${renderSettingsControlRow('Default identity', config.from_email || config.default_number || config.default_identity || 'Not set', 'Requires connector-specific values before live sends.', config.from_email || config.default_number ? 'Partial' : 'Disabled')}
            </div>
            ${setting.connector_type === 'social' ? renderSocialPlatformSetupRows(setting) : ''}
            <div class="task-actions">
                <button class="task-action" onclick="updateConnectorSettingStatus(${Number(setting.id)}, 'not_configured')">Mark Not Configured</button>
                <button class="task-action" onclick="updateConnectorSettingStatus(${Number(setting.id)}, 'manual_mode')">Manual Mode</button>
                <button class="task-action primary" onclick="updateConnectorSettingStatus(${Number(setting.id)}, 'test_mode')">Test Mode</button>
            </div>
        </article>
    `;
}

async function createPipelineCardPrompt() {
    const title = prompt('Pipeline card title');
    if (!title || !title.trim()) return;
    const nextAction = prompt('Next action', 'Follow up') || '';
    const pipeline = pipelineSection === 'overview' ? 'lead_pipeline' : pipelineSection;
    try {
        await api.createPipelineCard({
            workspace_key: currentWorkspaceKey(),
            pipeline_key: pipeline,
            stage_key: 'inbox',
            title: title.trim(),
            next_action: nextAction.trim(),
            owner_name: 'Shloimie',
            source: 'internal'
        });
        await loadData();
    } catch (error) {
        alert(error.message || 'Could not create pipeline card.');
    }
}

async function advancePipelineCard(id, stage) {
    if (!id) return;
    try {
        await api.updatePipelineCard(id, { stage_key: stage, status: stage === 'won' ? 'won' : 'active' });
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not update pipeline card.');
    }
}

async function createCalendarEventPrompt() {
    const title = prompt('Event title');
    if (!title || !title.trim()) return;
    const date = prompt('Start date/time (YYYY-MM-DD HH:mm)', new Date().toISOString().slice(0, 16).replace('T', ' '));
    if (!date || Number.isNaN(Date.parse(date.replace(' ', 'T')))) return alert('Use a valid date/time.');
    const meetingUrl = prompt('Zoom/class link (optional)', '') || '';
    try {
        await api.createCalendarEvent({
            workspace_key: currentWorkspaceKey() === 'platform' ? 'bna' : currentWorkspaceKey(),
            title: title.trim(),
            start_at: date.replace(' ', 'T'),
            meeting_url: meetingUrl.trim(),
            visibility: isProviderWorkspace() ? 'provider' : 'internal',
            source: 'internal'
        });
        await loadData();
    } catch (error) {
        alert(error.message || 'Could not create calendar event.');
    }
}

async function updateCalendarEventStatus(id, status) {
    if (!id) return;
    try {
        await api.updateCalendarEvent(id, { status });
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not update calendar event.');
    }
}

async function createInternalDialogueNotePrompt(threadId = null) {
    const body = prompt('Internal note / meeting summary / decision');
    if (!body || !body.trim()) return;
    const type = (prompt('Type: note, meeting_note, decision, question, support, upload, alert', 'note') || 'note').trim();
    try {
        await api.createInternalMessage({
            workspace_key: currentWorkspaceKey() === 'platform' ? 'rabbi_sheller_provider' : currentWorkspaceKey(),
            thread_id: threadId || undefined,
            thread_key: isProviderWorkspace() ? 'shloimie-rabbi-operations' : 'bna-operations',
            thread_title: isProviderWorkspace() ? 'Shloimie / Rabbi Sheller operations thread' : 'BNA school operations thread',
            body: body.trim(),
            message_type: type,
            metadata: { source: 'operations_prompt' }
        });
        await loadData();
    } catch (error) {
        alert(error.message || 'Could not save internal note.');
    }
}

async function createCommunicationNotePrompt() {
    const summary = prompt('Message summary');
    if (!summary || !summary.trim()) return;
    const body = prompt('Message body / note', '') || '';
    const channel = (prompt('Channel: internal_note, whatsapp, email, phone, meeting', 'internal_note') || 'internal_note').trim();
    try {
        await api.createContactCommunication({
            contact_type: 'general',
            channel,
            direction: channel === 'internal_note' ? 'internal_note' : 'outbound',
            summary: summary.trim(),
            body: body.trim(),
            source: 'operations'
        });
        await loadData();
    } catch (error) {
        alert(error.message || 'Could not save communication note.');
    }
}

async function loadContactImportFile(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    try {
        const text = await file.text();
        const target = document.getElementById('contactImportText');
        if (target) target.value = text;
        contactImportError = '';
    } catch (error) {
        contactImportError = error.message || 'Could not read import file.';
        render();
    }
}

async function previewContactImport(event) {
    event?.preventDefault?.();
    const textarea = document.getElementById('contactImportText');
    const content = textarea?.value || '';
    if (!content.trim()) {
        contactImportError = 'Paste or upload a CSV, vCard, or email export first.';
        render();
        return;
    }
    contactImportBusy = true;
    contactImportError = '';
    try {
        contactImportPreview = await api.previewContactImport({
            content,
            format: /BEGIN:VCARD/i.test(content) ? 'vcard' : 'csv',
            dry_run: true,
            workspace_key: currentWorkspaceKey(),
        });
    } catch (error) {
        contactImportError = error.message || 'Contact import preview failed.';
    } finally {
        contactImportBusy = false;
        render();
    }
}

function clearContactImportPreview(event) {
    event?.preventDefault?.();
    contactImportPreview = null;
    contactImportError = '';
    const textarea = document.getElementById('contactImportText');
    if (textarea) textarea.value = '';
    render();
}

async function syncWhapiLog(event, dryRun = false) {
    event?.preventDefault?.();
    const confirmed = dryRun || confirm('Import the latest 100 Whapi messages into Communications now? No WhatsApp messages will be sent.');
    if (!confirmed) return;
    const button = event?.currentTarget;
    const originalText = button?.textContent || '';
    try {
        if (button) {
            button.disabled = true;
            button.textContent = dryRun ? 'Previewing...' : 'Syncing...';
        }
        const result = await api.syncWapiLog({
            count: 100,
            sort: 'desc',
            dry_run: dryRun
        });
        if (dryRun) {
            alert(`Whapi preview found ${result.fetched || 0} messages. ${result.preview?.length || 0} preview rows were parsed.`);
        } else {
            alert(`Whapi sync complete. Fetched ${result.fetched || 0}, imported ${result.imported || 0}, duplicates ${result.duplicates || 0}, failed ${result.failed || 0}.`);
            await loadData();
        }
    } catch (err) {
        alert('Whapi sync failed: ' + err.message);
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

async function loadWapiPhonebookReport(event) {
    event?.preventDefault?.();
    const button = event?.currentTarget;
    const originalText = button?.textContent || '';
    try {
        if (button) {
            button.disabled = true;
            button.textContent = 'Building...';
        }
        wapiPhonebookReport = await api.getWapiPhonebookReport(100, { workspace: currentWorkspaceKey() });
        render();
    } catch (err) {
        alert('Whapi phonebook report failed: ' + err.message);
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

function selectWapiPhonebookGroup(key) {
    selectedWapiPhonebookKey = key || null;
    wapiMobilePane = 'conversation';
    render();
}

function jumpToWapiWorkspacePane(id) {
    wapiMobilePane = wapiPaneKeyFromId(id);
    render();
    requestAnimationFrame(() => {
        const node = document.getElementById(id);
        if (!node) return;
        node.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    });
}

function openWhatsAppSendReadiness(event) {
    event?.preventDefault?.();
    openBnaHelperWithPrompt([
        'WhatsApp send setup for the selected One Time conversation:',
        '1. Confirm the WAPI/Whapi sender account and token are configured.',
        '2. Confirm the selected recipient identity and workspace scope.',
        '3. Use the server confirmation phrase SEND_WHATSAPP only after explicit operator approval.',
        'Do not send any WhatsApp message from this run.'
    ].join('\\n'));
}

async function addWapiPhonebookNote(event) {
    event?.preventDefault?.();
    const group = selectedWapiPhonebookGroup();
    if (!group) {
        alert('Select a phonebook record first.');
        return;
    }
    const summary = prompt('Internal note summary', `Note for ${group.display_name || 'WhatsApp contact'}`);
    if (!summary || !summary.trim()) return;
    const body = prompt('Note details', group.last_preview || '') || '';
    const followUpRequired = confirm('Mark this note as needing follow-up? No WhatsApp message will be sent.');
    const leadRecord = (group.linked_records || []).find(record => record.type === 'lead');
    const signupRecord = (group.linked_records || []).find(record => record.type === 'signup');
    const studentRecord = (group.linked_records || []).find(record => record.type === 'student');
    const payload = {
        contact_type: leadRecord ? 'lead' : signupRecord ? 'signup' : studentRecord ? 'student' : 'general',
        lead_id: leadRecord?.id || undefined,
        signup_id: signupRecord?.id || undefined,
        student_id: studentRecord?.id || undefined,
        channel: 'internal_note',
        direction: 'internal_note',
        summary: summary.trim(),
        body: body.trim(),
        follow_up_required: followUpRequired,
        source: 'dashboard',
        source_context: {
            wapi_phonebook_workspace: true,
            phonebook_key: group.key || null,
            phone_digits: group.phone_digits || null,
            chat_id: group.chat_id || null,
            display_name: group.display_name || null,
            no_send: true,
            external_write_performed: false
        },
        metadata: {
            source: 'wapi_phonebook_workspace',
            no_send: true,
            external_write_performed: false
        }
    };
    try {
        await api.createContactCommunication(payload);
        await loadData({ background: true });
        selectedWapiPhonebookKey = group.key || selectedWapiPhonebookKey;
        alert('Internal note saved. No WhatsApp message was sent.');
    } catch (err) {
        alert('Could not save phonebook note: ' + err.message);
    }
}

async function applyWapiPhonebookCorrection(event) {
    event?.preventDefault?.();
    const button = event?.currentTarget;
    const key = button?.dataset?.phonebookKey || '';
    const correctionType = button?.dataset?.correctionType || '';
    const groups = [
        ...(wapiPhonebookReport?.manual_correction_candidates || []),
        ...(wapiPhonebookReport?.phonebook || [])
    ];
    const group = groups.find(item => item.key === key);
    if (!group || !key || !correctionType) {
        alert('Correction target is missing. Rebuild the phonebook report and try again.');
        return;
    }
    const notes = prompt('Local correction note (optional)', group.reason || '') || '';
    const originalText = button?.textContent || '';
    const payload = {
        phonebook_key: key,
        correction_type: correctionType,
        display_name: group.display_name || '',
        phone_digits: group.phone_digits || '',
        chat_id: group.chat_id || '',
        previous_recommended_type: group.recommended_type || '',
        confidence_label: group.confidence_label || '',
        notes,
        group,
        apply_contact_tags: true
    };
    try {
        if (button) {
            button.disabled = true;
            button.textContent = 'Previewing...';
        }
        const previewResult = await api.applyWapiPhonebookCorrection({
            ...payload,
            dry_run: true
        });
        const crmPreview = previewResult?.crm_write_preview || previewResult?.correction_preview?.crm_write_preview || {};
        const writeLines = (crmPreview.writes || []).map(write => {
            const ids = write.lead_id ? ` #${write.lead_id}` : (write.contact_ids || []).length ? ` #${write.contact_ids.join(', #')}` : '';
            return `- ${String(write.action || 'update').replace(/_/g, ' ')} ${write.target || 'local CRM'}${ids}: ${(write.tags || []).slice(0, 5).join(', ')}`;
        });
        const skippedLines = (crmPreview.skipped_writes || []).slice(0, 4).map(item => `- Skip ${item.target || 'row'}${item.id ? ` #${item.id}` : ''}: ${item.reason || 'guarded'}`);
        const previewText = [
            `Preview local WAPI correction as "${correctionType.replace(/_/g, ' ')}".`,
            '',
            writeLines.length ? 'Local contact/tag writes:' : 'Local contact/tag writes: none; only the correction overlay will be stored.',
            ...writeLines,
            skippedLines.length ? '' : null,
            skippedLines.length ? 'Guarded rows:' : null,
            ...skippedLines,
            '',
            'No WhatsApp message, broadcast, or external CRM write will run.',
            '',
            'Apply this local correction now?'
        ].filter(line => line !== null).join('\n');
        if (!confirm(previewText)) return;
        if (button) button.textContent = 'Applying...';
        const result = await api.applyWapiPhonebookCorrection({
            ...payload,
            confirm: 'APPLY_WAPI_CORRECTION'
        });
        if (!result?.success) throw new Error(result?.error || 'Correction was not applied');
        wapiPhonebookReport = await api.getWapiPhonebookReport(100, { workspace: currentWorkspaceKey() });
        render();
        const appliedCount = result?.crm_write_result?.applied_writes?.length || 0;
        alert(`Local WAPI correction applied${appliedCount ? ` with ${appliedCount} contact/tag write(s)` : ''}. No WhatsApp message was sent.`);
    } catch (err) {
        alert('Whapi correction failed: ' + err.message);
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

function loadParentAnnouncementCandidate(event) {
    event?.preventDefault?.();
    const index = Number(event?.currentTarget?.dataset?.parentAnnouncementCandidateIndex ?? -1);
    const item = parentAnnouncements[index];
    if (!item) {
        setParentAnnouncementStatus('Candidate update is not loaded. Refresh Operations and try again.', 'error');
        return;
    }
    const setValue = (id, value) => {
        const field = document.getElementById(id);
        if (field) field.value = value || '';
    };
    setValue('parentAnnouncementTitle', item.title || 'This week at BNA');
    setValue('parentAnnouncementBody', item.body || item.summary || '');
    setValue('parentAnnouncementImageUrl', item.image_url || '');
    setValue('parentAnnouncementVideoUrl', item.video_url || '');
    setParentAnnouncementStatus('Draft loaded into the approval form. Preview first, then type the approval phrase to select it.', 'success');
}

function setParentAnnouncementStatus(message, status = '') {
    const el = document.getElementById('parentAnnouncementStatus');
    if (!el) return;
    el.textContent = message || '';
    if (status) el.dataset.status = status;
    else delete el.dataset.status;
}

function readParentAnnouncementForm(event) {
    const target = event?.currentTarget || event?.target || null;
    const form = target?.matches?.('[data-parent-announcement-form]')
        ? target
        : target?.closest?.('[data-parent-announcement-form]') || document.querySelector('[data-parent-announcement-form]');
    const fieldValue = (id) => String(form?.querySelector(`#${id}`)?.value || '').trim();
    const title = fieldValue('parentAnnouncementTitle');
    const body = fieldValue('parentAnnouncementBody');
    const imageUrl = normalizeAnnouncementMediaUrl(fieldValue('parentAnnouncementImageUrl'), 'Image URL');
    const videoUrl = normalizeAnnouncementMediaUrl(fieldValue('parentAnnouncementVideoUrl'), 'Video URL');
    return {
        form,
        title,
        body,
        imageUrl,
        videoUrl,
        confirm: fieldValue('parentAnnouncementConfirm')
    };
}

function normalizeAnnouncementMediaUrl(value, label) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    let parsed;
    try {
        parsed = new URL(trimmed);
    } catch (error) {
        throw new Error(`${label} must be a valid URL.`);
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error(`${label} must start with http:// or https://.`);
    }
    return trimmed;
}

async function previewParentAnnouncementForm(event) {
    return submitParentAnnouncementForm(event, { dryRun: true });
}

async function approveParentAnnouncementForm(event) {
    return submitParentAnnouncementForm(event, { dryRun: false });
}

async function previewParentAnnouncementRecipients(event) {
    event?.preventDefault?.();
    const button = event?.currentTarget;
    const originalText = button?.textContent || '';
    try {
        if (button) {
            button.disabled = true;
            button.textContent = 'Previewing...';
        }
        const workspace = currentWorkspaceKey() === 'platform' ? 'bna' : currentWorkspaceKey();
        const result = await api.getParentAnnouncementRecipients({ workspace });
        if (!result?.success) throw new Error(result?.error || 'Recipient preview failed');
        parentAnnouncementRecipients = result;
        parentAnnouncementNotice = `Recipient preview ready: ${Number(result?.summary?.eligible_recipients || 0)} eligible current-parent email(s). No message was sent.`;
        render();
    } catch (err) {
        setParentAnnouncementStatus('Recipient preview failed: ' + err.message, 'error');
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

async function submitParentAnnouncementForm(event, options = {}) {
    event?.preventDefault?.();
    const dryRun = options.dryRun === true;
    let formData;
    try {
        formData = readParentAnnouncementForm(event);
    } catch (err) {
        setParentAnnouncementStatus(err.message, 'error');
        return;
    }
    const { title, body, imageUrl, videoUrl, confirm } = formData;
    if (!title) {
        setParentAnnouncementStatus('Parent announcement title is required.', 'error');
        return;
    }
    if (!body) {
        setParentAnnouncementStatus('Parent-visible body is required.', 'error');
        return;
    }
    if (!dryRun && confirm !== 'APPROVE_PARENT_ANNOUNCEMENT') {
        setParentAnnouncementStatus('Type APPROVE_PARENT_ANNOUNCEMENT before selecting this update for parents.', 'error');
        return;
    }
    const button = dryRun ? event?.currentTarget : event?.submitter || formData.form?.querySelector('button[type="submit"]');
    const originalText = button?.textContent || '';
    try {
        if (button) {
            button.disabled = true;
            button.textContent = dryRun ? 'Previewing...' : 'Saving...';
        }
        const result = await api.approveParentAnnouncement({
            workspace: currentWorkspaceKey(),
            title,
            body,
            summary: limitTextClient(body, 500),
            image_url: imageUrl || undefined,
            video_url: videoUrl || undefined,
            dry_run: dryRun,
            confirm: dryRun ? undefined : confirm
        });
        if (!result?.success) throw new Error(result?.error || 'Parent announcement was not saved');
        if (dryRun) {
            setParentAnnouncementStatus('Preview ready. No record was saved, and no email, WhatsApp, or social post will be sent.', 'success');
            return;
        }
        parentAnnouncementNotice = 'Parent announcement approved locally. No email, WhatsApp, or social post was sent.';
        await loadData({ background: true });
    } catch (err) {
        setParentAnnouncementStatus('Parent announcement failed: ' + err.message, 'error');
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

async function createServiceProviderPrompt() {
    const providerName = prompt('Provider name');
    if (!providerName || !providerName.trim()) return;
    const contactName = prompt('Contact name', '') || '';
    const contactEmail = prompt('Contact email', '') || '';
    const publicNotes = prompt('Public description (optional)', '') || '';
    try {
        await api.createServiceProvider({
            provider_name: providerName.trim(),
            contact_name: contactName.trim(),
            contact_email: contactEmail.trim(),
            public_notes: publicNotes.trim(),
            status: 'pending_review',
            provider_status: 'draft',
            commercial_model: 'free_listing',
            entitlement_plan: 'free_listing',
            source_of_truth: 'unknown_pending_access',
            integration_status: 'no_access',
            public_listing_enabled: true,
            public_signup_enabled: false,
            claim_listing_enabled: true,
            metadata: {
                created_from: 'operations_prompt',
                workspace_key: currentWorkspaceKey()
            }
        });
        await loadData();
    } catch (error) {
        alert(error.message || 'Could not create service provider.');
    }
}

async function updateProviderPlan(providerId, commercialModel, entitlementPlan, providerStatus) {
    if (!providerId) return;
    try {
        await api.updateServiceProvider(providerId, {
            commercial_model: commercialModel,
            entitlement_plan: entitlementPlan,
            provider_status: providerStatus,
            public_listing_enabled: providerStatus !== 'hidden',
            public_signup_enabled: commercialModel !== 'free_listing',
            claim_listing_enabled: commercialModel === 'free_listing',
            integration_status: commercialModel === 'revenue_share' ? 'access_requested' : undefined,
            source_of_truth: commercialModel === 'revenue_share' ? 'hybrid' : undefined
        });
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not update provider plan.');
    }
}

async function sendProviderSetupEmail(providerId) {
    if (!providerId) return;
    try {
        const result = await api.sendProviderSetupEmail(providerId);
        alert(result.email_sent
            ? `Provider setup email sent to ${result.contact_email || 'the provider contact'}. Username: ${result.login_username || 'assigned'}`
            : `Setup link was created, but email did not send: ${result.email_error || 'unknown error'}`);
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not send provider setup email.');
    }
}

async function approveProviderIndexProvider(providerId) {
    if (!providerId) return;
    try {
        await api.approveProvider(providerId);
        providerIndexNotice = 'Provider approved and eligible for the public index.';
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not approve provider.');
    }
}

async function hideProviderIndexProvider(providerId) {
    if (!providerId) return;
    try {
        await api.hideProvider(providerId);
        providerIndexNotice = 'Provider hidden from the public index.';
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not hide provider.');
    }
}

async function featureProviderIndexProvider(providerId, isFeatured) {
    if (!providerId) return;
    try {
        await api.featureProvider(providerId, Boolean(isFeatured));
        providerIndexNotice = Boolean(isFeatured) ? 'Provider featured.' : 'Provider unfeatured.';
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not update featured provider state.');
    }
}

async function updateProviderLeadStatus(leadId, status) {
    if (!leadId || !status) return;
    try {
        await api.updateProviderLead(leadId, { status });
        providerIndexNotice = `Provider lead marked ${status}.`;
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not update provider lead.');
    }
}

async function createProviderIndexCategory(event) {
    event?.preventDefault?.();
    const input = document.getElementById('providerCategoryName');
    const name = String(input?.value || '').trim();
    if (!name) return;
    try {
        await api.createProviderCategory({ name });
        providerIndexNotice = 'Provider category saved.';
        if (input) input.value = '';
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not create provider category.');
    }
}

async function updateConnectorSettingStatus(id, status) {
    if (!id) return;
    try {
        await api.updateConnectorSetting(id, { status });
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not update connector setting.');
    }
}

async function prepareSocialPlatformConnector(event, id, platformKey) {
    if (event) event.preventDefault();
    const key = String(platformKey || '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
    if (!id || !key) return;
    const setting = connectorSettings.find(item => Number(item.id) === Number(id)) || {};
    const timestamp = new Date().toISOString();
    const config = {};
    config[`${key}_setup_status`] = 'ready_for_shloimie';
    config[`${key}_setup_requested_at`] = timestamp;
    try {
        await api.updateConnectorSetting(id, {
            status: setting.status === 'configured' ? 'configured' : 'manual_mode',
            config,
            metadata: {
                last_platform_setup_requested: key,
                last_platform_setup_requested_at: timestamp,
                setup_guard: 'no social draft, post, upload, or publish happens from this button'
            }
        });
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not prepare social platform setting.');
    }
}

async function checkOneTimeAppAccessReadiness(event) {
    event?.preventDefault();
    try {
        const result = await api.getOneTimeAppAccessReadiness();
        const readiness = result?.readiness || currentOneTimeAppAccessReadiness();
        const blockers = Array.isArray(readiness.current_blockers) ? readiness.current_blockers : [];
        const guards = Array.isArray(readiness.no_write_guard) ? readiness.no_write_guard : [];
        alert([
            `One Time app readiness: ${readiness.status || 'blocked_pending_review'}`,
            `Live app writes: ${readiness.ready_for_live_app_write ? 'ready' : 'blocked'}`,
            `Member-library publish: ${readiness.ready_for_member_library_publish ? 'ready' : 'blocked'}`,
            blockers.length ? `Blockers:\n- ${blockers.join('\n- ')}` : 'Blockers: none reported',
            guards.length ? `No-write guard: ${guards.join(', ')}` : 'No-write guard active'
        ].join('\n\n'));
    } catch (error) {
        alert(error.message || 'Could not check One Time app access readiness.');
    }
}

async function saveVisibleSettings() {
    try {
        await api.updateWorkspaceSettings(currentWorkspaceKey(), {
            settings: {
                last_ui_save_requested_at: new Date().toISOString(),
                last_ui_save_section: settingsSection
            }
        });
        await loadData({ background: true });
        alert('Workspace settings save marker recorded.');
    } catch (error) {
        alert(error.message || 'Could not save workspace settings.');
    }
}

function renderNotConfiguredPanel(title, description) {
    const heading = title || 'Configuration required';
    const copy = description || 'This area is visible for orientation, but editing is not enabled for this account yet.';
    return `
        <section class="focus-panel not-configured-panel">
            <div class="not-configured-icon">Off</div>
            <div>
                <h3>${escapeHtml(heading)}</h3>
                <p>${escapeHtml(copy)}</p>
                <div class="settings-control-grid" style="margin-top:12px;">
                    ${renderSettingsControlRow('Availability', 'Not enabled', 'This control is locked for the current account view.', 'Disabled')}
                    ${renderSettingsControlRow('Changes', 'Locked', 'No changes are saved from this screen.', 'Disabled')}
                </div>
                <div class="task-actions">
                    <button class="task-action" disabled title="Not available for this account yet">Not available yet</button>
                </div>
            </div>
        </section>
    `;
}

function showNotConfigured(label = 'This feature') {
    const existing = document.getElementById('notConfiguredModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'notConfiguredModal';
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>Not available yet</h2>
                <button class="modal-close" type="button" aria-label="Close" onclick="document.getElementById('notConfiguredModal')?.remove()">Close</button>
            </div>
            <div class="modal-body">
                <p>${escapeHtml(label)} is visible for orientation, but it is not enabled for this account yet.</p>
                <p class="event-meta">No changes are saved from this screen.</p>
            </div>
            <div class="modal-footer">
                <button class="btn" type="button" onclick="document.getElementById('notConfiguredModal')?.remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function renderAccounting() {
    const activeSignups = signups.filter(s => !['archived', 'inactive'].includes(String(s.status || '').toLowerCase()));
    const openIntake = paymentIntake.filter(isUnresolvedPaymentIntake);
    const rosterRows = buildPaymentRoster(activeSignups, openIntake);
    const sectionRows = rosterRows.filter(row => paymentRosterMatchesSection(row, accountingSection));
    const visibleRows = sectionRows.filter(accountingMatchesFilters);
    const sectionMeta = accountingSectionMeta(accountingSection);
    const sectionCounts = ACCOUNTING_SUBTABS.reduce((counts, tab) => {
        counts[tab.id] = rosterRows.filter(row => paymentRosterMatchesSection(row, tab.id)).length;
        return counts;
    }, {});

    return `
        <div class="container">
            <div class="page-heading accounting-header">
                <div>
                    <div class="page-kicker">Accounting</div>
                    <h2>${escapeHtml(sectionMeta.title)}</h2>
                    <p>${escapeHtml(sectionMeta.description)}</p>
                </div>
            </div>
            ${renderSectionNav(tabsWithCounts(ACCOUNTING_SUBTABS, sectionCounts), accountingSection, 'setAccountingSection')}
            ${renderAccountingFilterPanel(sectionRows, visibleRows)}
            ${accountingSection === 'overview'
                ? renderAccountingOverview(visibleRows)
                : renderPaymentRosterTable(visibleRows, rosterRows.length === 0 ? 'No payment records yet.' : 'No payment records match this view.')}
        </div>
    `;
}

function renderPaymentReminderBlock() {
    const reminders = paymentReminderPreview?.reminders || [];
    return `
        <div style="margin-bottom: 28px; padding: 18px; border: 1px solid #334155; border-radius: 14px; background: #111827;">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; flex-wrap:wrap;">
                <div>
                    <h2 style="font-size:18px; margin-bottom:6px;">Payment Reminders</h2>
                    <p style="color:#94a3b8; font-size:13px; max-width:760px;">
                        Preview parents whose next payment is due within 5 days. Dry run does not send email; live send requires confirmation.
                    </p>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="previewPaymentReminders(event)">Preview due</button>
                    <button class="btn btn-secondary btn-sm" onclick="dryRunPaymentReminders(event)">Dry run</button>
                    <button class="btn btn-primary btn-sm" onclick="sendPaymentReminders(event)">Send reminders</button>
                </div>
            </div>
            ${paymentReminderPreview ? `
                <div style="margin-top:14px; color:#cbd5e1; font-size:13px;">
                    Found ${paymentReminderPreview.found || reminders.length} reminder${(paymentReminderPreview.found || reminders.length) === 1 ? '' : 's'}
                    due by ${formatDate(paymentReminderPreview.reminderTarget)}.
                </div>
                ${reminders.length ? `
                    <div class="data-table" style="margin-top:12px;">
                        <div class="table-header">
                            <div>Parent / Student</div>
                            <div>Email</div>
                            <div>Amount</div>
                            <div>Due</div>
                            <div>Language</div>
                        </div>
                        ${reminders.slice(0, 8).map((r) => `
                            <div class="table-row">
                                <div>
                                    <div class="parent-name">${escapeHtml(r.parent_name || 'Unknown parent')}</div>
                                    <div class="student-name">${escapeHtml(r.student_name || '')}</div>
                                </div>
                                <div>${escapeHtml(r.parent_email || '')}</div>
                                <div>ILS ${r.payment_amount || 1000}</div>
                                <div>${formatDate(r.payment_due_date)}</div>
                                <div>${escapeHtml(r.language || 'en')}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="payment-muted" style="margin-top:10px;">No reminders are due right now.</div>'}
            ` : ''}
        </div>
    `;
}

function renderPaymentIntakeBlock(openIntake) {
    return `
        <div style="display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 20px;">
            <h2 style="font-size: 18px;">Pre-Signup / Unmatched Payments (${openIntake.length})</h2>
            <span class="ramble-hint">Capture these by telling the Telegram bot who paid, how much, and how.</span>
        </div>

        <div class="data-table" style="margin-bottom: 32px;">
            <div class="table-header">
                <div>Parent / Student</div>
                <div>Contact</div>
                <div>Amount</div>
                <div>Method</div>
                <div>Status</div>
            </div>
            ${openIntake.length === 0 ? `
                <div class="empty-state">
                    <p>No unmatched payments. Good. That means money is not floating around homeless.</p>
                </div>
            ` : openIntake.map(p => `
                <div class="table-row">
                    <div>
                        <div class="parent-name">${escapeHtml(p.parent_name || 'Unknown parent')}</div>
                        <div class="student-name">${escapeHtml(p.student_name || 'Student not entered yet')}</div>
                    </div>
                    <div>
                        <div>${escapeHtml(p.parent_email || '')}</div>
                        <div class="student-name">${escapeHtml(p.parent_phone || '')}</div>
                    </div>
                    <div>${p.amount ? `ILS ${p.amount}` : 'Amount unknown'}</div>
                    <div>
                        <div>${escapeHtml(p.method || 'unknown')}</div>
                        <div class="student-name">${p.received_at ? `Paid ${formatDate(p.received_at)}` : 'Payment date unknown'}</div>
                    </div>
                    <div><span class="payment-status pending">${escapeHtml(p.status)}</span></div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderGreenInvoiceAuditBlock() {
    const events = Array.isArray(greenInvoiceWebhooks) ? greenInvoiceWebhooks.slice(0, 8) : [];
    return `
        <div style="margin-bottom: 28px; padding: 18px; border: 1px solid #334155; border-radius: 14px; background: #111827;">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; flex-wrap:wrap;">
                <div>
                    <h2 style="font-size:18px; margin-bottom:6px;">Green Invoice Webhook Audit</h2>
                    <p style="color:#94a3b8; font-size:13px; max-width:760px;">
                        Every incoming Green Invoice webhook is now logged with its event type, customer/payment IDs, local match result, and processing outcome. Use reprocess if a valid payload arrived before the parser fix.
                    </p>
                </div>
            </div>
            ${events.length ? `
                <div class="data-table" style="margin-top:12px;">
                    <div class="table-header">
                        <div>Received</div>
                        <div>Event</div>
                        <div>Payer / Amount</div>
                        <div>Match</div>
                        <div>Status</div>
                    </div>
                    ${events.map((event) => `
                        <div class="table-row">
                            <div>${formatDate(event.webhook_received_at || event.created_at)}</div>
                            <div>
                                <div class="parent-name">${escapeHtml(event.event_type || 'unknown')}</div>
                                <div class="student-name">Txn: ${escapeHtml(event.transaction_id || event.document_id || 'n/a')}</div>
                            </div>
                            <div>
                                <div>${escapeHtml(event.payer_name || event.payer_email || 'Unknown')}</div>
                                <div class="student-name">ILS ${event.amount || '0'}</div>
                            </div>
                            <div>
                                <div>${event.signup?.parent_name ? escapeHtml(event.signup.parent_name) : 'No signup match'}</div>
                                <div class="student-name">${event.student?.name ? escapeHtml(event.student.name) : (event.payment_intake_id ? `Intake #${event.payment_intake_id}` : '')}</div>
                            </div>
                            <div>
                                <span class="payment-status ${escapeHtml(String(event.status || 'pending'))}">${escapeHtml(event.status || 'received')}</span>
                                <div class="task-actions" style="margin-top:8px;">
                                    <button class="task-action" onclick="reprocessGreenInvoiceWebhook(event, ${Number(event.id)})">Reprocess</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="empty-state" style="margin-top:12px;">No Green Invoice webhook deliveries have been logged yet.</p>'}
        </div>
    `;
}

function selectedIntakeRunDetail() {
    const run = intakeSelectedRun?.parse_run || intakeParseRuns.find(item => Number(item.id) === Number(intakeSelectedRunId)) || null;
    return {
        rawIntake: intakeSelectedRun?.raw_intake || null,
        run,
        items: intakeSelectedRun?.items || [],
        reviews: intakeSelectedRun?.review_items || []
    };
}

function selectedIntakeRawStableId(run = null, rawIntake = null) {
    return rawIntake?.stable_id || run?.metadata?.raw_intake_stable_id || run?.parse_json?.ramble_protocol?.raw_id || '';
}

function renderIntakeReview() {
    const counts = intakeSubnavCounts();
    const detail = selectedIntakeRunDetail();
    const selected = detail.run;
    return `
        <div class="container">
            ${intakeNotice ? `<div class="success-banner">${escapeHtml(intakeNotice)}</div>` : ''}
            <section class="dashboard-header">
                <div>
                    <span class="eyebrow">Canonical parser</span>
                    <h1>Intake Review</h1>
                    <p>Natural-language rambles, recordings, and mixed notes land here before low-confidence or custom sections affect the durable workspace.</p>
                </div>
                <div class="metric-grid compact">
                    <div class="metric-card"><span>Runs</span><strong>${counts.runs || 0}</strong></div>
                    <div class="metric-card"><span>Source Links</span><strong>${counts.source || 0}</strong></div>
                    <div class="metric-card"><span>Audit Flags</span><strong>${counts.audit || 0}</strong></div>
                    <div class="metric-card"><span>Open Review</span><strong>${counts.review || 0}</strong></div>
                    <div class="metric-card"><span>Proposed Sections</span><strong>${counts.sections || 0}</strong></div>
                </div>
            </section>
            ${intakeSection === 'review' ? renderIntakeReviewQueue() : intakeSection === 'sections' ? renderIntakeSections() : intakeSection === 'source' ? renderIntakeSource(detail) : intakeSection === 'audit' ? renderIntakeAudit(detail) : renderIntakeRuns(selected)}
        </div>
    `;
}

function renderIntakeRuns(selected) {
    return `
        <div class="dashboard-grid two-column">
            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>Parse Runs</h2>
                        <p>Newest canonical parser runs from Telegram, recordings, and manual input.</p>
                    </div>
                </div>
                <div class="stacked-list">
                    ${intakeParseRuns.length ? intakeParseRuns.map(run => `
                        <button type="button" class="list-row ${Number(run.id) === Number(intakeSelectedRunId) ? 'active' : ''}" onclick="selectIntakeRun(${Number(run.id)})">
                            <span>
                                <strong>#${Number(run.id)} ${escapeHtml(run.summary || 'Intake parse')}</strong>
                                <small>${escapeHtml(run.source_type || 'manual')} / ${escapeHtml(formatDateTime(run.created_at))}</small>
                            </span>
                            <span class="status-pill ${escapeHtml(run.status || 'parsed')}">${escapeHtml(run.status || 'parsed')}</span>
                        </button>
                    `).join('') : `<div class="empty-state">No intake parse runs yet.</div>`}
                </div>
            </section>
            <section class="panel">
                ${selected ? renderIntakeRunDetail(selected) : `<div class="empty-state">Select a run to inspect parsed items.</div>`}
            </section>
        </div>
    `;
}

function renderIntakeRunDetail(run) {
    const items = intakeSelectedRun?.items || [];
    const reviews = intakeSelectedRun?.review_items || [];
    return `
        <div class="panel-header">
            <div>
                <h2>Run #${Number(run.id)}</h2>
                <p>${escapeHtml(run.summary || 'Canonical intake parse')}</p>
            </div>
            <button class="secondary-button" onclick="applyIntakeRun(${Number(run.id)})">Apply Safe Items</button>
        </div>
        <div class="detail-grid">
            <div><span>Source</span><strong>${escapeHtml(run.source_type || 'manual')}</strong></div>
            <div><span>Status</span><strong>${escapeHtml(run.status || 'parsed')}</strong></div>
            <div><span>Items</span><strong>${items.length}</strong></div>
            <div><span>Review</span><strong>${reviews.length}</strong></div>
        </div>
        <h3>Parsed Items</h3>
        <div class="table-scroll">
            <table class="data-table">
                <thead><tr><th>Type</th><th>Title</th><th>Confidence</th><th>Status</th></tr></thead>
                <tbody>
                    ${items.length ? items.map(item => `
                        <tr>
                            <td>${escapeHtml(formatEventType(item.item_type))}</td>
                            <td><strong>${escapeHtml(item.title || item.summary || 'Untitled')}</strong><br><small>${escapeHtml(item.source_excerpt || '')}</small></td>
                            <td>${Math.round(Number(item.confidence || 0) * 100)}%</td>
                            <td><span class="status-pill ${escapeHtml(item.status || 'parsed')}">${escapeHtml(item.status || 'parsed')}</span></td>
                        </tr>
                    `).join('') : `<tr><td colspan="4">No items.</td></tr>`}
                </tbody>
            </table>
        </div>
        ${reviews.length ? `<h3>Review Items</h3><div class="stacked-list">${reviews.map(renderIntakeReviewRow).join('')}</div>` : ''}
    `;
}

function renderIntakeSource(detail = selectedIntakeRunDetail()) {
    const { rawIntake, run, items } = detail;
    if (!run) return `<section class="panel"><div class="empty-state">Select a parse run to inspect source lineage.</div></section>`;
    const protocol = run.parse_json?.ramble_protocol || {};
    const envelope = run.parse_json?.source_envelope || {};
    const rawId = selectedIntakeRawStableId(run, rawIntake);
    const excerptRows = items.filter(item => item.source_excerpt || item.payload?.source_excerpt || item.payload?.raw_excerpt);
    const rawText = rawIntake?.raw_text || run.raw_input || '';
    const transcriptText = rawIntake?.transcript_text || '';
    return `
        <div class="dashboard-grid two-column">
            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>Source Lineage</h2>
                        <p>${escapeHtml(run.summary || 'Canonical intake source readback')}</p>
                    </div>
                    <span class="status-pill ${escapeHtml(rawIntake?.parse_status || run.status || 'parsed')}">${escapeHtml(rawIntake?.parse_status || run.status || 'parsed')}</span>
                </div>
                <div class="detail-grid">
                    <div><span>Raw ID</span><strong>${escapeHtml(rawId || 'Not linked')}</strong></div>
                    <div><span>Source</span><strong>${escapeHtml(rawIntake?.source_channel || run.source_type || 'manual')}</strong></div>
                    <div><span>Message</span><strong>${escapeHtml(rawIntake?.source_message_id || run.source_id || 'n/a')}</strong></div>
                    <div><span>Created</span><strong>${escapeHtml(formatDateTime(rawIntake?.created_at || run.created_at) || 'n/a')}</strong></div>
                    <div><span>Register</span><strong>${escapeHtml(rawIntake?.requirement_register_path || protocol.requirement_register_path || 'None')}</strong></div>
                    <div><span>Workspace</span><strong>${escapeHtml(run.metadata?.workspace_key || envelope.default_workspace || 'platform')}</strong></div>
                </div>
                <h3>Raw Capture</h3>
                <p>${escapeHtml(limitTextClient(rawText, 900) || 'No raw text is attached to this parse run.')}</p>
                ${transcriptText ? `<h3>Transcript</h3><p>${escapeHtml(limitTextClient(transcriptText, 700))}</p>` : ''}
            </section>
            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>Source Excerpts</h2>
                        <p>${Number(excerptRows.length)} parsed item${excerptRows.length === 1 ? '' : 's'} preserve source text.</p>
                    </div>
                </div>
                <div class="table-scroll">
                    <table class="data-table">
                        <thead><tr><th>Item</th><th>Excerpt</th><th>Target</th></tr></thead>
                        <tbody>
                            ${excerptRows.length ? excerptRows.map(item => `
                                <tr>
                                    <td><strong>${escapeHtml(item.item_key || `#${item.id}`)}</strong><br><small>${escapeHtml(formatEventType(item.item_type))}</small></td>
                                    <td>${escapeHtml(limitTextClient(item.source_excerpt || item.payload?.source_excerpt || item.payload?.raw_excerpt || '', 260))}</td>
                                    <td>${escapeHtml(item.target_table || item.payload?.target_table || item.status || 'parsed')}</td>
                                </tr>
                            `).join('') : `<tr><td colspan="3">No source excerpts are attached to this run.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    `;
}

function renderIntakeAudit(detail = selectedIntakeRunDetail()) {
    const { rawIntake, run, items, reviews } = detail;
    if (!run) return `<section class="panel"><div class="empty-state">Select a parse run to inspect audit status.</div></section>`;
    const itemStatusCounts = countByValue(items, item => item.status || 'parsed');
    const itemTypeCounts = countByValue(items, item => item.item_type || 'unknown');
    const openReviews = reviews.filter(item => ['open', 'reviewing'].includes(String(item.status || 'open'))).length;
    const externalWriteRecorded = run.metadata?.external_write_performed === true || rawIntake?.metadata?.external_write_performed === true;
    const auditRows = [
        ['Raw stable ID', selectedIntakeRawStableId(run, rawIntake) || 'Not linked'],
        ['Raw status', rawIntake?.parse_status || 'Not linked'],
        ['Parser status', run.status || 'parsed'],
        ['Dry run', run.dry_run ? 'Yes' : 'No'],
        ['External writes', externalWriteRecorded ? 'Check metadata' : 'None recorded'],
        ['Parser version', run.parser_version || 'unknown'],
        ['Created by', run.created_by || 'system'],
        ['Created', formatDateTime(run.created_at) || 'n/a'],
        ['Filed', formatDateTime(run.filed_at) || 'Not filed']
    ];
    return `
        <div class="dashboard-grid two-column">
            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>Run Audit</h2>
                        <p>${escapeHtml(run.summary || 'Parser audit readback')}</p>
                    </div>
                    <span class="status-pill ${escapeHtml(run.status || 'parsed')}">${escapeHtml(run.status || 'parsed')}</span>
                </div>
                <div class="detail-grid">
                    <div><span>Parsed Items</span><strong>${Number(items.length)}</strong></div>
                    <div><span>Open Review</span><strong>${Number(openReviews)}</strong></div>
                    <div><span>Filed</span><strong>${Number(itemStatusCounts.filed || 0)}</strong></div>
                    <div><span>Needs Review</span><strong>${Number(itemStatusCounts.needs_review || 0)}</strong></div>
                    <div><span>External Write</span><strong>${externalWriteRecorded ? 'Check' : 'None'}</strong></div>
                    <div><span>Raw Linked</span><strong>${rawIntake ? 'Yes' : 'No'}</strong></div>
                </div>
                <div class="table-scroll">
                    <table class="data-table">
                        <thead><tr><th>Check</th><th>Value</th></tr></thead>
                        <tbody>
                            ${auditRows.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </section>
            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>Item Distribution</h2>
                        <p>Counts by canonical type and current filing status.</p>
                    </div>
                </div>
                <div class="detail-grid">
                    ${Object.entries(itemTypeCounts).length ? Object.entries(itemTypeCounts).map(([type, count]) => `<div><span>${escapeHtml(formatEventType(type))}</span><strong>${Number(count)}</strong></div>`).join('') : '<div><span>Items</span><strong>0</strong></div>'}
                </div>
                <h3>Status Counts</h3>
                <div class="detail-grid">
                    ${Object.entries(itemStatusCounts).length ? Object.entries(itemStatusCounts).map(([status, count]) => `<div><span>${escapeHtml(formatEventType(status))}</span><strong>${Number(count)}</strong></div>`).join('') : '<div><span>Status</span><strong>0</strong></div>'}
                </div>
                ${reviews.length ? `<h3>Review Queue</h3><div class="stacked-list">${reviews.map(renderIntakeReviewRow).join('')}</div>` : ''}
            </section>
        </div>
    `;
}

function renderIntakeReviewQueue() {
    return `
        <section class="panel">
            <div class="panel-header">
                <div>
                    <h2>Review Queue</h2>
                    <p>Ambiguous people, low-confidence items, medical notes, and proposed custom sections wait here.</p>
                </div>
            </div>
            <div class="stacked-list">
                ${intakeReviewItems.length ? intakeReviewItems.map(renderIntakeReviewRow).join('') : `<div class="empty-state">No open review items.</div>`}
            </div>
        </section>
    `;
}

function renderIntakeReviewRow(item) {
    const payload = item.payload || {};
    const isCustomSection = item.review_type === 'custom_section' || item.item_type === 'custom_section';
    return `
        <article class="list-row as-card">
            <span>
                <strong>${escapeHtml(item.reason || item.review_type || 'Review item')}</strong>
                <small>${escapeHtml(item.review_type || '')}${item.parse_run_id ? ` / run #${Number(item.parse_run_id)}` : ''}</small>
                ${payload.label || payload.section_key ? `<small>Section: ${escapeHtml(payload.label || payload.section_key)}</small>` : ''}
            </span>
            <span class="button-row">
                ${isCustomSection ? `<button class="secondary-button" onclick="resolveIntakeReview(${Number(item.id)}, 'approve_custom_section')">Approve Section</button>` : `<button class="secondary-button" onclick="resolveIntakeReview(${Number(item.id)}, 'file_item')">File Item</button>`}
                <button class="ghost-button" onclick="resolveIntakeReview(${Number(item.id)}, 'ignore')">Ignore</button>
            </span>
        </article>
    `;
}

function renderIntakeSections() {
    return `
        <section class="panel">
            <div class="panel-header">
                <div>
                    <h2>Section Registry</h2>
                    <p>System sections stay active; parser-created sections begin as proposed until approved.</p>
                </div>
                <button class="secondary-button" onclick="createIntakeSectionPrompt()">New Section</button>
            </div>
            <div class="table-scroll">
                <table class="data-table">
                    <thead><tr><th>Section</th><th>Scope</th><th>Status</th><th>Visibility</th><th></th></tr></thead>
                    <tbody>
                        ${intakeSections.length ? intakeSections.map(section => `
                            <tr>
                                <td><strong>${escapeHtml(section.label || section.section_key)}</strong><br><small>${escapeHtml(section.section_key || '')}</small></td>
                                <td>${escapeHtml(section.scope || 'person')}</td>
                                <td><span class="status-pill ${escapeHtml(section.status || 'active')}">${escapeHtml(section.status || 'active')}</span></td>
                                <td>${escapeHtml(Object.entries(section.visible_to || {}).filter(([, enabled]) => enabled).map(([key]) => key).join(', ') || 'admin')}</td>
                                <td>${section.status === 'proposed' ? `<button class="secondary-button" onclick="updateIntakeSectionStatus(${Number(section.id)}, 'active')">Approve</button>` : `<button class="ghost-button" onclick="updateIntakeSectionStatus(${Number(section.id)}, 'hidden')">Hide</button>`}</td>
                            </tr>
                        `).join('') : `<tr><td colspan="5">No sections loaded.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

async function openManualIntakePrompt() {
    const raw = prompt('Paste the ramble, transcript excerpt, or mixed note to parse:');
    if (!raw || !raw.trim()) return;
    intakeNotice = 'Parsing intake...';
    render();
    try {
        const result = await api.parseIntake({ raw_input: raw, source_type: 'manual_dashboard', dry_run: true });
        intakeSelectedRunId = result?.parse_run?.id || intakeSelectedRunId;
        currentView = 'tasks';
        taskFocus = 'decisions';
        taskWorkflowNotice = `Created parse run #${intakeSelectedRunId}; low-confidence items should be handled as Decisions.`;
        await loadData({ background: true });
        syncOperationsUrl();
    } catch (error) {
        intakeNotice = '';
        alert(error.message || 'Intake parse failed.');
    }
}

async function selectIntakeRun(id) {
    intakeSelectedRunId = Number(id) || null;
    intakeSection = 'runs';
    syncOperationsUrl();
    await loadData({ background: true });
}

async function applyIntakeRun(id) {
    try {
        const result = await api.applyIntakeParseRun(id);
        intakeNotice = `Applied run #${id}: ${result?.counts?.tasks || 0} tasks, ${result?.counts?.section_records || 0} section records, ${result?.counts?.review || 0} review items.`;
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Apply failed.');
    }
}

async function resolveIntakeReview(id, action) {
    try {
        await api.resolveIntakeReview(id, { action });
        intakeNotice = action === 'ignore' ? 'Review item ignored.' : 'Review item resolved.';
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Review update failed.');
    }
}

async function createIntakeSectionPrompt() {
    const label = prompt('Section label:');
    if (!label || !label.trim()) return;
    const scope = prompt('Scope: workspace, household, or person', 'person') || 'person';
    try {
        await api.createIntakeSection({ label, scope, status: 'proposed' });
        intakeNotice = 'Proposed section created.';
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Section create failed.');
    }
}

async function updateIntakeSectionStatus(id, status) {
    try {
        await api.updateIntakeSection(id, { status });
        intakeNotice = `Section marked ${status}.`;
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Section update failed.');
    }
}

function communityCourseById(courseId) {
    const id = Number(courseId);
    return ws11Courses.find(course => Number(course.id) === id) || null;
}

function communityLessonLabel(item = {}) {
    const parts = [];
    const course = communityCourseById(item.course_id);
    if (course?.title) parts.push(course.title);
    if (item.lesson_id) parts.push(`Lesson #${Number(item.lesson_id)}`);
    return parts.join(' / ') || communityWorkspaceProfile().itemFallback;
}

function communityStatusChip(item = {}) {
    const status = String(item.approval_status || item.status || 'draft').replace(/_/g, ' ');
    const visible = item.parent_visible ? 'parent visible' : item.public_visible ? 'public visible' : item.student_visible === false ? 'hidden' : 'student';
    return `<span class="badge">${escapeHtml(status)} / ${escapeHtml(visible)}</span>`;
}

function renderCommunityAdmin() {
    const profile = communityWorkspaceProfile();
    const counts = communitySubnavCounts();
    const pendingApprovals = counts.approvals || 0;
    return `
        <div class="container" data-community-admin>
            <div class="page-heading">
                <div>
                    <div class="page-kicker">${escapeHtml(profile.kicker)}</div>
                    <h2>${escapeHtml(profile.title)}</h2>
                    <p>${escapeHtml(profile.subtitle)}</p>
                </div>
            </div>
            ${communityNotice ? `<div class="success-banner">${escapeHtml(communityNotice)}</div>` : ''}
            <section class="focus-panel" aria-label="${escapeHtml(profile.overviewLabel)}">
                <div class="summary-grid">
                    ${renderMetricButton('Courses', ws11Courses.length, 'Library shells', "setCurrentSection('courses')")}
                    ${renderMetricButton('Worksheets', ws11Worksheets.length, 'Assigned work', "setCurrentSection('worksheets')")}
                    ${renderMetricButton('Questions', ws11CourseQuestions.length, 'Course prompts', "setCurrentSection('questions')")}
                    ${renderMetricButton('Approvals', pendingApprovals, 'Review queue', "setCurrentSection('approvals')")}
                </div>
                <div class="task-actions" style="margin-top:14px;">
                    <button class="task-action primary" type="button" onclick="createCommunityQuestionPrompt(event)">New question</button>
                    <button class="task-action" type="button" onclick="createCommunityWorksheetPrompt(event)">New worksheet</button>
                    <button class="task-action" type="button" onclick="createCommunityCoursePrompt(event)">New course</button>
                    <button class="task-action" type="button" onclick="backfillWs11Gamification(event)">Backfill events</button>
                </div>
            </section>
            ${renderCommunitySectionBody()}
        </div>
    `;
}

function renderCommunitySectionBody() {
    if (communitySection === 'courses') return renderCommunityCourses();
    if (communitySection === 'worksheets') return renderCommunityWorksheets();
    if (communitySection === 'questions') return renderCommunityQuestions();
    if (communitySection === 'approvals') return renderCommunityApprovals();
    if (communitySection === 'ledger') return renderCommunityLedger();
    if (communitySection === 'parent_preview') return renderCommunityParentPreview();
    return `
        <section class="content-section-grid" aria-label="Community overview cards">
            ${renderCommunityCourses(true)}
            ${renderCommunityQuestions(true)}
            ${renderCommunityApprovals(true)}
        </section>
    `;
}

function renderCommunityCourses(compact = false) {
    const rows = compact ? ws11Courses.slice(0, 4) : ws11Courses;
    const cards = rows.length ? rows.map(course => `
        <article class="content-card">
            <div class="content-card-head">
                <div>
                    <div class="content-card-title">${escapeHtml(course.title || 'Course')}</div>
                    <div class="content-card-meta">${escapeHtml([course.status, course.visibility, course.primary_teacher].filter(Boolean).join(' / '))}</div>
                </div>
                <span class="badge">${Number(course.lesson_count || 0)} lessons</span>
            </div>
            ${course.description ? `<p class="event-meta">${escapeHtml(course.description)}</p>` : ''}
            <div class="goal-badges">
                <span class="badge">${Number(course.worksheet_count || 0)} worksheets</span>
                <span class="badge">${Number(course.enrollment_summary?.enrollment_count || 0)} students</span>
                <span class="badge">${Number(course.enrollment_summary?.average_progress_percent || 0)}% avg</span>
            </div>
        </article>
    `).join('') : `<div class="empty-state">${escapeHtml(communityWorkspaceProfile().emptyCourses)}</div>`;
    return `
        <section class="focus-panel" aria-label="Course library">
            <div class="task-section-header"><h3>Course Library</h3><span>${ws11Courses.length}</span></div>
            <div class="content-section-grid">${cards}</div>
        </section>
    `;
}

function renderCommunityWorksheets() {
    const rows = ws11Worksheets.length ? ws11Worksheets.map(worksheet => `
        <article class="content-card">
            <div class="content-card-head">
                <div>
                    <div class="content-card-title">${escapeHtml(worksheet.title || 'Worksheet')}</div>
                    <div class="content-card-meta">${escapeHtml(communityLessonLabel(worksheet))}${worksheet.due_at ? ` / due ${escapeHtml(formatDateTime(worksheet.due_at))}` : ''}</div>
                </div>
                ${communityStatusChip(worksheet)}
            </div>
            ${worksheet.instructions ? `<p class="event-meta">${escapeHtml(worksheet.instructions)}</p>` : ''}
            <div class="goal-badges">
                <span class="badge">${Number(worksheet.questions?.length || 0)} prompts</span>
                <span class="badge">${escapeHtml(worksheet.status || 'draft')}</span>
            </div>
        </article>
    `).join('') : '<div class="empty-state">No worksheets loaded yet.</div>';
    return `
        <section class="focus-panel" aria-label="Worksheet management">
            <div class="task-section-header"><h3>Worksheets</h3><span>${ws11Worksheets.length}</span></div>
            <div class="content-list">${rows}</div>
        </section>
    `;
}

function renderCommunityQuestions(compact = false) {
    const rows = compact ? ws11CourseQuestions.slice(0, 5) : ws11CourseQuestions;
    const cards = rows.length ? rows.map(question => `
        <article class="content-card">
            <div class="content-card-head">
                <div>
                    <div class="content-card-title">${escapeHtml(question.title || 'Question')}</div>
                    <div class="content-card-meta">${escapeHtml(communityLessonLabel(question))}${question.due_at ? ` / due ${escapeHtml(formatDateTime(question.due_at))}` : ''}</div>
                </div>
                ${communityStatusChip(question)}
            </div>
            <p class="event-meta">${escapeHtml(question.prompt || '')}</p>
            <div class="goal-badges">
                <span class="badge">${Number(question.points || 0)} points</span>
                <span class="badge">${Number(question.response_count || 0)} responses</span>
                <span class="badge">${escapeHtml(question.question_type || 'short_answer')}</span>
            </div>
        </article>
    `).join('') : '<div class="empty-state">No course questions loaded yet.</div>';
    return `
        <section class="focus-panel" aria-label="Question management">
            <div class="task-section-header"><h3>Questions</h3><span>${ws11CourseQuestions.length}</span></div>
            <div class="content-list">${cards}</div>
        </section>
    `;
}

function renderCommunityApprovals(compact = false) {
    const pendingQuestions = ws11CourseQuestions.filter(item => !['approved', 'archived'].includes(String(item.approval_status || '').toLowerCase()));
    const pendingWorksheets = ws11Worksheets.filter(item => !['approved', 'archived'].includes(String(item.approval_status || '').toLowerCase()));
    const pendingEvents = ws11GamificationEvents.filter(item => !['approved', 'archived'].includes(String(item.approval_status || '').toLowerCase()));
    const pendingShoutouts = ws11Shoutouts.filter(item => !['approved', 'archived'].includes(String(item.approval_status || '').toLowerCase()));
    const items = [
        ...pendingShoutouts.map(item => ({ kind: 'Shoutout', item })),
        ...pendingQuestions.map(item => ({ kind: 'Question', item })),
        ...pendingWorksheets.map(item => ({ kind: 'Worksheet', item })),
        ...pendingEvents.map(item => ({ kind: 'Event', item })),
    ];
    const visibleItems = compact ? items.slice(0, 5) : items;
    const cards = visibleItems.length ? visibleItems.map(({ kind, item }) => `
        <article class="content-card">
            <div class="content-card-head">
                <div>
                    <div class="content-card-title">${escapeHtml(item.title || item.worksheet_title || kind)}</div>
                    <div class="content-card-meta">${escapeHtml(kind)} / ${escapeHtml(item.student_name || communityLessonLabel(item))}</div>
                </div>
                ${communityStatusChip(item)}
            </div>
            ${item.body || item.prompt || item.notes ? `<p class="event-meta">${escapeHtml(item.body || item.prompt || item.notes || '')}</p>` : ''}
            ${kind === 'Shoutout' ? `<div class="task-actions"><button class="task-action primary" type="button" onclick="approveCommunityShoutout(event, ${Number(item.id)})">Approve parent-visible</button></div>` : ''}
        </article>
    `).join('') : '<div class="empty-state">No pending community approvals.</div>';
    return `
        <section class="focus-panel" aria-label="Approval queue">
            <div class="task-section-header"><h3>Approval Queue</h3><span>${items.length}</span></div>
            <div class="content-list">${cards}</div>
        </section>
    `;
}

function oneTimeBadgeReadinessState(events = []) {
    const eventList = Array.isArray(events) ? events : [];
    const approvedEvents = eventList.filter(item => String(item.approval_status || '').toLowerCase() === 'approved');
    const eventTypes = new Set(approvedEvents.map(item => String(item.event_type || '').toLowerCase()));
    const automaticBadges = ['First Class', 'On Time', 'Five On-Time Classes', 'Full Shiur', 'Three-Week Consistency', 'First Review', 'Chazarah Streak', 'Perek Completed', 'Masechta Completed', 'Watched the Missed Class', 'Comeback'];
    const rabbiBadges = ['Thoughtful Question', 'Clear Explanation', 'Strong Source Work', 'Excellent Preparation', 'Helped the Class', 'Exceptional Improvement'];
    return {
        requirementId: 'REQ-20260619-310',
        summary: {
            loadedEvents: eventList.length,
            approvedEvents: approvedEvents.length,
            eventTypes: eventTypes.size,
            automaticBadges: automaticBadges.length,
            rabbiBadges: rabbiBadges.length,
        },
        sections: [
            ['Automatic badges', 'Implemented', automaticBadges.join(', ')],
            ['Rabbi-awarded badges', 'Review required', rabbiBadges.join(', ')],
            ['Thresholds', 'Implemented', 'Five on-time classes, three-week consistency, and chazarah streak counts are threshold-driven.'],
            ['Idempotency', 'Implemented', 'Badge award and reversal keys are stable per student, badge, and source event/reversal reference.'],
            ['Source evidence', 'Implemented', 'Awards require source event, reason, class/session evidence when relevant, and parent-safe explanation.'],
            ['Manual reversal', 'Implemented', 'Reversal requires reason and writes a badge audit trail before any parent-facing readback changes.'],
            ['Public leaderboard', 'Blocked', 'No public individual leaderboard, negative points, prize/coupon/credit, access grant, or external notification is enabled.'],
        ],
    };
}

function renderCommunityBadgeReadinessPanel(events = []) {
    const state = oneTimeBadgeReadinessState(events);
    return `
        <section class="one-time-approval-packet" data-one-time-badge-audit-readiness data-requirement-id="${escapeHtml(state.requirementId)}" aria-label="One Time gamification badge readiness">
            <strong>Gamification / Badge Audit</strong>
            <span>${escapeHtml(state.requirementId)} / no-write readiness</span>
            <p>Server-side event badges and manual reversals are implemented, but this panel is read-only. No badge award, badge reversal, parent/student notification, automatic access grant, prize/coupon/credit, negative-point action, or public individual leaderboard runs from this panel.</p>
            <div class="classroom-board-metrics">
                ${renderClassroomMetric(state.summary.loadedEvents, 'Events')}
                ${renderClassroomMetric(state.summary.approvedEvents, 'Approved')}
                ${renderClassroomMetric(state.summary.automaticBadges, 'Auto badges')}
                ${renderClassroomMetric(state.summary.rabbiBadges, 'Rabbi badges')}
            </div>
            <div class="one-time-output-grid">
                ${state.sections.map(([title, status, body]) => `
                    <article class="one-time-output-state ${status === 'Blocked' ? 'blocked' : ''}">
                        <strong>${escapeHtml(title)}</strong>
                        <span>${escapeHtml(status)}</span>
                        <p>${escapeHtml(body)}</p>
                    </article>
                `).join('')}
            </div>
        </section>
    `;
}

function renderCommunityLedger() {
    const rows = ws11GamificationEvents.length ? ws11GamificationEvents.slice(0, 120).map(event => `
        <article class="content-card">
            <div class="content-card-head">
                <div>
                    <div class="content-card-title">${escapeHtml(event.title || event.event_type || 'Event')}</div>
                    <div class="content-card-meta">${escapeHtml([event.student_name, event.event_type, event.source].filter(Boolean).join(' / '))}</div>
                </div>
                <span class="badge">${Number(event.points || 0)} points</span>
            </div>
            <div class="goal-badges">
                <span class="badge">${escapeHtml(event.approval_status || 'approved')}</span>
                <span class="badge">${event.parent_visible ? 'parent visible' : 'student/internal'}</span>
                <span class="badge">${escapeHtml(formatDateTime(event.occurred_at || event.created_at))}</span>
            </div>
        </article>
    `).join('') : '<div class="empty-state">No gamification events loaded yet.</div>';
    return `
        <section class="focus-panel" aria-label="Gamification ledger">
            <div class="task-section-header"><h3>Gamification Ledger</h3><span>${ws11GamificationEvents.length}</span></div>
            ${renderCommunityBadgeReadinessPanel(ws11GamificationEvents)}
            <div class="content-list">${rows}</div>
        </section>
    `;
}

function renderCommunityParentPreview() {
    const rows = students.slice(0, 80).map(student => `
        <article class="content-card">
            <div class="content-card-head">
                <div>
                    <div class="content-card-title">${escapeHtml(student.name || 'Student')}</div>
                    <div class="content-card-meta">${escapeHtml([student.parent_email || 'parent email missing', student.status || 'active'].filter(Boolean).join(' / '))}</div>
                </div>
                <span class="badge">${escapeHtml(personAudienceLabel(studentAudienceKey(student)))}</span>
            </div>
            <div class="task-actions">
                <button class="task-action primary" type="button" onclick="generateWs11ParentReport(event, ${Number(student.id)})">Generate report</button>
                <button class="task-action" type="button" onclick="selectStudentAndOpen(${Number(student.id)}, 'assignments')">Open student community</button>
            </div>
        </article>
    `).join('');
    return `
        <section class="focus-panel" aria-label="Parent progress preview list">
            <div class="task-section-header"><h3>Parent Progress Preview</h3><span>${students.length}</span></div>
            <div class="content-list">${rows || '<div class="empty-state">No students loaded yet.</div>'}</div>
        </section>
    `;
}

async function createCommunityCoursePrompt(event) {
    event?.preventDefault?.();
    const projectKey = communityDataProjectFilters().project_key;
    if (!projectKey) {
        communityNotice = 'Choose a specific workspace before creating a community course.';
        render();
        return;
    }
    const title = prompt('Course title');
    if (!title) return;
    const description = prompt('Course description') || '';
    try {
        communityNotice = 'Creating course...';
        render();
        await api.createWs11Course({
            title,
            description,
            status: 'active',
            visibility: 'student',
            project_key: projectKey,
        });
        communityNotice = 'Course created.';
        await loadData({ background: true });
    } catch (error) {
        communityNotice = error.message || 'Could not create course.';
        render();
    }
}

async function createCommunityWorksheetPrompt(event) {
    event?.preventDefault?.();
    const projectKey = communityDataProjectFilters().project_key;
    if (!projectKey) {
        communityNotice = 'Choose a specific workspace before creating a community worksheet.';
        render();
        return;
    }
    const courseId = Number(prompt('Course ID', ws11Courses[0]?.id || ''));
    if (!Number.isFinite(courseId)) return;
    const title = prompt('Worksheet title');
    if (!title) return;
    const instructions = prompt('Worksheet instructions') || '';
    try {
        communityNotice = 'Creating worksheet...';
        render();
        await api.createWs11Worksheet({
            course_id: courseId,
            title,
            instructions,
            status: 'active',
            visibility: 'student',
            approval_status: 'approved',
            parent_visible: false,
            project_key: projectKey,
        });
        communityNotice = 'Worksheet created.';
        await loadData({ background: true });
    } catch (error) {
        communityNotice = error.message || 'Could not create worksheet.';
        render();
    }
}

async function createCommunityQuestionPrompt(event) {
    event?.preventDefault?.();
    const projectKey = communityDataProjectFilters().project_key;
    if (!projectKey) {
        communityNotice = 'Choose a specific workspace before creating a community question.';
        render();
        return;
    }
    const courseId = Number(prompt('Course ID', ws11Courses[0]?.id || ''));
    if (!Number.isFinite(courseId)) return;
    const title = prompt('Question title');
    if (!title) return;
    const promptText = prompt('Question prompt');
    if (!promptText) return;
    try {
        communityNotice = 'Creating question...';
        render();
        await api.createWs11CourseQuestion({
            course_id: courseId,
            title,
            prompt: promptText,
            status: 'active',
            approval_status: 'approved',
            visibility: 'student',
            student_visible: true,
            parent_visible: false,
            project_key: projectKey,
        });
        communityNotice = 'Question created.';
        await loadData({ background: true });
    } catch (error) {
        communityNotice = error.message || 'Could not create question.';
        render();
    }
}

async function approveCommunityShoutout(event, id) {
    event?.preventDefault?.();
    if (!confirm('Approve this shoutout for parent visibility?')) return;
    try {
        communityNotice = 'Approving shoutout...';
        render();
        await api.approveWs11Shoutout(id, {
            parent_visible: true,
            visibility: 'student_parent',
        });
        communityNotice = 'Shoutout approved for parent visibility.';
        await loadData({ background: true });
    } catch (error) {
        communityNotice = error.message || 'Could not approve shoutout.';
        render();
    }
}

function renderContent() {
    const contentTabs = visibleContentSubtabs();
    const activeContentSection = contentTabs.some(tab => tab.id === contentSection) ? contentSection : defaultContentSection();
    const scopedJobs = contentJobs.filter(job => !['archived'].includes(job.status) && !contentIsParserIntake(job));
    const visibleJobs = scopedJobs.filter(contentIsReusableContent);
    const selectedJobsAll = visibleJobs.filter(job => selectedContentJobIds.has(Number(job.id)));
    const repurposeJobsAll = visibleJobs.filter(job => ['transcribed', 'parsing', 'drafting', 'needs_approval', 'approved'].includes(String(job.status || '').toLowerCase()));
    const filteredJobs = visibleJobs
        .filter(job => contentTypeFilter === 'all' || contentMediaType(job) === contentTypeFilter)
        .filter(job => contentProjectFilter === 'all' || contentProject(job) === contentProjectFilter)
        .filter(job => contentMatchesStatusFilter(job, contentStatusFilter))
        .filter(job => contentTopicFilter === 'all' || contentTopicKeys(job).includes(contentTopicFilter))
        .filter(job => contentSourceFilter === 'all' || contentSourceKey(job) === contentSourceFilter)
        .filter(job => contentMatchesDateFilter(job, contentDateFilter))
        .filter(job => contentMatchesSearch(job, contentSearchQuery))
        .sort(sortContentJobs);
    const selectedJobs = filteredJobs.filter(job => selectedContentJobIds.has(Number(job.id)));
    const repurposeJobs = filteredJobs.filter(job => ['transcribed', 'parsing', 'drafting', 'needs_approval', 'approved'].includes(String(job.status || '').toLowerCase()));
    const oneTimeLibraryJobsAll = visibleJobs.filter(contentIsOneTimeLibraryItem);
    const oneTimeLibraryJobs = filteredJobs.filter(contentIsOneTimeLibraryItem);
    const openJobs = filteredJobs.filter(job => !['published'].includes(job.status));
    const researchSessions = classSessions
        .filter(contentSessionHasResearchMaterial)
        .sort(sortClassSessions);
    const meetingCandidates = scopedJobs
        .filter(contentJobLooksLikeOneTimeMeeting)
        .sort(sortContentJobs);
    const typeCounts = {
        all: visibleJobs.length,
        video: visibleJobs.filter(job => contentMediaType(job) === 'video').length,
        audio: visibleJobs.filter(job => contentMediaType(job) === 'audio').length,
        image: visibleJobs.filter(job => contentMediaType(job) === 'image').length,
        file: visibleJobs.filter(job => contentMediaType(job) === 'file').length
    };
    const statusCounts = contentStatusCounts(visibleJobs);
    const topicCounts = countByContentTopicKeys(visibleJobs);
    const sourceCounts = countByValue(visibleJobs, contentSourceKey);
    const projectCounts = {
        all: visibleJobs.length,
        bna: visibleJobs.filter(job => contentProject(job) === 'bna').length,
        mishna: visibleJobs.filter(job => contentProject(job) === 'mishna').length
    };
    const sectionMeta = contentSectionMeta(activeContentSection);
    const sectionCounts = contentTabs.reduce((counts, tab) => {
        counts[tab.id] = contentSectionCount(tab.id, {
            visibleJobs,
            selectedJobs: selectedJobsAll,
            repurposeJobs: repurposeJobsAll,
            researchSessions,
            bundles: contentBundles,
            prompts: contentPrompts,
            meetingCandidates,
            projectMeetings,
            oneTimeLibraryJobs: oneTimeLibraryJobsAll,
            oneTimeQuestionQueue,
            oneTimeClasses,
        });
        return counts;
    }, {});
    const contentFilterStats = {
        library: { filtered: filteredJobs.length, total: visibleJobs.length },
        selected: { filtered: selectedJobs.length, total: selectedJobsAll.length },
        repurpose: { filtered: repurposeJobs.length, total: repurposeJobsAll.length }
    }[activeContentSection] || { filtered: filteredJobs.length, total: visibleJobs.length };
    const selectedDetailJob = selectedContentDetailJobId
        ? visibleJobs.find(job => Number(job.id) === Number(selectedContentDetailJobId))
        : null;
    const mediaFilterOptions = [
        { value: 'all', label: `All (${typeCounts.all})` },
        { value: 'video', label: `Video (${typeCounts.video})` },
        { value: 'audio', label: `Audio (${typeCounts.audio})` },
        { value: 'image', label: `Images (${typeCounts.image})` },
        { value: 'file', label: `Files (${typeCounts.file})` }
    ];
    const statusFilterOptions = CONTENT_STATUS_FILTERS.map(filter => ({
        value: filter.id,
        label: `${filter.label}${filter.id === 'all' ? ` (${statusCounts.all})` : ` (${statusCounts[filter.id] || 0})`}`
    }));
    const topicFilterIds = ['all', ...new Set([
        ...CONTENT_TOPIC_FILTERS.map(filter => filter.id).filter(id => id !== 'all'),
        ...Object.keys(topicCounts)
    ])];
    const topicFilterOptions = topicFilterIds
        .filter(id => id === 'all' || topicCounts[id])
        .map(filter => ({
            value: filter,
            label: `${contentTopicLabelForKey(filter)}${filter === 'all' ? ` (${visibleJobs.length})` : ` (${topicCounts[filter] || 0})`}`
        }));
    const sourceFilterOptions = CONTENT_SOURCE_FILTERS
        .filter(filter => filter.id === 'all' || sourceCounts[filter.id])
        .map(filter => ({
            value: filter.id,
            label: `${filter.label}${filter.id === 'all' ? ` (${visibleJobs.length})` : ` (${sourceCounts[filter.id] || 0})`}`
        }));
    const projectFilterOptions = [
        { value: 'all', label: `All (${projectCounts.all})` },
        { value: 'bna', label: `BNA (${projectCounts.bna})` },
        { value: 'mishna', label: `One Time (${projectCounts.mishna})` }
    ];
    const oneTimeContentSectionAttr = currentWorkspaceIsOneTime()
        ? ` data-one-time-content-section="${escapeHtml(activeContentSection)}"`
        : '';
    const contentFilterOpenAttr = activeContentSection === 'one_time_library' ? '' : ' open';
    return `
        <div class="container"${oneTimeContentSectionAttr}>
            <div class="page-heading">
                <div>
                    <div class="page-kicker">Content Review</div>
                    <h2>${escapeHtml(sectionMeta.title)}</h2>
                    <p>${escapeHtml(sectionMeta.description)}</p>
                </div>
            </div>
            ${renderSectionNav(tabsWithCounts(contentTabs, sectionCounts), activeContentSection, 'setContentTypeTab')}

            ${['library', 'one_time_library', 'selected', 'repurpose'].includes(activeContentSection) ? `
                <details class="filter-details collapsible-details"${contentFilterOpenAttr}>
                    <summary>Filters</summary>
                    <div class="filter-details-body content-toolbar">
                        <div class="filter-row">
                            <span class="filter-label">Search</span>
                            <input class="filter-text-input content-search-input" type="search" value="${escapeHtml(contentSearchQuery)}" placeholder="Search title, summary, topic, source, output, or metadata" oninput="setContentSearch(this.value)">
                        </div>
                        <div class="filter-row">
                            <span class="filter-label">Topic</span>
                            ${renderFilterSelect('setContentFilter', 'topic', contentTopicFilter, topicFilterOptions, 'Content topic filter')}
                        </div>
                        <div class="filter-row">
                            <span class="filter-label">Source</span>
                            ${renderFilterSelect('setContentFilter', 'source', contentSourceFilter, sourceFilterOptions, 'Content source filter')}
                        </div>
                        <div class="filter-row">
                            <span class="filter-label">Media</span>
                            ${renderFilterSelect('setContentFilter', 'type', contentTypeFilter, mediaFilterOptions, 'Content media filter')}
                        </div>
                        <div class="filter-row">
                            <span class="filter-label">Status</span>
                            ${renderFilterSelect('setContentFilter', 'status', contentStatusFilter, statusFilterOptions, 'Content status filter')}
                        </div>
                        <div class="filter-row">
                            <span class="filter-label">Uploaded</span>
                            ${renderContentFilterChip('date', 'all', 'All dates', contentDateFilter)}
                            ${renderContentFilterChip('date', 'today', 'Today', contentDateFilter)}
                            ${renderContentFilterChip('date', 'week', 'Last 7 days', contentDateFilter)}
                            ${renderContentFilterChip('date', 'month', 'Last 30 days', contentDateFilter)}
                        </div>
                        <div class="filter-row">
                            <span class="filter-label">Project</span>
                            ${renderFilterSelect('setContentFilter', 'project', contentProjectFilter, projectFilterOptions, 'Content project filter')}
                        </div>
                        ${renderFilterCountNote(contentFilterStats.filtered, contentFilterStats.total, 'content item')}
                    </div>
                </details>
            ` : ''}

            ${selectedDetailJob ? renderContentDetailDrawer(selectedDetailJob) : ''}
            ${renderContentSectionBody(activeContentSection, {
                visibleJobs,
                filteredJobs,
                selectedJobs,
                repurposeJobs,
                oneTimeLibraryJobs,
                oneTimeLibraryJobsAll,
                oneTimeQuestionQueue,
                oneTimeClasses,
                researchSessions,
                meetingCandidates,
                projectMeetings,
            })}
        </div>
    `;
}

function contentSectionMeta(section) {
    return ({
        library: {
            title: 'Content Library',
            description: 'Compact cards show title, upload date, short topic bullets, output status, and next action. Full transcripts and prompt details stay collapsed.',
        },
        one_time_library: {
            title: 'One Time Library',
            description: 'Scoped Rabbi Sheller video library review: hosted media readiness, transcript review, worksheet/source-sheet drafts, internal approvals, and publishing guardrails.',
        },
        meetings: {
            title: 'Meeting Drops',
            description: 'Rabbi and One Time meeting recordings become structured summaries, decision cards, and linked follow-up tasks.',
        },
        research: {
            title: currentWorkspaceIsOneTime() ? 'Source Prep' : 'Research',
            description: 'Class topics, questions, and mentioned sources from uploaded recordings. Create source-sheet tasks for class learning, or public bibliography tasks for parent-facing videos and content claims.',
        },
        selected: {
            title: 'Selected',
            description: 'Use selected recordings, images, or voice notes to generate one output across multiple sources.',
        },
        repurpose: {
            title: 'Repurpose',
            description: 'Ready-to-repurpose items and output generation flow. Choose output is the main action.',
        },
        newsletter: {
            title: 'Newsletter',
            description: 'Weekly newsletter review: bundle sources, edit the draft, and approve when ready. Sending stays separate.',
        },
        prompts: {
            title: 'Prompts',
            description: 'Prompt templates for WhatsApp, Facebook, newsletters, website blogs, LinkedIn, and YouTube descriptions.',
        },
        bundles: {
            title: 'Bundles',
            description: 'Newsletter bundles and review bundles.',
        },
    })[section] || {
        title: 'Content Library',
        description: 'Compact content cards.',
    };
}

function contentSectionCount(section, state) {
    const counts = {
        library: state.visibleJobs.length,
        one_time_library: (state.oneTimeLibraryJobs || state.visibleJobs.filter(contentIsOneTimeLibraryItem)).length + (state.oneTimeQuestionQueue || []).length + (state.oneTimeClasses || []).length,
        meetings: Math.max((state.meetingCandidates || []).length, (state.projectMeetings || []).length),
        research: state.researchSessions.length,
        selected: state.selectedJobs.length,
        repurpose: state.repurposeJobs.length,
        newsletter: (state.bundles || []).filter(bundle => bundle.status !== 'archived').length,
        prompts: CONTENT_OUTPUT_TYPES.length,
        bundles: (state.bundles || []).length,
    };
    return counts[section] || 0;
}

function renderContentSectionBody(section, state) {
    if (section === 'selected') {
        return `
            ${renderContentSelectionPanel(state.filteredJobs)}
            ${state.selectedJobs.length
                ? `<div class="content-list">${state.selectedJobs.map(job => renderContentCard(job)).join('')}</div>`
                : '<div class="task-empty">No content is selected yet. Go to Library or Repurpose and select cards first.</div>'}
        `;
    }
    if (section === 'repurpose') {
        return state.repurposeJobs.length
            ? `<div class="content-list">${state.repurposeJobs.map(job => renderContentCard(job)).join('')}</div>`
            : '<div class="task-empty">No ready-to-repurpose content matches these filters yet.</div>';
    }
    if (section === 'one_time_library') {
        return renderOneTimeContentLibraryPanel(state.oneTimeLibraryJobs || [], state.oneTimeLibraryJobsAll || [], state.oneTimeQuestionQueue || [], state.oneTimeClasses || []);
    }
    if (section === 'research') {
        return renderContentResearchPanel(state.researchSessions);
    }
    if (section === 'meetings') {
        return renderContentMeetingDropsPanel(state.meetingCandidates || [], state.projectMeetings || []);
    }
    if (section === 'newsletter' || section === 'bundles') {
        return renderNewsletterBundlePanel();
    }
    if (section === 'prompts') {
        return renderContentPromptLibrary();
    }
    if (state.visibleJobs.length === 0) {
        return `
            <div class="data-table">
                <div class="empty-state">
                    <p>No content jobs yet. Drop audio, video, or images into Drive Raw Intake and they will appear here.</p>
                </div>
            </div>
        `;
    }
    return state.filteredJobs.length === 0
        ? '<div class="task-empty">No content matches these filters yet.</div>'
        : `<div class="content-list">${state.filteredJobs.map(job => renderContentCard(job)).join('')}</div>`;
}

function contentOutputMetadata(output = {}) {
    return parseJsonField(output.metadata) || {};
}

function contentHasOutputType(job = {}, outputType = '') {
    return Boolean(outputForJob(job, outputType));
}

function contentIsOneTimeLibraryItem(job = {}) {
    if (contentProject(job) !== 'mishna') return false;
    const parsed = parseJsonField(job.parse_json) || {};
    const haystack = [
        parsed.content_kind,
        parsed.created_by_action,
        parsed.source_url,
        job.title,
        job.caption,
        job.notes,
        job.drive_stage,
        job.media_url,
        ...(job.outputs || []).map(output => `${output.output_type || ''} ${output.platform || ''} ${output.title || ''}`)
    ].filter(Boolean).join(' ').toLowerCase();
    return parsed.content_kind === 'one_time_video_library_item'
        || parsed.created_by_action === 'create_one_time_video_library_item'
        || contentHasOutputType(job, 'video_library_item')
        || /\bone[_\s-]?time[_\s-]?video[_\s-]?library\b|\bvideo library item\b|\bone[_\s-]?time[_\s-]?library\b/.test(haystack);
}

function contentHostedMediaUrl(job = {}) {
    const direct = String(job.media_url || '').trim();
    if (/^https?:\/\//i.test(direct)) return direct;
    const metadataUrl = (job.outputs || [])
        .map(output => contentOutputMetadata(output).source_url || contentOutputMetadata(output).media_url)
        .find(value => /^https?:\/\//i.test(String(value || '').trim()));
    return metadataUrl ? String(metadataUrl).trim() : '';
}

function contentHasHostedMedia(job = {}) {
    return Boolean(contentHostedMediaUrl(job));
}

function contentHasLocalMediaOnly(job = {}) {
    const mediaType = contentMediaType(job);
    return ['video', 'audio', 'image'].includes(mediaType)
        && Boolean(String(job.local_path || '').trim())
        && !contentHasHostedMedia(job);
}

function oneTimeLibraryOutputStatus(job = {}, outputType = '') {
    const output = outputForJob(job, outputType);
    return output ? String(output.status || 'draft').toLowerCase() : 'missing';
}

function oneTimeMemberVisibilityState(job = {}) {
    const parsed = parseJsonField(job.parse_json) || {};
    const outputs = (job.outputs || []).map(contentOutputMetadata);
    const memberVisible = parsed.member_visible === true || outputs.some(metadata => metadata.member_visible === true);
    const publicVisible = parsed.public_visible === true || outputs.some(metadata => metadata.public_visible === true);
    if (memberVisible || publicVisible) return 'visibility flag set - review before continuing';
    return 'private review only';
}

function oneTimeLibraryBlockers(job = {}) {
    const blockers = [];
    if (contentHasLocalMediaOnly(job)) blockers.push('Hosted media URL missing for local media');
    if (!contentHasOutputType(job, 'video_library_item')) blockers.push('Library card output missing');
    if (!String(job.transcript_text || outputForJob(job, 'transcript_review')?.body || '').trim()) blockers.push('Transcript review not ready');
    if (oneTimeMemberVisibilityState(job).includes('visibility flag set')) blockers.push('Visibility metadata needs review');
    return blockers;
}

function oneTimeThumbnailPreviewData(job = {}) {
    const parsed = parseJsonField(job.parse_json) || {};
    const output = outputForJob(job, 'thumbnail_brief') || {};
    const metadata = contentOutputMetadata(output);
    const thumbnailUrl = [
        metadata.thumbnail_url,
        metadata.thumbnailUrl,
        parsed.thumbnail_url,
        parsed.thumbnailUrl,
        job.thumbnail_url,
        job.image_url,
    ].find(value => /^https?:\/\//i.test(String(value || '').trim()));
    return {
        url: thumbnailUrl ? String(thumbnailUrl).trim() : '',
        status: metadata.thumbnail_status || metadata.thumbnailStatus || parsed.thumbnail_status || parsed.thumbnailStatus || (thumbnailUrl ? 'thumbnail_received' : 'needs_thumbnail'),
        brief: String(output.body || '').trim(),
    };
}

function renderOneTimeThumbnailPreview(job = {}) {
    const thumbnail = oneTimeThumbnailPreviewData(job);
    const statusLabel = String(thumbnail.status || 'needs_thumbnail').replace(/_/g, ' ');
    return `
        <div class="one-time-thumbnail-preview">
            <div class="one-time-thumbnail-frame">
                ${thumbnail.url
                    ? `<img src="${escapeHtml(thumbnail.url)}" alt="${escapeHtml(`Thumbnail preview for ${job.title || 'One Time library item'}`)}" loading="lazy" referrerpolicy="no-referrer">`
                    : '<div class="one-time-thumbnail-empty">Thumbnail reference missing</div>'}
            </div>
            <p class="payment-muted">Status: ${escapeHtml(statusLabel)}. ${thumbnail.brief ? escapeHtml(limitTextClient(thumbnail.brief, 180)) : 'Save a thumbnail URL or design brief before member-library publishing.'}</p>
            ${thumbnail.url ? `<a class="task-action" href="${escapeHtml(thumbnail.url)}" target="_blank" rel="noopener">Open Thumbnail</a>` : ''}
        </div>
    `;
}

function oneTimeLibraryStats(jobs = []) {
    const items = Array.isArray(jobs) ? jobs : [];
    const approvedItems = items.filter(job => oneTimeLibraryOutputStatus(job, 'video_library_item') === 'approved').length;
    const needsReview = items.filter(job =>
        String(job.status || '').toLowerCase() === 'needs_approval'
        || ONE_TIME_LIBRARY_OUTPUT_LANES.some(lane => oneTimeLibraryOutputStatus(job, lane.type) === 'needs_approval')
    ).length;
    const blockedItems = items.filter(job => oneTimeLibraryBlockers(job).length).length;
    const hostedReady = items.filter(contentHasHostedMedia).length;
    return {
        total: items.length,
        approvedItems,
        needsReview,
        blockedItems,
        hostedReady,
    };
}

function renderOneTimeLibraryReport(jobs = []) {
    const stats = oneTimeLibraryStats(jobs);
    return `
        <div class="one-time-library-report" aria-label="One Time content library report">
            <div class="one-time-report-card"><strong>${Number(stats.total)}</strong><span>Total Items</span></div>
            <div class="one-time-report-card"><strong>${Number(stats.needsReview)}</strong><span>Needs Review</span></div>
            <div class="one-time-report-card"><strong>${Number(stats.approvedItems)}</strong><span>Approved Internally</span></div>
            <div class="one-time-report-card"><strong>${Number(stats.hostedReady)} / ${Number(stats.blockedItems)}</strong><span>Hosted / Blocked</span></div>
        </div>
    `;
}

function renderOneTimeOutputLane(lane = {}, jobs = []) {
    const outputs = jobs.map(job => outputForJob(job, lane.type)).filter(Boolean);
    const needs = outputs.filter(output => String(output.status || '').toLowerCase() === 'needs_approval').length;
    const approved = outputs.filter(output => String(output.status || '').toLowerCase() === 'approved').length;
    const missing = Math.max(0, jobs.length - outputs.length);
    return `
        <article class="one-time-lane-card">
            <strong>${escapeHtml(lane.label)}</strong>
            <span>${Number(outputs.length)} saved / ${Number(needs)} review / ${Number(approved)} approved</span>
            <p>${escapeHtml(lane.helper)}${missing ? ` ${missing} item${missing === 1 ? '' : 's'} missing this lane.` : ''}</p>
        </article>
    `;
}

function renderOneTimeOutputState(job = {}, lane = {}) {
    const output = outputForJob(job, lane.type);
    const status = output ? String(output.status || 'draft').toLowerCase() : 'missing';
    const statusClass = status.replace(/[^a-z0-9_-]/g, '_');
    const body = String(output?.body || '').trim();
    return `
        <article class="one-time-output-state ${escapeHtml(statusClass)}">
            <strong>${escapeHtml(lane.label)}</strong>
            <span>${escapeHtml(status.replace(/_/g, ' '))}</span>
            <p>${escapeHtml(body ? limitTextClient(body, 150) : lane.helper)}</p>
            ${output?.id ? `
                <div class="task-actions">
                    ${body ? `<button class="task-action" onclick="copyText(event, ${attrJson(body)})">Copy</button>` : ''}
                    ${body && status !== 'approved' ? `<button class="task-action primary" onclick="approveContentOutput(event, ${Number(output.id)})">Approve Internal</button>` : ''}
                </div>
            ` : ''}
        </article>
    `;
}

function renderOneTimeApprovalQueue(job = {}) {
    const pending = ONE_TIME_LIBRARY_OUTPUT_LANES
        .map(lane => ({ lane, output: outputForJob(job, lane.type) }))
        .filter(item => String(item.output?.status || '').toLowerCase() === 'needs_approval');
    if (!pending.length) return '<p class="payment-muted">No internal outputs are waiting for approval on this item.</p>';
    return `
        <div class="content-bulk-selected">
            ${pending.map(({ lane, output }) => `<span class="example-chip">${escapeHtml(lane.label)} #${Number(output.id)}</span>`).join('')}
        </div>
    `;
}

function oneTimePublishPackagePayload(job = {}) {
    const parsed = parseJsonField(job.parse_json) || {};
    const sections = contentParsedSections(job, parsed);
    const displayTitle = contentDisplayTitle(job, parsed, sections);
    const outputStatuses = {};
    ONE_TIME_LIBRARY_OUTPUT_LANES.forEach(lane => {
        outputStatuses[lane.type] = oneTimeLibraryOutputStatus(job, lane.type);
    });
    const libraryMeta = contentOutputMetadata(outputForJob(job, 'video_library_item'));
    return {
        content_job_id: Number(job.id),
        title: displayTitle,
        project_key: 'one_time_mishnah_class',
        workspace_key: 'rabbi_sheller_provider',
        media_url: contentHostedMediaUrl(job) || '',
        source_url: contentSourceHref(job) || '',
        output_statuses: outputStatuses,
        release_status: parsed.release_status || libraryMeta.release_status || job.status || 'needs_review',
        rabbi_review_status: parsed.rabbi_review_status || libraryMeta.rabbi_review_status || 'pending',
        privacy_review_status: parsed.privacy_review_status || libraryMeta.privacy_review_status || 'pending',
        notification_plan: 'no-send until separately approved',
        blockers_from_operations: oneTimeLibraryBlockers(job),
    };
}

async function previewOneTimePublishPackage(event, jobId) {
    event?.stopPropagation?.();
    const job = (state.oneTimeLibraryJobs || contentJobs || []).find(item => Number(item.id) === Number(jobId));
    if (!job) return alert('This One Time library item is not loaded.');
    try {
        const result = await api.runAction({
            action_id: 'preview_one_time_member_library_publish_package',
            dry_run: true,
            source: 'operations_one_time_library',
            workspace_key: 'rabbi_sheller_provider',
            inputs: oneTimePublishPackagePayload(job),
        });
        await loadData({ background: true });
        const blockers = result?.preview?.blockers || [];
        alert(`Publish package preview logged for job #${Number(jobId)}. ${blockers.length ? `${blockers.length} blocker${blockers.length === 1 ? '' : 's'} remain.` : 'No blockers were reported by the preview.'} No publishing, send, member visibility, Drive/video-host, Buffer/social, checkout/access, or external CRM write ran.`);
    } catch (error) {
        alert(error.message || 'Could not preview the One Time publish package.');
    }
}

function oneTimePayloadFromForm(form) {
    const payload = {};
    if (!form) return payload;
    new FormData(form).forEach((value, key) => {
        payload[key] = typeof value === 'string' ? value.trim() : value;
    });
    return payload;
}

async function runOneTimeManagerAction(event, workingMessage, action) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    oneTimeClassManagerNotice = workingMessage || 'Working...';
    render([], { force: true });
    try {
        const message = await action();
        oneTimeClassManagerNotice = message || 'Done.';
        await loadData({ background: true });
    } catch (error) {
        oneTimeClassManagerNotice = error.message || 'One Time class manager action failed.';
        render([], { force: true });
    }
}

async function createOneTimeClassPackage(event) {
    const form = event?.currentTarget;
    await runOneTimeManagerAction(event, 'Creating One Time class package...', async () => {
        const result = await api.createOneTimeClass(oneTimePayloadFromForm(form));
        form?.reset?.();
        return `Created package #${Number(result?.class_session?.id || 0)}.`;
    });
}

async function saveOneTimeClassPackage(event, classSessionId) {
    const form = event?.currentTarget || document.getElementById(`oneTimeClassForm-${Number(classSessionId)}`);
    await runOneTimeManagerAction(event, 'Saving One Time class package...', async () => {
        await api.updateOneTimeClass(classSessionId, oneTimePayloadFromForm(form));
        return `Saved package #${Number(classSessionId)}.`;
    });
}

async function addOneTimeClassAsset(event, classSessionId) {
    const form = event?.currentTarget || document.getElementById(`oneTimeAssetForm-${Number(classSessionId)}`);
    await runOneTimeManagerAction(event, 'Attaching One Time class asset...', async () => {
        const result = await api.addOneTimeClassAsset(classSessionId, oneTimePayloadFromForm(form));
        form?.reset?.();
        return `Attached ${result?.asset?.asset_type || 'asset'} to package #${Number(classSessionId)}.`;
    });
}

async function previewOneTimeClassPackage(event, classSessionId) {
    await runOneTimeManagerAction(event, 'Previewing One Time class package...', async () => {
        const result = await api.previewOneTimeClassPackage(classSessionId, {});
        const assetCount = Number(result?.package?.assets?.length || 0);
        const pipelineStatus = result?.recording_pipeline?.status || 'preview_ready';
        return `Previewed package #${Number(classSessionId)} with ${assetCount} linked asset${assetCount === 1 ? '' : 's'}; recording/Vimeo status ${pipelineStatus}.`;
    });
}

function oneTimePublishPayloadForClass(classSessionId) {
    const form = document.getElementById(`oneTimePublishForm-${Number(classSessionId)}`);
    return {
        destination: 'member_library',
        ...oneTimePayloadFromForm(form),
    };
}

async function previewOneTimeClassMember(event, classSessionId) {
    await runOneTimeManagerAction(event, 'Previewing member-library visibility...', async () => {
        const result = await api.previewOneTimeClassMember(classSessionId, oneTimePublishPayloadForClass(classSessionId));
        return result?.preview_visible
            ? `Package #${Number(classSessionId)} is visible for that preview tier.`
            : `Package #${Number(classSessionId)} is hidden for that preview tier.`;
    });
}

async function approveOneTimeClassLibrary(event, classSessionId) {
    await runOneTimeManagerAction(event, 'Approving One Time member-library package...', async () => {
        await api.approveOneTimeClassLibrary(classSessionId, oneTimePublishPayloadForClass(classSessionId));
        return `Approved package #${Number(classSessionId)} for member-library publishing.`;
    });
}

async function publishOneTimeClassLibrary(event, classSessionId) {
    await runOneTimeManagerAction(event, 'Publishing One Time member-library item...', async () => {
        const result = await api.publishOneTimeClassLibrary(classSessionId, oneTimePublishPayloadForClass(classSessionId));
        return `Published member-library item #${Number(result?.item?.id || 0)} from package #${Number(classSessionId)}.`;
    });
}

async function rollbackOneTimeLibraryItem(event, libraryItemId) {
    const form = event?.currentTarget?.closest('form');
    await runOneTimeManagerAction(event, 'Rolling back One Time member-library item...', async () => {
        await api.rollbackOneTimeLibraryItem(libraryItemId, oneTimePayloadFromForm(form));
        return `Rolled back member-library item #${Number(libraryItemId)}.`;
    });
}

async function runOneTimeLibrarySmoke(event) {
    await runOneTimeManagerAction(event, 'Running One Time member-library smoke test...', async () => {
        const approvalFlag = document.getElementById('oneTimeSmokeApprovalFlag')?.value || '';
        const result = await api.runOneTimeLibrarySmoke({ approval_flag: approvalFlag });
        const smoke = result?.smoke || {};
        return `Smoke item #${Number(smoke.library_item_id || 0)} readback ${Number(smoke.visible_before_count || 0)} before rollback and ${Number(smoke.visible_after_count || 0)} after rollback.`;
    });
}

function renderOneTimeLibraryCard(job = {}) {
    const parsed = parseJsonField(job.parse_json) || {};
    const sections = contentParsedSections(job, parsed);
    const displayTitle = contentDisplayTitle(job, parsed, sections);
    const summary = contentDisplaySummary(job, parsed);
    const hostedUrl = contentHostedMediaUrl(job);
    const sourceHref = contentSourceHref(job);
    const blockers = oneTimeLibraryBlockers(job);
    const providerSubmitted = parsed.provider_portal_submission === true || parsed.created_by_action === 'provider_one_time_class_media_intake';
    const providerContext = [
        parsed.submitted_by_provider_name || (providerSubmitted ? 'Rabbi portal' : ''),
        parsed.service_title,
        parsed.session_title,
        parsed.class_date,
    ].filter(Boolean).join(' / ');
    const transcriptBody = String(outputForJob(job, 'transcript_review')?.body || job.transcript_text || '').trim();
    const worksheetBody = String(outputForJob(job, 'worksheet_draft')?.body || '').trim();
    return `
        <div class="content-library-card expanded one-time-library-item" id="one-time-library-item-${Number(job.id)}">
            <div class="content-card-compact">
                <div class="content-card-header">
                    <div class="content-card-main">
                        <div class="event-type">One Time Library Item</div>
                        <div class="content-title-line">
                            <span class="media-pill ${contentMediaType(job)}">${escapeHtml(contentMediaType(job))}</span>
                            <span class="media-pill audio">One Time</span>
                            <span class="media-pill file">${escapeHtml(contentStatusLabel(job))}</span>
                            <h3 style="font-size:16px;">${escapeHtml(displayTitle)}</h3>
                        </div>
                        <div class="content-source-meta">
                            <span>Job #${Number(job.id)}</span>
                            <span>${escapeHtml(formatDateTime(contentUploadedAt(job)))}</span>
                            <span>${hostedUrl ? 'Hosted media ready' : 'Hosted media missing'}</span>
                            ${providerSubmitted ? '<span>Submitted from Rabbi portal</span>' : ''}
                            ${providerContext ? `<span>${escapeHtml(providerContext)}</span>` : ''}
                            <span>${escapeHtml(oneTimeMemberVisibilityState(job))}</span>
                        </div>
                        ${summary ? `<p class="content-card-summary">${escapeHtml(limitTextClient(summary, 280))}</p>` : ''}
                        ${blockers.length ? `<div class="one-time-blocker-list">${blockers.map(blocker => `<span class="one-time-blocker-chip">${escapeHtml(blocker)}</span>`).join('')}</div>` : '<div class="content-topic-chips"><span class="content-topic-chip">No item-level blockers</span></div>'}
                    </div>
                    <div class="content-card-tools">
                        ${hostedUrl ? `<a class="task-action" href="${escapeHtml(hostedUrl)}" target="_blank" rel="noopener">Open Hosted Media</a>` : ''}
                        ${sourceHref && sourceHref !== hostedUrl ? `<a class="task-action" href="${escapeHtml(sourceHref)}" target="_blank" rel="noopener">Open Source</a>` : ''}
                        <button class="task-action" onclick="saveOneTimeHostedMediaUrl(event, ${Number(job.id)})">${hostedUrl ? 'Update Hosted URL' : 'Add Hosted URL'}</button>
                        <button class="task-action" onclick="previewOneTimePublishPackage(event, ${Number(job.id)})">Package Preview</button>
                        <button class="task-action primary" onclick="toggleContentCard(event, ${Number(job.id)})">Open Detail</button>
                    </div>
                </div>
            </div>
            <div class="content-card-expanded">
                <div class="settings-disabled-note">No email, WhatsApp, social post, checkout, external CRM, Drive/video-host write, or member-library publish happens from this screen. Approval here records internal review state only.</div>
                <div class="content-section-grid">
                    <div class="event-card">
                        <div class="event-type">Approval Queue</div>
                        ${renderOneTimeApprovalQueue(job)}
                    </div>
                    <div class="event-card">
                        <div class="event-type">Hosted Media</div>
                        <p class="payment-muted">${escapeHtml(hostedUrl || 'No hosted media URL is saved yet. Add one before attaching local photos/videos or preparing member-library visibility.')}</p>
                        ${job.local_path ? `<p class="payment-muted">Local source: ${escapeHtml(shortContentValue(job.local_path, 100))}</p>` : ''}
                    </div>
                    <div class="event-card">
                        <div class="event-type">Thumbnail Preview</div>
                        ${renderOneTimeThumbnailPreview(job)}
                    </div>
                </div>
                <div class="one-time-output-grid">
                    ${ONE_TIME_LIBRARY_OUTPUT_LANES.map(lane => renderOneTimeOutputState(job, lane)).join('')}
                </div>
                <details class="workflow-details" ${transcriptBody ? 'open' : ''}>
                    <summary>Transcript Review</summary>
                    ${transcriptBody ? `<div class="task-inline-text">${escapeHtml(limitTextClient(transcriptBody, 1800))}</div>` : '<div class="empty-state">Transcript review text is not ready yet.</div>'}
                </details>
                <details class="workflow-details">
                    <summary>Worksheet / Source Sheet</summary>
                    ${worksheetBody ? `<div class="task-inline-text">${escapeHtml(limitTextClient(worksheetBody, 1200))}</div>` : '<div class="empty-state">Worksheet or source-sheet draft is not ready yet.</div>'}
                </details>
            </div>
        </div>
    `;
}

function oneTimeQuestionStatusLabel(status = '') {
    return ({
        needs_review: 'Needs review',
        approved_for_rabbi: 'Rabbi review',
        needs_source_sheet: 'Needs source sheet',
        needs_parent_safe_response: 'Needs parent/member-safe response',
        needs_clarification: 'Needs clarification',
        duplicate_grouped: 'Duplicate grouped',
        rejected_private: 'Rejected/private',
    })[String(status || 'needs_review')] || String(status || 'needs_review').replace(/_/g, ' ');
}

function renderOneTimeQuestionModerationQueue(reviews = []) {
    const rows = Array.isArray(reviews) ? reviews : [];
    const summary = oneTimeQuestionQueueSummary || {};
    const digest = oneTimeQuestionDigestPreview || {};
    const needsReview = Number(summary.needs_review || rows.filter(row => String(row.review_status || '') === 'needs_review').length);
    const sourceSheet = Number(summary.needs_source_sheet || rows.filter(row => String(row.review_status || '') === 'needs_source_sheet').length);
    const response = Number(summary.needs_parent_safe_response || rows.filter(row => String(row.review_status || '') === 'needs_parent_safe_response').length);
    return `
        <section class="one-time-approval-packet" aria-label="One Time private question moderation queue">
            <strong>Private Question Moderation Queue</strong>
            <span>${Number(summary.total || rows.length)} private review item${Number(summary.total || rows.length) === 1 ? '' : 's'}</span>
            <p>One Time questions stay private, no-send, and non-public. This queue is not a forum and does not create member-visible answers.</p>
            <div class="one-time-library-report">
                <div class="one-time-report-card"><strong>${Number(summary.total || rows.length)}</strong><span>Total</span></div>
                <div class="one-time-report-card"><strong>${needsReview}</strong><span>Needs Review</span></div>
                <div class="one-time-report-card"><strong>${sourceSheet}</strong><span>Source Sheet</span></div>
                <div class="one-time-report-card"><strong>${response}</strong><span>Safe Response</span></div>
            </div>
            <div class="settings-disabled-note">Guardrails: no public forum, no member-visible feed, no email, no WhatsApp/SMS, no portal notification, no agent job, and no external CRM write. Reviews still go through the approval-gated <code>review_moderated_question</code> action.</div>
            ${renderOneTimeQuestionDigestPreview(digest)}
            ${rows.length ? `
                <div class="content-section-grid">
                    ${rows.slice(0, 8).map((item) => `
                        <article class="event-card">
                            <div class="event-type">${escapeHtml(oneTimeQuestionStatusLabel(item.review_status))}</div>
                            <div class="content-card-title">${escapeHtml(item.title || item.task_title || 'Private moderated question')}</div>
                            <p class="payment-muted">${escapeHtml(limitTextClient(item.question_preview || '', 220))}</p>
                            <div class="content-source-meta">
                                <span>${escapeHtml(item.submitter_label || 'Private submitter')}</span>
                                ${item.topic ? `<span>${escapeHtml(item.topic)}</span>` : ''}
                                ${item.task_id ? `<span>Task #${Number(item.task_id)}</span>` : ''}
                                <span>${escapeHtml(formatDateTime(item.updated_at || item.created_at))}</span>
                            </div>
                            <div class="content-topic-chips">
                                <span class="content-topic-chip">${item.public_visible ? 'Public visible' : 'Private'}</span>
                                <span class="content-topic-chip">${item.member_visible ? 'Member visible' : 'Member hidden'}</span>
                                <span class="content-topic-chip">${item.no_send === false ? 'Send flag set' : 'No-send'}</span>
                                <span class="content-topic-chip">${item.forum_post_created ? 'Forum post created' : 'No forum post'}</span>
                            </div>
                            <div class="task-actions">
                                ${item.task_id ? `<button class="task-action primary" onclick="openTaskDetail(event, ${Number(item.task_id)})">Open Review Task</button>` : ''}
                            </div>
                        </article>
                    `).join('')}
                </div>
            ` : '<div class="task-empty">No private One Time questions are queued for moderation yet.</div>'}
        </section>
    `;
}

function renderOneTimeQuestionDigestPreview(digest = {}) {
    if (!digest || !Array.isArray(digest.sections)) return '';
    const sections = digest.sections || [];
    const duplicateTopics = Array.isArray(digest.duplicate_topics) ? digest.duplicate_topics : [];
    const nextSteps = Array.isArray(digest.recommended_next_steps) ? digest.recommended_next_steps : [];
    const guardrails = Array.isArray(digest.guardrails) ? digest.guardrails : [];
    return `
        <section class="focus-panel" data-one-time-question-digest-preview style="margin-top:14px;">
            <div class="task-section-header compact">
                <div>
                    <h3>Private Question Digest Preview</h3>
                    <p class="settings-disabled-note">Rabbi-facing review digest only. It groups private questions for triage without creating forum posts, publishing answers, sending notifications, or exposing submitter identities.</p>
                </div>
                <span>No-write</span>
            </div>
            <div class="settings-control-grid">
                ${renderSettingsControlRow('Digest mode', digest.digest_preview ? 'Preview only' : 'Unavailable', 'Read-only summary generated from the private moderation queue.', 'No-write')}
                ${renderSettingsControlRow('Visibility', digest.member_visible ? 'Member visible' : 'Private', 'Digest items stay hidden from members until an explicit future publish/response approval exists.', digest.member_visible ? 'Unsafe' : 'Private')}
                ${renderSettingsControlRow('External writes', digest.external_write_performed ? 'Write detected' : 'None', 'No email, WhatsApp, Telegram, Google, Buffer, billing, WAPI, member-library, portal, or external CRM write runs from this digest.', digest.external_write_performed ? 'Blocked' : 'Locked')}
            </div>
            ${sections.length ? `
                <div class="content-section-grid" style="margin-top:12px;">
                    ${sections.map((section) => `
                        <article class="event-card">
                            <div class="event-type">${escapeHtml(section.label || section.status || 'Review lane')}</div>
                            <div class="content-card-title">${Number(section.count || 0)} item${Number(section.count || 0) === 1 ? '' : 's'}</div>
                            <p class="payment-muted">${escapeHtml(section.next_action || '')}</p>
                            ${(section.items || []).length ? `
                                <ul class="task-decision-list">
                                    ${(section.items || []).map(item => `<li>${escapeHtml(item.topic || 'Question')} ${item.task_id ? `(task #${Number(item.task_id)})` : ''}${item.question_preview ? ` - ${escapeHtml(limitTextClient(item.question_preview, 120))}` : ''}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </article>
                    `).join('')}
                </div>
            ` : '<div class="task-empty">No digest lanes are active yet.</div>'}
            ${duplicateTopics.length ? `
                <div class="settings-control-grid" style="margin-top:12px;">
                    ${renderSettingsControlRow('Duplicate grouping candidates', `${duplicateTopics.length} topic${duplicateTopics.length === 1 ? '' : 's'}`, duplicateTopics.map(item => `${item.topic} (${item.count})`).join('; '), 'Review')}
                </div>
            ` : ''}
            <div class="settings-control-grid" style="margin-top:12px;">
                ${nextSteps.map((step, index) => renderSettingsControlRow(`Next step ${index + 1}`, 'Manual review', step, 'Private')).join('')}
                ${guardrails.slice(0, 3).map((guardrail, index) => renderSettingsControlRow(`Guardrail ${index + 1}`, 'Locked', guardrail, 'No-write')).join('')}
            </div>
        </section>
    `;
}

function oneTimeSelectOptions(options = [], selected = '') {
    return options.map((option) => `<option value="${escapeHtml(option)}" ${String(option) === String(selected || '') ? 'selected' : ''}>${escapeHtml(option.replace(/_/g, ' '))}</option>`).join('');
}

function oneTimeInputDateValue(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toISOString().slice(0, 10);
}

function renderOneTimeClassManagerPanel(classes = []) {
    const publishedCount = classes.filter((item) => (item.library_items || []).some((libraryItem) => libraryItem.publish_status === 'published')).length;
    return `
        <section class="one-time-approval-packet" aria-label="One Time class package manager">
            <strong>Class Package Manager</strong>
            <span>${classes.length} packages | ${publishedCount} published</span>
            ${oneTimeClassManagerNotice ? `<div class="settings-disabled-note">${escapeHtml(oneTimeClassManagerNotice)}</div>` : ''}
            <form class="settings-grid" onsubmit="createOneTimeClassPackage(event)">
                <label>Title<input name="title" required placeholder="Class title"></label>
                <label>Date<input name="class_date" type="date"></label>
                <label>Media provider<select name="media_provider">${oneTimeSelectOptions(ONE_TIME_CLASS_MEDIA_PROVIDERS, 'manual_url')}</select></label>
                <label>Vimeo/manual hosted URL<input name="media_url" placeholder="https://"></label>
                <label>Masechta<input name="masechta" placeholder="Berachos"></label>
                <label>Perek<input name="perek" placeholder="1"></label>
                <label>Mishnah range<input name="mishnah_range" placeholder="1-3"></label>
                <label>Duration seconds<input name="duration_seconds" type="number" min="0" step="1" placeholder="3600"></label>
                <label>Thumbnail URL<input name="thumbnail_url" placeholder="https://"></label>
                <label>Transcript status<select name="transcript_status">${oneTimeSelectOptions(ONE_TIME_TRANSCRIPT_STATUSES, 'draft')}</select></label>
                <label>Description<textarea name="description" rows="3"></textarea></label>
                <label>Source sheet draft<textarea name="source_sheet_draft" rows="3"></textarea></label>
                <div class="task-actions">
                    <button class="task-action primary" type="submit">Add Class</button>
                    <button class="task-action" type="button" data-action-id="ACTION-ONETIME-MEMBER-LIBRARY-SMOKE" onclick="runOneTimeLibrarySmoke(event)">Run Verification</button>
                    <input id="oneTimeSmokeApprovalFlag" placeholder="${ONE_TIME_MEMBER_LIBRARY_APPROVAL_FLAG}" style="min-width: 320px;">
                </div>
            </form>
            ${classes.length ? `<div class="content-list">${classes.map(renderOneTimeClassPackageCard).join('')}</div>` : '<div class="task-empty">No class packages yet.</div>'}
        </section>
    `;
}

function renderOneTimeClassPackageCard(item = {}) {
    const id = Number(item.id || 0);
    const assets = item.assets || [];
    const libraryItems = item.library_items || [];
    const publishedItem = libraryItems.find((libraryItem) => libraryItem.publish_status === 'published') || null;
    const latestItem = libraryItems[0] || publishedItem;
    const eventPreview = (item.publish_events || []).slice(0, 3);
    return `
        <article class="content-card one-time-class-package" data-class-session-id="${id}">
            <div class="content-card-header">
                <div>
                    <strong>${escapeHtml(item.title || 'Untitled class')}</strong>
                    <p>${escapeHtml(item.description || item.summary || '')}</p>
                </div>
                <div class="content-status-stack">
                    <span class="content-topic-chip">${escapeHtml(item.package_status || 'draft')}</span>
                    <span class="content-topic-chip">${escapeHtml(item.media_provider || 'manual_url')}</span>
                    ${item.masechta ? `<span class="content-topic-chip">${escapeHtml(item.masechta)} ${escapeHtml(item.perek || '')}${item.mishnah_range ? `:${escapeHtml(item.mishnah_range)}` : ''}</span>` : ''}
                    ${item.duration_seconds ? `<span class="content-topic-chip">${Math.round(Number(item.duration_seconds) / 60)} min</span>` : ''}
                    ${publishedItem ? '<span class="content-topic-chip">member visible</span>' : '<span class="content-topic-chip">member hidden</span>'}
                </div>
            </div>
            <form id="oneTimeClassForm-${id}" class="settings-grid" onsubmit="saveOneTimeClassPackage(event, ${id})">
                <label>Title<input name="title" value="${escapeHtml(item.title || '')}" required></label>
                <label>Date<input name="class_date" type="date" value="${escapeHtml(oneTimeInputDateValue(item.class_date))}"></label>
                <label>Status<select name="package_status">${oneTimeSelectOptions(ONE_TIME_CLASS_PACKAGE_STATUSES, item.package_status || 'draft')}</select></label>
                <label>Transcript<select name="transcript_status">${oneTimeSelectOptions(ONE_TIME_TRANSCRIPT_STATUSES, item.transcript_status || 'draft')}</select></label>
                <label>Provider<select name="media_provider">${oneTimeSelectOptions(ONE_TIME_CLASS_MEDIA_PROVIDERS, item.media_provider || 'manual_url')}</select></label>
                <label>Vimeo/manual hosted URL<input name="media_url" value="${escapeHtml(item.media_url || '')}" placeholder="https://"></label>
                <label>Vimeo ID<input name="vimeo_id" value="${escapeHtml(item.vimeo_id || '')}"></label>
                <label>Masechta<input name="masechta" value="${escapeHtml(item.masechta || '')}" placeholder="Berachos"></label>
                <label>Perek<input name="perek" value="${escapeHtml(item.perek || '')}" placeholder="1"></label>
                <label>Mishnah range<input name="mishnah_range" value="${escapeHtml(item.mishnah_range || '')}" placeholder="1-3"></label>
                <label>Duration seconds<input name="duration_seconds" type="number" min="0" step="1" value="${escapeHtml(item.duration_seconds || '')}"></label>
                <label>Thumbnail URL<input name="thumbnail_url" value="${escapeHtml(item.thumbnail_url || '')}" placeholder="https://"></label>
                <label>Description<textarea name="description" rows="3">${escapeHtml(item.description || '')}</textarea></label>
                <label>Transcript notes<textarea name="transcript_notes" rows="3">${escapeHtml(item.transcript_notes || '')}</textarea></label>
                <label>Source sheet draft<textarea name="source_sheet_draft" rows="4">${escapeHtml(item.source_sheet_draft || '')}</textarea></label>
                <div class="task-actions">
                    <button class="task-action primary" type="submit">Save / Attach Vimeo Video</button>
                    <button class="task-action" type="button" data-action-id="ACTION-ONETIME-CLASS-PACKAGE-PREVIEW" onclick="previewOneTimeClassPackage(event, ${id})">Preview Upload</button>
                </div>
            </form>
            <form id="oneTimeAssetForm-${id}" class="settings-grid" onsubmit="addOneTimeClassAsset(event, ${id})">
                <label>Asset type<select name="asset_type">${oneTimeSelectOptions(ONE_TIME_CLASS_ASSET_TYPES, 'source_sheet')}</select></label>
                <label>Asset title<input name="title" placeholder="Worksheet or source sheet"></label>
                <label>Linked asset URL<input name="file_url" placeholder="https://"></label>
                <label>Status<select name="status">${oneTimeSelectOptions(['draft', 'review', 'approved'], 'draft')}</select></label>
                <label>Description<textarea name="description" rows="2"></textarea></label>
                <div class="task-actions">
                    <button class="task-action" type="submit">Attach Source Asset</button>
                </div>
            </form>
            ${assets.length ? `
                <div class="content-topic-row">
                    ${assets.map((asset) => `
                        <span class="content-topic-chip">${escapeHtml(asset.asset_type || 'asset')}: ${escapeHtml(asset.title || 'Untitled')} (${escapeHtml(asset.status || 'draft')})</span>
                    `).join('')}
                </div>
            ` : '<p class="payment-muted">No linked assets yet.</p>'}
            <form id="oneTimePublishForm-${id}" class="settings-grid" onsubmit="publishOneTimeClassLibrary(event, ${id})">
                <input type="hidden" name="destination" value="member_library">
                <label>Visibility<select name="library_visibility">${oneTimeSelectOptions(ONE_TIME_LIBRARY_VISIBILITIES, 'tier')}</select></label>
                <label>Audience tier<select name="required_tier">${oneTimeSelectOptions(ONE_TIME_LIBRARY_TIERS, 'library_only')}</select></label>
                <label>Approval phrase<input name="approval_flag" placeholder="${ONE_TIME_MEMBER_LIBRARY_APPROVAL_FLAG}"></label>
                <label>Rollback note<input name="reason" placeholder="Reason"></label>
                <div class="task-actions">
                    <button class="task-action" type="button" data-action-id="ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW" onclick="previewOneTimeClassMember(event, ${id})">Member Preview</button>
                    <button class="task-action" type="button" data-action-id="ACTION-ONETIME-MEMBER-LIBRARY-APPROVE" onclick="approveOneTimeClassLibrary(event, ${id})">Approve</button>
                    <button class="task-action primary" type="submit" data-action-id="ACTION-ONETIME-MEMBER-LIBRARY-PUBLISH">Publish</button>
                    ${latestItem ? `<button class="task-action danger" type="button" data-action-id="ACTION-ONETIME-MEMBER-LIBRARY-ROLLBACK" onclick="rollbackOneTimeLibraryItem(event, ${Number(latestItem.id)})">Unpublish / Restore Latest</button>` : ''}
                    <a class="task-action" href="/member-library" target="_blank" rel="noopener">Open Library</a>
                </div>
            </form>
            ${libraryItems.length ? `
                <div class="content-topic-row">
                    ${libraryItems.slice(0, 4).map((libraryItem) => `
                        <span class="content-topic-chip">#${Number(libraryItem.id)} ${escapeHtml(libraryItem.publish_status)} ${escapeHtml(libraryItem.required_tier || '')}</span>
                    `).join('')}
                </div>
            ` : ''}
            ${eventPreview.length ? `
                <div class="payment-muted">${eventPreview.map((event) => `${escapeHtml(event.action)} by ${escapeHtml(event.actor || 'dashboard')}`).join(' | ')}</div>
            ` : ''}
        </article>
    `;
}

function oneTimeClassroomPanelData() {
    return oneTimeClassroom || {
        curriculum: [],
        classes: [],
        assignments: [],
        calendar_items: [],
        threads: [],
        leaderboard: [],
        top_questions: [],
        participation_events: []
    };
}

function oneTimeClassroomCurriculumOptions(selectedId = '') {
    const units = oneTimeClassroomPanelData().curriculum || [];
    return ['<option value="">Curriculum unit</option>'].concat(units.map(unit => {
        const id = String(unit.id || '');
        return `<option value="${escapeHtml(id)}" ${String(selectedId || '') === id ? 'selected' : ''}>${escapeHtml(unit.title || unit.unit_key || 'Unit')}</option>`;
    })).join('');
}

function oneTimeClassroomClassOptions(selectedId = '') {
    const classes = (oneTimeClassroomPanelData().classes || []).length ? oneTimeClassroomPanelData().classes : (oneTimeClasses || []);
    return ['<option value="">Video / class session</option>'].concat(classes.map(item => {
        const id = String(item.id || '');
        const label = [item.title || `Class ${id}`, item.class_date || ''].filter(Boolean).join(' - ');
        return `<option value="${escapeHtml(id)}" ${String(selectedId || '') === id ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    })).join('');
}

function oneTimeClassroomModerationMessages() {
    return (oneTimeClassroomPanelData().threads || []).flatMap(thread => (thread.messages || [])
        .filter(message => String(message.moderation_status || '').toLowerCase() !== 'approved')
        .map(message => ({ ...message, thread_title: thread.title, thread_id: thread.id })));
}

function renderOneTimeClassroomPreview(preview = oneTimeClassroomPreview) {
    if (!preview) return '<div class="task-empty">No schedule preview yet.</div>';
    const sessions = preview.schedule_plan?.sessions || [];
    return `
        <div class="content-topic-row">
            <span class="content-topic-chip">${escapeHtml(preview.sync_mode || 'app_only')}</span>
            <span class="content-topic-chip">Google writes: ${preview.google_writes_enabled ? 'enabled' : 'off'}</span>
            <span class="content-topic-chip">${preview.needs_review ? 'Review suggested' : 'Ready'}</span>
        </div>
        <div class="content-list" style="margin-top:10px;">
            ${sessions.length ? sessions.slice(0, 4).map(session => `
                <article class="content-card">
                    <div class="content-card-title">${escapeHtml(session.display_label || session.label || preview.title || 'Classroom schedule')}</div>
                    <div class="content-card-meta">${escapeHtml([session.start_at || 'start pending', session.end_at || 'end pending', session.timezone || 'Asia/Jerusalem'].filter(Boolean).join(' / '))}</div>
                </article>
            `).join('') : '<div class="task-empty">The parser did not find a concrete date yet.</div>'}
        </div>
    `;
}

function renderOneTimeClassroomAdminPanel(classroom = oneTimeClassroomPanelData()) {
    const curriculum = classroom.curriculum || [];
    const classes = classroom.classes || [];
    const calendarItems = classroom.calendar_items || [];
    const threads = classroom.threads || [];
    const heldMessages = oneTimeClassroomModerationMessages();
    const scheduleDraft = oneTimeClassroomScheduleDraft || {};
    const threadDraft = oneTimeClassroomThreadDraft || {};
    return `
        <section class="one-time-approval-packet" data-one-time-classroom-admin aria-label="One Time classroom console">
            <div class="task-section-header">
                <div>
                    <strong>One Time Classroom Console</strong>
                    <span>Rabbi-led Mishnah classroom, internal calendar, moderated responses, approved leaderboard, and source-grounded bot policy.</span>
                </div>
                <a class="task-action" href="/one-time-classroom" target="_blank" rel="noopener">Open Classroom</a>
            </div>
            ${oneTimeClassroomNotice ? `<div class="success-banner">${escapeHtml(oneTimeClassroomNotice)}</div>` : ''}
            <div class="classroom-board-metrics" style="margin-top:12px;">
                ${renderClassroomMetric(curriculum.length, 'Sedarim')}
                ${renderClassroomMetric(classes.length, 'Videos')}
                ${renderClassroomMetric(calendarItems.length, 'Calendar items')}
                ${renderClassroomMetric(heldMessages.length, 'Held responses')}
                ${renderClassroomMetric((classroom.leaderboard || []).length, 'Leaderboard rows')}
            </div>
            <div class="settings-control-grid compact" style="margin-top:12px;" data-rabbi-classroom-reply-publish-rules data-community-classroom-mobile-layout>
                ${renderSettingsControlRow('Class list', `${classes.length} classes/videos`, 'Class sessions and videos stay grouped by Seder and classroom schedule.', 'Visible')}
                ${renderSettingsControlRow('Student/member list', `${(classroom.leaderboard || []).length} participation rows`, 'Member/student participation is summarized without opening an unmoderated forum.', 'Visible')}
                ${renderSettingsControlRow('Teacher posts', `${threads.length} Rabbi/admin threads`, 'Rabbi/admin prompts, announcements, and source discussions are teacher-led.', 'Teacher controlled')}
                ${renderSettingsControlRow('Student questions/replies', `${heldMessages.length} held responses`, 'Students can reply privately to Rabbi/admin threads; replies are not member-visible until reviewed.', 'Private first')}
                ${renderSettingsControlRow('No student-student chat', 'Off unless enabled', 'The default One Time classroom does not allow open student-to-student chat.', 'Policy')}
                ${renderSettingsControlRow('Display / publish controls', 'Approve / Feature / Parent Hold / Reject', 'Rabbi or provider admin chooses which replies/questions publish to the public/community display.', 'Moderated')}
            </div>
            <div class="content-list" style="margin-top:12px;">
                <article class="content-card">
                    <div class="content-card-title">Natural-language video assignment</div>
                    <form id="oneTimeClassroomAssignmentForm" class="classroom-material-form" onsubmit="previewOneTimeClassroomAssignment(event)">
                        <div class="form-grid">
                            <label>Plain English schedule
                                <textarea name="natural_language_text" placeholder="assign Berachos video 3 next Tuesday, due Thursday">${escapeHtml(scheduleDraft.natural_language_text || '')}</textarea>
                            </label>
                            <label>Assignment title
                                <input name="title" value="${escapeHtml(scheduleDraft.title || '')}" placeholder="Optional title">
                            </label>
                            <label>Video
                                <select name="class_session_id">${oneTimeClassroomClassOptions(scheduleDraft.class_session_id || '')}</select>
                            </label>
                            <label>Seder
                                <select name="curriculum_unit_id">${oneTimeClassroomCurriculumOptions(scheduleDraft.curriculum_unit_id || '')}</select>
                            </label>
                            <label>Duration minutes
                                <input name="duration_minutes" type="number" min="5" max="240" value="${escapeHtml(scheduleDraft.duration_minutes || 30)}">
                            </label>
                            <label>Visibility
                                <select name="classroom_visibility">
                                    ${['members', 'students_parents', 'students', 'parents', 'staff_only', 'hidden'].map(value => `<option value="${value}" ${(scheduleDraft.classroom_visibility || 'members') === value ? 'selected' : ''}>${escapeHtml(value.replace(/_/g, ' '))}</option>`).join('')}
                                </select>
                            </label>
                        </div>
                        <label>Instructions
                            <textarea name="instructions" placeholder="Optional assignment notes">${escapeHtml(scheduleDraft.instructions || '')}</textarea>
                        </label>
                        <div class="task-actions">
                            <button class="task-action" type="submit">Preview</button>
                            <button class="task-action primary" type="button" aria-label="Add Session" onclick="createOneTimeClassroomAssignment(event)">Create Internal Calendar Item</button>
                        </div>
                    </form>
                    ${renderOneTimeClassroomPreview()}
                </article>
                <article class="content-card">
                    <div class="content-card-title">Rabbi thread</div>
                    <form id="oneTimeClassroomThreadForm" class="classroom-material-form" onsubmit="createOneTimeClassroomThread(event)">
                        <div class="form-grid">
                            <label>Title
                                <input name="title" value="${escapeHtml(threadDraft.title || '')}" placeholder="Thread title">
                            </label>
                            <label>Type
                                <select name="thread_type">
                                    ${['announcement', 'video_thread', 'top_question', 'daily_video', 'source_discussion'].map(value => `<option value="${value}" ${(threadDraft.thread_type || 'announcement') === value ? 'selected' : ''}>${escapeHtml(value.replace(/_/g, ' '))}</option>`).join('')}
                                </select>
                            </label>
                            <label>Video
                                <select name="class_session_id">${oneTimeClassroomClassOptions(threadDraft.class_session_id || '')}</select>
                            </label>
                            <label>Seder
                                <select name="curriculum_unit_id">${oneTimeClassroomCurriculumOptions(threadDraft.curriculum_unit_id || '')}</select>
                            </label>
                        </div>
                        <label>Public Rabbi/admin prompt
                            <textarea name="body" placeholder="Question, announcement, or source prompt">${escapeHtml(threadDraft.body || '')}</textarea>
                        </label>
                        <label class="checkbox-row"><input name="leaderboard_eligible" type="checkbox" ${threadDraft.leaderboard_eligible ? 'checked' : ''}> Eligible for top Q&A / leaderboard</label>
                        <button class="task-action primary" type="submit">Post Rabbi Thread</button>
                    </form>
                </article>
            </div>
            <div class="content-list" style="margin-top:12px;">
                <article class="content-card">
                    <div class="content-card-title">Moderation review</div>
                    ${heldMessages.length ? heldMessages.slice(0, 8).map(message => `
                        <div class="content-review-row">
                            <div>
                                <strong>${escapeHtml(message.author_name || 'Classroom member')}</strong>
                                <div class="content-card-meta">${escapeHtml([message.thread_title || 'Thread', message.moderation_status || 'needs_review', message.parent_escalation_status || 'none'].join(' / '))}</div>
                                <p class="event-meta">${escapeHtml(limitTextClient(message.body || message.body_preview || '', 220))}</p>
                            </div>
                            <div class="task-actions">
                                <button class="task-action primary" type="button" onclick="reviewOneTimeClassroomMessage(event, ${Number(message.id)}, 'approved')">Approve</button>
                                <button class="task-action" type="button" onclick="reviewOneTimeClassroomMessage(event, ${Number(message.id)}, 'approved', true)">Feature</button>
                                <button class="task-action" type="button" onclick="reviewOneTimeClassroomMessage(event, ${Number(message.id)}, 'held_for_parent_review')">Parent Hold</button>
                                <button class="task-action danger" type="button" onclick="reviewOneTimeClassroomMessage(event, ${Number(message.id)}, 'rejected_private')">Reject</button>
                            </div>
                        </div>
                    `).join('') : '<div class="task-empty">No held classroom responses.</div>'}
                </article>
                <article class="content-card">
                    <div class="content-card-title">Top classroom signals</div>
                    ${(classroom.top_questions || []).length ? (classroom.top_questions || []).slice(0, 5).map(item => `
                        <div class="content-review-row">
                            <div>
                                <strong>${escapeHtml(item.thread_title || 'Approved question')}</strong>
                                <p class="event-meta">${escapeHtml(limitTextClient(item.body_preview || '', 180))}</p>
                            </div>
                        </div>
                    `).join('') : '<div class="task-empty">Approved questions and featured responses will appear here.</div>'}
                </article>
            </div>
        </section>
    `;
}

function readOneTimeClassroomAssignmentForm() {
    const form = document.getElementById('oneTimeClassroomAssignmentForm');
    if (!form) return {};
    const payload = {
        natural_language_text: form.elements.natural_language_text?.value?.trim() || '',
        title: form.elements.title?.value?.trim() || '',
        class_session_id: form.elements.class_session_id?.value || '',
        curriculum_unit_id: form.elements.curriculum_unit_id?.value || '',
        duration_minutes: Number(form.elements.duration_minutes?.value || 30),
        classroom_visibility: form.elements.classroom_visibility?.value || 'members',
        instructions: form.elements.instructions?.value?.trim() || ''
    };
    oneTimeClassroomScheduleDraft = payload;
    return payload;
}

async function previewOneTimeClassroomAssignment(event) {
    if (event) event.preventDefault();
    const payload = readOneTimeClassroomAssignmentForm();
    oneTimeClassroomNotice = 'Previewing classroom schedule...';
    render();
    try {
        const result = await api.previewOneTimeClassroomAssignment(payload);
        oneTimeClassroomPreview = result.preview || null;
        oneTimeClassroomNotice = 'Schedule preview ready. No Google or external write was performed.';
    } catch (error) {
        oneTimeClassroomNotice = error.message || 'Schedule preview failed.';
    }
    render();
}

async function createOneTimeClassroomAssignment(event) {
    if (event) event.preventDefault();
    const payload = readOneTimeClassroomAssignmentForm();
    oneTimeClassroomNotice = 'Creating internal classroom assignment...';
    render();
    try {
        const result = await api.createOneTimeClassroomAssignment(payload);
        oneTimeClassroomPreview = result.preview || null;
        oneTimeClassroomScheduleDraft = {};
        oneTimeClassroomNotice = 'Internal assignment and calendar item created. Google/Classroom writes stayed off.';
        await loadData({ background: true });
    } catch (error) {
        oneTimeClassroomNotice = error.message || 'Classroom assignment failed.';
        render();
    }
}

function readOneTimeClassroomThreadForm() {
    const form = document.getElementById('oneTimeClassroomThreadForm');
    if (!form) return {};
    const payload = {
        title: form.elements.title?.value?.trim() || '',
        thread_type: form.elements.thread_type?.value || 'announcement',
        class_session_id: form.elements.class_session_id?.value || '',
        curriculum_unit_id: form.elements.curriculum_unit_id?.value || '',
        body: form.elements.body?.value?.trim() || '',
        leaderboard_eligible: Boolean(form.elements.leaderboard_eligible?.checked)
    };
    oneTimeClassroomThreadDraft = payload;
    return payload;
}

async function createOneTimeClassroomThread(event) {
    if (event) event.preventDefault();
    const payload = readOneTimeClassroomThreadForm();
    oneTimeClassroomNotice = 'Posting Rabbi thread...';
    render();
    try {
        await api.createOneTimeClassroomThread(payload);
        oneTimeClassroomThreadDraft = {};
        oneTimeClassroomNotice = 'Rabbi thread posted for the classroom.';
        await loadData({ background: true });
    } catch (error) {
        oneTimeClassroomNotice = error.message || 'Thread creation failed.';
        render();
    }
}

async function reviewOneTimeClassroomMessage(event, messageId, status, featured = false) {
    if (event) event.preventDefault();
    oneTimeClassroomNotice = 'Saving moderation decision...';
    render();
    try {
        await api.reviewOneTimeClassroomMessage(messageId, {
            moderation_status: status,
            leaderboard_eligible: status === 'approved',
            featured
        });
        oneTimeClassroomNotice = featured ? 'Response approved and featured.' : `Response moved to ${String(status).replace(/_/g, ' ')}.`;
        await loadData({ background: true });
    } catch (error) {
        oneTimeClassroomNotice = error.message || 'Moderation update failed.';
        render();
    }
}

function oneTimeClassroomAssignments() {
    return (assignments || []).filter(assignment => assignmentProjectKey(assignment) === 'one_time_mishnah_class'
        || /one time|mishnah|mishna|rabbi elie|scheller|sheller/i.test(`${assignment.title || ''} ${assignment.instructions || ''} ${assignment.material_url || ''}`));
}

function renderOneTimeClassroomHandoffPanel(classes = []) {
    const classroomItems = oneTimeClassroomAssignments();
    const reviewedContentJobs = (contentJobs || []).filter(contentIsOneTimeLibraryItem);
    const sourceSheetCount = reviewedContentJobs.filter(job => (job.outputs || []).some(output => ['worksheet_draft', 'transcript_review'].includes(output.output_type))).length;
    const pendingQuestions = (oneTimeQuestionQueue || []).filter(item => String(item.status || '').toLowerCase() !== 'approved').length;
    const readyForBufferDraft = reviewedContentJobs.filter(job => (job.outputs || []).some(output => ['facebook_post', 'linkedin_post', 'youtube_description', 'social_copy_plan'].includes(output.output_type))).length;
    return `
        <section class="one-time-approval-packet" data-one-time-classroom-flow aria-label="Rabbi One Time local classroom flow">
            <strong>Local One Time Classroom</strong>
            <span>Rabbi Elie Scheller / One Time uses the same first-party classroom and content pipeline: class sessions, assignments/materials, source sheets, worksheets, recordings, questions, and content outputs.</span>
            <div class="classroom-policy-chips" style="margin-top:8px;">
                <span>Content parsing enabled</span>
                <span>Buffer draft-only</span>
                <span>No auto-publish</span>
                <span>No Resend or mass email required</span>
            </div>
            <div class="classroom-board-metrics" style="margin-top:12px;">
                ${renderClassroomMetric(classes.length, 'Class packages')}
                ${renderClassroomMetric(classroomItems.length, 'Classroom items')}
                ${renderClassroomMetric(sourceSheetCount, 'Worksheets / source sheets')}
                ${renderClassroomMetric(pendingQuestions, 'Questions in review')}
            </div>
            <div class="settings-disabled-note" style="margin-top:12px;">
                Member-library publishing, public Q&A, notifications, rewards, and leaderboards stay behind the approval gates already created. Social output can be committed only as a Buffer draft after exact source, channel, copy, hosted media URL if any, and rollback/no-post details are approved.
            </div>
            <div class="content-topic-row">
                <span class="content-topic-chip">Approved social candidates: ${Number(readyForBufferDraft || 0)}</span>
                <span class="content-topic-chip">Google Classroom sync: optional preview only</span>
                <span class="content-topic-chip">Email: manual/current Gmail-style path</span>
            </div>
            ${classroomItems.length ? `
                <div class="content-list" style="margin-top:12px;">
                    ${classroomItems.slice(0, 4).map(item => `
                        <article class="content-card">
                            <div class="content-card-title">${escapeHtml(item.title || 'Classroom material')}</div>
                            <div class="content-card-meta">${escapeHtml([item.status || 'draft', item.worksheet_type || 'worksheet', assignmentMaterialHref(item) ? 'material linked' : 'material pending'].join(' / '))}</div>
                            <p class="event-meta">${escapeHtml(limitTextClient(item.instructions || item.schedule_text || 'First-party classroom item scoped to One Time.', 180))}</p>
                        </article>
                    `).join('')}
                </div>
            ` : '<div class="task-empty">No One Time classroom assignments/materials are loaded yet. Use reviewed recordings and class packages here first; roster-linked assignments can be added once the scoped participant roster is ready.</div>'}
        </section>
    `;
}

function oneTimeRecordingVimeoPipelineState(jobs = [], classes = []) {
    const classList = Array.isArray(classes) ? classes : [];
    const jobList = Array.isArray(jobs) ? jobs : [];
    const transcriptReady = classList.filter(item => String(item.transcript_status || '').toLowerCase() === 'approved' || String(item.transcript_text || '').trim()).length
        + jobList.filter(job => String(job.transcript_text || '').trim()).length;
    const summaryReady = classList.filter(item => String(item.summary || '').trim()).length
        + jobList.filter(job => String(job.summary || '').trim()).length;
    const vimeoReady = classList.filter(item => String(item.vimeo_id || item.media_url || '').match(/vimeo|^\d{5,}$/i)).length;
    const publicationReady = classList.filter(item => ['approved', 'published'].includes(String(item.package_status || '').toLowerCase())).length;
    return {
        requirementId: 'REQ-20260619-308',
        summary: {
            classPackages: classList.length,
            contentJobs: jobList.length,
            transcriptReady,
            summaryReady,
            vimeoReady,
            publicationReady,
        },
        sections: [
            ['Recording webhook handling', 'Local contract', 'Provider recording events can be normalized only as previews; no live webhook is accepted.'],
            ['Recording file selection', 'Preview ready', 'Multiple recording files, preferred layout selection, and audio-only fallback are modeled locally.'],
            ['Transcript and summary', transcriptReady && summaryReady ? 'Review ready' : 'Needs source text', 'Transcript and summary must be saved before publication approval.'],
            ['Retry and dead letter', 'Local contract', 'Retry, dead-letter, and idempotency keys are defined without mutating provider or member-library state.'],
            ['Review and correction', 'Local contract', 'Rabbi/operator correction, approval, and rejection states are internal review states only.'],
            ['Manual/API Vimeo modes', 'Manual ready', 'Manual Vimeo URL attachment and first-party member-library publishing are usable with the approval phrase; API upload remains disabled pending owner token, plan, quota, folder, privacy, embed domains, and upload smoke approval.'],
            ['Publish, unpublish, delete', 'Approval gated', 'Never publish directly from a webhook; first-party publish/unpublish uses the Class Package Manager and explicit approval phrase while provider deletion remains blocked.'],
            ['Entitlement and watch progress', 'Publish ready / progress blocked', 'Member visibility is enabled only after approved first-party publication; watch-progress writes stay future-scoped.'],
        ],
        automatedUploadSetup: [
            'authenticated Vimeo user',
            'account owner',
            'plan',
            'upload scope',
            'upload capability',
            'storage/quota',
            'folder',
            'privacy default',
            'allowed embed domains',
            'callback URL',
            'token state',
            'last verification',
        ],
    };
}

function renderOneTimeRecordingVimeoReadinessPanel(jobs = [], classes = []) {
    const state = oneTimeRecordingVimeoPipelineState(jobs, classes);
    return `
        <section class="one-time-approval-packet" data-one-time-recording-vimeo-readiness data-requirement-id="${escapeHtml(state.requirementId)}" aria-label="One Time recording Vimeo readiness">
            <strong>Recording / Vimeo Pipeline</strong>
            <span>${escapeHtml(state.requirementId)} / manual mode ready, automated upload disabled</span>
            <p>Manual Vimeo URL attachment and approval-gated first-party member-library publish run through the Class Package Manager. No provider webhook, recording fetch, Vimeo upload, provider publish, provider unpublish, provider delete, watch-progress write, notification send, or external portal publish runs from this panel.</p>
            <div class="classroom-board-metrics">
                ${renderClassroomMetric(state.summary.classPackages, 'Class packages')}
                ${renderClassroomMetric(state.summary.transcriptReady, 'Transcripts')}
                ${renderClassroomMetric(state.summary.summaryReady, 'Summaries')}
                ${renderClassroomMetric(state.summary.vimeoReady, 'Vimeo refs')}
            </div>
            <div class="task-actions" style="margin:10px 0 12px;">
                <button class="task-action" type="button" onclick="openBnaHelperWithPrompt('Create the One Time Vimeo upload setup task. Include authenticated Vimeo user, account owner, plan, upload scope/capability, storage/quota, folder, privacy default, allowed embed domains, callback URL, token state, idempotent upload job, retry policy, playback verification, and no real upload without explicit authorization.')">Preview Upload setup</button>
                <button class="task-action" type="button" onclick="openBnaHelperWithPrompt('Create the One Time recording retry/dead-letter setup task. Include source recording ID, transcript/summary state, idempotency key, retry reason, rollback path, audit log, and confirmation that no publish or delete occurs from retry.')">Retry setup</button>
            </div>
            <div class="content-topic-row" aria-label="Automated Vimeo upload setup blockers">
                ${state.automatedUploadSetup.map(item => `<span class="content-topic-chip">${escapeHtml(item)}</span>`).join('')}
            </div>
            <div class="one-time-output-grid">
                ${state.sections.map(([title, status, body]) => `
                    <article class="one-time-output-state ${status === 'Blocked' ? 'blocked' : ''}">
                        <strong>${escapeHtml(title)}</strong>
                        <span>${escapeHtml(status)}</span>
                        <p>${escapeHtml(body)}</p>
                    </article>
                `).join('')}
            </div>
        </section>
    `;
}

function oneTimeTranscriptPrivacyReadinessState(jobs = [], classes = []) {
    const classList = Array.isArray(classes) ? classes : [];
    const jobList = Array.isArray(jobs) ? jobs : [];
    const sources = [...classList, ...jobList];
    const normalizeState = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const privacyClasses = ['provider_general', 'cohort_general', 'student_private', 'parent_visible', 'staff_private', 'excluded', 'needs_review'];
    const approvedStates = ['approved', 'rabbi_approved', 'published'];
    const transcriptSources = sources.filter(item => String(item.transcript_text || item.transcript || '').trim());
    const normalizedSources = sources.filter(item => String(item.transcript_notes || item.summary || item.normalized_text || '').trim());
    const approvedSources = sources.filter(item => approvedStates.includes(normalizeState(item.transcript_status || item.package_status || item.review_state)));
    const segmentList = sources.flatMap(item => Array.isArray(item.transcript_segments) ? item.transcript_segments : []);
    const guessedSpeakerBlocks = segmentList.filter(segment => ['speaker_label', 'guessed_speaker_label', 'voice_guess', 'llm_guess', 'name_mentioned'].includes(normalizeState(segment.match_method || segment.matchMethod))).length;
    const privacyCounts = privacyClasses.reduce((acc, key) => {
        acc[key] = sources.filter(item => normalizeState(item.privacy_class || item.transcript_privacy_class || '') === key).length;
        return acc;
    }, {});
    const reviewNeeded = sources.filter(item => {
        const reviewState = normalizeState(item.transcript_status || item.package_status || item.review_state);
        const privacyClass = normalizeState(item.privacy_class || item.transcript_privacy_class || 'needs_review');
        return !approvedStates.includes(reviewState) || privacyClass === 'needs_review';
    }).length;
    return {
        requirementId: 'REQ-20260619-309',
        summary: {
            sources: sources.length,
            rawTranscriptSignals: transcriptSources.length,
            normalizedSignals: normalizedSources.length,
            approvedSignals: approvedSources.length,
            reviewNeeded,
            guessedSpeakerBlocks,
            privacyCounts,
        },
        sections: [
            ['Transcript versions', 'Local contract', 'Raw, normalized, corrected, and Rabbi-approved versions are tracked as states; raw bodies are not rendered here.'],
            ['Segments, speakers, confidence', 'Implemented', 'Timestamped segment, speaker label, speaker confidence, match method, student match, and match confidence fields are modeled for review.'],
            ['Privacy classes', 'Local contract', 'provider_general, cohort_general, student_private, parent_visible, staff_private, excluded, and needs_review are explicit classes.'],
            ['Student matching and review', reviewNeeded || guessedSpeakerBlocks ? 'Needs review' : 'Review ready', 'Uncertain student matches require enrollment context, accepted match method, confidence threshold, and manual review; guessed speaker labels are never student data.'],
            ['Retrieval boundaries', 'Preview ready', 'Student and parent views can only resolve their own approved private segments; cross-student retrieval stays blocked.'],
            ['Public helper guardrails', 'Preview ready', 'Public helper context can use only reviewed safe snippets, never raw unreviewed transcript dumps.'],
            ['Audit and release', 'Live smoke ready', 'Read-only production smoke verifies no raw body, no guessed student mapping, and no cross-student retrieval without external writes.'],
        ],
    };
}

function renderOneTimeTranscriptPrivacyReadinessPanel(jobs = [], classes = []) {
    const state = oneTimeTranscriptPrivacyReadinessState(jobs, classes);
    return `
        <section class="one-time-approval-packet" data-one-time-transcript-privacy-readiness data-requirement-id="${escapeHtml(state.requirementId)}" aria-label="One Time transcript privacy readiness">
            <strong>Transcript Privacy / Knowledge Scope</strong>
            <span>${escapeHtml(state.requirementId)} / no-write readiness</span>
            <p>No raw unreviewed transcript, staff-private note, student-private segment, guessed speaker identity, cross-student question/feedback, or public helper raw transcript dump is exposed by this panel.</p>
            <div class="classroom-board-metrics">
                ${renderClassroomMetric(state.summary.sources, 'Sources')}
                ${renderClassroomMetric(state.summary.rawTranscriptSignals, 'Transcript refs')}
                ${renderClassroomMetric(state.summary.approvedSignals, 'Approved')}
                ${renderClassroomMetric(state.summary.reviewNeeded, 'Need review')}
                ${renderClassroomMetric(state.summary.guessedSpeakerBlocks, 'Guess blocks')}
            </div>
            <div class="content-topic-row" aria-label="Transcript privacy classes">
                ${Object.entries(state.summary.privacyCounts).map(([key, value]) => `
                    <span class="content-topic-chip">${escapeHtml(key)}: ${escapeHtml(value)}</span>
                `).join('')}
            </div>
            <div class="one-time-output-grid">
                ${state.sections.map(([title, status, body]) => `
                    <article class="one-time-output-state ${status === 'Blocked' ? 'blocked' : ''}">
                        <strong>${escapeHtml(title)}</strong>
                        <span>${escapeHtml(status)}</span>
                        <p>${escapeHtml(body)}</p>
                    </article>
                `).join('')}
            </div>
        </section>
    `;
}

function oneTimeCommunityModerationReadinessState(classroom = oneTimeClassroomPanelData()) {
    const threads = Array.isArray(classroom.threads) ? classroom.threads : [];
    const messages = threads.flatMap(thread => (thread.messages || []).map(message => ({ ...message, thread_type: thread.thread_type, thread_title: thread.title })));
    const normalizeState = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const pending = messages.filter(message => ['needs_review', 'held_for_parent_review', 'temporary_hold_pending_admin', 'held_for_safety_review'].includes(normalizeState(message.moderation_status || message.private_to_public_state)));
    const parentHolds = messages.filter(message => message.parent_visible_safety || normalizeState(message.parent_escalation_status) === 'flagged');
    const reportFlags = messages.filter(message => {
        const flags = message.ai_moderation?.flags || message.report_flags || message.metadata?.report_flags || [];
        return Array.isArray(flags) ? flags.length : Boolean(flags);
    });
    const staffOnly = messages.filter(message => normalizeState(message.visibility_decision || message.visibility) === 'staff_only');
    const publicAnonymized = messages.filter(message => normalizeState(message.visibility_decision || message.private_to_public_state) === 'public_anonymized' || normalizeState(message.private_to_public_state) === 'approved_anonymized_public');
    return {
        requirementId: 'REQ-20260619-311',
        summary: {
            threads: threads.length,
            announcements: threads.filter(thread => normalizeState(thread.thread_type) === 'announcement').length,
            cohortDiscussions: threads.filter(thread => ['cohort_discussion', 'source_discussion', 'video_thread', 'daily_video', 'top_question'].includes(normalizeState(thread.thread_type))).length,
            privateQuestions: pending.length,
            parentHolds: parentHolds.length,
            staffOnly: staffOnly.length,
            reportFlags: reportFlags.length,
            publicAnonymized: publicAnonymized.length,
        },
        sections: [
            ['Rabbi announcements', 'Teacher controlled', 'Rabbi/admin announcements stay as teacher-led threads, not participant broadcasts.'],
            ['Cohort discussions', 'Moderated', 'Approved discussion is cohort/member scoped and still requires review before visibility changes.'],
            ['Private questions', pending.length ? 'Needs review' : 'Implemented private-first', 'Student/member questions submit privately and remain hidden until Rabbi/admin review.'],
            ['Parent-visible communication', parentHolds.length ? 'Safety holds present' : 'Guarded', 'Safety flags can move an item to parent hold without exposing it to the cohort.'],
            ['Staff-only notes', 'Guarded', 'Staff-only visibility is modeled separately from parent, cohort, and public surfaces.'],
            ['Moderated posting', 'Guarded', 'Unreviewed posts, temporary holds, and flagged items cannot auto-publish.'],
            ['Edit and deletion history', 'Implemented', 'Original, edited, published, anonymized, edit-history, and deletion-history fields are required for review traceability.'],
            ['Report / flag flow', reportFlags.length ? 'Flags present' : 'Implemented guarded', 'Contact info, direct-chat requests, unsafe language, and private identifiers stay in the moderation queue.'],
            ['Private-to-public workflow', 'Implemented preview-only', 'Student submits privately, Rabbi/moderator reviews, reviewer edits or anonymizes, visibility is selected, and original/published versions remain linked.'],
            ['Private-to-public anonymization', publicAnonymized.length ? 'Reviewed previews' : 'Implemented preview-only', 'Public promotion requires an edited anonymized version, stores original/published versions, and blocks identifying private data.'],
            ['No unrestricted messaging', 'Policy', 'No unrestricted student-to-student private messaging is enabled.'],
            ['Audit and release', 'Live smoke ready', 'Read-only production smoke is safe; public/member publication writes, notifications, and deletion purge still require a separate approval path.'],
        ],
    };
}

function renderOneTimeCommunityModerationReadinessPanel(classroom = oneTimeClassroomPanelData()) {
    const state = oneTimeCommunityModerationReadinessState(classroom);
    return `
        <section class="one-time-approval-packet" data-one-time-community-moderation-readiness data-requirement-id="${escapeHtml(state.requirementId)}" aria-label="One Time community moderation readiness">
            <strong>Community / Moderation Workflow</strong>
            <span>${escapeHtml(state.requirementId)} / implemented no-write readiness</span>
            <p>No unrestricted student-to-student messaging, public/member-visible post publication, external notification, temporary-hold enforcement, delete purge, or anonymized public promotion write runs from this panel. The private-to-public workflow is implemented as a linked-version, anonymized preview path.</p>
            <div class="classroom-board-metrics">
                ${renderClassroomMetric(state.summary.threads, 'Threads')}
                ${renderClassroomMetric(state.summary.privateQuestions, 'Private queue')}
                ${renderClassroomMetric(state.summary.parentHolds, 'Parent holds')}
                ${renderClassroomMetric(state.summary.reportFlags, 'Flags')}
            </div>
            <div class="content-topic-row" aria-label="Community moderation counts">
                <span class="content-topic-chip">Announcements: ${escapeHtml(state.summary.announcements)}</span>
                <span class="content-topic-chip">Cohort discussions: ${escapeHtml(state.summary.cohortDiscussions)}</span>
                <span class="content-topic-chip">Staff-only: ${escapeHtml(state.summary.staffOnly)}</span>
                <span class="content-topic-chip">Public anonymized: ${escapeHtml(state.summary.publicAnonymized)}</span>
            </div>
            <div class="one-time-output-grid">
                ${state.sections.map(([title, status, body]) => `
                    <article class="one-time-output-state ${status === 'Blocked' ? 'blocked' : ''}">
                        <strong>${escapeHtml(title)}</strong>
                        <span>${escapeHtml(status)}</span>
                        <p>${escapeHtml(body)}</p>
                    </article>
                `).join('')}
            </div>
        </section>
    `;
}

function oneTimeStudyAssistantReadinessState(jobs = [], classes = []) {
    const normalizeState = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const classSources = (Array.isArray(classes) ? classes : []).flatMap(cls => (Array.isArray(cls.sources) ? cls.sources : []).map(source => ({
        ...source,
        source_bucket: 'class',
        retrieval_scope: source.retrieval_scope || source.scope || 'cohort',
        review_state: source.review_state || cls.package_status || 'needs_review',
    })));
    const jobSources = (Array.isArray(jobs) ? jobs : []).flatMap(job => {
        const links = Array.isArray(job.source_links) ? job.source_links : (Array.isArray(job.sources) ? job.sources : []);
        return links.map(source => ({
            ...source,
            source_bucket: 'content_job',
            retrieval_scope: source.retrieval_scope || source.scope || 'provider_wide',
            review_state: source.review_state || job.status || 'needs_review',
        }));
    });
    const sources = [...classSources, ...jobSources];
    const missingMetadata = sources.filter(source => {
        const required = [
            source.canonical_reference || source.ref || source.reference,
            source.title,
            source.index_title || source.indexTitle || source.index || source.book,
            source.version_title || source.versionTitle || source.version,
            source.language || source.lang,
            source.license,
            source.attribution,
            source.source_url || source.sourceUrl || source.url,
            source.retrieved_at || source.retrievedAt,
            source.content_hash || source.contentHash || source.hash,
            source.rabbi_approval_status || source.review_state || source.reviewState,
            source.quote_permission || source.quotePermission,
            source.summary_permission || source.summaryPermission,
            source.index_permission || source.indexPermission,
        ];
        return required.some(item => !String(item || '').trim());
    });
    const approved = sources.filter(source => ['rabbi_approved', 'approved', 'published'].includes(normalizeState(source.rabbi_approval_status || source.review_state || source.status)));
    const licenseReviewed = sources.filter(source => source.license_reviewed || normalizeState(source.rabbi_approval_status || source.review_state) === 'license_reviewed' || normalizeState(source.rabbi_approval_status || source.review_state) === 'rabbi_approved');
    const citationVerified = sources.filter(source => source.citation_verified || normalizeState(source.rabbi_approval_status || source.review_state) === 'citation_verified' || normalizeState(source.rabbi_approval_status || source.review_state) === 'rabbi_approved');
    const scopeCount = scope => sources.filter(source => normalizeState(source.retrieval_scope || source.scope) === scope).length;
    return {
        requirementId: 'REQ-20260619-312',
        summary: {
            sources: sources.length,
            missingMetadata: missingMetadata.length,
            approved: approved.length,
            licenseReviewed: licenseReviewed.length,
            citationVerified: citationVerified.length,
            providerWide: scopeCount('provider_wide'),
            cohort: scopeCount('cohort'),
            studentPrivate: scopeCount('student_private'),
            restricted: scopeCount('restricted'),
        },
        sections: [
            ['Source-version model', 'Implemented', 'Canonical reference, version, language, license, attribution, source URL, retrieved timestamp, content hash, Rabbi approval, and quote/summary/index permissions are required.'],
            ['Provider-wide retrieval', 'Implemented preview', 'Approved recordings, transcripts, summaries, handouts, and Sefaria source metadata can be scoped provider-wide after review.'],
            ['Cohort retrieval', 'Implemented preview', 'Class curriculum, recordings, summaries, discussions, and sources require matching cohort context.'],
            ['Student-private retrieval', 'Guarded', 'Student questions, feedback, assignments, progress, attendance, badges, and approved student transcript segments stay scoped to the matching student.'],
            ['Restricted sources', 'Blocked by policy', 'Another student information, raw transcripts, staff notes, moderation metadata, and family-private material are blocked.'],
            ['Licensing and citation review', 'Implemented gate', 'Licensing, citation verification, scoped retrieval tests, transcript review, privacy tests, and Rabbi approval must pass before launch.'],
            ['Disabled feature flag', 'Disabled by policy', 'The study assistant and unrestricted AI chat remain off; this panel does not generate answers.'],
            ['No arbitrary versions', 'Guarded', 'Only approved source-version metadata may appear in retrieval previews; arbitrary versions and raw text ingestion stay disabled.'],
            ['Audit and release', 'Live smoke ready', 'Read-only production smoke is safe while Sefaria/API ingestion, source corpus mutation, portal publishing, and answer generation stay disabled.'],
        ],
    };
}

function renderOneTimeStudyAssistantReadinessPanel(jobs = [], classes = []) {
    const state = oneTimeStudyAssistantReadinessState(jobs, classes);
    return `
        <section class="one-time-approval-packet" data-one-time-study-assistant-readiness data-requirement-id="${escapeHtml(state.requirementId)}" aria-label="One Time Sefaria and study assistant readiness">
            <strong>Sefaria / Study Assistant Readiness</strong>
            <span>${escapeHtml(state.requirementId)} / implemented disabled-feature foundation</span>
            <p>No unrestricted AI chat, Sefaria/API ingestion, arbitrary translation merge, arbitrary version ingestion, source corpus mutation, raw transcript retrieval, cross-student retrieval, portal publish, or answer generation runs from this panel.</p>
            <div class="classroom-board-metrics">
                ${renderClassroomMetric(state.summary.sources, 'Sources')}
                ${renderClassroomMetric(state.summary.missingMetadata, 'Need metadata')}
                ${renderClassroomMetric(state.summary.approved, 'Rabbi approved')}
                ${renderClassroomMetric(state.summary.citationVerified, 'Citations')}
            </div>
            <div class="content-topic-row" aria-label="Study assistant source scopes">
                <span class="content-topic-chip">Provider-wide: ${escapeHtml(state.summary.providerWide)}</span>
                <span class="content-topic-chip">Cohort: ${escapeHtml(state.summary.cohort)}</span>
                <span class="content-topic-chip">Student-private: ${escapeHtml(state.summary.studentPrivate)}</span>
                <span class="content-topic-chip">Restricted: ${escapeHtml(state.summary.restricted)}</span>
                <span class="content-topic-chip">License reviewed: ${escapeHtml(state.summary.licenseReviewed)}</span>
            </div>
            <div class="one-time-output-grid">
                ${state.sections.map(([title, status, body]) => `
                    <article class="one-time-output-state ${status === 'Blocked' ? 'blocked' : ''}">
                        <strong>${escapeHtml(title)}</strong>
                        <span>${escapeHtml(status)}</span>
                        <p>${escapeHtml(body)}</p>
                    </article>
                `).join('')}
            </div>
        </section>
    `;
}

function renderOneTimeContentLibraryPanel(jobs = [], allJobs = [], questionQueue = [], classes = []) {
    const reportJobs = allJobs.length ? allJobs : jobs;
    return `
        <div class="one-time-library-panel" aria-label="One Time content library workspace">
            ${renderOneTimeLibraryReport(reportJobs)}
            <div class="settings-disabled-note">One Time library items stay scoped to <code>one_time_mishnah_class</code>. Hosted URLs, Vimeo/manual media URLs, transcripts, worksheet/source-sheet drafts, social plans, and newsletter plans stay first-party BNA records.</div>
            <div class="settings-disabled-note">No email, WhatsApp, social post, checkout, external CRM, Drive/video-host write, or member-library publish happens from this screen without the Class Package Manager and exact approval phrase. Approval here records internal review state only for the legacy output review lanes.</div>
            ${renderOneTimeRecordingVimeoReadinessPanel(reportJobs, classes)}
            ${renderOneTimeTranscriptPrivacyReadinessPanel(reportJobs, classes)}
            ${renderOneTimeCommunityModerationReadinessPanel(oneTimeClassroomPanelData())}
            ${renderOneTimeStudyAssistantReadinessPanel(reportJobs, classes)}
            ${renderOneTimeClassroomAdminPanel(oneTimeClassroomPanelData())}
            ${renderOneTimeClassroomHandoffPanel(classes)}
            ${renderOneTimeClassManagerPanel(classes)}
            ${renderOneTimeQuestionModerationQueue(questionQueue)}
            ${renderOneTimePublishingApprovalPacket(reportJobs)}
            <div class="one-time-lane-grid">
                ${ONE_TIME_LIBRARY_OUTPUT_LANES.map(lane => renderOneTimeOutputLane(lane, reportJobs)).join('')}
            </div>
            ${jobs.length
                ? `<div class="content-list">${jobs.map(renderOneTimeLibraryCard).join('')}</div>`
                : '<div class="task-empty">No One Time video library items match these filters yet. Use the One Time video-library helper to create scoped review records first.</div>'}
        </div>
    `;
}

function renderOneTimePublishingApprovalPacket(jobs = []) {
    const stats = oneTimeLibraryStats(jobs);
    const cards = [
        ['Member-library destination', 'Needs approval', 'Confirm where approved videos live, who can see them, and whether the destination is BNA-hosted, Rabbi-owned, Vimeo, Drive, Replit, or another app.'],
        ['Visibility and audience rules', 'Needs approval', 'Define eligible One Time members, preview/admin-only states, paid/free access, and private-question/source sensitivity before any member visibility.'],
        ['Hosted media provider', `${Number(stats.hostedReady || 0)} ready`, 'Choose hosted media URL policy, upload/rollback owner, thumbnail policy, and whether Drive/video-host writes are allowed.'],
        ['Notification and social channels', 'No-send until approved', 'Approve channel, copy, recipient/source list, Buffer/social scheduling, newsletter, WhatsApp, and rollback/no-send path separately.'],
        ['Confirmation phrase', 'Required for live publishing', 'Use APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING only after destination, visibility, hosting, copy, verification item, and rollback are approved.'],
        ['Verification proof', 'Not run yet', 'Use one approved test item, verify destination readback, verify no publish-now behavior without separate approval, and record rollback/takedown evidence.'],
    ];
    return `
        <section class="one-time-approval-packet" aria-label="One Time publishing approval packet">
            <strong>One Time Publishing Approval Packet</strong>
            <span>Readiness checklist</span>
            <p>No Buffer/social, email, WhatsApp, Drive/video-host, checkout, member visibility, or external CRM write runs from this packet.</p>
            <div class="one-time-output-grid">
                ${cards.map(([title, status, body]) => `
                    <article class="one-time-output-state blocked">
                        <strong>${escapeHtml(title)}</strong>
                        <span>${escapeHtml(status)}</span>
                        <p>${escapeHtml(body)}</p>
                    </article>
                `).join('')}
            </div>
            <div class="task-actions">
                <button class="task-action primary" type="button" onclick="previewApprovalDecisionDraft(event, 'one_time_member_library')">Preview Decision Draft</button>
                <button class="task-action" type="button" onclick="copyText(event, 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING')">Copy Phrase</button>
            </div>
            <p class="payment-muted">Preview Decision Draft logs a local <code>create_decision</code> dry-run only. It creates no decision task and performs no publishing, send, checkout, member visibility, Drive/video-host, Buffer/social, or external CRM write.</p>
        </section>
    `;
}

function classSessionItems(value) {
    const parsed = typeof value === 'string' ? parseJsonField(value) : value;
    return asList(parsed || value);
}

function classSessionResearchSections(session = {}) {
    const topics = uniqueEnglishList(classSessionItems(session.topics), 14);
    const discussions = uniqueEnglishList(classSessionItems(session.discussions), 14);
    const studentQuestions = uniqueEnglishList(classSessionItems(session.student_questions), 14);
    const sources = uniqueSourceList(classSessionItems(session.sources), 14);
    const highlights = uniqueEnglishList(classSessionItems(session.highlights), 10);
    const sourceableTopics = uniqueEnglishList([
        ...topics,
        ...discussions,
        ...studentQuestions,
        ...sources,
        ...highlights,
    ], 18);
    return {
        topics,
        discussions,
        studentQuestions,
        sources,
        highlights,
        sourceableTopics,
    };
}

function contentSessionHasResearchMaterial(session = {}) {
    const sections = classSessionResearchSections(session);
    return Boolean(
        String(session.summary || session.transcript_text || '').trim()
        || sections.topics.length
        || sections.discussions.length
        || sections.studentQuestions.length
        || sections.sources.length
        || sections.highlights.length
    );
}

function contentClassSessionForJob(job = {}) {
    const jobId = Number(job.id || 0);
    if (!jobId) return null;
    return (classSessions || []).find(session => Number(session.content_job_id || session.content_job?.id || 0) === jobId) || null;
}

function contentResearchSectionsForJob(job = {}, parsedSections = {}, session = null) {
    const sessionSections = session ? classSessionResearchSections(session) : {
        topics: [],
        discussions: [],
        studentQuestions: [],
        sources: [],
        highlights: [],
        sourceableTopics: [],
    };
    const topics = uniqueEnglishList([
        ...asList(sessionSections.topics),
        ...asList(parsedSections.topics),
    ], 14);
    const discussions = uniqueEnglishList([
        ...asList(sessionSections.discussions),
        ...asList(parsedSections.discussions),
    ], 14);
    const studentQuestions = uniqueEnglishList([
        ...asList(sessionSections.studentQuestions),
        ...asList(parsedSections.studentQuestions),
    ], 14);
    const sources = uniqueSourceList([
        ...asList(sessionSections.sources),
        ...asList(parsedSections.sources),
    ], 14);
    const highlights = uniqueEnglishList([
        ...asList(sessionSections.highlights),
        ...asList(parsedSections.highlights),
    ], 10);
    const sourceableTopics = uniqueEnglishList([
        ...studentQuestions,
        ...topics,
        ...discussions,
        ...sources,
        ...highlights,
    ], 22);
    return {
        topics,
        discussions,
        studentQuestions,
        sources,
        highlights,
        sourceableTopics,
        session,
    };
}

function sefariaSearchUrl(value) {
    const query = String(value || '').replace(/\s+/g, ' ').trim();
    return query ? `https://www.sefaria.org/search?q=${encodeURIComponent(query)}` : '';
}

function directSefariaUrl(value) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    const existing = text.match(/https:\/\/www\.sefaria\.org\/[^\s)]+/i);
    if (existing) return existing[0];
    if (!/\b(genesis|exodus|leviticus|numbers|deuteronomy|berakhot|shabbat|eruvin|pesachim|yoma|sukkah|rosh hashanah|taanit|megillah|ketubot|bava|baba|sanhedrin|makkot|avot|mishnah|rambam|mishneh torah|shulchan aruch|mishnah berurah|rashi|onkelos|orchos tzadikim|tanakh|midrash|zohar)\b/i.test(text)) {
        return '';
    }
    if (!/\d/.test(text) && text.length > 70) return '';
    return `https://www.sefaria.org/${encodeURIComponent(text).replace(/%20/g, '_')}`;
}

function renderResearchLinkedList(label, items = [], options = {}) {
    const cleanedItems = options.allowSources ? uniqueSourceList(items, 10) : uniqueEnglishList(items, 10);
    if (!cleanedItems.length) return '';
    return `
        <div class="event-card">
            <div class="event-type">${escapeHtml(label)}</div>
            <ul class="content-section-list" style="color: #cbd5e1; font-size: 13px;">
                ${cleanedItems.map((item) => {
                    const directUrl = options.allowSources ? directSefariaUrl(item) : '';
                    const searchUrl = sefariaSearchUrl(item);
                    return `
                        <li>
                            <span>${escapeHtml(item)}</span>
                            <div class="content-source-meta" style="margin-top:4px;">
                                ${directUrl ? `<a href="${escapeHtml(directUrl)}" target="_blank" rel="noopener noreferrer" style="color:#93c5fd;">Open Sefaria ref</a>` : ''}
                                ${searchUrl ? `<a href="${escapeHtml(searchUrl)}" target="_blank" rel="noopener noreferrer" style="color:#93c5fd;">Sefaria search</a>` : ''}
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>
        </div>
    `;
}

function renderContentCardResearchBlock(job = {}, research = {}) {
    const hasResearch = research.sourceableTopics?.length
        || research.studentQuestions?.length
        || research.sources?.length
        || research.discussions?.length
        || research.topics?.length;
    const session = research.session || null;
    return `
        <div class="event-card">
            <div class="event-type">Research / Source Links</div>
            <div class="content-source-meta">
                <span>${research.studentQuestions?.length || 0} student question${research.studentQuestions?.length === 1 ? '' : 's'}</span>
                <span>${research.sourceableTopics?.length || 0} sourceable item${research.sourceableTopics?.length === 1 ? '' : 's'}</span>
                <span>${research.sources?.length || 0} mentioned source${research.sources?.length === 1 ? '' : 's'}</span>
                ${session?.id ? `<span>Class session #${Number(session.id)}</span>` : ''}
            </div>
            <p style="margin-top:8px;color:#94a3b8;font-size:12px;">
                Student questions and class topics stay in Content. Operational tasks and decisions are filed separately; use the source-sheet action when a researched worksheet/source map still needs Codex work.
            </p>
            ${hasResearch ? `
                <div class="content-section-grid" style="margin-bottom:0;">
                    ${renderResearchLinkedList('Student Questions', research.studentQuestions)}
                    ${renderResearchLinkedList('Topics / Analysis', research.sourceableTopics)}
                    ${renderResearchLinkedList('Sources Mentioned', research.sources, { allowSources: true })}
                </div>
            ` : `<p class="payment-muted" style="margin-top:8px;">No parsed class research is attached yet. The source-sheet action can still create a Codex task from the transcript.</p>`}
            <div class="task-actions" style="margin-top:12px;">
                <button class="task-action primary" onclick="createContentJobSourceSheetResearchTask(event, ${Number(job.id || 0)}, ${Number(session?.id || 0)})">Create Student Source Sheet Task</button>
            </div>
        </div>
    `;
}

function sortClassSessions(a = {}, b = {}) {
    return Date.parse(b.class_date || b.created_at || b.updated_at || 0) - Date.parse(a.class_date || a.created_at || a.updated_at || 0);
}

function contentSessionTitle(session = {}) {
    const job = session.content_job || {};
    const candidates = [session.title, job.title, session.summary, job.caption];
    for (const candidate of candidates) {
        const title = englishContentLine(candidate);
        if (title && title.length <= 150) return title;
    }
    return `Class session #${session.id}`;
}

function renderResearchList(label, items, emptyText = '') {
    if (!items.length && !emptyText) return '';
    return `
        <div class="event-card">
            <div class="event-type">${escapeHtml(label)}</div>
            ${items.length ? `
                <ul class="content-section-list" style="color: #cbd5e1; font-size: 13px;">
                    ${items.map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
                </ul>
            ` : `<p class="payment-muted">${escapeHtml(emptyText)}</p>`}
        </div>
    `;
}

function compactText(text, limit = 180) {
    const value = String(text || '').replace(/\s+/g, ' ').trim();
    if (!value) return '';
    return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
}

function renderContentResearchPanel(sessions = []) {
    if (!sessions.length) {
        return `
            <div class="task-empty">
                No parsed research is ready yet. Once uploaded recordings are parsed into class sessions, their topics and sources will appear here for source-sheet and public-bibliography work.
            </div>
        `;
    }
    return `
        <div class="content-list">
            ${sessions.map(session => renderContentResearchCard(session)).join('')}
        </div>
    `;
}

function renderContentResearchCard(session = {}) {
    const job = session.content_job || {};
    const sections = classSessionResearchSections(session);
    const title = contentSessionTitle(session);
    const project = contentProject(job);
    const sourceCount = sections.sources.length;
    const sourceableCount = sections.sourceableTopics.length;
    const canCreateTask = Boolean(job.id);
    return `
        <div class="content-library-card expanded">
            <div class="content-card-compact">
                <div class="content-card-header">
                    <div class="content-card-main">
                        <div class="event-type">Class Research</div>
                        <div class="content-title-line">
                            <span class="media-pill ${project === 'mishna' ? 'audio' : 'file'}">${escapeHtml(project === 'mishna' ? 'One Time' : 'BNA')}</span>
                            <h3 style="font-size: 16px;">${escapeHtml(title)}</h3>
                        </div>
                        <div class="content-source-meta">
                            <span>${escapeHtml(session.class_date || formatDateTime(session.created_at))}</span>
                            <span>${sourceableCount} sourceable topic${sourceableCount === 1 ? '' : 's'}</span>
                            <span>${sourceCount} mentioned source${sourceCount === 1 ? '' : 's'}</span>
                        </div>
                    </div>
                    <div class="content-card-tools">
                        ${job.media_url || session.source_media_url ? `<a href="${escapeHtml(job.media_url || session.source_media_url)}" target="_blank" rel="noopener" style="color:#93c5fd; font-size:12px;">Open source</a>` : ''}
                        <button class="task-action primary" onclick="createSourceSheetResearchTask(event, ${Number(session.id)})" ${canCreateTask ? '' : 'disabled'}>Create Student Source Sheet Task</button>
                        <button class="task-action" onclick="createPublicBibliographyTask(event, ${Number(session.id)})" ${canCreateTask ? '' : 'disabled'}>Create Public Bibliography Task</button>
                    </div>
                </div>
            </div>
            <div class="content-card-expanded">
                ${session.summary ? `<div class="event-card"><div class="event-type">Summary</div><p style="color:#cbd5e1; font-size:13px;">${escapeHtml(englishContentLine(session.summary) || session.summary)}</p></div>` : ''}
                <div class="content-section-grid">
                    ${renderResearchList('Sourceable Topics', sections.sourceableTopics, 'No topics have been parsed yet.')}
                    ${renderResearchList('Topics Discussed', sections.topics)}
                    ${renderResearchList('Questions / Discussions', [...sections.discussions, ...sections.studentQuestions])}
                    ${renderResearchList('Sources Mentioned', sections.sources, 'No explicit sources were parsed yet; the task should still source the topics.')}
                    ${renderResearchList('Highlights', sections.highlights)}
                </div>
            </div>
        </div>
    `;
}

function meetingForContentJob(jobId) {
    return (projectMeetings || []).find(meeting => Number(meeting.content_job_id || meeting.content_job?.id || 0) === Number(jobId)) || null;
}

function meetingDecisionItems(meeting = {}) {
    const decisions = Array.isArray(meeting.decisions) ? meeting.decisions : asList(meeting.decisions);
    return decisions.filter(Boolean);
}

function renderMeetingDecisionList(meeting = {}) {
    const decisions = meetingDecisionItems(meeting);
    if (!decisions.length) return '<p class="payment-muted">No decision list saved yet.</p>';
    return `
        <div class="meeting-decision-list">
            ${decisions.map(decision => `
                <div class="meeting-decision">
                    <div>
                        <strong>${escapeHtml(decision.title || decision.key || 'Decision')}</strong>
                        <span>${escapeHtml(decision.owner || 'Owner not set')} / ${escapeHtml(String(decision.status || 'needs_decision').replace(/_/g, ' '))}</span>
                    </div>
                    ${Array.isArray(decision.options) && decision.options.length ? `
                        <ul>
                            ${decision.options.slice(0, 3).map(option => `<li>${escapeHtml(option)}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function renderMeetingCandidateCard(job = {}) {
    const existingMeeting = meetingForContentJob(job.id);
    const transcriptChars = String(job.transcript_text || '').length;
    const project = contentProject(job);
    return `
        <div class="meeting-candidate-row">
            <div class="meeting-candidate-main">
                <div class="event-type">${existingMeeting ? 'Structured Meeting' : 'Meeting Candidate'}</div>
                <div class="event-title">${escapeHtml(job.title || `Content job #${job.id}`)}</div>
                <div class="content-source-meta">
                    <span>Job #${Number(job.id)}</span>
                    <span>${escapeHtml(contentMediaType(job))}</span>
                    <span>${escapeHtml(project === 'mishna' ? 'One Time' : 'BNA')}</span>
                    <span>${escapeHtml(contentStatusLabel(job))}</span>
                    <span>${transcriptChars.toLocaleString()} transcript chars</span>
                    <span>${escapeHtml(formatDateTime(contentUploadedAt(job)))}</span>
                </div>
                ${job.caption ? `<p class="payment-muted">${escapeHtml(compactText(job.caption, 180))}</p>` : ''}
            </div>
            <div class="meeting-candidate-actions">
                ${job.media_url ? `<a href="${escapeHtml(job.media_url)}" target="_blank" rel="noopener">Open source</a>` : ''}
                <button class="task-action primary" onclick="structureOneTimeMeeting(event, ${Number(job.id)})">
                    ${existingMeeting ? 'Refresh Meeting Summary' : 'Structure as One Time Meeting'}
                </button>
            </div>
        </div>
    `;
}

function renderStructuredMeetingCard(meeting = {}) {
    const taskIds = Array.isArray(meeting.extracted_task_ids) ? meeting.extracted_task_ids : asList(meeting.extracted_task_ids);
    const sourceJob = meeting.content_job || {};
    return `
        <div class="content-library-card expanded meeting-summary-card">
            <div class="content-card-compact">
                <div class="content-card-header">
                    <div class="content-card-main">
                        <div class="event-type">${escapeHtml(String(meeting.status || 'structured').replace(/_/g, ' '))}</div>
                        <div class="content-title-line">
                            <span class="media-pill audio">One Time</span>
                            <h3 style="font-size:16px;">${escapeHtml(meeting.title || `Meeting #${meeting.id}`)}</h3>
                        </div>
                        <div class="content-source-meta">
                            <span>Meeting #${Number(meeting.id)}</span>
                            ${meeting.content_job_id ? `<span>Content job #${Number(meeting.content_job_id)}</span>` : ''}
                            <span>${escapeHtml(formatDateTime(meeting.updated_at || meeting.created_at))}</span>
                            ${taskIds.length ? `<span>${taskIds.length} linked task${taskIds.length === 1 ? '' : 's'}</span>` : ''}
                        </div>
                    </div>
                    <div class="content-card-tools">
                        ${meeting.source_media_url || sourceJob.media_url ? `<a href="${escapeHtml(meeting.source_media_url || sourceJob.media_url)}" target="_blank" rel="noopener" style="color:#93c5fd; font-size:12px;">Open source</a>` : ''}
                        ${taskIds.length ? `<button class="task-action" onclick="switchView('tasks')">Open Tasks</button>` : ''}
                    </div>
                </div>
            </div>
            <div class="content-card-expanded">
                <div class="event-card">
                    <div class="event-type">Summary</div>
                    <p style="color:#cbd5e1; font-size:13px; white-space:pre-wrap;">${escapeHtml(meeting.summary || 'Summary is not ready yet.')}</p>
                </div>
                <div class="event-card">
                    <div class="event-type">Decisions</div>
                    ${renderMeetingDecisionList(meeting)}
                </div>
                ${taskIds.length ? `
                    <div class="event-card">
                        <div class="event-type">Linked Tasks</div>
                        <div class="content-bulk-selected">
                            ${taskIds.map(id => `<span class="example-chip">#${escapeHtml(String(id))}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderContentMeetingDropsPanel(candidates = [], meetings = []) {
    const sortedMeetings = meetings
        .filter(meeting => contentProject(meeting.content_job || { project_key: meeting.project_key, title: meeting.title }) === 'mishna')
        .sort((a, b) => Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0));
    const latestCandidate = candidates[0] || null;
    return `
        <div class="meeting-drop-panel" data-one-time-rabbi-module="classes_content">
            <div class="meeting-drop-hero">
                <div>
                    <div class="event-type">Rabbi Meeting Intake</div>
                    <h3>${latestCandidate ? escapeHtml(latestCandidate.title || `Content job #${latestCandidate.id}`) : 'No meeting drop detected yet'}</h3>
                    <p>${latestCandidate ? `Latest candidate: job #${Number(latestCandidate.id)}, uploaded ${escapeHtml(formatDateTime(contentUploadedAt(latestCandidate)))}` : 'Drop meeting audio into Drive Raw Intake, then structure it here when the transcript is ready.'}</p>
                </div>
                <div class="task-actions" style="margin-top:0;">
                    <button class="task-action" data-action-id="ACTION-ONETIME-DRIVE-BRIEF-PREVIEW" data-preview-one-time-drive-brief onclick="previewLatestOneTimeDriveBrief(event)" ${oneTimeDriveBriefPreviewBusy ? 'disabled' : ''}>${oneTimeDriveBriefPreviewBusy ? 'Previewing...' : 'Preview Drive Brief'}</button>
                    ${latestCandidate ? `<button class="task-action primary" onclick="structureOneTimeMeeting(event, ${Number(latestCandidate.id)})">Structure Latest</button>` : ''}
                </div>
            </div>
            ${renderOneTimeDriveBriefPreviewPanel()}
            <div class="meeting-drop-grid">
                <section class="meeting-drop-list">
                    <div class="content-bulk-header">
                        <div>
                            <div class="event-type">Candidates</div>
                            <h3 style="font-size:16px;">Drive voice notes and meeting recordings</h3>
                        </div>
                    </div>
                    ${candidates.length
                        ? candidates.slice(0, 12).map(renderMeetingCandidateCard).join('')
                        : '<div class="task-empty">No One Time / Rabbi meeting candidates are visible in content jobs yet.</div>'}
                </section>
                <section class="meeting-drop-list">
                    <div class="content-bulk-header">
                        <div>
                            <div class="event-type">Structured</div>
                            <h3 style="font-size:16px;">Summaries, decisions, and linked tasks</h3>
                        </div>
                    </div>
                    ${sortedMeetings.length
                        ? sortedMeetings.map(renderStructuredMeetingCard).join('')
                        : '<div class="task-empty">No structured One Time meetings yet. Structure a candidate to create the summary and decision tasks.</div>'}
                </section>
            </div>
        </div>
    `;
}

function renderOneTimeDriveBriefPreviewPanel() {
    if (oneTimeDriveBriefPreviewBusy) {
        return '<div class="task-empty compact">Previewing the latest Rabbi Elie / One Time Drive brief without writing records...</div>';
    }
    if (oneTimeDriveBriefPreviewError) {
        return `<div class="error-banner">Drive brief preview failed: ${escapeHtml(oneTimeDriveBriefPreviewError)}</div>`;
    }
    const preview = oneTimeDriveBriefPreview;
    if (!preview) {
        return '';
    }
    const counts = preview.counts || {};
    const routing = preview.routing || {};
    const source = preview.source || {};
    const owners = Array.isArray(preview.owner_assignments) ? preview.owner_assignments : [];
    const blockers = Array.isArray(preview.blockers) ? preview.blockers : [];
    const blockerSummary = blockers.slice(0, 6).map(blocker => `
        <div class="event-card">
            <div class="event-type">${escapeHtml(blocker.owner || 'Owner decision')}</div>
            <strong>${escapeHtml(blocker.title || 'Decision needed')}</strong>
            <div class="event-meta">Due ${escapeHtml(blocker.due_date || 'unscheduled')} &middot; ${escapeHtml((blocker.blocked_actions || []).slice(0, 3).join(', ') || 'external write locked')}</div>
        </div>
    `).join('');
    return `
        <div class="content-bulk-actions" data-one-time-drive-brief-preview data-one-time-content-command-center data-one-time-no-write-preview>
            <div class="content-bulk-header">
                <div>
                    <div class="event-type">No-write Drive Brief Preview</div>
                    <h3 style="font-size:16px; margin-top:4px;">${escapeHtml(source.title || 'Rabbi Elie / One Time meeting brief')}</h3>
                    <p style="color:#94a3b8; font-size:12px; margin-top:4px;">Scope: ${escapeHtml(routing.project_key || 'one_time_mishnah_class')} / ${escapeHtml(routing.workspace_key || 'rabbi_sheller_provider')} &middot; production writes: ${preview.external_write_performed ? 'yes' : 'no'}</p>
                </div>
                <span>${escapeHtml(preview.parser_version || 'preview')}</span>
            </div>
            <div class="content-bulk-selected">
                <span class="example-chip">${Number(counts.decisions || 0)} Decisions</span>
                <span class="example-chip">${Number(counts.tasks || 0)} Tasks</span>
                <span class="example-chip">${Number(counts.calendar_events || 0)} Calendar</span>
                <span class="example-chip">${Number(counts.content_items || 0)} Content</span>
                <span class="example-chip">${Number(counts.community_records || 0)} Community</span>
                <span class="example-chip">${Number(counts.integration_items || 0)} Integrations</span>
            </div>
            <div class="settings-control-grid" style="margin-top:14px;">
                ${owners.map(owner => renderSettingsControlRow(owner.person_name || 'Owner', owner.role || 'role', `${owner.access_level || 'access'} / ${owner.workspace_key || ''}`, 'One Time')).join('')}
                ${renderSettingsControlRow('Idempotency', 'Stable', preview.idempotency?.duplicate_policy || 'Match by source key and record key.', 'No duplicates')}
                ${renderSettingsControlRow('Secrets', preview.acceptance?.no_secrets_in_output ? 'Clean' : 'Review', 'Preview output is scanned for key/token-like material before display.', 'Guarded')}
            </div>
            ${blockerSummary ? `<div class="meeting-drop-grid" style="margin-top:14px;">${blockerSummary}</div>` : ''}
        </div>
    `;
}

async function previewLatestOneTimeDriveBrief(event) {
    event?.preventDefault?.();
    oneTimeDriveBriefPreviewBusy = true;
    oneTimeDriveBriefPreviewError = '';
    render();
    try {
        oneTimeDriveBriefPreview = await api.previewOneTimeDriveBrief({
            source: {
                drive_file_id: '1QondCYFKL0CB6K9wkjVL7aa7enbPBmzI',
                title: '2026-06-18-rabbi-elie-scheller.md',
                url: 'https://drive.google.com/file/d/1QondCYFKL0CB6K9wkjVL7aa7enbPBmzI/view',
                created_time: '2026-06-18T17:16:22.555Z',
                modified_time: '2026-06-18T17:16:21.504Z',
                mime_type: 'text/markdown'
            }
        });
    } catch (error) {
        oneTimeDriveBriefPreviewError = error.message || 'Could not preview the Drive brief.';
    } finally {
        oneTimeDriveBriefPreviewBusy = false;
        render();
    }
}

async function refreshContentPromptLibrary() {
    if (contentPromptLibraryLoading) return;
    contentPromptLibraryLoading = true;
    contentPromptLibraryError = '';
    try {
        const result = await api.getContentPrompts();
        contentPrompts = Array.isArray(result?.prompts) ? result.prompts : [];
    } catch (error) {
        contentPromptLibraryError = error.message || 'Could not load the prompt library.';
    } finally {
        contentPromptLibraryLoading = false;
        if (currentView === 'content' && contentSection === 'prompts') render();
    }
}

function queueContentPromptLibraryRefresh() {
    if (contentPromptLibraryLoading) return;
    setTimeout(() => refreshContentPromptLibrary(), 0);
}

function renderContentPromptLibrary() {
    const hasLoadedPromptBodies = contentPrompts.some(prompt => String(prompt?.prompt_text || prompt?.prompt || prompt?.template || prompt?.body || prompt?.content || '').trim());
    if (!hasLoadedPromptBodies && !contentPromptLibraryLoading) queueContentPromptLibraryRefresh();
    return `
        ${contentPromptLibraryLoading ? '<div class="task-empty compact">Loading prompt library...</div>' : ''}
        ${contentPromptLibraryError ? `<div class="error-banner">Prompt library could not load: ${escapeHtml(contentPromptLibraryError)}</div>` : ''}
        <div class="prompt-grid" data-bna-admin-prompt-library data-content-prompt-count="${CONTENT_OUTPUT_TYPES.length}">
            ${CONTENT_OUTPUT_TYPES.map(type => {
                const prompt = promptForOutputType(type.id);
                const examples = prompt?.examples || [];
                const promptUpdated = prompt?.updated_at ? formatDateTime(prompt.updated_at) : 'not loaded';
                const version = prompt?.version ? `v${prompt.version}` : 'no prompt';
                const latestOutput = contentJobs
                    .flatMap(job => job.outputs || [])
                    .filter(output => output.output_type === type.id)
                    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))[0] || null;
                const draftStatus = latestOutput?.status ? String(latestOutput.status).replace(/_/g, ' ') : 'no draft yet';
                const promptBody = prompt?.prompt_text || prompt?.prompt || prompt?.template || prompt?.body || prompt?.content || '';
                const promptPreview = promptBody ? shortContentValue(promptBody, 180) : '';
                return `
                    <div class="prompt-card">
                        <div class="prompt-card-header">
                            <div>
                                <div class="prompt-title">${escapeHtml(type.label)}</div>
                                <div class="prompt-meta">Prompt ${escapeHtml(version)} &middot; Updated ${escapeHtml(promptUpdated)}</div>
                                <div class="prompt-meta">${examples.length} example${examples.length === 1 ? '' : 's'} &middot; Draft status: ${escapeHtml(draftStatus)}</div>
                             </div>
                             <div class="task-actions" style="margin-top:0;">
                                <button class="task-action" onclick="togglePromptLibraryCard(event, '${type.id}')">View Prompt</button>
                                <button class="task-action primary" onclick="setContentTypeTab('library')">Make output</button>
                             </div>
                         </div>
                        <p style="color:#94a3b8; font-size:12px;">${escapeHtml(type.hint)}</p>
                        ${promptPreview ? `<p class="payment-muted"><strong>Prompt:</strong> ${escapeHtml(promptPreview)}</p>` : `<p class="payment-muted">${contentPromptLibraryLoading ? 'Loading prompt body...' : 'Prompt body is not loaded yet.'}</p>`}
                        ${examples.length ? `
                            <div class="example-list">
                                ${examples.slice(0, 4).map(example => `<span class="example-chip">${escapeHtml(example.title || 'Example')}</span>`).join('')}
                            </div>
                         ` : '<p class="payment-muted">No examples saved yet.</p>'}
                         ${expandedPromptKey === `library:${type.id}` ? `
                            <div class="prompt-draft prompt-source-text">${escapeHtml(promptBody || 'Prompt body is not loaded yet.')}</div>
                            <div class="task-actions">
                                <button class="task-action" onclick="addPromptExample(event, '${type.id}')">Add Example / File</button>
                            </div>
                         ` : ''}
                     </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderContentSelectionPanel(filteredJobs = []) {
    const selectedCount = selectedContentJobIds.size;
    const selectedJobs = filteredJobs.filter(job => selectedContentJobIds.has(Number(job.id)));
    if (!selectedCount) {
        return `
            <div class="task-empty">
                No content selected yet. Go to Library or Repurpose, select the cards you want, then come back here to make platform drafts, internal reports, parent emails, clip packaging, or a review bundle.
            </div>
        `;
    }
    return `
        <div class="content-bulk-actions">
            <div class="content-bulk-header">
                <div>
                    <div class="event-type">Selected Content</div>
                    <h3 style="font-size: 16px; margin-top: 4px;">Use one prompt across several source items</h3>
                    <p style="color:#94a3b8; font-size:12px; margin-top:4px;">Select recordings, images, or voice notes. The platform prompt stays the source of truth; custom instructions apply only to this run.</p>
                </div>
                <div class="task-actions" style="margin-top:0; justify-content:flex-end;">
                    ${CONTENT_OUTPUT_TYPES.map(type => `
                        <button class="task-action ${type.id === 'weekly_newsletter' ? 'primary' : ''}" onclick="generateSelectedContentOutput(event, '${type.id}')">${escapeHtml(type.action)} (${selectedCount})</button>
                    `).join('')}
                    <button class="task-action primary" onclick="createWeeklyBundleFromSelection(event)">Create Newsletter Review Bundle (${selectedCount})</button>
                </div>
            </div>
            <div class="content-bulk-selected">
                ${selectedJobs.slice(0, 8).map(job => `<span class="example-chip">${escapeHtml(job.title || `Content #${job.id}`)}</span>`).join('')}
                ${selectedJobs.length > 8 ? `<span class="example-chip">+${selectedJobs.length - 8} more</span>` : ''}
            </div>
        </div>
    `;
}

function latestNewsletterOutputForBundle(bundle) {
    const outputs = Array.isArray(bundle.outputs) ? bundle.outputs : [];
    return outputs
        .filter(output => output.output_type === 'weekly_newsletter' && output.status !== 'archived')
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))[0] || null;
}

function newsletterOutputBody(output) {
    return isMostlyEnglishText(output?.body || '')
        ? (containsHebrewText(output.body) ? cleanEnglishDisplayText(output.body) : output.body)
        : String(output?.body || '');
}

function renderNewsletterBundlePanel() {
    const bundles = Array.isArray(contentBundles) ? contentBundles : [];
    const activeBundles = bundles.filter(bundle => bundle.status !== 'archived');
    return `
        <div class="bundle-panel">
            <div class="content-bulk-header">
                <div>
                    <div class="event-type">Weekly Newsletter Review</div>
                    <h3 style="font-size: 16px; margin-top: 4px;">Bundle sources, edit the draft, approve only when ready</h3>
                    <p style="color:#94a3b8; font-size:12px; margin-top:4px;">This review flow does not send email. It keeps newsletter copy approval separate from future parent-recipient sending.</p>
                </div>
                <div class="task-actions" style="margin-top:0;">
                    <button class="task-action primary" onclick="createWeeklyBundleFromSelection(event)" ${selectedContentJobIds.size ? '' : 'disabled'}>New Bundle from Selected (${selectedContentJobIds.size})</button>
                </div>
            </div>
            ${activeBundles.length ? `
                <div class="bundle-grid">
                    ${activeBundles.map(bundle => renderNewsletterBundleCard(bundle)).join('')}
                </div>
            ` : "<p style=\"color:#64748b; font-size:12px; margin-top:12px;\">No newsletter bundles yet. Select this week's content above, then create a review bundle.</p>"}
        </div>
    `;
}

function renderNewsletterBundleCard(bundle) {
    const output = latestNewsletterOutputForBundle(bundle);
    const jobs = Array.isArray(bundle.jobs) ? bundle.jobs : [];
    const body = newsletterOutputBody(output);
    const textareaId = output?.id ? `newsletterDraft-${Number(output.id)}` : '';
    const feedbackId = `newsletterFeedback-${Number(bundle.id)}`;
    const saveExampleId = output?.id ? `newsletterSaveExample-${Number(output.id)}` : '';
    const generationState = newsletterGenerationStates[Number(bundle.id)] || null;
    const generationWorking = generationState?.status === 'working';
    return `
        <div class="bundle-card">
            <div class="content-bulk-header">
                <div>
                    <div class="event-type">${escapeHtml(String(bundle.status || 'draft').replace(/_/g, ' '))}</div>
                    <h3 style="font-size:16px; margin-top:4px;">${escapeHtml(bundle.title || `Newsletter bundle #${bundle.id}`)}</h3>
                    <div class="content-source-meta">
                        <span>${jobs.length} source item${jobs.length === 1 ? '' : 's'}</span>
                        ${bundle.start_date || bundle.end_date ? `<span>${escapeHtml([bundle.start_date, bundle.end_date].filter(Boolean).join(' to '))}</span>` : ''}
                        ${output?.status ? `<span>Draft: ${escapeHtml(String(output.status).replace(/_/g, ' '))}</span>` : '<span>No draft yet</span>'}
                    </div>
                </div>
                <div class="task-actions" style="margin-top:0;">
                    <button class="task-action primary" ${generationWorking ? 'disabled' : ''} onclick="generateBundleNewsletter(event, ${Number(bundle.id)}, ${output?.id ? Number(output.id) : 0})">${generationWorking ? 'Regenerating...' : (output?.body ? 'Regenerate' : 'Generate Newsletter')}</button>
                    <button class="task-action" onclick="archiveNewsletterBundle(event, ${Number(bundle.id)})">Archive</button>
                </div>
            </div>
            ${renderPromptGenerationStatus(generationState)}
            ${jobs.length ? `
                <div class="content-bulk-selected" style="margin-top:10px;">
                    ${jobs.slice(0, 10).map(job => `<span class="example-chip">${escapeHtml(job.title || `Content #${job.id}`)}</span>`).join('')}
                    ${jobs.length > 10 ? `<span class="example-chip">+${jobs.length - 10} more</span>` : ''}
                </div>
            ` : ''}
            ${output?.body ? `
                <textarea class="newsletter-review-textarea" id="${textareaId}">${escapeHtml(body)}</textarea>
                <div class="prompt-feedback-box">
                    <label for="${feedbackId}">Output Correction</label>
                    <textarea id="${feedbackId}" placeholder="What should change next time?"></textarea>
                    <label class="prompt-example-check" for="${saveExampleId}">
                        <input id="${saveExampleId}" type="checkbox">
                        Save current draft as example first
                    </label>
                </div>
                <div class="task-actions">
                    <button class="task-action primary" onclick="saveNewsletterBundleDraft(event, ${Number(output.id)})">Save Draft Edits</button>
                    <button class="task-action" onclick="copyText(event, ${attrJson(body)})">Copy Draft</button>
                    <button class="task-action primary" ${generationWorking ? 'disabled' : ''} onclick="generateBundleNewsletter(event, ${Number(bundle.id)}, ${Number(output.id)})">${generationWorking ? 'Regenerating...' : 'Apply Correction + Regenerate'}</button>
                    <button class="task-action primary" onclick="approveContentOutput(event, ${Number(output.id)})">Approve + Save Example</button>
                </div>
            ` : '<p style="color:#94a3b8; font-size:12px; margin-top:12px;">Generate a newsletter draft from these sources, then edit it here before approval.</p>'}
        </div>
    `;
}

function contentPrimaryActionLabel(job) {
    const status = String(job?.status || '').toLowerCase();
    if (['ingested', 'transcribing'].includes(status)) return 'Waiting for transcript';
    if (contentNeedsOutput(job)) return 'Generate output';
    if (status === 'transcribed') return 'Choose output';
    if (status === 'drafting' || status === 'parsing') return 'Review draft soon';
    if (status === 'needs_approval') return 'Approve or revise';
    if (status === 'approved') return 'Ready to publish';
    if (status === 'published') return 'Published';
    return 'Open card';
}

function renderContentDetailDrawer(job) {
    const parsed = parseJsonField(job.parse_json) || {};
    const sections = contentParsedSections(job, parsed);
    const displayTitle = contentDisplayTitle(job, parsed, sections);
    const summary = contentDisplaySummary(job, parsed);
    const classSession = contentClassSessionForJob(job);
    const researchSections = contentResearchSectionsForJob(job, sections, classSession);
    const activeOutputs = activeContentOutputs(job);
    const transcript = String(job.transcript_text || '').trim();
    const sourceHref = contentSourceHref(job);
    const sourceDetail = contentSourceDetail(job);
    const mediaType = contentMediaType(job);
    const project = contentProject(job);
    const promptRows = CONTENT_OUTPUT_TYPES.map(type => {
        const prompt = promptForOutputType(type.id);
        const output = outputForJob(job, type.id);
        return { type, prompt, output };
    });
    return `
        <section class="detail-page-layout content-detail-drawer" id="content-detail-drawer" aria-label="Content detail drawer">
            <aside class="detail-side-panel">
                <div class="detail-side-kicker">Content Detail</div>
                <h2>${escapeHtml(displayTitle)}</h2>
                <div class="content-source-meta">
                    <span>${escapeHtml(contentStatusLabel(job))}</span>
                    <span>${escapeHtml(mediaType)}</span>
                    <span>${escapeHtml(project === 'mishna' ? 'Rabbi Sheller Provider' : 'BNA School')}</span>
                    <span>${activeOutputs.length} output${activeOutputs.length === 1 ? '' : 's'}</span>
                </div>
                <div class="task-actions detail-actions">
                    <button class="task-action" onclick="closeContentDetail()">Close</button>
                    ${sourceHref ? `<a class="task-action" href="${escapeHtml(sourceHref)}" target="_blank" rel="noopener">Open source</a>` : '<button class="task-action" disabled title="No source URL is saved for this item.">Open source</button>'}
                    <button class="task-action primary" onclick="copyContentPrompt(${Number(job.id)}, 'selected source')">Copy source prompt</button>
                </div>
            </aside>
            <div class="detail-main-panel">
                <div class="detail-section">
                    <h3>Source Overview</h3>
                    <div class="task-inline-grid">
                        ${renderContactDetailItem('Uploaded', formatDateTime(contentUploadedAt(job)) || 'Unknown')}
                        ${renderContactDetailItem('Status', contentStatusLabel(job))}
                        ${renderContactDetailItem('Topic', contentTopicLabel(job))}
                        ${renderContactDetailItem('Source', contentSourceLabel(job))}
                        ${renderContactDetailItem('Project', project === 'mishna' ? 'Rabbi Sheller provider content' : 'BNA school content')}
                        ${renderContactDetailItem('Outputs', `${activeOutputs.length}`)}
                    </div>
                    ${sourceDetail ? `<p class="event-meta">${escapeHtml(sourceDetail)}</p>` : ''}
                    ${summary ? `<p class="event-meta">${escapeHtml(summary)}</p>` : ''}
                    ${contentNeedsOutput(job) ? '<div class="settings-disabled-note">Transcript is saved, but no platform output has been generated yet. Use Generate below to create a reviewable draft before sending or publishing.</div>' : ''}
                </div>
                <details class="workflow-details" open>
                    <summary>Transcript / Source</summary>
                    ${transcript ? `<div class="task-inline-text">${escapeHtml(limitTextClient(transcript, 2200))}</div>` : '<div class="empty-state">No transcript is saved yet.</div>'}
                </details>
                <div class="content-section-grid">
                    ${renderContentList('Topics', researchSections.topics)}
                    ${renderContentList('Questions', researchSections.studentQuestions.concat(researchSections.discussions))}
                    ${renderContentList('Sources', researchSections.sources, { allowHebrew: true })}
                    ${renderContentList('Highlights', researchSections.highlights)}
                </div>
                ${renderContentCardResearchBlock(job, researchSections)}
                <details class="workflow-details" open>
                    <summary>Outputs</summary>
                    ${activeOutputs.length ? `
                        <div class="content-section-grid">
                            ${activeOutputs.map(output => `
                                <article class="content-card">
                                    <div class="content-card-title">${escapeHtml(contentOutputTypeLabel(output.output_type))}</div>
                                    <div class="content-card-meta">${escapeHtml(String(output.status || 'draft').replace(/_/g, ' '))} / prompt ${output.prompt_version ? `v${escapeHtml(String(output.prompt_version))}` : 'not set'}</div>
                                    ${output.body ? `<p class="event-meta">${escapeHtml(limitTextClient(output.body, 320))}</p>` : '<p class="event-meta">No body saved.</p>'}
                                    <div class="task-actions">
                                        ${output.body ? `<button class="task-action" onclick="copyText(event, ${attrJson(output.body)})">Copy</button>` : ''}
                                        ${output.body ? `<button class="task-action primary" onclick="approveContentOutput(event, ${Number(output.id)})">Approve</button>` : ''}
                                    </div>
                                </article>
                            `).join('')}
                        </div>
                    ` : '<div class="empty-state">No outputs are saved yet. Use Generate below to create a reviewable draft.</div>'}
                </details>
                <details class="workflow-details">
                    <summary>Prompt Versions</summary>
                    <div class="content-section-grid">
                        ${promptRows.map(({ type, prompt, output }) => `
                            <article class="content-card">
                                <div class="content-card-title">${escapeHtml(type.label)}</div>
                                <div class="content-card-meta">Prompt ${prompt?.version ? `v${escapeHtml(String(prompt.version))}` : 'not loaded'} / ${escapeHtml(output?.status || 'no draft')}</div>
                                <p class="event-meta">${escapeHtml(type.hint || '')}</p>
                                <div class="task-actions">
                                    <button class="task-action" onclick="togglePromptEditor(event, ${Number(job.id)}, '${type.id}')">${expandedPromptKey === `${Number(job.id)}:${type.id}` ? 'Hide Prompt' : 'View Prompt'}</button>
                                    <button class="task-action primary" onclick="generateContentOutput(event, ${Number(job.id)}, '${type.id}', '${Number(job.id)}:${type.id}')">${output?.body ? 'Regenerate' : type.action}</button>
                                </div>
                                ${expandedPromptKey === `${Number(job.id)}:${type.id}` ? renderPromptEditor(job, type, prompt, output) : ''}
                            </article>
                        `).join('')}
                    </div>
                </details>
                <details class="workflow-details">
                    <summary>Activity</summary>
                    <div class="timeline-list">
                        <div class="timeline-item compact"><span class="timeline-dot"></span><div><strong>Uploaded</strong><p>${escapeHtml(formatDateTime(contentUploadedAt(job)) || 'Unknown')}</p></div></div>
                        <div class="timeline-item compact"><span class="timeline-dot"></span><div><strong>Status</strong><p>${escapeHtml(contentStatusLabel(job))}</p></div></div>
                        ${activeOutputs.map(output => `<div class="timeline-item compact"><span class="timeline-dot"></span><div><strong>${escapeHtml(contentOutputTypeLabel(output.output_type))}</strong><p>${escapeHtml(String(output.status || 'draft').replace(/_/g, ' '))}</p></div></div>`).join('')}
                    </div>
                </details>
            </div>
        </section>
    `;
}

function renderContentCard(job) {
    const parsed = parseJsonField(job.parse_json) || {};
    const sections = contentParsedSections(job, parsed);
    const card = contentCardModel(job, parsed, sections);
    const displayTitle = card.display_title || contentDisplayTitle(job, parsed, sections);
    const summary = card.summary || contentDisplaySummary(job, parsed);
    const classSession = contentClassSessionForJob(job);
    const researchSections = contentResearchSectionsForJob(job, sections, classSession);
    const topicLabel = contentTopicLabel(job);
    const sourceLabel = contentSourceLabel(job);
    const sourceHref = contentSourceHref(job);
    const sourceDetail = contentSourceDetail(job);
    const activeOutputs = activeContentOutputs(job);
    const transcriptLength = String(job.transcript_text || '').trim().length;
    const compactTopics = [
        ...sections.topics,
        ...sections.discussions,
        ...researchSections.studentQuestions,
        ...sections.sources,
        ...sections.highlights,
        ...sections.outputBullets
    ];
    const compactTopicCount = compactContentTopics(compactTopics).length;
    const mediaType = contentMediaType(job);
    const project = contentProject(job);
    const selected = selectedContentJobIds.has(Number(job.id));
    const expanded = Number(selectedContentDetailJobId) === Number(job.id);
    return `
        <div class="content-library-card ${expanded ? 'expanded' : ''}" id="content-card-${Number(job.id)}" data-helper-record-type="content_job" data-helper-record-id="${Number(job.id)}">
            <div class="content-card-compact" role="button" tabindex="0" onclick="toggleContentCard(event, ${Number(job.id)})">
                <div class="content-card-header">
                    <div class="content-card-main">
                        <div class="event-type">${escapeHtml(contentStatusLabel(job))}</div>
                        <div class="content-title-line">
                            <span class="media-pill ${mediaType}">${escapeHtml(mediaType)}</span>
                            <span class="media-pill ${project === 'mishna' ? 'audio' : 'file'}">${escapeHtml(project === 'mishna' ? 'One Time' : 'BNA')}</span>
                            <span class="media-pill file">${escapeHtml(topicLabel)}</span>
                            <span class="media-pill file">${escapeHtml(sourceLabel)}</span>
                            <h3 style="font-size: 16px;">${escapeHtml(displayTitle)}</h3>
                        </div>
                        <div class="content-source-meta">
                            <span>Uploaded ${formatDateTime(contentUploadedAt(job))}</span>
                            <span>${activeOutputs.length} output${activeOutputs.length === 1 ? '' : 's'}</span>
                            <span>Parse: ${escapeHtml(card.parse_status?.label || 'Needs parse')}</span>
                            <span>Digest: ${escapeHtml(card.digest_status?.label || 'Needs digest')}</span>
                            <span>Routing: ${escapeHtml(card.routing_status?.label || 'Needs routing')}</span>
                            <span>Topic: ${escapeHtml(card.topic_status?.label || 'Needs topic classification')}</span>
                            <span>${compactTopicCount || 0} brief topic${compactTopicCount === 1 ? '' : 's'}</span>
                            ${researchSections.studentQuestions.length ? `<span>${researchSections.studentQuestions.length} student question${researchSections.studentQuestions.length === 1 ? '' : 's'}</span>` : ''}
                            ${transcriptLength ? `<span>${transcriptLength.toLocaleString()} transcript chars</span>` : ''}
                        </div>
                        ${summary ? `<p class="content-card-summary">${escapeHtml(limitTextClient(summary, 320))}</p>` : ''}
                        ${renderContentCardDigestChips(card)}
                        ${renderContentBulletSummary(card.main_points || compactTopics, 'Needs parse')}
                    </div>
                    <div class="content-card-tools" onclick="event.stopPropagation()">
                        <label class="content-select" title="Select this item for a combined output">
                            <input class="content-select-large" type="checkbox" ${selected ? 'checked' : ''} onchange="toggleContentSelection(event, ${Number(job.id)})">
                            Select
                        </label>
                        <span class="content-next-action">${escapeHtml(card.next_action || contentPrimaryActionLabel(job))}</span>
                        <div>
                            ${job.drive_stage ? `<div style="color:#94a3b8; font-size:12px; margin-bottom:6px;">${escapeHtml(job.drive_stage)}</div>` : ''}
                            ${sourceHref ? `<a href="${escapeHtml(sourceHref)}" target="_blank" rel="noopener" style="color:#93c5fd; font-size:12px;">Open source</a>` : ''}
                        </div>
                        <span class="content-expand-cue">${expanded ? 'Detail open' : 'Open detail'}</span>
                    </div>
                </div>
            </div>
            ${expanded ? '<div class="content-card-expanded"><div class="settings-disabled-note">Detail drawer is open above the list.</div></div>' : ''}
        </div>
    `;
}

function renderPromptStudioForJob(job, type) {
    const output = outputForJob(job, type.id);
    const prompt = promptForOutputType(type.id);
    const examples = prompt?.examples || [];
    const key = `${Number(job.id)}:${type.id}`;
    const expanded = expandedPromptKey === key;
    const promptUpdated = prompt?.updated_at ? formatDateTime(prompt.updated_at) : 'not loaded';
    const version = prompt?.version ? `v${prompt.version}` : 'no prompt';
    const outputStatus = output?.status ? String(output.status).replace(/_/g, ' ') : 'no draft yet';
    const draftBody = String(output?.body || '');
    const draftDisplayBody = isMostlyEnglishText(draftBody)
        ? (containsHebrewText(draftBody) ? cleanEnglishDisplayText(draftBody) : draftBody)
        : '';
    const generationState = contentGenerationStates[key] || null;
    const generationWorking = generationState?.status === 'working';
    const approveLabel = ['facebook_post', 'linkedin_post', 'youtube_description'].includes(type.id)
        ? 'Commit to Buffer Draft'
        : 'Approve + Save Example';
    return `
        <div class="prompt-card">
            <div class="prompt-card-header">
                <div>
                    <div class="prompt-title">${escapeHtml(type.label)}</div>
                    <div class="prompt-meta">Prompt ${escapeHtml(version)} &middot; Updated ${escapeHtml(promptUpdated)}</div>
                    <div class="prompt-meta">${examples.length} example${examples.length === 1 ? '' : 's'} &middot; ${escapeHtml(outputStatus)}</div>
                 </div>
                 <div class="task-actions" style="margin-top:0;">
                    <button class="task-action" onclick="togglePromptEditor(event, ${Number(job.id)}, '${type.id}')">${expanded ? 'Hide Prompt' : 'View Prompt'}</button>
                 </div>
             </div>
            <p style="color:#94a3b8; font-size:12px;">${escapeHtml(type.hint)}</p>
            ${examples.length ? `
                <div class="example-list">
                    ${examples.slice(0, 4).map(example => `<span class="example-chip">${escapeHtml(example.title || 'Example')}</span>`).join('')}
                </div>
            ` : ''}
            ${expanded ? renderPromptEditor(job, type, prompt, output) : ''}
            ${renderPromptGenerationStatus(generationState)}
            ${output?.body && draftDisplayBody ? `
                <div class="prompt-draft">${escapeHtml(draftDisplayBody)}</div>
                <div class="prompt-meta">Generated with prompt ${output.prompt_version ? `v${escapeHtml(String(output.prompt_version))}` : version}</div>
            ` : output?.body ? `
                <div class="content-language-note">This saved draft is not in English. Regenerate it with the current English prompt before using it.</div>
            ` : ''}
            <div class="task-actions">
                <button class="task-action primary" ${generationWorking ? 'disabled' : ''} onclick="generateContentOutput(event, ${Number(job.id)}, '${type.id}', '${key}')">${generationWorking ? 'Regenerating...' : (output?.body ? 'Apply Correction + Regenerate' : type.action)}</button>
                ${output?.body && draftDisplayBody ? `<button class="task-action" onclick="copyText(event, ${attrJson(draftDisplayBody)})">Copy</button>` : ''}
                ${output?.body && draftDisplayBody ? `<button class="task-action primary" onclick="approveContentOutput(event, ${Number(output.id)})">${approveLabel}</button>` : ''}
            </div>
        </div>
    `;
}

function renderPromptEditor(job, type, prompt, output) {
    const key = `${type.id}-${Number(job.id)}`;
    const cardKey = `${Number(job.id)}:${type.id}`;
    const generationState = contentGenerationStates[cardKey] || null;
    const generationWorking = generationState?.status === 'working';
    const feedbackValue = generationWorking || generationState?.status === 'error'
        ? generationState.feedback || ''
        : '';
    const hasOutput = Boolean(output?.body);
    return `
        <div class="prompt-editor">
            <div class="prompt-draft prompt-source-text">${escapeHtml(prompt?.prompt_text || '')}</div>
            ${hasOutput ? `
                <div class="prompt-feedback-box">
                    <label for="promptFeedback-${key}">Output Correction</label>
                    <textarea id="promptFeedback-${key}" placeholder="What should change next time?" ${generationWorking ? 'disabled' : ''}>${escapeHtml(feedbackValue)}</textarea>
                    <label class="prompt-example-check" for="promptSaveExample-${key}">
                        <input id="promptSaveExample-${key}" type="checkbox" ${generationWorking ? 'disabled' : ''}>
                        Save current draft as example first
                    </label>
                </div>
            ` : ''}
            <div class="task-actions" style="margin-top:0;">
                <button class="task-action" onclick="addPromptExample(event, '${type.id}')">Add Example / File</button>
            </div>
        </div>
    `;
}

function goalBoardMetadata(event = {}) {
    const parsed = parseJsonField(event.metadata) || {};
    const raw = parsed.goal_board && typeof parsed.goal_board === 'object' ? parsed.goal_board : parsed;
    const visibleFlag = (value, fallback = true) => {
        if (value === undefined || value === null || value === '') return fallback;
        return !['false', '0', 'no', 'hidden', 'private', 'admin_only'].includes(String(value).trim().toLowerCase());
    };
    const source = ['self', 'admin', 'classroom', 'private_meeting'].includes(raw.source) ? raw.source : 'admin';
    const consequence = raw.consequence && typeof raw.consequence === 'object' ? raw.consequence : {};
    const agreement = raw.agreement && typeof raw.agreement === 'object' ? raw.agreement : {};
    const classroom = raw.classroom && typeof raw.classroom === 'object' ? raw.classroom : {};
    return {
        source,
        category: raw.category || event.topic || '',
        urgency: raw.urgency || 'this_week',
        status: raw.status || 'active',
        due_at: raw.due_at || '',
        optional_scheduled_at: raw.optional_scheduled_at || '',
        student_owned: Boolean(raw.student_owned || source === 'self'),
        student_visible: visibleFlag(raw.student_visible ?? raw.share_with_student, true),
        parent_visible: visibleFlag(raw.parent_visible ?? raw.share_with_parent, true),
        approval_required: Boolean(raw.approval_required),
        approval_status: raw.approval_status || (raw.approval_required ? 'pending_review' : 'approved'),
        student_summary: raw.student_summary || '',
        private_note: raw.private_note || event.notes || '',
        reflection_note: raw.reflection_note || '',
        classroom,
        agreement: {
            type: agreement.type || raw.agreement_type || '',
            bedtime_time: agreement.bedtime_time || raw.bedtime_time || '',
            wake_time: agreement.wake_time || raw.wake_time || '',
            student_commitment: agreement.student_commitment || raw.student_commitment || '',
            chosen_consequence: agreement.chosen_consequence || raw.chosen_consequence || ''
        },
        consequence: {
            status: consequence.status || 'none',
            approval_required: consequence.approval_required !== false,
            recovery_path: consequence.recovery_path || '',
            device_access_state: consequence.device_access_state || '',
            duration_minutes: consequence.duration_minutes || '',
            auto_apply_on_completion: Boolean(consequence.auto_apply_on_completion),
            success_device_access_state: consequence.success_device_access_state || '',
            success_duration_minutes: consequence.success_duration_minutes || '',
            success_applied_at: consequence.success_applied_at || '',
            review_reason: consequence.review_reason || ''
        }
    };
}

function dateOnlyKey(value = null) {
    const date = value ? new Date(value) : new Date();
    if (!Number.isFinite(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
}

function goalBoardStatus(event) {
    const meta = goalBoardMetadata(event);
    const progress = Number(event.progress_percent || 0);
    if (meta.status === 'archived') return 'archived';
    if (progress >= 100 || meta.status === 'done') return 'done';
    if (meta.status === 'waiting' || meta.approval_status === 'pending_review' || meta.consequence.status === 'pending_review') return 'waiting';
    if (meta.due_at && dateOnlyKey(meta.due_at) < dateOnlyKey()) return 'overdue';
    return 'active';
}

function goalBoardBucket(event) {
    const status = goalBoardStatus(event);
    if (status === 'done') return 'done';
    if (status === 'waiting') return 'waiting';
    if (status === 'archived') return 'archived';
    const dueAt = goalBoardMetadata(event).due_at;
    if (dueAt && dateOnlyKey(dueAt) > dateOnlyKey()) return 'upcoming';
    return 'today';
}

function goalBoardSortRank(event) {
    const bucket = goalBoardBucket(event);
    return ({
        waiting: 0,
        today: 1,
        overdue: 2,
        upcoming: 3,
        done: 4,
        archived: 5
    })[bucket] ?? 3;
}

function goalBoardFilterMatches(item, filter, deviceList = []) {
    const meta = goalBoardMetadata(item);
    const status = goalBoardStatus(item);
    const progress = goalBoardProgress(item);
    const deviceState = normalizeDeviceAccessState(deviceList[0]?.status || '', 'accountability_only');
    const dueToday = !meta.due_at || dateOnlyKey(meta.due_at) === dateOnlyKey();
    if (filter === 'all') return true;
    if (filter === 'needs_setup') return false;
    if (filter === 'due_today') return status !== 'done' && dueToday;
    if (filter === 'checked_off') return status === 'done' || progress >= 100;
    if (filter === 'missed') return status === 'overdue';
    if (filter === 'access_open') {
        return deviceState === 'approved_access'
            || deviceState === 'manual_override'
            || Boolean(meta.consequence.success_applied_at);
    }
    if (filter === 'locked') {
        return ['locked', 'accountability_only', 'expired'].includes(deviceState);
    }
    if (filter === 'needs_review') {
        return status === 'waiting'
            || meta.approval_status === 'pending_review'
            || meta.consequence.status === 'pending_review';
    }
    return true;
}

function goalBoardSourceLabel(source) {
    return (GOAL_BOARD_SOURCES.find(item => item.id === source)?.label) || 'Admin';
}

function goalBoardStatusLabel(event) {
    const status = goalBoardStatus(event);
    if (status === 'overdue') return 'Overdue';
    if (status === 'waiting') return 'Waiting';
    if (status === 'done') return 'Done';
    return 'Active';
}

function goalBoardUrgencyLabel(urgency) {
    return ({
        urgent: 'Urgent',
        today: 'Today',
        this_week: 'This week',
        low: 'Low'
    })[urgency] || 'This week';
}

function formatGoalDue(value) {
    if (!value) return '';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    return date.toLocaleString('en-GB', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function goalBoardProgress(event) {
    const progress = Number(event.progress_percent || 0);
    return Number.isFinite(progress) ? Math.max(0, Math.min(100, Math.round(progress))) : 0;
}

function studentGoalBoardItems(student, events) {
    const studentName = normalizeLooseText(student?.name || '');
    return events
        .filter(event => event.event_type === 'student_goal')
        .filter(event => {
            if (event.student_id) return String(event.student_id) === String(student.id || '');
            return studentName && normalizeLooseText(event.student_name || '') === studentName;
        })
        .filter(event => goalBoardStatus(event) !== 'archived')
        .sort((a, b) => {
            const aBucket = goalBoardSortRank(a);
            const bBucket = goalBoardSortRank(b);
            if (aBucket !== bBucket) return aBucket - bBucket;
            const aDue = Date.parse(goalBoardMetadata(a).due_at || a.occurred_at || a.created_at || 0);
            const bDue = Date.parse(goalBoardMetadata(b).due_at || b.occurred_at || b.created_at || 0);
            return aDue - bDue;
        });
}

function goalBoardCounts(items) {
    return GOAL_BOARD_FILTERS.reduce((counts, filter) => {
        counts[filter.id] = items.filter(item => goalBoardFilterMatches(item, filter.id)).length;
        return counts;
    }, {});
}

function normalizeDeviceAccessState(value, fallback = 'accountability_only') {
    const normalized = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_');
    if (DEVICE_ACCESS_STATES.some(state => state.id === normalized)) return normalized;
    if (normalized === 'approved' || normalized === 'unlock' || normalized === 'unlocked') return 'approved_access';
    if (normalized === 'accountability') return 'accountability_only';
    return DEVICE_ACCESS_STATES.some(state => state.id === fallback) ? fallback : 'accountability_only';
}

function deviceAccessLabel(value) {
    const state = normalizeDeviceAccessState(value);
    return DEVICE_ACCESS_STATES.find(item => item.id === state)?.label || 'Accountability Only';
}

function deviceAccessBadge(value) {
    const state = String(value || '').trim() === 'not_configured'
        ? 'not_configured'
        : normalizeDeviceAccessState(value, 'accountability_only');
    const label = state === 'not_configured' ? 'Not Configured' : deviceAccessLabel(state);
    return `<span class="access-state-badge ${escapeHtml(state)}">${escapeHtml(label)}</span>`;
}

function studentDevices(student) {
    return (devices || [])
        .filter(device => String(device.student_id || device.student?.id || '') === String(student.id || ''))
        .sort((a, b) => Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0));
}

function preferredDeviceIdForStudent(studentId) {
    const matches = (devices || [])
        .filter(device => String(device.student_id || device.student?.id || '') === String(studentId || ''))
        .sort((a, b) => Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0));
    return matches[0]?.id || '';
}

function studentAccountabilitySnapshot(student) {
    const events = studentEvents(student);
    const goalItems = studentGoalBoardItems(student, events);
    const deviceList = studentDevices(student);
    const device = deviceList[0] || null;
    const statusRank = { waiting: 0, active: 1, overdue: 2, done: 3 };
    const activeGoal = goalItems
        .slice()
        .filter(item => goalBoardStatus(item) !== 'done')
        .sort((a, b) => (statusRank[goalBoardStatus(a)] ?? 4) - (statusRank[goalBoardStatus(b)] ?? 4))[0]
        || goalItems[0]
        || null;
    const meta = activeGoal ? goalBoardMetadata(activeGoal) : null;
    const deviceState = device ? normalizeDeviceAccessState(device.status) : 'not_configured';
    const status = !goalItems.length
        ? 'needs_setup'
        : pendingDeviceReviews(goalItems).length ? 'needs_review'
            : deviceState === 'approved_access' || deviceState === 'manual_override' ? 'access_open'
                : activeGoal && goalBoardStatus(activeGoal) === 'done' ? 'checked_off'
                    : activeGoal && goalBoardStatus(activeGoal) === 'overdue' ? 'missed'
                        : activeGoal && goalBoardFilterMatches(activeGoal, 'due_today', deviceList) ? 'due_today'
                            : ['locked', 'accountability_only', 'expired'].includes(deviceState) ? 'locked'
                                : 'due_today';

    return {
        status,
        goal: activeGoal,
        metadata: meta,
        device,
        deviceState,
        deviceLabel: device ? deviceAccessLabel(deviceState) : 'Not Configured',
        accessWindow: device?.active_session ? formatSessionWindow(device.active_session) : '',
    };
}

function studentAccountabilityMatches(student, filter) {
    const snapshot = studentAccountabilitySnapshot(student);
    if (filter === 'all') return true;
    return snapshot.status === filter;
}

function studentAccountabilityCounts() {
    return ACCOUNTABILITY_FILTERS.reduce((counts, filter) => {
        counts[filter.id] = students.filter(student => studentAccountabilityMatches(student, filter.id)).length;
        return counts;
    }, {});
}

function studentAudienceMatches(student, filter = studentAudienceFilter) {
    if (filter === 'all') return true;
    return studentAudienceKey(student) === filter;
}

function studentAudienceCounts() {
    return ['all', 'internal', 'external'].reduce((counts, filter) => {
        counts[filter] = filter === 'all'
            ? students.length
            : students.filter(student => studentAudienceMatches(student, filter)).length;
        return counts;
    }, {});
}

function studentBotSettingsForChannel(student, channel = 'telegram') {
    const settings = Array.isArray(student?.bot_settings) ? student.bot_settings : [];
    return settings.find(item => String(item.channel || 'telegram') === String(channel))
        || settings.find(item => String(item.status || '') === 'active')
        || null;
}

function studentBotRouteState(student) {
    const settings = Array.isArray(student?.bot_settings) ? student.bot_settings : [];
    if (!settings.length) return 'not_configured';
    if (settings.some(item => String(item.filter_status || '') === 'active_filtered' || (String(item.status || '') === 'active' && (item.route_configured || item.source_chat_id || item.bot_username)))) return 'active_filtered';
    if (settings.some(item => String(item.status || '') === 'active')) return 'needs_route';
    if (settings.some(item => String(item.status || '') === 'blocked')) return 'blocked';
    if (settings.some(item => String(item.status || '') === 'paused')) return 'paused';
    return 'draft';
}

function studentBotRouteLabel(state) {
    return STUDENT_BOT_FILTERS.find(item => item.id === state)?.label || String(state || 'Not Configured').replace(/_/g, ' ');
}

function studentBotMatches(student, filter = studentBotFilter) {
    if (filter === 'all') return true;
    return studentBotRouteState(student) === filter;
}

function studentBotCounts() {
    return STUDENT_BOT_FILTERS.reduce((counts, filter) => {
        counts[filter.id] = filter.id === 'all'
            ? students.length
            : students.filter(student => studentBotMatches(student, filter.id)).length;
        return counts;
    }, {});
}

function pendingDeviceReviews(items) {
    return (items || []).filter(item => {
        const consequence = goalBoardMetadata(item).consequence || {};
        return consequence.device_access_state && (
            consequence.status === 'pending_review' ||
            goalBoardStatus(item) === 'waiting' ||
            item.approval_status === 'pending_review'
        );
    });
}

function formatSessionWindow(session) {
    if (!session) return '';
    const started = session.started_at ? formatDateTime(session.started_at) : '';
    const expires = session.expires_at ? formatDateTime(session.expires_at) : '';
    if (started && expires) return `${started} until ${expires}`;
    return expires ? `Until ${expires}` : started;
}

function studentViewState() {
    const torahById = new Map((torahSummary?.students || []).map(student => [String(student.id), student]));
    const accountabilityCounts = studentAccountabilityCounts();
    const audienceCounts = studentAudienceCounts();
    const botCounts = studentBotCounts();
    const visibleStudents = students.filter(studentMatchesStudentFilters);
    const selectedCandidate = students.find(student => String(student.id) === String(selectedStudentId)) || null;
    const filterAffectsSelection = ['overview', 'list'].includes(studentSection);
    const selectedStudent = filterAffectsSelection
        ? (selectedCandidate && studentMatchesStudentFilters(selectedCandidate)
            ? selectedCandidate
            : visibleStudents[0] || selectedCandidate || students[0] || null)
        : selectedCandidate || visibleStudents[0] || students[0] || null;
    if (!selectedStudentId && selectedStudent) {
        selectedStudentId = selectedStudent.id;
        if (currentView === 'students') {
            syncOperationsUrl();
        }
    }

    return {
        torahById,
        accountabilityCounts,
        audienceCounts,
        botCounts,
        visibleStudents,
        selectedStudent,
        selectedCandidate,
        tabCounts: studentSectionCounts()
    };
}

function normalizeStudentAttendanceStatus(value) {
    const key = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (['present', 'here', 'attended', 'showed_up', 'came'].includes(key)) return 'present';
    if (['late', 'tardy'].includes(key)) return 'late';
    if (['absent', 'missed', 'missed_class', 'no_show', 'noshow'].includes(key)) return 'absent';
    return key || 'unknown';
}

function studentAttendanceStatusLabel(value) {
    const key = normalizeStudentAttendanceStatus(value);
    if (key === 'present') return 'Present';
    if (key === 'late') return 'Late';
    if (key === 'absent') return 'Absent';
    return value
        ? String(value).replace(/[_-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
        : 'No attendance status';
}

function latestDateValue(values = []) {
    return values
        .filter(Boolean)
        .sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null;
}

function studentAttendanceEvents(student, events = studentEvents(student)) {
    return (events || [])
        .filter(event => String(event.attendance_status || '').trim())
        .sort(sortEventsNewestFirst);
}

function studentAttendanceSummary(student, events = studentEvents(student)) {
    const rows = studentAttendanceEvents(student, events);
    const recordCount = rows.length || Number(student.attendance_record_count || 0);
    const presentCount = rows.length
        ? rows.filter(event => normalizeStudentAttendanceStatus(event.attendance_status) === 'present').length
        : Number(student.attendance_present_count || 0);
    const latestRow = rows[0] || null;
    const latestStatus = latestRow?.attendance_status || student.latest_attendance_status || '';
    const latestAt = latestRow?.occurred_at || latestRow?.created_at || student.latest_attendance_at || null;
    const percent = recordCount
        ? Math.round((presentCount / Math.max(1, recordCount)) * 100)
        : 100;
    return {
        recordCount,
        presentCount,
        percent,
        latestStatus,
        latestAt,
        label: recordCount ? `${percent}% present` : 'Present by default',
        detail: recordCount
            ? `${presentCount}/${recordCount} attendance record${recordCount === 1 ? '' : 's'} present`
            : 'No attendance exceptions recorded',
    };
}

function studentLearningStatus(student, options = {}) {
    const events = options.events || studentEvents(student);
    const sortedEvents = (events || []).slice().sort(sortEventsNewestFirst);
    const goals = options.goals || events.filter(event => event.event_type === 'student_goal');
    const torahRecord = options.torahRecord || torahStudentRecord(student);
    const attendance = studentAttendanceSummary(student, events);
    const goalProgress = studentProgressPercent(student, goals);
    const latestProgress = student.latest_progress_percent !== null && student.latest_progress_percent !== undefined
        ? Number(student.latest_progress_percent)
        : null;
    const tripProgress = Number(torahRecord?.percentage || 0);
    return {
        attendance,
        goalProgress,
        latestProgress,
        tripProgress,
        lastUpdatedAt: latestDateValue([
            student.latest_accountability_at,
            student.latest_progress_at,
            student.latest_attendance_at,
            sortedEvents[0]?.updated_at,
            sortedEvents[0]?.occurred_at,
            sortedEvents[0]?.created_at,
            torahRecord?.date,
            student.updated_at,
            student.created_at,
        ]),
    };
}

function studentLatestActivityDate(student) {
    return studentLearningStatus(student).lastUpdatedAt;
}

function studentMatchesStudentFilters(student) {
    return studentAccountabilityMatches(student, studentAccountabilityFilter)
        && studentAudienceMatches(student, studentAudienceFilter)
        && studentBotMatches(student, studentBotFilter)
        && matchesRecentDate(studentLatestActivityDate(student), studentDateFilter);
}

function studentSectionCounts() {
    const goalItemsCount = students.reduce((sum, student) => sum + studentGoalBoardItems(student, studentEvents(student)).length, 0);
    const questionCount = accountabilityEvents.filter(event => event.event_type === 'question').length;
    const analysisCount = accountabilityEvents.filter(isStudentAnalysisEvent).length;
    const meetingCount = accountabilityEvents
        .filter(event => ['private_meeting', 'decision', 'learning_note', 'class_session'].includes(event.event_type))
        .filter(event => !isStudentAnalysisEvent(event))
        .length;
    return {
        overview: students.length,
        group_goal: (torahSummary?.students || []).length || students.length,
        list: students.length,
        profile: students.length,
        parent_family: students.filter(student => student.parent_name || student.parent_email || student.parent_phone || linkedSignupForStudent(student)).length,
        assignments: assignments.filter(assignment => assignment.status !== 'archived').length,
        goal_board: goalItemsCount,
        tablet_access: devices.length,
        analysis: analysisCount,
        questions: questionCount,
        documents: assignments.filter(assignment => assignmentMaterialHref(assignment) || assignmentWorksheetReady(assignment, assignment.students || [])).length,
        portal_links: students.filter(student => student.student_access_code || student.student_access_enabled !== false).length,
        bot_settings: students.length,
        activity: accountabilityEvents.length,
        next_year_login: nextYearLoginReadiness?.summary?.roster_count || students.length,
        meetings: meetingCount
    };
}

function studentDetailSections(student) {
    const events = student ? studentEvents(student) : [];
    const goalBoardItems = student ? studentGoalBoardItems(student, events) : [];
    const analysisEvents = events.filter(isStudentAnalysisEvent);
    const questions = events.filter(event => event.event_type === 'question');
    const meetings = studentMeetingEvents(student);
    return STUDENT_DETAIL_SECTIONS.map(section => {
        const count = ({
            assignments: student ? assignmentsForStudent(student).length : 0,
            goal_board: goalBoardItems.length,
            tablet_access: student ? studentDevices(student).length : 0,
            analysis: analysisEvents.length,
            questions: questions.length,
            documents: student ? assignmentsForStudent(student).filter(assignment => assignmentMaterialHref(assignment) || assignmentWorksheetReady(assignment, assignmentStudentRowsForStudent(assignment, student))).length : 0,
            portal_links: student && (student.student_access_code || student.student_access_enabled !== false) ? 1 : 0,
            meetings: meetings.length,
            group_goal: student && torahStudentRecord(student) ? 1 : 0,
            parent_family: student && (student.parent_name || student.parent_email || student.parent_phone || linkedSignupForStudent(student)) ? 1 : 0,
            bot_settings: student ? 1 : 0,
            activity: events.length,
        })[section.id];
        return count === undefined ? section : { ...section, count };
    });
}

function studentMeetingEvents(student) {
    if (!student) return [];
    return studentEvents(student)
        .filter(event => ['private_meeting', 'decision', 'learning_note', 'class_session'].includes(event.event_type))
        .filter(event => !isStudentAnalysisEvent(event))
        .sort(sortEventsNewestFirst);
}

function renderStudentIdentityReviewPanel() {
    const openReviews = (studentIdentityReviews || []).filter(review => ['open', 'needs_decision', 'blocked'].includes(String(review.status || 'open')));
    return `
        <section class="focus-panel">
            <div class="task-section-header">
                <div>
                    <h3>Identity Review</h3>
                    <p>${openReviews.length} possible duplicate${openReviews.length === 1 ? '' : 's'} need review.</p>
                </div>
                <div class="task-actions" style="margin-top:0;">
                    <button class="task-action" type="button" onclick="refreshStudentIdentityReviews(event)">Refresh</button>
                    <button class="task-action primary" type="button" onclick="scanStudentIdentityDuplicates(event)">Scan for duplicates</button>
                </div>
            </div>
            ${identityBackfillNotice ? `<div class="settings-disabled-note">${escapeHtml(identityBackfillNotice)}</div>` : ''}
            ${openReviews.length ? `<div class="task-list">${openReviews.slice(0, 6).map(renderStudentIdentityReviewCard).join('')}</div>` : '<div class="empty-state">No open student duplicate reviews loaded.</div>'}
        </section>
    `;
}

function renderStudentIdentityReviewCard(review = {}) {
    const chips = [...(review.evidence_chips || []), ...(review.language_chips || [])]
        .filter(Boolean)
        .slice(0, 8);
    const targetId = Number(review.target_student_id || 0);
    const candidateId = Number(review.candidate_student_id || 0);
    return `
        <article class="task-card">
            <div class="task-card-header">
                <div>
                    <div class="task-title">#${Number(review.id)} ${escapeHtml(review.target_name || 'Student A')} / ${escapeHtml(review.candidate_name || 'Student B')}</div>
                    <div class="task-meta">
                        <span>${Math.round(Number(review.confidence || 0))}% confidence</span>
                        <span>${escapeHtml(review.status || 'open')}</span>
                        <span>${escapeHtml(formatDateTime(review.created_at))}</span>
                    </div>
                </div>
            </div>
            <div class="student-row-meta" style="margin:8px 0;">
                ${chips.map(chip => `<span>${escapeHtml(chip)}</span>`).join('')}
                ${review.masked_parent_email ? `<span>${escapeHtml(review.masked_parent_email)}</span>` : ''}
                ${review.masked_parent_phone ? `<span>${escapeHtml(review.masked_parent_phone)}</span>` : ''}
            </div>
            <p class="task-notes">${escapeHtml(review.evidence_summary || 'Review these records before merging.')}</p>
            <div class="task-actions">
                ${targetId && candidateId ? `<button class="task-action primary" onclick="approveStudentIdentityMerge(event, ${Number(review.id)}, ${targetId}, ${candidateId})">Merge into A</button>` : ''}
                ${targetId && candidateId ? `<button class="task-action primary" onclick="approveStudentIdentityMerge(event, ${Number(review.id)}, ${candidateId}, ${targetId})">Merge into B</button>` : ''}
                <button class="task-action" onclick="rejectStudentIdentityReview(event, ${Number(review.id)})">Not same person</button>
                <button class="task-action" onclick="blockStudentIdentityReview(event, ${Number(review.id)})">Needs Shloimie</button>
                ${targetId ? `<button class="task-action" onclick="selectStudentAndOpen(${targetId}, 'profile')">Open A</button>` : ''}
                ${candidateId ? `<button class="task-action" onclick="selectStudentAndOpen(${candidateId}, 'profile')">Open B</button>` : ''}
            </div>
        </article>
    `;
}

function renderStudents() {
    const state = studentViewState();
    const groupProgress = Number(torahSummary?.group?.groupPercentage || 0);
    const inStudentWorkspace = !['overview', 'list'].includes(studentSection) && state.selectedStudent;

    return `
        <div class="container">
            <div class="page-heading">
                <div>
                    <div class="page-kicker">Student Accountability</div>
                    <h2>Students</h2>
                    <p>Scan progress first, then work inside the focused student views for goals, tablets, questions, and portal links.</p>
                </div>
            </div>
            ${renderStudentIdentityReviewPanel()}
            ${inStudentWorkspace ? renderStudentWorkspaceNav(state.selectedStudent, studentSection) : renderSectionNav(tabsWithCounts(STUDENT_SUBTABS, state.tabCounts), studentSection, 'setStudentSection')}
            ${renderStudentSection({
                ...state,
                groupProgress
            })}
        </div>
    `;
}

function renderStudentWorkspaceNav(student, section) {
    const sectionLabel = STUDENT_SUBTABS.find(tab => tab.id === section)?.label || 'Workspace';
    return `
        <div class="student-workspace-nav">
            <button type="button" class="task-action" onclick="openStudentList()">Back to student list</button>
            <div>
                <span class="event-type">Student Workspace</span>
                <strong>${escapeHtml(student.name || 'Student')}</strong>
                <small>${escapeHtml(sectionLabel)}</small>
            </div>
        </div>
    `;
}

function renderStudentSection(state) {
    if (studentSection === 'group_goal') return renderStudentGroupGoalView(state);
    if (studentSection === 'list') return renderStudentListView(state);
    if (studentSection === 'profile') return renderStudentProfileView(state);
    if (studentSection === 'parent_family') return renderStudentParentFamilyView(state);
    if (studentSection === 'assignments') return renderStudentAssignmentsView(state);
    if (studentSection === 'goal_board') return renderStudentGoalBoardView(state);
    if (studentSection === 'tablet_access') return renderStudentTabletAccessView(state);
    if (studentSection === 'analysis') return renderStudentAnalysisView(state);
    if (studentSection === 'questions') return renderStudentQuestionsView(state);
    if (studentSection === 'documents') return renderStudentDocumentsView(state);
    if (studentSection === 'portal_links') return renderStudentPortalLinksView(state);
    if (studentSection === 'bot_settings') return renderStudentBotSettingsView(state);
    if (studentSection === 'activity') return renderStudentActivityView(state);
    if (studentSection === 'next_year_login') return renderStudentNextYearLoginView(state);
    if (studentSection === 'meetings') return renderStudentMeetingsView(state);
    return renderStudentOverview(state);
}

function renderStudentOverview(state) {
    return `
        <section class="focus-panel" aria-label="Students overview">
            ${renderStudentFilterPanel(state)}
            <div class="student-row-list">
                ${state.visibleStudents.length ? state.visibleStudents.map(student => renderStudentListRow(student, state, { targetSection: 'profile' })).join('') : '<div class="empty-state"><p>No students match this filter.</p></div>'}
            </div>
        </section>
    `;
}

function renderStudentListView(state) {
    return `
        <section class="focus-panel" aria-label="Student list">
            ${renderStudentFilterPanel(state)}
            ${state.visibleStudents.length === 0 ? `
                <div class="empty-state"><p>No students match this filter.</p></div>
            ` : `
                <div class="student-row-list">
                    ${state.visibleStudents.map(student => renderStudentListRow(student, state, { targetSection: 'profile' })).join('')}
                </div>
            `}
        </section>
    `;
}

function renderStudentFilterPanel(state) {
    const statusOptions = ACCOUNTABILITY_FILTERS.map(filter => ({
        value: filter.id,
        label: `${filter.label}${state.accountabilityCounts[filter.id] ? ` (${state.accountabilityCounts[filter.id]})` : ''}`
    }));
    const audienceOptions = [
        { value: 'all', label: `All people (${state.audienceCounts.all || 0})` },
        { value: 'internal', label: `Internal school (${state.audienceCounts.internal || 0})` },
        { value: 'external', label: `External (${state.audienceCounts.external || 0})` },
    ];
    const botOptions = STUDENT_BOT_FILTERS.map(filter => ({
        value: filter.id,
        label: `${filter.label}${state.botCounts[filter.id] ? ` (${state.botCounts[filter.id]})` : ''}`
    }));
    return `
        <details class="filter-details" open>
            <summary>Filters</summary>
            <div class="filter-details-body">
                <div class="filter-row">
                    <span class="filter-label">People</span>
                    ${renderFilterSelect('setStudentFilter', 'audience', studentAudienceFilter, audienceOptions, 'Student internal external filter')}
                </div>
                <div class="filter-row">
                    <span class="filter-label">Date</span>
                    ${COMMON_DATE_FILTERS.map(filter => renderFilterChip('setStudentFilter', 'date', filter.id, filter.label, studentDateFilter)).join('')}
                </div>
                <div class="filter-row">
                    <span class="filter-label">Status</span>
                    ${renderFilterSelect('setStudentFilter', 'accountability', studentAccountabilityFilter, statusOptions, 'Student accountability filter')}
                </div>
                <div class="filter-row">
                    <span class="filter-label">Bot Route</span>
                    ${renderFilterSelect('setStudentFilter', 'bot', studentBotFilter, botOptions, 'Student bot route filter')}
                </div>
                ${renderFilterCountNote(state.visibleStudents.length, students.length, 'student')}
            </div>
        </details>
    `;
}

function renderStudentListRow(student, state, options = {}) {
    const torahRecord = state.torahById.get(String(student.id));
    const snapshot = studentAccountabilitySnapshot(student);
    const learningStatus = studentLearningStatus(student, { torahRecord });
    const meta = snapshot.metadata || {};
    const agreement = meta.agreement || {};
    const consequence = meta.consequence || {};
    const due = meta.due_at ? formatGoalDue(meta.due_at) : '';
    const accessDuration = consequence.success_duration_minutes || consequence.duration_minutes || '';
    const statusLabel = ACCOUNTABILITY_FILTERS.find(filter => filter.id === snapshot.status)?.label || snapshot.status;
    const botState = studentBotRouteState(student);
    const targetSection = options.targetSection || studentSection || 'profile';
    return `
        <button type="button" class="student-row ${String(state.selectedStudent?.id) === String(student.id) ? 'active' : ''}" data-helper-record-type="student" data-helper-record-id="${Number(student.id)}" onclick="selectStudentAndOpen(${Number(student.id)}, '${targetSection}')">
            <div class="student-row-main">
                <div>
                    <div class="student-row-name">${escapeHtml(student.name)}</div>
                    <div class="student-row-subtitle">${escapeHtml(snapshot.goal?.title || 'No accountability agreement yet')}</div>
                </div>
                <span class="student-card-status">${escapeHtml(statusLabel)}</span>
            </div>
            <div class="student-row-meta">
                <span>${escapeHtml(personAudienceLabel(studentAudienceKey(student)))}</span>
                <span>${escapeHtml(snapshot.deviceLabel)}</span>
                <span>Bot ${escapeHtml(studentBotRouteLabel(botState))}</span>
                <span>Updated ${escapeHtml(learningStatus.lastUpdatedAt ? formatDate(learningStatus.lastUpdatedAt) : 'not yet')}</span>
                <span>Attendance ${escapeHtml(learningStatus.attendance.label)}</span>
                <span>Goal ${Number(learningStatus.goalProgress || 0)}%</span>
                ${due ? `<span>Due ${escapeHtml(due)}</span>` : ''}
                ${agreement.bedtime_time || agreement.wake_time ? `<span>Bed ${escapeHtml(agreement.bedtime_time || '--')} / Up ${escapeHtml(agreement.wake_time || '--')}</span>` : ''}
                ${accessDuration ? `<span>${Number(accessDuration)} min access</span>` : ''}
                ${torahRecord ? `<span>Trip ${Number(learningStatus.tripProgress || 0)}%</span>` : ''}
                ${consequence.recovery_path ? `<span>${escapeHtml(consequence.recovery_path)}</span>` : ''}
                ${snapshot.accessWindow ? `<span>Open ${escapeHtml(snapshot.accessWindow)}</span>` : ''}
            </div>
            <span class="student-row-open">Open</span>
        </button>
    `;
}

function renderStudentCard(student, state, options = {}) {
    return renderStudentListRow(student, state, options);
}

function renderStudentGroupGoalView(state) {
    return `
        <section class="student-two-column" aria-label="Group Torah goal">
            ${renderStudentDetailSidebar(state.selectedStudent, 'group_goal')}
            <div class="student-workspace">
                ${renderGroupGoalPanel()}
                <div class="focus-panel">
                    ${state.selectedStudent ? renderTorahAdminPanel(state.selectedStudent, torahStudentRecord(state.selectedStudent)) : '<div class="empty-state"><p>Select a student to edit a Torah entry.</p></div>'}
                </div>
            </div>
        </section>
    `;
}

function liveMemberForStudent(student) {
    if (!student) return null;
    const signup = linkedSignupForStudent(student);
    const studentId = String(student.id || '');
    const signupId = String(student.signup_id || signup?.id || '');
    const emailKeys = [
        student.parent_email,
        signup?.parent_email,
        student.email,
    ].map(normalizeEmailKey).filter(Boolean);
    return (members || []).find(member => {
        if (studentId && String(member.student_id || '') === studentId) return true;
        if (signupId && String(member.signup_id || '') === signupId) return true;
        const memberEmail = normalizeEmailKey(member.email || '');
        return memberEmail && emailKeys.includes(memberEmail);
    }) || null;
}

function renderStudentLiveMemberAccessPanel(student) {
    if (!student) return '';
    const member = liveMemberForStudent(student);
    if (!member) {
        return `
            <div class="student-profile-section full">
                <h4>Live Class Access</h4>
                <p class="settings-disabled-note">No member access record is linked to this student or family yet.</p>
                <div class="task-actions">
                    <button class="task-action" type="button" onclick="createLiveMemberForStudent(${Number(student.id)})">Create member access</button>
                    <button class="task-action" type="button" onclick="switchView('live_classes')">Open Live Classes</button>
                </div>
            </div>
        `;
    }
    return `
        <div class="student-profile-section full">
            <h4>Live Class Access</h4>
            <div class="settings-control-grid compact">
                <label>Name<input id="memberName${Number(member.id)}" type="text" value="${escapeHtml(member.display_name || '')}"></label>
                <label>Email<input id="memberEmail${Number(member.id)}" type="email" value="${escapeHtml(member.email || '')}"></label>
                <label>Phone<input id="memberPhone${Number(member.id)}" type="tel" value="${escapeHtml(member.phone || '')}"></label>
                <label>Tier<select id="memberTier${Number(member.id)}">${liveClassTierOptions(member.access_tier)}</select></label>
                <label>Status<select id="memberStatus${Number(member.id)}">${liveMemberStatusOptions(member.access_status)}</select></label>
                <label>Enabled<select id="memberEnabled${Number(member.id)}"><option value="true" ${member.access_enabled === false ? '' : 'selected'}>Enabled</option><option value="false" ${member.access_enabled === false ? 'selected' : ''}>Disabled</option></select></label>
                <label class="settings-wide">Notes<textarea id="memberNotes${Number(member.id)}" rows="2">${escapeHtml(member.notes || '')}</textarea></label>
            </div>
            <div class="task-actions" style="margin-top:14px;">
                <button class="task-action primary" type="button" onclick="updateLiveMember(${Number(member.id)})">Save member access</button>
                <button class="task-action" type="button" onclick="createLiveMemberAccessCode(${Number(member.id)}, false)">Create/copy member link</button>
                ${member.access_url ? `<a class="task-action" href="${escapeHtml(member.access_url)}" target="_blank" rel="noopener">Open portal</a>` : ''}
                <button class="task-action" type="button" onclick="switchView('live_classes')">Open Live Classes</button>
            </div>
        </div>
    `;
}

function renderStudentProfileView(state) {
    return `
        <section class="student-two-column" aria-label="Student profile">
            ${renderStudentDetailSidebar(state.selectedStudent, 'profile')}
            <div class="focus-panel">
                ${state.selectedStudent ? `${renderStudentProfileSummary(state.selectedStudent)}${renderStudentLiveMemberAccessPanel(state.selectedStudent)}` : '<div class="empty-state"><p>Select a student to see their profile.</p></div>'}
            </div>
        </section>
    `;
}

function renderStudentParentFamilyView(state) {
    const student = state.selectedStudent;
    const signup = linkedSignupForStudent(student);
    return `
        <section class="student-two-column" aria-label="Parent and family">
            ${renderStudentDetailSidebar(student, 'parent_family')}
            <div class="focus-panel">
                ${student ? `
                    <div class="student-profile-section full">
                        <h4>${escapeHtml(student.name || 'Student')} Family</h4>
                        <div class="contact-detail-grid">
                            ${renderContactDetailItem('Parent', student.parent_name || signup?.parent_name || 'Not linked yet')}
                            ${renderContactDetailItem('Parent Email', student.parent_email || signup?.parent_email || 'Not entered')}
                            ${renderContactDetailItem('Parent Phone', student.parent_phone || signup?.parent_phone || 'Not entered')}
                            ${renderContactDetailItem('Student Email', student.email || 'Not entered')}
                            ${renderContactDetailItem('Current School', student.current_school || signup?.previous_school || 'Not entered')}
                            ${renderContactDetailItem('Grade', student.grade || signup?.student_grade || 'Not entered')}
                            ${renderContactDetailItem('Audience', personAudienceLabel(studentAudienceKey(student)))}
                            ${renderContactDetailItem('Signup', signup?.id ? `Signup #${signup.id}` : 'No signup linked')}
                        </div>
                        <div class="task-actions" style="margin-top:14px;">
                            ${signup ? `<button class="task-action primary" onclick="openSignupContact(${attrJson(contactKey(signup))})">Open parent/contact detail</button>` : '<button class="task-action" disabled>No parent contact detail</button>'}
                            ${renderParentPortalActionButtons(signup ? 'signup' : 'student', signup?.id || student.id, { email: student.parent_email || signup?.parent_email, phone: student.parent_phone || signup?.parent_phone })}
                        </div>
                    </div>
                ` : '<div class="empty-state"><p>Select a student to see parent/family information.</p></div>'}
            </div>
        </section>
    `;
}

function assignmentPromptForKey(promptKey = 'worksheet_generation') {
    return (assignmentPrompts || []).find(prompt => String(prompt.prompt_key) === String(promptKey)) || null;
}

function assignmentStudentRowsForStudent(assignment, student) {
    const rows = Array.isArray(assignment?.students) ? assignment.students : [];
    if (!student) return rows;
    return rows.filter(row => String(row.student_id || '') === String(student.id || ''));
}

function assignmentAppliesToStudent(assignment, student) {
    return !student || assignmentStudentRowsForStudent(assignment, student).length > 0;
}

function assignmentsForStudent(student) {
    return (assignments || [])
        .filter(assignment => assignment.status !== 'archived')
        .filter(assignment => assignmentAppliesToStudent(assignment, student))
        .sort((a, b) => Date.parse(a.created_at || 0) - Date.parse(b.created_at || 0));
}

function assignmentMaterialHref(assignment) {
    return String(assignment?.youtube_url || assignment?.material_url || '').trim();
}

function formatAssignmentDate(value) {
    if (!value) return '';
    return formatDateTime(value);
}

function assignmentStudentCount(assignment, student = null) {
    const rows = assignmentStudentRowsForStudent(assignment, student);
    return rows.length || (assignment.students || []).length || 0;
}

function assignmentWorksheetReady(assignment, rows = []) {
    return Boolean(
        String(assignment?.worksheet_body || assignment?.edited_worksheet || assignment?.generated_worksheet || '').trim()
        || rows.some(row => String(row.worksheet_body || row.edited_worksheet || row.generated_worksheet || '').trim())
    );
}

function assignmentScheduleEntries(assignment, student = null) {
    const rows = assignmentStudentRowsForStudent(assignment, student);
    const sourceRows = rows.length ? rows : (assignment.students || []);
    const entries = [];
    sourceRows.forEach(row => {
        const rowScheduleItems = Array.isArray(row.schedule_items) ? row.schedule_items : [];
        if (rowScheduleItems.length) {
            rowScheduleItems.forEach(item => {
                if (!item.start_at) return;
                entries.push({
                    assignment,
                    row,
                    start_at: item.start_at,
                    end_at: item.end_at || row.due_at || '',
                    label: item.display_label || item.title || assignment.title || 'Assignment',
                    student_name: row.student_name || '',
                    status: row.status || assignment.status || 'assigned',
                });
            });
            return;
        }
        if (row.scheduled_start_at || row.due_at) {
            entries.push({
                assignment,
                row,
                start_at: row.scheduled_start_at || row.due_at,
                end_at: row.due_at || row.scheduled_start_at || '',
                label: assignment.title || 'Assignment',
                student_name: row.student_name || '',
                status: row.status || assignment.status || 'assigned',
            });
        }
    });
    if (!entries.length && assignment.schedule_plan?.scheduled_start_at) {
        entries.push({
            assignment,
            row: {},
            start_at: assignment.schedule_plan.scheduled_start_at,
            end_at: assignment.schedule_plan.due_at || '',
            label: assignment.title || 'Assignment',
            student_name: student?.name || '',
            status: assignment.status || 'scheduled',
        });
    }
    return entries
        .filter(entry => Number.isFinite(new Date(entry.start_at).getTime()))
        .sort((a, b) => Date.parse(a.start_at || 0) - Date.parse(b.start_at || 0));
}

function assignmentNextScheduleEntry(assignment, student = null) {
    const entries = assignmentScheduleEntries(assignment, student);
    const now = Date.now();
    return entries.find(entry => Date.parse(entry.start_at) >= now) || entries[0] || null;
}

function assignmentBoardLane(assignment, student = null) {
    const rows = assignmentStudentRowsForStudent(assignment, student);
    const statuses = [assignment.status, ...rows.map(row => row.status)].map(value => String(value || '').toLowerCase());
    if (statuses.some(status => ['submitted', 'reviewed', 'done', 'completed'].includes(status))) return 'review';
    if (assignmentScheduleEntries(assignment, student).length || statuses.includes('scheduled')) return 'scheduled';
    if (!assignmentWorksheetReady(assignment, rows) || statuses.some(status => ['draft', 'generated'].includes(status))) return 'needs_worksheet';
    return 'assigned';
}

function assignmentLaneLabel(laneId) {
    return ({
        needs_worksheet: 'Needs Worksheet',
        scheduled: 'Scheduled',
        assigned: 'Assigned',
        review: 'Review / Done',
    })[laneId] || 'Assigned';
}

function assignmentCalendarDateKey(value) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : '';
}

function addDaysToCalendarDate(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function assignmentProjectKey(assignment = {}) {
    return normalizeProjectKey(assignment.project_key || assignment.metadata?.project_key || (assignment.project_id ? '' : 'bna')) || 'bna';
}

function assignmentProjectLabel(assignment = {}) {
    const project = projectByKey(assignmentProjectKey(assignment));
    return assignment.project_short_name || assignment.project_name || project.short_name || project.name || project.project_key || 'BNA';
}

function classroomPeople(visibleAssignments, student) {
    const people = new Map();
    if (student?.id) people.set(`student-${student.id}`, {
        name: student.name || 'Student',
        detail: 'Selected student',
    });
    visibleAssignments.forEach(assignment => {
        (assignment.students || []).forEach(row => {
            const key = row.student_id ? `student-${row.student_id}` : `name-${row.student_name || 'student'}`;
            if (!people.has(key)) {
                people.set(key, {
                    name: row.student_name || 'Student',
                    detail: [row.status || 'assigned', assignmentProjectLabel(assignment)].filter(Boolean).join(' / '),
                });
            }
        });
    });
    return [...people.values()].sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

function classroomLaneGroups(visibleAssignments, student) {
    const sorted = visibleAssignments.slice().sort((a, b) => {
        const aNext = assignmentNextScheduleEntry(a, student)?.start_at || a.updated_at || a.created_at || '';
        const bNext = assignmentNextScheduleEntry(b, student)?.start_at || b.updated_at || b.created_at || '';
        return Date.parse(bNext || 0) - Date.parse(aNext || 0);
    });
    const scheduled = visibleAssignments
        .filter(assignment => assignmentScheduleEntries(assignment, student).length)
        .sort((a, b) => {
            const aNext = assignmentNextScheduleEntry(a, student)?.start_at || '';
            const bNext = assignmentNextScheduleEntry(b, student)?.start_at || '';
            return Date.parse(aNext || 0) - Date.parse(bNext || 0);
        });
    const review = sorted.filter(assignment => assignmentBoardLane(assignment, student) === 'review'
        || (assignment.students || []).some(row => ['submitted', 'reviewed'].includes(String(row.status || '').toLowerCase())));
    return [
        { id: 'stream', label: 'Stream', type: 'assignments', items: sorted.slice(0, 5), empty: 'No classroom stream updates yet.' },
        { id: 'classwork', label: 'Classwork', type: 'assignments', items: sorted, empty: 'No classwork or materials yet.' },
        { id: 'people', label: 'People', type: 'people', items: classroomPeople(visibleAssignments, student), empty: 'No assigned students or participants yet.' },
        { id: 'calendar', label: 'Calendar', type: 'schedule', items: scheduled, empty: 'No scheduled classroom sessions yet.' },
        { id: 'review', label: 'Review', type: 'assignments', items: review, empty: 'No submissions waiting for review.' },
    ];
}

function renderInternalClassroomBoard(visibleAssignments, student) {
    const scheduledCount = visibleAssignments.filter(assignment => assignmentScheduleEntries(assignment, student).length).length;
    const worksheetCount = visibleAssignments.filter(assignment => assignmentWorksheetReady(assignment, assignmentStudentRowsForStudent(assignment, student))).length;
    const peopleCount = classroomPeople(visibleAssignments, student).length;
    const reviewCount = classroomLaneGroups(visibleAssignments, student).find(lane => lane.id === 'review')?.items?.length || 0;
    const projectLabels = Array.from(new Set(visibleAssignments.map(assignmentProjectLabel).filter(Boolean)));
    const workspaceLabel = projectLabels.length ? projectLabels.join(' / ') : (currentWorkspaceKey() === 'rabbi_sheller_provider' ? 'One Time' : 'BNA');
    return `
        <section class="student-profile-section full classroom-board" data-classroom-board>
            <div class="classroom-board-header">
                <div>
                    <h4>${student ? `${escapeHtml(student.name)} Classroom` : 'BNA Classroom'}</h4>
                    <div class="event-meta">Stream, Classwork, People, Calendar, and Review are first-party BNA classroom lanes.</div>
                </div>
                <span class="badge badge-category-accountability">${escapeHtml(workspaceLabel)} / ${visibleAssignments.length} item${visibleAssignments.length === 1 ? '' : 's'}</span>
            </div>
            <div class="classroom-context-strip" data-local-classroom-first>
                <strong>Local classroom first</strong>
                <span>This classroom runs on BNA assignments, schedule items, worksheets, source materials, and portal-safe student rows. It does not require Google Classroom OAuth.</span>
                <div class="classroom-policy-chips">
                    <span>Google optional and gated</span>
                    <span>Buffer draft-only</span>
                    <span>Email manual/current path</span>
                    <span>Resend campaigns off</span>
                </div>
            </div>
            <div class="classroom-board-metrics">
                ${renderClassroomMetric(visibleAssignments.length, 'Total')}
                ${renderClassroomMetric(peopleCount, 'People')}
                ${renderClassroomMetric(worksheetCount, 'Worksheets')}
                ${renderClassroomMetric(scheduledCount, 'Scheduled')}
                ${renderClassroomMetric(reviewCount, 'Review')}
            </div>
            <div class="classroom-lanes">
                ${classroomLaneGroups(visibleAssignments, student).map(lane => renderClassroomLane(lane, student)).join('')}
            </div>
        </section>
    `;
}

function renderClassroomMetric(value, label) {
    return `
        <div class="classroom-board-metric">
            <strong>${Number(value || 0)}</strong>
            <span>${escapeHtml(label)}</span>
        </div>
    `;
}

function renderClassroomLane(lane, student) {
    const items = Array.isArray(lane.items) ? lane.items : [];
    return `
        <div class="classroom-lane" data-classroom-lane="${escapeHtml(lane.id)}">
            <div class="classroom-lane-head">
                <span>${escapeHtml(lane.label)}</span>
                <span>${items.length}</span>
            </div>
            <div class="classroom-lane-items">
                ${items.length
                    ? renderClassroomLaneItems(lane, items, student)
                    : `<div class="event-meta">${escapeHtml(lane.empty || 'No classroom items')}</div>`}
            </div>
        </div>
    `;
}

function renderClassroomLaneItems(lane, items, student) {
    if (lane.type === 'people') {
        return `<div class="classroom-people-list">${items.slice(0, 12).map(person => `
            <div class="classroom-person-pill">
                <strong>${escapeHtml(person.name || 'Student')}</strong>
                <span>${escapeHtml(person.detail || 'Class participant')}</span>
            </div>
        `).join('')}</div>`;
    }
    return items.slice(0, lane.id === 'classwork' ? 10 : 6).map(assignment => renderClassroomAssignmentTile(assignment, student, lane.id)).join('');
}

function renderClassroomAssignmentTile(assignment, student, laneId) {
    const rows = assignmentStudentRowsForStudent(assignment, student);
    const next = assignmentNextScheduleEntry(assignment, student);
    const material = assignmentMaterialHref(assignment);
    const statusLabel = String(assignment.status || rows[0]?.status || 'draft').replace(/_/g, ' ');
    return `
        <button class="classroom-assignment-tile ${escapeHtml(laneId)}" type="button" onclick="focusAssignmentCard(event, ${Number(assignment.id)})">
            <strong>${escapeHtml(assignment.title || 'Assignment')}</strong>
            <span>${escapeHtml(assignmentProjectLabel(assignment))} / ${escapeHtml(statusLabel)}${next?.start_at ? ` - ${escapeHtml(formatAssignmentDate(next.start_at))}` : ''}</span>
            <span>${assignmentStudentCount(assignment, student)} student${assignmentStudentCount(assignment, student) === 1 ? '' : 's'}${material ? ' - material saved' : ''}</span>
        </button>
    `;
}

function renderAssignmentCalendar(visibleAssignments, student) {
    const entries = visibleAssignments.flatMap(assignment => assignmentScheduleEntries(assignment, student));
    const firstUpcoming = entries.find(entry => Date.parse(entry.start_at) >= Date.now());
    const base = firstUpcoming ? new Date(firstUpcoming.start_at) : new Date();
    base.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = addDaysToCalendarDate(base, index);
        const key = assignmentCalendarDateKey(date);
        return {
            date,
            key,
            items: entries.filter(entry => assignmentCalendarDateKey(entry.start_at) === key),
        };
    });
    const todayKey = assignmentCalendarDateKey(new Date());
    return `
        <section class="student-profile-section full assignment-calendar" data-assignment-calendar>
            <div class="assignment-calendar-header">
                <div>
                    <h4>Classroom Calendar</h4>
                    <div class="event-meta">${entries.length} scheduled item${entries.length === 1 ? '' : 's'}</div>
                </div>
                <span class="badge badge-category-accountability">First-party schedule</span>
            </div>
            <div class="assignment-calendar-grid">
                ${days.map(day => renderAssignmentCalendarDay(day, todayKey)).join('')}
            </div>
        </section>
    `;
}

function renderAssignmentCalendarDay(day, todayKey) {
    const label = day.date.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
    return `
        <div class="assignment-calendar-day ${day.key === todayKey ? 'today' : ''}">
            <div class="assignment-calendar-date">
                <span>${escapeHtml(label)}</span>
                <span>${day.items.length}</span>
            </div>
            <div class="assignment-calendar-items">
                ${day.items.length
                    ? day.items.slice(0, 5).map(renderAssignmentCalendarItem).join('')
                    : '<div class="event-meta">Open</div>'}
            </div>
        </div>
    `;
}

function renderAssignmentCalendarItem(entry) {
    const time = new Date(entry.start_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `
        <button class="assignment-calendar-item" type="button" onclick="focusAssignmentCard(event, ${Number(entry.assignment?.id)})">
            <strong>${escapeHtml(time)} ${escapeHtml(entry.assignment?.title || entry.label || 'Assignment')}</strong>
            <span>${escapeHtml([entry.student_name, entry.status].filter(Boolean).join(' - '))}</span>
        </button>
    `;
}

function renderWs11CommunityAdminPanel(student) {
    return `
        <div class="student-profile-section full" data-ws11-community-admin>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div>
                    <h4>WS11 Mishnah Community</h4>
                    <div class="event-meta">Course library, worksheet submissions, participation points, parent reports, and Rabbi-approved shoutouts.</div>
                </div>
                <span class="badge badge-project-one_time_mishnah_class">One Time</span>
            </div>
            <div class="task-actions" style="margin-top:12px;">
                <button class="task-action" type="button" onclick="backfillWs11Gamification(event)">Backfill events</button>
                <button class="task-action" type="button" ${student ? '' : 'disabled'} onclick="generateWs11ParentReport(event, ${Number(student?.id || 0)})">Generate report</button>
                <button class="task-action" type="button" ${student ? '' : 'disabled'} onclick="createWs11ShoutoutPrompt(event, ${Number(student?.id || 0)})">Add shoutout</button>
                <button class="task-action" type="button" ${student ? '' : 'disabled'} onclick="linkWs11ParentPrompt(event, ${Number(student?.id || 0)})">Link parent</button>
            </div>
            <div class="event-meta" id="ws11-admin-status">${student ? `Selected student: ${escapeHtml(student.name || '')}` : 'Select a student to use student-specific WS11 actions.'}</div>
        </div>
    `;
}

function renderStudentAssignmentsView(state) {
    const student = state.selectedStudent;
    const visibleAssignments = assignmentsForStudent(student);
    return `
        <section class="student-two-column" aria-label="Classroom">
            ${renderStudentDetailSidebar(student, 'assignments')}
            <div class="focus-panel">
                ${renderWs11CommunityAdminPanel(student)}
                ${student ? renderAssignmentCreator(student) : '<div class="empty-state"><p>Select a student to create an assignment.</p></div>'}
                ${renderInternalClassroomBoard(visibleAssignments, student)}
                ${renderAssignmentCalendar(visibleAssignments, student)}
                ${renderAssignmentPromptPanel()}
                <div class="student-profile-section full" style="margin-top:14px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <h4>${student ? `${escapeHtml(student.name)} Classwork` : 'Classwork'}</h4>
                        <span class="badge badge-category-accountability">${visibleAssignments.length} active</span>
                    </div>
                    ${visibleAssignments.length
                        ? `<div class="content-list">${visibleAssignments.map(assignment => renderAssignmentCard(assignment, student)).join('')}</div>`
                        : '<p style="color:#64748b; font-size:13px;">No assignments created yet.</p>'}
                </div>
            </div>
        </section>
    `;
}

function renderAssignmentCreator(student) {
    const selectedId = String(student?.id || '');
    return `
        <form class="student-profile-section full" onsubmit="createStudentAssignment(event)">
            <h4>Create Classroom Material</h4>
            <div class="event-meta">Create the BNA classroom item first. Google Classroom and Calendar are optional preview/confirm syncs, and this flow does not need Google OAuth to work locally.</div>
            <div class="form-row" style="margin-top:12px;">
                <div class="form-group">
                    <label for="assignment-title">Title</label>
                    <input id="assignment-title" name="title" required placeholder="Mishnayos video worksheet">
                </div>
                <div class="form-group">
                    <label for="assignment-youtube">Paste YouTube URL</label>
                    <input id="assignment-youtube" name="youtube_url" placeholder="https://www.youtube.com/watch?v=...">
                    <button class="task-action" type="button" style="margin-top:8px;" onclick="fetchAssignmentMetadata(event)">Fetch Metadata</button>
                    <div class="event-meta" id="assignment-youtube-meta-status"></div>
                </div>
                <div class="form-group">
                    <label for="assignment-link">Link Material</label>
                    <input id="assignment-link" name="material_url" placeholder="https://...">
                </div>
            </div>
            <div class="form-group">
                <label for="assignment-instructions">Instructions</label>
                <textarea id="assignment-instructions" name="instructions" placeholder="Watch the video and answer in your own words."></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="assignment-prompt-patch">Assignment Prompt Patch</label>
                    <textarea id="assignment-prompt-patch" name="prompt_patch_text" placeholder="Focus on responsibility and practical takeaway."></textarea>
                </div>
                <div class="form-group">
                    <label for="assignment-teacher-patch">Parent / Teacher Instruction Patch</label>
                    <textarea id="assignment-teacher-patch" name="teacher_instruction_patch" placeholder="Keep it short, concrete, and in Hebrew where helpful."></textarea>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="assignment-language">Language</label>
                    <select id="assignment-language" name="language_mode">
                        <option value="mixed">Mixed</option>
                        <option value="english">English</option>
                        <option value="hebrew">Hebrew</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="assignment-style">Worksheet Type</label>
                    <select id="assignment-style" name="worksheet_type">
                        <option value="short_answer">Short Answer</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="reflection_questions">Reflection Questions</option>
                        <option value="summary_questions">Summary Questions</option>
                        <option value="torah_values_takeaway">Torah / Values Takeaway</option>
                        <option value="practical_action_step">Practical Action Step</option>
                        <option value="parent_discussion_questions">Parent Discussion Questions</option>
                        <option value="teacher_review_version">Teacher Review Version</option>
                        <option value="age_level_adjustment">Age / Level Adjustment</option>
                        <option value="comprehension">Comprehension</option>
                        <option value="source_questions">Source Questions</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="assignment-schedule">Natural Schedule</label>
                    <input id="assignment-schedule" name="schedule_text" placeholder="Tomorrow at 10:30">
                </div>
                <div class="form-group">
                    <label>External sync</label>
                    <label class="prompt-example-check">
                        <input id="assignment-classroom-sync" type="checkbox" name="google_classroom_sync">
                        Optional Google Classroom sync (gated)
                    </label>
                    <label class="prompt-example-check">
                        <input id="assignment-calendar-sync" type="checkbox" name="google_calendar_sync">
                        Optional Google Calendar sync (gated)
                    </label>
                    <label class="prompt-example-check">
                        <input id="assignment-video-processing" type="checkbox" name="queue_video_download">
                        Optional download/process video
                    </label>
                </div>
            </div>
            <details class="filter-details collapsible-details">
                <summary>Students</summary>
                <div class="filter-details-body" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;">
                    ${(students || []).map(item => `
                        <label class="prompt-example-check">
                            <input type="checkbox" name="student_ids" value="${Number(item.id)}" ${String(item.id) === selectedId ? 'checked' : ''}>
                            ${escapeHtml(item.name)}
                        </label>
                    `).join('')}
                </div>
            </details>
            <div class="task-actions">
                <button class="task-action primary" type="submit">Create Classroom Item</button>
            </div>
        </form>
    `;
}

function renderAssignmentPromptPanel() {
    const prompt = assignmentPromptForKey('worksheet_generation');
    return `
        <details class="student-profile-section full filter-details collapsible-details" style="margin-top:14px;">
            <summary>Worksheet Prompt Patch</summary>
            <div class="filter-details-body">
                <div class="event-meta">Saved prompt ${prompt?.version ? `v${prompt.version}` : 'not loaded'}. Corrections here affect future worksheet generation.</div>
                <div class="form-group" style="margin-top:10px;">
                    <label for="assignmentPromptText">Prompt</label>
                    <textarea id="assignmentPromptText" style="min-height:180px;">${escapeHtml(prompt?.prompt_text || '')}</textarea>
                </div>
                <div class="task-actions">
                    <button class="task-action primary" onclick="saveAssignmentPrompt(event)">Save Prompt</button>
                </div>
            </div>
        </details>
    `;
}

function renderAssignmentStudentRows(assignment, student) {
    const rows = assignmentStudentRowsForStudent(assignment, student);
    if (!rows.length) return '';
    return rows.map(row => {
        const scheduleItems = Array.isArray(row.schedule_items) ? row.schedule_items : [];
        return `
        <details class="filter-details collapsible-details" style="margin-top:10px;">
            <summary>${escapeHtml(row.student_name || 'Student')} - ${escapeHtml(row.status || 'assigned')}</summary>
            <div class="filter-details-body">
                <div class="event-meta">
                    ${row.scheduled_start_at ? `Starts ${escapeHtml(formatAssignmentDate(row.scheduled_start_at))}` : 'No start time'}
                    ${row.due_at ? ` - Due ${escapeHtml(formatAssignmentDate(row.due_at))}` : ''}
                </div>
                ${row.classroom_alternate_link ? `<div class="event-meta">Classroom: <a href="${escapeHtml(row.classroom_alternate_link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.classroom_alternate_link)}</a></div>` : ''}
                ${row.calendar_html_link ? `<div class="event-meta">Calendar: <a href="${escapeHtml(row.calendar_html_link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.calendar_html_link)}</a></div>` : ''}
                ${scheduleItems.length ? `<div class="event-meta">Schedule: ${scheduleItems.map(item => `${escapeHtml(item.display_label || 'Session')} ${escapeHtml(formatAssignmentDate(item.start_at))}`).join(' | ')}</div>` : ''}
                <div class="form-row">
                    <div class="form-group">
                        <label for="assignmentStudentPatch-${Number(row.id)}">Per-student prompt patch</label>
                        <textarea id="assignmentStudentPatch-${Number(row.id)}" placeholder="Make this easier, harder, more Hebrew, etc.">${escapeHtml(row.prompt_patch_text || '')}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="assignmentStudentPatchInstruction-${Number(row.id)}">Patch instruction / level note</label>
                        <textarea id="assignmentStudentPatchInstruction-${Number(row.id)}" placeholder="Age level, confidence, parent note, or teacher review instruction.">${escapeHtml(row.prompt_patch_instruction || '')}</textarea>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="assignmentStudentClassroom-${Number(row.id)}">Classroom student ID</label>
                        <input id="assignmentStudentClassroom-${Number(row.id)}" value="${escapeHtml(row.classroom_student_id || '')}" placeholder="Google Classroom student user ID">
                    </div>
                    <div class="form-group">
                        <label for="assignmentStudentStatus-${Number(row.id)}">Student assignment status</label>
                        <select id="assignmentStudentStatus-${Number(row.id)}">
                            ${['assigned', 'scheduled', 'published', 'in_progress', 'submitted', 'reviewed', 'completed', 'blocked'].map(status => `<option value="${status}" ${String(row.status || '') === status ? 'selected' : ''}>${escapeHtml(status.replace(/_/g, ' '))}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-top:10px;">
                    <label for="assignmentStudentWorksheet-${Number(row.id)}">Student worksheet</label>
                    <textarea id="assignmentStudentWorksheet-${Number(row.id)}" style="min-height:130px;">${escapeHtml(row.edited_worksheet || row.worksheet_body || row.generated_worksheet || '')}</textarea>
                </div>
                <div class="task-actions">
                    <button class="task-action" onclick="saveAssignmentStudentPatch(event, ${Number(row.id)})">Save Student Patch</button>
                    <button class="task-action primary" onclick="regenerateAssignmentStudentWorksheet(event, ${Number(assignment.id)}, ${Number(row.id)})">Regenerate for this student</button>
                </div>
            </div>
        </details>
    `;
    }).join('');
}

function renderAssignmentCard(assignment, student = null) {
    const rows = assignmentStudentRowsForStudent(assignment, student);
    const material = assignmentMaterialHref(assignment);
    const schedulePlan = assignment.schedule_plan || {};
    const firstSession = Array.isArray(schedulePlan.sessions) ? schedulePlan.sessions[0] : null;
    const feedbackId = `assignmentFeedback-${Number(assignment.id)}`;
    const bodyId = `assignmentBody-${Number(assignment.id)}`;
    const assignmentPatchId = `assignmentPatch-${Number(assignment.id)}`;
    const teacherPatchId = `assignmentTeacherPatch-${Number(assignment.id)}`;
    const videoToggleId = `assignmentVideoProcessing-${Number(assignment.id)}`;
    const courseInputId = `assignmentCourse-${Number(assignment.id)}`;
    const calendarInputId = `assignmentCalendar-${Number(assignment.id)}`;
    const firstRow = rows[0] || (assignment.students || [])[0] || {};
    const youtubeMeta = assignment.youtube_metadata_json || assignment.metadata?.youtube_metadata || {};
    const videoJobs = Array.isArray(assignment.video_processing_jobs) ? assignment.video_processing_jobs : [];
    const latestVideoJob = videoJobs[0] || null;
    const videoProcessingRequested = assignment.video_processing_requested === true
        || String(assignment.video_processing_requested || '').toLowerCase() === 'true';
    return `
        <article class="content-card" id="assignment-card-${Number(assignment.id)}">
            <div class="content-card-header">
                <div>
                    <div class="event-type">Assignment</div>
                    <h3>${escapeHtml(assignment.title || 'Assignment')}</h3>
                    <div class="event-meta">
                        ${escapeHtml(assignment.status || 'draft')}
                        ${assignment.sync_mode ? ` - ${escapeHtml(String(assignment.sync_mode).replace(/_/g, ' '))}` : ''}
                        ${firstSession?.start_at ? ` - Starts ${escapeHtml(formatAssignmentDate(firstSession.start_at))}` : ''}
                    </div>
                </div>
                <span class="badge badge-category-accountability">${rows.length || (assignment.students || []).length} student${(rows.length || (assignment.students || []).length) === 1 ? '' : 's'}</span>
            </div>
            ${material ? `<div class="event-meta" style="word-break:break-all;">Material: <a href="${escapeHtml(material)}" target="_blank" rel="noopener noreferrer">${escapeHtml(material)}</a></div>` : ''}
            ${youtubeMeta.title || assignment.youtube_video_id ? `
                <div class="event-meta">
                    YouTube: ${escapeHtml(youtubeMeta.title || assignment.youtube_video_id || 'saved')}
                    ${youtubeMeta.channel ? ` - ${escapeHtml(youtubeMeta.channel)}` : ''}
                    ${youtubeMeta.duration_seconds ? ` - ${escapeHtml(String(youtubeMeta.duration_seconds))} sec` : ''}
                </div>
            ` : ''}
            ${latestVideoJob ? `<div class="event-meta">Video processing: ${escapeHtml(latestVideoJob.status || 'unknown')}${latestVideoJob.output_file_path ? ` - ${escapeHtml(latestVideoJob.output_file_path)}` : ''}${latestVideoJob.error_message ? ` - ${escapeHtml(latestVideoJob.error_message)}` : ''}</div>` : ''}
            ${assignment.youtube_url ? `
                <label class="prompt-example-check" style="margin-top:8px;">
                    <input id="${videoToggleId}" type="checkbox" ${videoProcessingRequested ? 'checked' : ''}>
                    Optional download/process video
                </label>
            ` : ''}
            ${assignment.instructions ? `<p class="content-card-summary">${escapeHtml(assignment.instructions)}</p>` : ''}
            <div class="form-row" style="margin-top:10px;">
                <div class="form-group">
                    <label for="${assignmentPatchId}">Assignment Prompt Patch</label>
                    <textarea id="${assignmentPatchId}" placeholder="Focus or style for this assignment.">${escapeHtml(assignment.prompt_patch_text || '')}</textarea>
                </div>
                <div class="form-group">
                    <label for="${teacherPatchId}">Parent / Teacher Instruction Patch</label>
                    <textarea id="${teacherPatchId}" placeholder="Extra instruction from parent or teacher.">${escapeHtml(assignment.teacher_instruction_patch || '')}</textarea>
                </div>
            </div>
            <div class="form-group" style="margin-top:10px;">
                <label for="${bodyId}">Worksheet</label>
                <textarea id="${bodyId}" style="min-height:160px;">${escapeHtml(assignment.worksheet_body || firstRow.worksheet_body || '')}</textarea>
            </div>
            <div class="prompt-feedback-box" style="margin-top:10px;">
                <label for="${feedbackId}">Correction to save into the worksheet prompt</label>
                <textarea id="${feedbackId}" placeholder="Example: Make these worksheets shorter and add one practical action at the end."></textarea>
            </div>
            ${assignment.final_resolved_prompt || assignment.original_prompt_text ? `
                <details class="filter-details collapsible-details" style="margin-top:10px;">
                    <summary>Prompt / Generation Record</summary>
                    <div class="filter-details-body">
                        ${assignment.original_prompt_text ? `<div class="form-group"><label>Original prompt</label><textarea readonly style="min-height:120px;">${escapeHtml(assignment.original_prompt_text)}</textarea></div>` : ''}
                        ${assignment.final_resolved_prompt ? `<div class="form-group"><label>Final resolved prompt</label><textarea readonly style="min-height:160px;">${escapeHtml(assignment.final_resolved_prompt)}</textarea></div>` : ''}
                        ${assignment.generated_worksheet ? `<div class="form-group"><label>Generated worksheet</label><textarea readonly style="min-height:120px;">${escapeHtml(assignment.generated_worksheet)}</textarea></div>` : ''}
                        ${assignment.edited_worksheet ? `<div class="form-group"><label>Edited worksheet</label><textarea readonly style="min-height:120px;">${escapeHtml(assignment.edited_worksheet)}</textarea></div>` : ''}
                    </div>
                </details>
            ` : ''}
            ${renderAssignmentStudentRows(assignment, student)}
            <details class="filter-details collapsible-details" style="margin-top:10px;">
                <summary>Google Sync Preview</summary>
                <div class="filter-details-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${courseInputId}">Classroom course ID</label>
                            <input id="${courseInputId}" value="${escapeHtml(firstRow.classroom_course_id || '')}" placeholder="Required for Classroom live sync">
                        </div>
                        <div class="form-group">
                            <label for="${calendarInputId}">Calendar ID</label>
                            <input id="${calendarInputId}" value="${escapeHtml(firstRow.calendar_id || 'primary')}" placeholder="primary">
                        </div>
                    </div>
                    ${firstRow.sync_payload_json?.blockers?.length ? `<div class="error-banner">${escapeHtml(firstRow.sync_payload_json.blockers.join('; '))}</div>` : ''}
                </div>
            </details>
            <div class="task-actions">
                <button class="task-action primary" onclick="generateAssignmentWorksheet(event, ${Number(assignment.id)}, false)">Generate Worksheet</button>
                <button class="task-action" onclick="generateAssignmentWorksheet(event, ${Number(assignment.id)}, true)">Apply Correction + Regenerate</button>
                <button class="task-action" onclick="saveAssignmentWorksheet(event, ${Number(assignment.id)})">Save Edits</button>
                <button class="task-action" onclick="previewAssignmentPrompt(event, ${Number(assignment.id)})">Preview Resolved Prompt</button>
                <button class="task-action" onclick="previewAssignmentGoogleSync(event, ${Number(assignment.id)})">Preview Google Payload</button>
                ${assignment.youtube_url ? `<button class="task-action" onclick="refreshAssignmentYoutubeMetadata(event, ${Number(assignment.id)})">Fetch Metadata</button>` : ''}
                ${assignment.youtube_url ? `<button class="task-action" onclick="queueAssignmentVideoDownload(event, ${Number(assignment.id)})">Queue Video Processing</button>` : ''}
                <button class="task-action primary" onclick="publishAssignmentSchedule(event, ${Number(assignment.id)})">Publish/Schedule</button>
                <button class="task-action danger" onclick="syncAssignmentGoogle(event, ${Number(assignment.id)})">Live Google Sync</button>
            </div>
        </article>
    `;
}

function renderStudentGoalBoardView(state) {
    const student = state.selectedStudent;
    const events = student ? studentEvents(student) : [];
    const goalBoardItems = student ? studentGoalBoardItems(student, events) : [];
    return `
        <section class="student-two-column" aria-label="Goal board">
            ${renderStudentDetailSidebar(student, 'goal_board')}
            <div class="focus-panel">
                ${student ? renderGoalBoardAdminPanel(student, goalBoardItems) : '<div class="empty-state"><p>Select a student to manage their Goal Board.</p></div>'}
            </div>
        </section>
    `;
}

function renderStudentTabletAccessView(state) {
    const student = state.selectedStudent;
    const events = student ? studentEvents(student) : [];
    const goalBoardItems = student ? studentGoalBoardItems(student, events) : [];
    return `
        <section class="student-two-column" aria-label="Tablet access">
            ${renderStudentDetailSidebar(student, 'tablet_access')}
            <div class="focus-panel">
                ${student ? renderDeviceAccessPanel(student, studentDevices(student), goalBoardItems) : '<div class="empty-state"><p>Select a student to manage tablet access.</p></div>'}
            </div>
        </section>
    `;
}

function renderStudentQuestionsView(state) {
    const student = state.selectedStudent;
    const questions = student ? studentEvents(student).filter(event => event.event_type === 'question') : [];
    const allQuestions = accountabilityEvents
        .filter(event => event.event_type === 'question')
        .slice()
        .sort((a, b) => Date.parse(b.occurred_at || b.created_at || 0) - Date.parse(a.occurred_at || a.created_at || 0));
    return `
        <section class="student-two-column" aria-label="Student questions">
            ${renderStudentDetailSidebar(student, 'questions')}
            <div class="focus-panel">
                <div class="student-profile-section full">
                    <div style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;">
                        <h4>${student ? `${escapeHtml(student.name)} Questions` : 'Questions'}</h4>
                        <button class="task-action" onclick="enrichRecentQuestionSources(event)">Source Recent Questions</button>
                    </div>
                    ${renderStudentEventList(questions, 'No questions captured for this student yet.')}
                </div>
                <div class="student-profile-section full" style="margin-top:14px;">
                    <h4>Recent Questions Across Students</h4>
                    ${renderStudentEventList(allQuestions, 'No student questions captured yet.')}
                </div>
            </div>
        </section>
    `;
}

function renderStudentAnalysisView(state) {
    const student = state.selectedStudent;
    const selectedAnalysis = student ? studentAnalysisEvents(student) : [];
    const allAnalysis = accountabilityEvents
        .filter(isStudentAnalysisEvent)
        .slice()
        .sort(sortEventsNewestFirst);
    return `
        <section class="student-two-column" aria-label="Student analysis">
            ${renderStudentDetailSidebar(student, 'analysis')}
            <div class="focus-panel">
                <div class="student-profile-section full">
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
                        <h4>${student ? `${escapeHtml(student.name)} Analysis` : 'Student Analysis'}</h4>
                        ${student ? `<button class="task-action primary" onclick="addStudentAnalysis(event, ${Number(student.id)})">Add Analysis</button>` : ''}
                    </div>
                    ${renderStudentEventList(selectedAnalysis, 'No analysis captured for this student yet.')}
                </div>
                <div class="student-profile-section full" style="margin-top:14px;">
                    <h4>Recent Analysis Across Students</h4>
                    ${renderStudentEventList(allAnalysis, 'No student analysis captured yet.')}
                </div>
            </div>
        </section>
    `;
}

function renderStudentPortalLinksView(state) {
    const student = state.selectedStudent;
    return `
        <section class="student-two-column" aria-label="Portal links">
            ${renderStudentDetailSidebar(student, 'portal_links')}
            <div class="focus-panel">
                ${student ? renderStudentAccessPanel(student) : '<div class="empty-state"><p>Select a student to manage their portal link.</p></div>'}
                <div class="student-list-grid" style="margin-top:14px;">
                    ${students.map(item => `
                        <div class="event-card">
                            <div class="event-type">Portal Link</div>
                            <div class="event-title">${escapeHtml(item.name)}</div>
                            <div class="event-meta">${item.student_access_code ? 'Ready' : 'Not created'} &middot; ${item.student_access_enabled === false ? 'Disabled' : 'Enabled'}</div>
                            ${studentPortalUrl(item) ? `<div class="event-meta" style="word-break:break-all;">${escapeHtml(studentPortalUrl(item))}</div>` : ''}
                            <div class="task-actions">
                                ${studentPortalUrl(item) ? `<button class="task-action primary" onclick="openStudentPortal(event, ${Number(item.id)})">Open</button>` : ''}
                                <button class="task-action" onclick="createStudentAccessLink(event, ${Number(item.id)}, false)">${studentPortalUrl(item) ? 'Refresh Link' : 'Create Link'}</button>
                                ${renderParentPortalActionButtons('student', item.id, { email: item.parent_email, phone: item.parent_phone })}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
}

function renderStudentDocumentsView(state) {
    const student = state.selectedStudent;
    const studentAssignments = student ? assignmentsForStudent(student) : [];
    const visibleDocs = studentAssignments.filter(assignment => (
        assignmentMaterialHref(assignment)
        || assignmentWorksheetReady(assignment, assignmentStudentRowsForStudent(assignment, student))
        || assignment.youtube_url
    ));
    return `
        <section class="student-two-column" aria-label="Student documents and links">
            ${renderStudentDetailSidebar(student, 'documents')}
            <div class="focus-panel">
                <div class="student-profile-section full">
                    <h4>${student ? `${escapeHtml(student.name)} Documents / Links` : 'Documents / Links'}</h4>
                    <div class="event-meta">Assignments, worksheets, video links, and other saved materials already available from the internal classroom data.</div>
                </div>
                ${student ? `
                    <div class="student-list-grid" style="margin-top:14px;">
                        ${visibleDocs.length ? visibleDocs.map(assignment => renderStudentDocumentCard(assignment, student)).join('') : '<div class="empty-state"><p>No visible documents or links are saved for this student yet.</p></div>'}
                    </div>
                ` : '<div class="empty-state"><p>Select a student to see documents and links.</p></div>'}
            </div>
        </section>
    `;
}

function renderStudentDocumentCard(assignment, student) {
    const rows = assignmentStudentRowsForStudent(assignment, student);
    const material = assignmentMaterialHref(assignment);
    const firstRow = rows[0] || {};
    const worksheet = String(firstRow.worksheet_body || firstRow.edited_worksheet || firstRow.generated_worksheet || assignment.worksheet_body || assignment.edited_worksheet || assignment.generated_worksheet || '').trim();
    const status = firstRow.status || assignment.status || 'assigned';
    return `
        <article class="event-card">
            <div class="event-type">${escapeHtml(status)}</div>
            <div class="event-title">${escapeHtml(assignment.title || 'Assignment')}</div>
            <div class="event-meta">
                ${assignment.sync_mode ? `${escapeHtml(String(assignment.sync_mode).replace(/_/g, ' '))} - ` : ''}
                ${firstRow.due_at || assignment.due_at ? `Due ${escapeHtml(formatDateTime(firstRow.due_at || assignment.due_at))}` : 'No due date'}
            </div>
            ${material ? `<div class="event-meta" style="word-break:break-all;">Material: <a href="${escapeHtml(material)}" target="_blank" rel="noopener noreferrer">${escapeHtml(material)}</a></div>` : ''}
            ${assignment.youtube_url ? `<div class="event-meta" style="word-break:break-all;">Video: <a href="${escapeHtml(assignment.youtube_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(assignment.youtube_url)}</a></div>` : ''}
            ${worksheet ? `<div class="goal-board-public">${escapeHtml(limitTextClient(worksheet, 420))}</div>` : '<div class="event-meta">Worksheet text is not saved yet.</div>'}
        </article>
    `;
}

function renderStudentBotSettingsView(state) {
    const student = state.selectedStudent;
    const setting = student ? (studentBotSettingsForChannel(student, 'telegram') || {}) : {};
    const routeState = student ? studentBotRouteState(student) : 'not_configured';
    const promptPreviewId = student ? `studentBotPromptPreview-${Number(student.id)}-telegram` : '';
    const status = setting.status || 'draft';
    const transcriptAccess = setting.transcript_access || 'student_visible';
    const allowedTopics = Array.isArray(setting.allowed_topics) && setting.allowed_topics.length ? setting.allowed_topics : ['goals', 'assignments', 'schedule', 'questions', 'torah_learning', 'parent_messages'];
    const blockedTopics = Array.isArray(setting.blocked_topics) && setting.blocked_topics.length ? setting.blocked_topics : ['admin_notes', 'private_parent_records', 'payments', 'other_students', 'credentials'];
    const checked = (value, fallback = true) => (value === undefined || value === null ? fallback : Boolean(value)) ? 'checked' : '';
    return `
        <section class="student-two-column" aria-label="Student bot settings">
            ${renderStudentDetailSidebar(student, 'bot_settings')}
            <div class="focus-panel">
                ${student ? `
                    <div class="student-profile-section full">
                        <h4>${escapeHtml(student.name || 'Student')} Bot Settings</h4>
                        <div class="contact-detail-grid">
                            ${renderContactDetailItem('Student Portal', student.student_access_enabled === false ? 'Disabled' : 'Enabled or not configured')}
                            ${renderContactDetailItem('Access Code', student.student_access_code ? 'Created' : 'Not created')}
                            ${renderContactDetailItem('Parent Email', student.parent_email || 'Not entered')}
                            ${renderContactDetailItem('Telegram Bot', studentBotRouteLabel(routeState))}
                            ${renderContactDetailItem('Chat Filter', setting.source_chat_id ? 'Chat ID set' : 'No chat ID')}
                            ${renderContactDetailItem('Prompt Profile', setting.prompt_profile || 'student_accountability')}
                        </div>
                    </div>
                    <form id="studentBotSettingsForm-${Number(student.id)}-telegram" class="student-profile-section full" style="margin-top:14px;" onsubmit="saveStudentBotSettings(event, ${Number(student.id)}, 'telegram')">
                        <h4>Telegram Bot Route</h4>
                        <div class="contact-detail-grid">
                            <label>
                                Status
                                <select name="status">
                                    ${['draft', 'active', 'paused', 'blocked', 'archived'].map(item => `<option value="${item}" ${status === item ? 'selected' : ''}>${escapeHtml(item.replace(/_/g, ' '))}</option>`).join('')}
                                </select>
                            </label>
                            <label>
                                Bot Username
                                <input name="bot_username" value="${escapeHtml(setting.bot_username || '')}" placeholder="@student_bot">
                            </label>
                            <label>
                                Bot Display Name
                                <input name="bot_display_name" value="${escapeHtml(setting.bot_display_name || '')}" placeholder="${escapeHtml(student.name || 'Student')} Helper">
                            </label>
                            <label>
                                Source Chat ID
                                <input name="source_chat_id" value="${escapeHtml(setting.source_chat_id || '')}" placeholder="Telegram chat id">
                            </label>
                            <label>
                                Prompt Profile
                                <input name="prompt_profile" value="${escapeHtml(setting.prompt_profile || 'student_accountability')}">
                            </label>
                            <label>
                                Transcript Access
                                <select name="transcript_access">
                                    ${['none', 'student_visible', 'student_and_parent_visible'].map(item => `<option value="${item}" ${transcriptAccess === item ? 'selected' : ''}>${escapeHtml(item.replace(/_/g, ' '))}</option>`).join('')}
                                </select>
                            </label>
                        </div>
                        <div class="contact-detail-grid" style="margin-top:12px;">
                            <label><input type="checkbox" name="include_goal_board" ${checked(setting.include_goal_board, true)}> Goal Board</label>
                            <label><input type="checkbox" name="include_assignments" ${checked(setting.include_assignments, true)}> Assignments</label>
                            <label><input type="checkbox" name="include_calendar" ${checked(setting.include_calendar, true)}> Calendar</label>
                            <label><input type="checkbox" name="include_questions" ${checked(setting.include_questions, true)}> Questions</label>
                            <label><input type="checkbox" name="include_parent_messages" ${checked(setting.include_parent_messages, false)}> Parent Messages</label>
                        </div>
                        <div class="form-grid" style="margin-top:12px;">
                            <label>
                                Allowed Topics
                                <textarea name="allowed_topics">${escapeHtml(allowedTopics.join('\n'))}</textarea>
                            </label>
                            <label>
                                Blocked Topics
                                <textarea name="blocked_topics">${escapeHtml(blockedTopics.join('\n'))}</textarea>
                            </label>
                        </div>
                        <label style="display:block;margin-top:12px;">
                            Base Prompt
                            <textarea name="prompt_text" placeholder="Leave blank to use the default BNA student helper prompt.">${escapeHtml(setting.prompt_text || '')}</textarea>
                        </label>
                        <label style="display:block;margin-top:12px;">
                            Per-Student Prompt Patch
                            <textarea name="prompt_patch_text" placeholder="Student-specific tone, confidence, reading level, or boundaries.">${escapeHtml(setting.prompt_patch_text || '')}</textarea>
                        </label>
                        <div class="task-actions" style="margin-top:12px;">
                            <button type="submit" class="task-action primary">Save Bot Settings</button>
                            <button type="button" class="task-action" onclick="previewStudentBotPrompt(event, ${Number(student.id)}, 'telegram')">Preview Prompt</button>
                        </div>
                        <pre id="${escapeHtml(promptPreviewId)}" class="event-card" style="margin-top:12px;white-space:pre-wrap;max-height:420px;overflow:auto;">${setting.id ? 'Prompt preview not loaded.' : 'Save or preview to generate the filtered student prompt.'}</pre>
                    </form>
                ` : '<div class="empty-state"><p>Select a student to see bot settings.</p></div>'}
            </div>
        </section>
    `;
}

function renderStudentActivityView(state) {
    const student = state.selectedStudent;
    const events = student ? studentEvents(student).slice().sort(sortEventsNewestFirst) : accountabilityEvents.slice().sort(sortEventsNewestFirst);
    return `
        <section class="student-two-column" aria-label="Student activity">
            ${renderStudentDetailSidebar(student, 'activity')}
            <div class="focus-panel">
                <div class="student-profile-section full">
                    <h4>${student ? `${escapeHtml(student.name)} Activity` : 'Student Activity'}</h4>
                    <div class="event-meta">Timeline view of accountability notes, questions, meetings, analysis, and class-session records.</div>
                </div>
                <div class="student-profile-section full" style="margin-top:14px;">
                    ${renderStudentEventList(events, 'No student activity has been captured yet.')}
                </div>
            </div>
        </section>
    `;
}

function nextYearIssueLabel(issue) {
    return ({
        missing_parent_email: 'Missing parent email',
        student_link_disabled: 'Student link disabled',
        missing_student_link: 'Missing student link',
        parent_password_not_set: 'Parent password not set',
        no_assignments: 'No assignments/materials',
        no_visible_materials: 'Assignments have no visible material'
    })[issue] || String(issue || '').replace(/_/g, ' ');
}

function renderNextYearIssueBadges(issues = []) {
    const list = Array.isArray(issues) ? issues : [];
    if (!list.length) return '<span class="badge badge-category-accountability">Ready</span>';
    return list.map(issue => `<span class="badge">${escapeHtml(nextYearIssueLabel(issue))}</span>`).join('');
}

function renderStudentNextYearLoginView() {
    const report = nextYearLoginReadiness;
    const summary = report?.summary || {};
    const rows = Array.isArray(report?.students) ? report.students : [];
    return `
        <section class="focus-panel" aria-label="Next year login readiness">
            <div class="student-profile-section full">
                <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                    <div>
                        <h4>Next Year's Group Login Readiness</h4>
                        <div class="event-meta">Audit parent access, student checkoff links, and whether assignments/materials are already visible in the portals.</div>
                    </div>
                    <div class="task-actions" style="margin-top:0;">
                        <button class="task-action" onclick="refreshNextYearLoginReadiness(event)" ${nextYearLoginReadinessLoading ? 'disabled' : ''}>${nextYearLoginReadinessLoading ? 'Checking...' : 'Refresh Readiness'}</button>
                        <button class="task-action primary" onclick="prepareNextYearLogins(event)" ${nextYearLoginReadinessLoading ? 'disabled' : ''}>Prepare Missing Student Links</button>
                    </div>
                </div>
                <div class="contact-detail-note" style="margin-top:10px;">
                    This action does not bulk-send parent email or WhatsApp login links. Parent links expire quickly, so send them from the per-family buttons when the rollout is ready. Use password setup preview before emailing any parent reset/setup link.
                </div>
                <div class="contact-detail-note" style="margin-top:10px;">
                    Rollout packet: student links can be prepared in bulk; parent login links, parent password setup/reset emails, and WhatsApp login links stay explicit per family. No parent onboarding campaign is sent from this page.
                </div>
            </div>

            ${!report ? `
                <div class="empty-state" style="margin-top:14px;">
                    <p>${nextYearLoginReadinessLoading ? 'Checking next-year login readiness...' : 'Run the readiness check before sending next-year login instructions.'}</p>
                </div>
            ` : `
                <div class="student-profile-kpis" style="margin-top:14px;">
                    ${renderMiniKpi(summary.roster_count || 0, 'Students')}
                    ${renderMiniKpi(summary.login_ready || 0, 'Login Ready')}
                    ${renderMiniKpi(summary.rollout_ready || 0, 'Materials Ready')}
                    ${renderMiniKpi(summary.prepared_student_links || 0, 'Links Prepared')}
                    ${renderMiniKpi(summary.missing_parent_email || 0, 'Missing Email')}
                    ${renderMiniKpi(summary.parent_password_not_set || 0, 'No Password Yet')}
                </div>
                <div class="student-list-grid" style="margin-top:14px;">
                    ${rows.length ? rows.map(renderNextYearLoginStudentCard).join('') : '<div class="empty-state"><p>No active internal students were found for this rollout.</p></div>'}
                </div>
            `}
        </section>
    `;
}

function renderNextYearLoginStudentCard(item = {}) {
    const portalUrl = studentPortalUrl(item);
    const status = item.rollout_ready ? 'Ready for rollout' : item.login_ready ? 'Login ready' : 'Needs setup';
    return `
        <div class="event-card">
            <div class="event-type">${escapeHtml(status)}</div>
            <div class="event-title">${escapeHtml(item.name || 'Student')}</div>
            <div class="event-meta">
                ${escapeHtml(item.parent_email || 'No parent email')}
                &middot; ${Number(item.visible_material_count || 0)}/${Number(item.assignment_count || 0)} visible materials
                ${item.parent_last_login_at ? ` &middot; Parent last login ${escapeHtml(formatDateTime(item.parent_last_login_at))}` : ''}
            </div>
            <div class="student-profile-kpis" style="margin-top:12px;">
                ${renderMiniKpi(item.student_link_ready ? 'Ready' : 'Missing', 'Student Link')}
                ${renderMiniKpi(item.parent_link_ready ? 'Ready' : 'Missing', 'Parent Link')}
                ${renderMiniKpi(item.parent_password_set ? 'Set' : 'Not Set', 'Parent Password')}
                ${renderMiniKpi(item.materials_ready ? 'Ready' : 'Missing', 'Materials')}
            </div>
            <div class="tag-list" style="margin-top:10px;">${renderNextYearIssueBadges(item.issues)}</div>
            ${portalUrl ? `<div class="event-meta" style="margin-top:10px; word-break:break-all;">${escapeHtml(portalUrl)}</div>` : ''}
            <div class="task-actions" style="margin-top:12px;">
                ${portalUrl ? `<button class="task-action primary" onclick="openNextYearStudentPortal(event, ${Number(item.id)})">Open Student Portal</button>` : ''}
                <button class="task-action" onclick="createStudentAccessLink(event, ${Number(item.id)}, false)">${portalUrl ? 'Refresh Student Link' : 'Create Student Link'}</button>
                ${renderParentPortalActionButtons('student', item.id, { email: item.parent_email, phone: item.parent_phone })}
            </div>
        </div>
    `;
}

function renderStudentMeetingsView(state) {
    const student = state.selectedStudent;
    const meetings = studentMeetingEvents(student);
    return `
        <section class="student-two-column" aria-label="Meetings and notes">
            ${renderStudentDetailSidebar(student, 'meetings')}
            <div class="focus-panel">
                <div class="student-profile-section full">
                    <h4>${student ? `${escapeHtml(student.name)} Meetings / Notes` : 'Meetings / Notes'}</h4>
                    ${renderStudentEventList(meetings, 'No private meetings or notes captured yet.')}
                </div>
            </div>
        </section>
    `;
}

function renderStudentDetailSidebar(selectedStudent, activeSection) {
    return renderStudentPicker(selectedStudent, activeSection, {
        sectionMenu: {
            id: `student-${selectedStudent?.id || 'none'}`,
            label: 'Student Sections',
            sections: studentDetailSections(selectedStudent),
            activeId: activeSection,
            handlerName: 'setStudentSection'
        }
    });
}

function renderStudentPicker(selectedStudent, targetSection, options = {}) {
    const dropdownId = cssToken(`student-picker-${targetSection || 'profile'}`);
    const selectedLabel = selectedStudent?.name || 'Choose a student';
    const sectionMenu = options.sectionMenu ? renderPersonSectionMenu(options.sectionMenu) : '';
    return `
        <aside class="student-picker ${sectionMenu ? 'person-detail-sidebar' : ''}">
            ${sectionMenu ? '<button type="button" class="student-picker-back" onclick="openStudentList()">Back to student list</button>' : ''}
            <div class="event-type">Selected Student</div>
            <div class="event-title">${escapeHtml(selectedStudent?.name || 'No student selected')}</div>
            <div class="filter-dropdown student-select-dropdown" data-filter-dropdown="${escapeHtml(dropdownId)}">
                <button type="button" class="filter-dropdown-button" aria-label="Selected student" aria-haspopup="listbox" aria-expanded="false" onclick="toggleFilterDropdown(event, ${attrJson(dropdownId)})">
                    <span class="filter-dropdown-value">${escapeHtml(selectedLabel)}</span>
                    <span class="filter-dropdown-caret" aria-hidden="true"></span>
                </button>
                <div class="filter-dropdown-menu student-select-menu" role="listbox" aria-label="Selected student">
                    ${(students || []).map(student => `
                        <button type="button" class="filter-dropdown-option ${String(selectedStudent?.id) === String(student.id) ? 'active' : ''}" role="option" aria-selected="${String(selectedStudent?.id) === String(student.id) ? 'true' : 'false'}" onclick="selectStudentAndOpen(${Number(student.id)}, ${attrJson(targetSection)})">
                            <strong>${escapeHtml(student.name)}</strong>
                            <span>${escapeHtml([personAudienceLabel(studentAudienceKey(student)), student.parent_name || 'No parent linked', student.next_check_in_date ? `Next ${formatDate(student.next_check_in_date)}` : 'No meeting date'].join(' - '))}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
            ${sectionMenu}
        </aside>
    `;
}

function renderStudentIdentityProfileSection(student = {}) {
    const aliases = Array.isArray(student.aliases) ? student.aliases : [];
    const sourceRecords = Array.isArray(student.source_records) ? student.source_records : [];
    const mergedIds = (students || [])
        .filter(row => Number(row.archived_duplicate_of || 0) === Number(student.id))
        .map(row => row.id);
    const openReviews = (studentIdentityReviews || [])
        .filter(review => Number(review.target_student_id) === Number(student.id) || Number(review.candidate_student_id) === Number(student.id));
    return `
        <div class="student-profile-section full">
            <h4>Identity</h4>
            <div class="contact-detail-grid">
                ${renderContactDetailItem('Canonical', student.canonical_display_name || student.name || 'Not set')}
                ${renderContactDetailItem('English', student.english_name || student.name_en || 'Not set')}
                ${renderContactDetailItem('Hebrew', student.hebrew_name || student.name_he || 'Not set')}
                ${renderContactDetailItem('Status', student.identity_review_status || 'clear')}
                ${renderContactDetailItem('Archived duplicate of', student.archived_duplicate_of ? `Student #${student.archived_duplicate_of}` : 'No')}
                ${renderContactDetailItem('Merged duplicates', mergedIds.length ? mergedIds.map(id => `#${id}`).join(', ') : 'None loaded')}
                ${renderContactDetailItem('Source records', sourceRecords.length ? `${sourceRecords.length} preserved` : 'None')}
                ${renderContactDetailItem('Open reviews', openReviews.length ? String(openReviews.length) : 'None')}
            </div>
            <div class="student-row-meta" style="margin-top:10px;">
                ${aliases.length ? aliases.slice(0, 14).map(alias => `<span>${escapeHtml(alias)}</span>`).join('') : '<span>No aliases</span>'}
            </div>
        </div>
    `;
}

function renderStudentLearningStatusPanel(student, options = {}) {
    const status = studentLearningStatus(student, options);
    const attendance = status.attendance;
    const latestProgressAt = student.latest_progress_at ? formatDateTime(student.latest_progress_at) : '';
    return `
        <div class="student-profile-section full" data-student-learning-status>
            <h4>Learning Status</h4>
            <div class="contact-detail-grid">
                ${renderContactDetailItem('Last Updated', status.lastUpdatedAt ? formatDateTime(status.lastUpdatedAt) : 'No update recorded')}
                ${renderContactDetailItem('Attendance', attendance.label)}
                ${renderContactDetailItem('Attendance Record', attendance.detail)}
                ${renderContactDetailItem('Last Attendance', attendance.latestAt ? `${studentAttendanceStatusLabel(attendance.latestStatus)} - ${formatDateTime(attendance.latestAt)}` : 'No attendance exception recorded')}
                ${renderContactDetailItem('Goal Progress', `${Number(status.goalProgress || 0)}%`)}
                ${renderContactDetailItem('Latest Progress Note', status.latestProgress !== null ? `${Number(status.latestProgress)}%${latestProgressAt ? ` - ${latestProgressAt}` : ''}` : 'No progress note recorded')}
                ${renderContactDetailItem('Trip Progress', `${Number(status.tripProgress || 0)}%`)}
            </div>
        </div>
    `;
}

function renderStudentProfileSummary(student) {
    const events = studentEvents(student);
    const questions = events.filter(event => event.event_type === 'question');
    const goals = events.filter(event => event.event_type === 'student_goal');
    const goalBoardItems = studentGoalBoardItems(student, events);
    const goalCounts = goalBoardCounts(goalBoardItems);
    const topics = uniqueValues(events.map(event => event.topic).filter(Boolean));
    const latest = events.slice().sort((a, b) => Date.parse(b.occurred_at || b.created_at || 0) - Date.parse(a.occurred_at || a.created_at || 0))[0];
    const progressPercent = studentProgressPercent(student, goals);
    const nextCheckIn = nextStudentCheckIn(events);
    const torahRecord = torahStudentRecord(student);
    const torahPercent = Number(torahRecord?.percentage || 0);
    const studentAssignments = assignmentsForStudent(student);
    const learningStatus = studentLearningStatus(student, { events, goals, torahRecord });

    return `
        <div class="student-profile-hero">
            <div class="event-type">Student Profile</div>
            <h3>${escapeHtml(student.name)}</h3>
            <p style="color: #cbd5e1; font-size: 13px; margin-top: 6px;">
                Parent: ${escapeHtml(student.parent_name || 'Not linked yet')}
                ${learningStatus.lastUpdatedAt ? ` &middot; Updated: ${formatDate(learningStatus.lastUpdatedAt)}` : latest ? ` &middot; Latest note: ${formatDate(latest.occurred_at || latest.created_at)}` : ''}
            </p>
            <div class="student-profile-kpis">
                ${renderMiniKpi(questions.length, 'Questions')}
                ${renderMiniKpi(studentAssignments.length, 'Assignments')}
                ${renderMiniKpi(learningStatus.attendance.label, 'Attendance')}
                ${renderMiniKpi(`${Number(learningStatus.goalProgress || 0)}%`, 'Goal Progress')}
                ${renderMiniKpi(goalCounts.due_today || 0, 'Due Today')}
                ${renderMiniKpi(goalCounts.needs_review || 0, 'Needs Review')}
                ${renderMiniKpi(`${torahPercent}%`, 'Trip Progress')}
            </div>
        </div>

        <div class="student-profile-grid">
            <div class="student-profile-section full">
                <h4>Profile Snapshot</h4>
                <div class="event-meta">Weekly goal completion snapshot</div>
                <div class="progress-track"><div class="progress-fill" style="--progress: ${progressPercent}%;"></div></div>
                <p style="color:#94a3b8; font-size:12px; margin-top:8px;">
                    ${goals.length ? `${progressPercent}% average from tracked goal/progress notes.` : 'No active goals logged yet. Use Telegram to add a goal for this student.'}
                </p>
                ${nextCheckIn ? `<p style="color:#cbd5e1; font-size:12px; margin-top:6px;">Next check-in: ${formatDate(nextCheckIn)}</p>` : ''}
            </div>
            ${renderStudentLearningStatusPanel(student, { events, goals, torahRecord })}
            ${renderStudentIdentityProfileSection(student)}
            <div class="student-profile-section">
                <h4>Parent / Contact</h4>
                <div class="contact-detail-grid" style="grid-template-columns:1fr;">
                    ${renderContactDetailItem('Parent', student.parent_name || 'Not linked yet')}
                    ${renderContactDetailItem('Email', student.parent_email || 'Not entered')}
                    ${renderContactDetailItem('Phone', student.parent_phone || 'Not entered')}
                </div>
            </div>
            <div class="student-profile-section">
                <h4>School / Audience</h4>
                <div class="contact-detail-grid" style="grid-template-columns:1fr;">
                    ${renderContactDetailItem('People', personAudienceLabel(studentAudienceKey(student)))}
                    ${renderContactDetailItem('Current School', student.current_school || 'Not entered')}
                    ${renderContactDetailItem('Grade', student.grade || 'Not entered')}
                </div>
            </div>
            <div class="student-profile-section full">
                <h4>Interests / Topics</h4>
                ${topics.length ? topics.slice(0, 14).map(topic => `<span class="badge badge-category-accountability" style="margin: 0 6px 6px 0; display:inline-block;">${escapeHtml(topic)}</span>`).join('') : '<p style="color:#64748b; font-size:13px;">No interests or topics captured yet.</p>'}
            </div>
            <div class="student-profile-section full">
                <h4>Latest Note</h4>
                ${latest ? renderStudentEventList([latest], 'No notes captured yet.') : '<p style="color:#64748b; font-size:13px;">No notes captured yet.</p>'}
            </div>
        </div>
    `;
}

function renderStudentProfilePanel(title, body, open = false) {
    return `
        <details class="student-profile-section full filter-details collapsible-details" ${open ? 'open' : ''}>
            <summary>${escapeHtml(title)}</summary>
            <div class="filter-details-body">${body}</div>
        </details>
    `;
}

function renderGroupGoalPanel() {
    if (!torahSummary || !Array.isArray(torahSummary.students) || !torahSummary.students.length) {
        return `
            <div class="student-profile-hero">
                <div class="event-type">Torah Group Goal</div>
                <h3>Group Torah Goal</h3>
                <p style="color:#cbd5e1; font-size:13px; margin-top:6px;">No Torah goal summary is available yet.</p>
            </div>
        `;
    }
    const groupProgress = Number(torahSummary.group?.groupPercentage || 0);
    const studentsComplete = (torahSummary.students || []).filter(student => Number(student.percentage || 0) >= 100).length;
    return `
        <div class="student-profile-hero">
            <div class="event-type">Torah Group Goal</div>
            <h3>Group Torah Goal: ${groupProgress}%</h3>
            <p style="color:#cbd5e1; font-size:13px; margin-top:6px;">
                ${torahSummary.group?.tripUnlocked
                    ? 'Trip unlocked - everyone reached the full trip goal.'
                    : 'Trip locked - the group goal is not complete yet.'}
            </p>
            <div class="student-profile-kpis">
                ${renderMiniKpi(`${groupProgress}%`, 'Group Progress')}
                ${renderMiniKpi(`${studentsComplete}/${torahSummary.students.length || 0}`, 'Boys at 100%')}
                ${renderMiniKpi(torahSummary.date || 'Today', 'Tracking Date')}
                ${renderMiniKpi(torahSummary.group?.tripUnlocked ? 'Unlocked' : 'Locked', 'Trip')}
            </div>
            <div class="progress-track"><div class="progress-fill" style="--progress: ${groupProgress}%;"></div></div>
            <div class="group-goal-chips">
                ${(torahSummary.students || []).length ? torahSummary.students.map(student => `
                    <div class="group-goal-chip">
                        <span>${escapeHtml(student.name || 'Student')}</span>
                        <strong>${Number(student.percentage || 0)}%</strong>
                    </div>
                `).join('') : '<div class="group-goal-chip"><span>No student progress recorded yet</span><strong>0%</strong></div>'}
            </div>
        </div>
    `;
}

function latestGroupGoalEntries(entries) {
    const byStudent = new Map();
    entries
        .slice()
        .sort((a, b) => Date.parse(b.recorded_date || b.created_at || 0) - Date.parse(a.recorded_date || a.created_at || 0))
        .forEach(entry => {
            const key = entry.student_id ? `id:${entry.student_id}` : `name:${entry.student_name || 'unknown'}`;
            if (!byStudent.has(key)) byStudent.set(key, entry);
        });
    return [...byStudent.values()].sort((a, b) => String(a.student_name || '').localeCompare(String(b.student_name || '')));
}

function renderStudentProfile(student) {
    const events = studentEvents(student);
    const questions = events.filter(event => event.event_type === 'question');
    const goals = events.filter(event => event.event_type === 'student_goal');
    const goalBoardItems = studentGoalBoardItems(student, events);
    const goalCounts = goalBoardCounts(goalBoardItems);
    const deviceList = studentDevices(student);
    const analysisEvents = events.filter(isStudentAnalysisEvent);
    const meetings = events
        .filter(event => ['private_meeting', 'decision', 'learning_note', 'class_session'].includes(event.event_type))
        .filter(event => !isStudentAnalysisEvent(event));
    const topics = uniqueValues(events.map(event => event.topic).filter(Boolean));
    const latest = events.slice().sort((a, b) => Date.parse(b.occurred_at || b.created_at || 0) - Date.parse(a.occurred_at || a.created_at || 0))[0];
    const progressPercent = studentProgressPercent(student, goals);
    const nextCheckIn = nextStudentCheckIn(events);
    const followUps = events.filter(event => event.follow_up_required);
    const torahRecord = torahStudentRecord(student);
    const torahPercent = Number(torahRecord?.percentage || 0);
    const learningStatus = studentLearningStatus(student, { events, goals, torahRecord });

    return `
        <div class="student-profile-hero">
            <div class="event-type">Student Profile</div>
            <h3>${escapeHtml(student.name)}</h3>
            <p style="color: #cbd5e1; font-size: 13px; margin-top: 6px;">
                Parent: ${escapeHtml(student.parent_name || 'Not linked yet')}
                ${learningStatus.lastUpdatedAt ? ` &middot; Updated: ${formatDate(learningStatus.lastUpdatedAt)}` : latest ? ` &middot; Latest note: ${formatDate(latest.occurred_at || latest.created_at)}` : ''}
            </p>
            <div class="student-profile-kpis">
                ${renderMiniKpi(questions.length, 'Questions')}
                ${renderMiniKpi(learningStatus.attendance.label, 'Attendance')}
                ${renderMiniKpi(`${Number(learningStatus.goalProgress || 0)}%`, 'Goal Progress')}
                ${renderMiniKpi(goalCounts.due_today || 0, 'Due Today')}
                ${renderMiniKpi(goalCounts.needs_review || 0, 'Needs Review')}
                ${renderMiniKpi(`${torahPercent}%`, 'Trip Progress')}
            </div>
        </div>

        <div class="student-profile-grid">
            <div class="student-profile-section full">
                ${renderTorahAdminPanel(student, torahRecord)}
            </div>

            <div class="student-profile-section full">
                ${renderStudentAccessPanel(student)}
            </div>

            <div class="student-profile-section full">
                ${renderDeviceAccessPanel(student, deviceList, goalBoardItems)}
            </div>

            <div class="student-profile-section full">
                ${renderGoalBoardAdminPanel(student, goalBoardItems)}
            </div>

            ${renderStudentLearningStatusPanel(student, { events, goals, torahRecord })}

            <div class="student-profile-section">
                <h4>Accountability Chart</h4>
                <div class="event-meta">Weekly goal completion snapshot</div>
                <div class="progress-track"><div class="progress-fill" style="--progress: ${progressPercent}%;"></div></div>
                <p style="color:#94a3b8; font-size:12px; margin-top:8px;">
                    ${goals.length ? `${progressPercent}% average from tracked goal/progress notes.` : 'No active goals logged yet. Use Telegram to add a goal for this student.'}
                </p>
                ${nextCheckIn ? `<p style="color:#cbd5e1; font-size:12px; margin-top:6px;">Next check-in: ${formatDate(nextCheckIn)}</p>` : ''}
            </div>

            <div class="student-profile-section">
                <h4>Interests / Topics</h4>
                ${topics.length ? topics.slice(0, 10).map(topic => `<span class="badge badge-category-accountability" style="margin: 0 6px 6px 0; display:inline-block;">${escapeHtml(topic)}</span>`).join('') : '<p style="color:#64748b; font-size:13px;">No interests or topics captured yet.</p>'}
            </div>

            <div class="student-profile-section">
                <h4>Questions</h4>
                ${renderStudentEventList(questions, 'No questions captured yet.')}
            </div>

            <div class="student-profile-section">
                <h4>Recent Goal Notes</h4>
                ${renderStudentEventList(goals, 'No goals captured yet.')}
            </div>

            <div class="student-profile-section full">
                <h4>Student Analysis</h4>
                ${renderStudentEventList(analysisEvents, 'No analysis captured yet.')}
            </div>

            <div class="student-profile-section full">
                <h4>Private Meetings / Notes</h4>
                ${renderStudentEventList(meetings, 'No private meetings or notes captured yet.')}
            </div>
        </div>
    `;
}

function torahStudentRecord(student) {
    return (torahSummary?.students || []).find(item => String(item.id) === String(student.id)) || null;
}

function studentPortalUrl(student) {
    if (!student?.student_access_code) return '';
    return `${window.location.origin}/student.html?code=${encodeURIComponent(student.student_access_code)}`;
}

function renderStudentAccessPanel(student) {
    const portalUrl = studentPortalUrl(student);
    return `
        <h4>Student Goal Board Login</h4>
        <div class="event-meta">Private student portal for the read-only Torah summary and visible Goal Board items.</div>
        <div class="student-profile-kpis" style="margin-top:12px;">
            ${renderMiniKpi(student.student_access_code ? 'Ready' : 'Not Created', 'Access Link')}
            ${renderMiniKpi(student.student_access_enabled === false ? 'Disabled' : 'Enabled', 'Portal')}
            ${renderMiniKpi(student.parent_email ? 'Ready' : 'Missing Email', 'Parent Access')}
        </div>
        ${portalUrl ? `
            <div class="event-card" style="margin-top:12px;">
                <div class="event-type">Portal Link</div>
                <div class="event-title" style="font-size:13px; word-break:break-all;">${escapeHtml(portalUrl)}</div>
            </div>
        ` : ''}
        <div class="task-actions" style="margin-top:12px;">
            ${portalUrl ? `<button class="task-action primary" onclick="openStudentPortal(event, ${Number(student.id)})">Open</button>` : ''}
            <button class="task-action" onclick="createStudentAccessLink(event, ${Number(student.id)}, false)">${portalUrl ? 'Refresh Link' : 'Create Link'}</button>
            <button class="task-action" onclick="createStudentAccessLink(event, ${Number(student.id)}, true)">Regenerate</button>
            ${renderParentPortalActionButtons('student', student.id, { email: student.parent_email, phone: student.parent_phone })}
        </div>
    `;
}

function renderDeviceAccessPanel(student, deviceList, goalBoardItems) {
    const activeDevice = deviceList[0] || null;
    const activeStatus = activeDevice?.status || 'not_configured';
    const reviews = pendingDeviceReviews(goalBoardItems);
    const activeSession = activeDevice?.active_session || null;
    return `
        <div class="device-access-panel">
            <div>
                <h4>Tablet Access Accountability</h4>
                <div class="event-meta">Q Studio/Qustodio remains the content filter. BNA applies the accountability access state automatically after a successful student checkoff; current provider mode is mock until Headwind/FreeKiosk is verified on a real tablet.</div>
            </div>
            <div class="device-safe-note">
                No real Android calls are enabled yet. These buttons and automatic checkoffs write BNA device, session, review, and mock provider-result records.
            </div>
            <div class="student-profile-kpis" style="margin-top:0;">
                ${renderMiniKpi(activeStatus === 'not_configured' ? 'Not Configured' : deviceAccessLabel(activeStatus), 'Current State')}
                ${renderMiniKpi(deviceList.length, 'Devices')}
                ${renderMiniKpi(reviews.length, 'Pending Reviews')}
                ${renderMiniKpi('Mock', 'Provider')}
            </div>
            ${activeSession?.expires_at ? `<div class="event-meta">Active window: ${escapeHtml(formatSessionWindow(activeSession))}</div>` : ''}
            <div class="task-actions" style="margin-top:0;">
                <button class="task-action primary" onclick="createMockDevice(event, ${Number(student.id)})">Add Mock Tablet</button>
            </div>
            <div class="device-list">
                ${deviceList.length ? deviceList.map(device => renderDeviceCard(device)).join('') : `
                    <div class="empty-state" style="padding:18px 12px;">
                        <p>No tablet record yet. Add a mock tablet before approving device-linked goals.</p>
                    </div>
                `}
            </div>
            <div>
                <h4 style="margin-top:4px;">Access Reviews</h4>
                <div class="event-meta">Missed-goal consequences still require review. Successful checkoffs can open the configured access window automatically.</div>
            </div>
            <div class="device-review-list">
                ${reviews.length ? reviews.map(item => renderDeviceReviewCard(item, activeDevice)).join('') : `
                    <div class="empty-state" style="padding:18px 12px;">
                        <p>No device-linked access reviews are waiting for this student.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderDeviceCard(device) {
    const state = normalizeDeviceAccessState(device.status);
    const session = device.active_session || device.latest_session || null;
    const providerResult = parseJsonField(session?.provider_result) || session?.provider_result || {};
    const reason = session?.reason || providerResult.reason || '';
    return `
        <div class="event-card device-card" data-state="${escapeHtml(state)}">
            <div class="event-type">Mock Device &middot; ${escapeHtml(device.platform || 'android')}</div>
            <div class="event-title">${escapeHtml(device.device_name || 'Student tablet')} ${deviceAccessBadge(state)}</div>
            <div class="event-meta">
                Provider: ${escapeHtml(device.provider || 'mock')}
                ${device.provider_device_id ? ` &middot; Provider ID: ${escapeHtml(device.provider_device_id)}` : ''}
                ${device.last_seen_at ? ` &middot; Last seen ${escapeHtml(formatDateTime(device.last_seen_at))}` : ''}
            </div>
            ${session ? `<div class="goal-board-public">Latest session: ${escapeHtml(deviceAccessLabel(session.status))}${formatSessionWindow(session) ? ` &middot; ${escapeHtml(formatSessionWindow(session))}` : ''}</div>` : ''}
            ${reason ? `<div class="goal-board-private"><strong>Reason:</strong> ${escapeHtml(reason)}</div>` : ''}
            <div class="task-actions">
                <button class="task-action" onclick="performDeviceAction(event, ${Number(device.id)}, 'locked')">Lock</button>
                <button class="task-action" onclick="performDeviceAction(event, ${Number(device.id)}, 'accountability_only')">Accountability Only</button>
                <button class="task-action primary" onclick="performDeviceAction(event, ${Number(device.id)}, 'approved_access', 60)">Approve 60m</button>
                <button class="task-action" onclick="performDeviceAction(event, ${Number(device.id)}, 'manual_override', 30)">Manual Override</button>
                <button class="task-action" onclick="performDeviceAction(event, ${Number(device.id)}, 'expired')">Expire</button>
            </div>
        </div>
    `;
}

function renderDeviceReviewCard(item, activeDevice) {
    const meta = goalBoardMetadata(item);
    const consequence = meta.consequence || {};
    const desiredState = normalizeDeviceAccessState(consequence.device_access_state);
    const duration = consequence.duration_minutes || 60;
    const deviceId = activeDevice?.id || preferredDeviceIdForStudent(item.student_id);
    const deviceName = activeDevice?.device_name || (deviceId ? 'Selected device' : 'No mock tablet');
    const disableDeviceAction = deviceId ? '' : 'disabled';
    return `
        <div class="event-card device-card" data-state="${escapeHtml(desiredState)}">
            <div class="event-type">Pending Device Review</div>
            <div class="event-title">${escapeHtml(item.title || 'Access review')} ${deviceAccessBadge(desiredState)}</div>
            <div class="event-meta">
                Device: ${escapeHtml(deviceName)}
                &middot; Duration: ${Number(duration) || 60} minutes
                ${consequence.status ? ` &middot; Review: ${escapeHtml(String(consequence.status).replace(/_/g, ' '))}` : ''}
            </div>
            ${consequence.recovery_path ? `<div class="goal-board-public">Recovery: ${escapeHtml(consequence.recovery_path)}</div>` : ''}
            ${consequence.review_reason ? `<div class="goal-board-private"><strong>Review reason:</strong> ${escapeHtml(consequence.review_reason)}</div>` : ''}
            <div class="task-actions">
                <button class="task-action primary" ${disableDeviceAction} onclick="reviewDeviceAccess(event, ${Number(item.id)}, ${Number(deviceId || 0)}, 'approve', ${Number(duration) || 60})">Approve State</button>
                <button class="task-action" onclick="reviewDeviceAccess(event, ${Number(item.id)}, ${Number(deviceId || 0)}, 'deny')">Deny</button>
                <button class="task-action" ${disableDeviceAction} onclick="reviewDeviceAccess(event, ${Number(item.id)}, ${Number(deviceId || 0)}, 'manual_override', 30)">Manual Override</button>
            </div>
        </div>
    `;
}

function renderGoalBoardAdminPanel(student, items) {
    const deviceList = studentDevices(student);
    const counts = GOAL_BOARD_FILTERS.reduce((nextCounts, filter) => {
        nextCounts[filter.id] = items.filter(item => goalBoardFilterMatches(item, filter.id, deviceList)).length;
        return nextCounts;
    }, {});
    const activeFilter = GOAL_BOARD_FILTERS.some(filter => filter.id === studentGoalFilter) ? studentGoalFilter : 'due_today';
    const filtered = items.filter(item => goalBoardFilterMatches(item, activeFilter, deviceList));
    return `
        <div class="goal-board-panel">
            <div>
                <h4>Student Accountability</h4>
                <div class="event-meta">Student-owned agreements, chosen recovery paths, and automatic tablet-access rules. Private notes stay in Operations.</div>
            </div>
            <div class="filter-row">
                <span class="filter-label">Board</span>
                ${GOAL_BOARD_FILTERS.map(filter => `
                    <button class="filter-chip ${activeFilter === filter.id ? 'active' : ''}" onclick="setStudentGoalFilter('${filter.id}')">
                        ${escapeHtml(filter.label)} ${counts[filter.id] ? `(${counts[filter.id]})` : ''}
                    </button>
                `).join('')}
            </div>
            <details class="filter-details collapsible-details">
                <summary>Add Goal</summary>
                <div class="filter-details-body">
                    <form class="goal-board-form" onsubmit="createGoalBoardItem(event, ${Number(student.id)})">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goal-title-${student.id}">Title</label>
                                <input id="goal-title-${student.id}" placeholder="Goal or assignment title">
                            </div>
                            <div class="form-group">
                                <label for="goal-source-${student.id}">Source</label>
                                <select id="goal-source-${student.id}">
                                    ${GOAL_BOARD_SOURCES.map(source => `<option value="${source.id}">${escapeHtml(source.label)}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goal-urgency-${student.id}">Urgency</label>
                                <select id="goal-urgency-${student.id}">
                                    <option value="today">Today</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="this_week" selected>This Week</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="goal-category-${student.id}">Category</label>
                                <input id="goal-category-${student.id}" placeholder="Torah, routine, project">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goal-due-${student.id}">Due Date / Time</label>
                                <input id="goal-due-${student.id}" type="datetime-local">
                            </div>
                            <div class="form-group">
                                <label for="goal-target-${student.id}">Target Value</label>
                                <input id="goal-target-${student.id}" type="number" min="0" step="0.5" placeholder="Optional">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goal-bedtime-${student.id}">In Bed By</label>
                                <input id="goal-bedtime-${student.id}" type="time" value="22:00">
                            </div>
                            <div class="form-group">
                                <label for="goal-wake-${student.id}">Out Of Bed By</label>
                                <input id="goal-wake-${student.id}" type="time" value="07:00">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="goal-commitment-${student.id}">Student Commitment</label>
                            <textarea id="goal-commitment-${student.id}" placeholder="Example: I will be in bed by 10:00 PM and out of bed by 7:00 AM."></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goal-unit-${student.id}">Target Unit</label>
                                <input id="goal-unit-${student.id}" placeholder="pages, reps, days">
                            </div>
                            <div class="form-group">
                                <label for="goal-youtube-${student.id}">YouTube / Classroom Link</label>
                                <input id="goal-youtube-${student.id}" placeholder="Optional link">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="goal-summary-${student.id}">Student Summary</label>
                            <textarea id="goal-summary-${student.id}" placeholder="Visible to student"></textarea>
                        </div>
                        <div class="form-row">
                            <label class="checkbox-row">
                                <input type="checkbox" id="goal-share-student-${student.id}" checked>
                                <span>Show this goal on the student portal</span>
                            </label>
                            <label class="checkbox-row">
                                <input type="checkbox" id="goal-share-parent-${student.id}" checked>
                                <span>Show this goal on the parent portal</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="goal-private-${student.id}">Private Admin Note</label>
                            <textarea id="goal-private-${student.id}" placeholder="Never visible in student or parent portals"></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goal-recovery-${student.id}">Recovery Path</label>
                                <input id="goal-recovery-${student.id}" placeholder="Next step if missed">
                            </div>
                            <div class="form-group">
                                <label for="goal-device-${student.id}">Missed Goal Device State</label>
                                <select id="goal-device-${student.id}">
                                    <option value="">None</option>
                                    <option value="locked">Locked</option>
                                    <option value="accountability_only">Accountability Only</option>
                                    <option value="approved_access">Approved Access</option>
                                    <option value="expired">Expired</option>
                                    <option value="manual_override">Manual Override</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goal-success-device-${student.id}">After Checkoff</label>
                                <select id="goal-success-device-${student.id}">
                                    <option value="approved_access" selected>Open Approved Access</option>
                                    <option value="manual_override">Manual Override</option>
                                    <option value="">No Automatic Access</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="goal-success-duration-${student.id}">Access Duration Minutes</label>
                                <input id="goal-success-duration-${student.id}" type="number" min="1" max="1440" step="1" value="60">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goal-device-duration-${student.id}">Missed State Duration Minutes</label>
                                <input id="goal-device-duration-${student.id}" type="number" min="1" max="1440" step="1" value="60">
                            </div>
                            <div class="form-group">
                                <label for="goal-review-reason-${student.id}">Chosen Consequence / Note</label>
                                <input id="goal-review-reason-${student.id}" placeholder="Example: no games until I reset my morning plan">
                            </div>
                        </div>
                        <label class="checkbox-row">
                            <input type="checkbox" id="goal-approval-${student.id}">
                            <span>Needs parent/admin approval</span>
                        </label>
                        <div class="task-actions" style="margin-top:0;">
                            <button class="task-action primary" type="submit">Create Goal Board Item</button>
                        </div>
                    </form>
                </div>
            </details>
            <div class="goal-board-list">
                ${filtered.length ? filtered.map(renderGoalBoardAdminCard).join('') : `<div class="empty-state" style="padding:22px 12px;"><p>No ${escapeHtml(activeFilter)} Goal Board items.</p></div>`}
            </div>
        </div>
    `;
}

function renderGoalBoardAdminCard(item) {
    const meta = goalBoardMetadata(item);
    const bucket = goalBoardBucket(item);
    const progress = goalBoardProgress(item);
    const due = formatGoalDue(meta.due_at);
    const target = item.goal_target_value
        ? `${item.goal_actual_value || 0}/${item.goal_target_value}${item.goal_unit ? ` ${escapeHtml(item.goal_unit)}` : ''}`
        : '';
    const classroomUrl = meta.classroom?.youtube_url || meta.classroom?.alternate_link || '';
    const consequence = meta.consequence || {};
    const agreement = meta.agreement || {};
    const preferredDeviceId = preferredDeviceIdForStudent(item.student_id);
    return `
        <div class="event-card goal-board-card ${escapeHtml(bucket)}">
            <div class="event-type">
                ${escapeHtml(goalBoardSourceLabel(meta.source))}
                &middot; ${escapeHtml(goalBoardUrgencyLabel(meta.urgency))}
                &middot; ${escapeHtml(goalBoardStatusLabel(item))}
            </div>
            <div class="event-title">${escapeHtml(item.title || 'Goal Board item')}</div>
            <div class="event-meta">
                ${meta.category ? `${escapeHtml(meta.category)} &middot; ` : ''}
                ${due ? `Due ${escapeHtml(due)} &middot; ` : ''}
                ${target ? `${target} &middot; ` : ''}
                ${progress}% progress
            </div>
            <div class="progress-track"><div class="progress-fill" style="--progress: ${progress}%;"></div></div>
            ${agreement.bedtime_time || agreement.wake_time ? `<div class="goal-board-public">Agreement: in bed by ${escapeHtml(agreement.bedtime_time || '--')}; out of bed by ${escapeHtml(agreement.wake_time || '--')}.</div>` : ''}
            ${agreement.student_commitment ? `<div class="goal-board-public">Commitment: ${escapeHtml(agreement.student_commitment)}</div>` : ''}
            ${agreement.chosen_consequence ? `<div class="goal-board-public">Chosen consequence: ${escapeHtml(agreement.chosen_consequence)}</div>` : ''}
            ${meta.student_summary ? `<div class="goal-board-public">${escapeHtml(meta.student_summary)}</div>` : ''}
            ${classroomUrl ? `<div class="goal-board-public">Classroom draft: <span style="word-break:break-all;">${escapeHtml(classroomUrl)}</span></div>` : ''}
            ${consequence.recovery_path ? `<div class="goal-board-public">Recovery: ${escapeHtml(consequence.recovery_path)}</div>` : ''}
            <div class="task-row-meta" style="margin-top:8px;">
                ${consequence.success_device_access_state ? `<span class="badge badge-category-accountability">Auto after checkoff: ${escapeHtml(consequence.success_device_access_state.replace(/_/g, ' '))}${consequence.success_duration_minutes ? ` for ${Number(consequence.success_duration_minutes)}m` : ''}</span>` : ''}
                ${consequence.success_applied_at ? `<span class="badge badge-category-accountability">Access opened ${escapeHtml(formatDateTime(consequence.success_applied_at))}</span>` : ''}
                ${consequence.device_access_state ? `<span class="badge badge-category-accountability">If missed: ${escapeHtml(consequence.device_access_state.replace(/_/g, ' '))}</span>` : ''}
                <span class="badge badge-category-accountability">${meta.student_visible ? 'Student visible' : 'Hidden from student'}</span>
                <span class="badge badge-category-accountability">${meta.parent_visible ? 'Parent visible' : 'Hidden from parent'}</span>
            </div>
            ${consequence.status === 'pending_review' ? `<div class="goal-board-private">Pending review. No device or consequence action has been applied automatically.</div>` : ''}
            ${meta.private_note ? `<div class="goal-board-private"><strong>Private admin note:</strong> ${escapeHtml(meta.private_note)}</div>` : ''}
            ${meta.reflection_note ? `<div class="goal-board-public">Student reflection: ${escapeHtml(meta.reflection_note)}</div>` : ''}
            <div class="task-actions">
                <button class="task-action" onclick="setGoalProgress(event, ${Number(item.id)}, 0)">Not Yet</button>
                <button class="task-action" onclick="setGoalProgress(event, ${Number(item.id)}, 50)">Half</button>
                <button class="task-action primary" onclick="setGoalProgress(event, ${Number(item.id)}, 100)">Done</button>
                ${consequence.status === 'pending_review' && consequence.device_access_state ? `
                    <button class="task-action primary" ${preferredDeviceId ? '' : 'disabled'} onclick="reviewDeviceAccess(event, ${Number(item.id)}, ${Number(preferredDeviceId || 0)}, 'approve', ${Number(consequence.duration_minutes || 60)})">Approve Device State</button>
                    <button class="task-action" onclick="reviewDeviceAccess(event, ${Number(item.id)}, ${Number(preferredDeviceId || 0)}, 'deny')">Deny Device State</button>
                    <button class="task-action" ${preferredDeviceId ? '' : 'disabled'} onclick="reviewDeviceAccess(event, ${Number(item.id)}, ${Number(preferredDeviceId || 0)}, 'manual_override', 30)">Manual Override</button>
                ` : consequence.status === 'pending_review' ? `
                    <button class="task-action primary" onclick="goalBoardAction(event, ${Number(item.id)}, 'approve_consequence')">Approve Recovery</button>
                    <button class="task-action" onclick="goalBoardAction(event, ${Number(item.id)}, 'override_consequence')">Override</button>
                ` : ''}
                <button class="task-action" onclick="updateGoalBoardItem(event, ${Number(item.id)}, { status: 'waiting', approval_required: true, approval_status: 'pending_review' })">Wait</button>
                <button class="task-action" onclick="updateGoalBoardItem(event, ${Number(item.id)}, { student_visible: ${meta.student_visible ? 'false' : 'true'} })">${meta.student_visible ? 'Hide from Student' : 'Show Student'}</button>
                <button class="task-action" onclick="updateGoalBoardItem(event, ${Number(item.id)}, { parent_visible: ${meta.parent_visible ? 'false' : 'true'} })">${meta.parent_visible ? 'Hide from Parent' : 'Show Parent'}</button>
                <button class="task-action" onclick="updateGoalBoardItem(event, ${Number(item.id)}, { status: 'archived' })">Archive</button>
            </div>
        </div>
    `;
}

function renderTorahAdminPanel(student, torahRecord) {
    const goal = torahRecord?.goal || {};
    const entry = torahRecord?.entry || {};
    const trip = torahRecord?.trip || {};
    const dateValue = entry.date || torahSummary?.date || new Date().toISOString().slice(0, 10);
    const goalMinutes = goal.goal_minutes ?? 10;
    const goalType = goal.goal_type || 'LISTENING';
    const listeningMinutes = entry.engaged_listening_minutes ?? 0;
    const insideMinutes = entry.inside_engaged_minutes ?? 0;
    const listeningWithoutFollowingMinutes = entry.listening_without_following_minutes ?? 0;
    const dailyCompletion = Number(entry.daily_completion_percentage ?? entry.individual_percentage ?? 0);
    const tripCompletedUnits = Number(entry.total_completed_units ?? trip.total_completed_units ?? 0);
    const tripRequiredUnits = Number(entry.total_required_units ?? trip.total_required_units ?? 30);

    return `
        <h4>Torah Goal Admin</h4>
        <div class="event-meta">These minutes and goal type stay admin-only. The public site shows only cumulative trip progress.</div>
        <div class="student-profile-kpis" style="margin-top:12px;">
            ${renderMiniKpi(`${Number(torahRecord?.percentage || 0)}%`, 'Public Trip Progress')}
            ${renderMiniKpi(`${dailyCompletion}%`, 'Daily Completion')}
            ${renderMiniKpi(`${tripCompletedUnits}/${tripRequiredUnits}`, 'Trip Units')}
            ${renderMiniKpi(`${goalMinutes} min`, 'Goal Minutes')}
            ${renderMiniKpi(goalType, 'Goal Type')}
            ${renderMiniKpi(entry.counted_minutes !== undefined ? `${Number(entry.counted_minutes || 0)} min` : '0 min', 'Counted')}
        </div>
        <div class="form-row" style="margin-top:16px;">
            <div class="form-group">
                <label for="torah-date-${student.id}">Date</label>
                <input id="torah-date-${student.id}" type="date" value="${escapeHtml(dateValue)}">
            </div>
            <div class="form-group">
                <label for="torah-goal-minutes-${student.id}">Goal Minutes</label>
                <input id="torah-goal-minutes-${student.id}" type="number" min="1" step="1" value="${escapeHtml(String(goalMinutes))}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="torah-goal-type-${student.id}">Goal Type</label>
                <select id="torah-goal-type-${student.id}">
                    <option value="LISTENING" ${goalType === 'LISTENING' ? 'selected' : ''}>LISTENING</option>
                    <option value="INSIDE" ${goalType === 'INSIDE' ? 'selected' : ''}>INSIDE</option>
                </select>
            </div>
            <div class="form-group">
                <label for="torah-listening-${student.id}">Engaged Listening Minutes</label>
                <input id="torah-listening-${student.id}" type="number" min="0" step="0.5" value="${escapeHtml(String(listeningMinutes))}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="torah-inside-${student.id}">Inside Engaged Minutes</label>
                <input id="torah-inside-${student.id}" type="number" min="0" step="0.5" value="${escapeHtml(String(insideMinutes))}">
            </div>
            <div class="form-group">
                <label for="torah-listening-half-${student.id}">Listening Without Following Minutes</label>
                <input id="torah-listening-half-${student.id}" type="number" min="0" step="0.5" value="${escapeHtml(String(listeningWithoutFollowingMinutes))}">
            </div>
        </div>
        <div class="form-group">
            <label for="torah-note-${student.id}">Note</label>
            <textarea id="torah-note-${student.id}">${escapeHtml(entry.note || '')}</textarea>
        </div>
        <div class="task-actions" style="margin-top:0;">
            <button class="task-action primary" onclick="saveTorahEntry(event, ${Number(student.id)})">Save / Update Torah Entry</button>
        </div>
    `;
}

function renderMiniKpi(value, label) {
    return `
        <div class="mini-kpi">
            <strong>${escapeHtml(String(value))}</strong>
            <span>${escapeHtml(label)}</span>
        </div>
    `;
}

function questionMetadata(event = {}) {
    const metadata = parseJsonField(event.metadata) || {};
    return metadata.question && typeof metadata.question === 'object' ? metadata.question : metadata;
}

function safeSefariaUrl(source = {}) {
    const url = String(source.url || '').trim();
    if (/^https:\/\/www\.sefaria\.org\//i.test(url)) return url;
    const ref = String(source.ref || '').trim();
    return ref ? `https://www.sefaria.org/${encodeURIComponent(ref).replace(/%20/g, '_')}` : '';
}

function renderQuestionLearningBlock(event = {}) {
    if (event.event_type !== 'question') return '';
    const meta = questionMetadata(event);
    const sources = Array.isArray(meta.sources) ? meta.sources : [];
    const assignments = Array.isArray(meta.assignments) ? meta.assignments : [];
    const parentResponses = Array.isArray(meta.parent_responses) ? meta.parent_responses : [];
    const sourceStatus = meta.source_status ? String(meta.source_status).replace(/_/g, ' ') : '';
    return `
        <div style="display:grid;gap:8px;margin-top:10px;">
            ${sourceStatus ? `<div class="event-meta">Source status: ${escapeHtml(sourceStatus)}</div>` : ''}
            ${sources.length ? `
                <div class="goal-board-public">
                    <strong>Sefaria sources:</strong>
                    <ul style="margin:6px 0 0 18px;padding:0;">
                        ${sources.slice(0, 6).map(source => {
                            const url = safeSefariaUrl(source);
                            return `
                                <li style="margin-bottom:6px;">
                                    ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.ref || 'Sefaria source')}</a>` : escapeHtml(source.ref || 'Sefaria source')}
                                    ${source.snippet ? `<div class="event-meta">${escapeHtml(source.snippet)}</div>` : ''}
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </div>
            ` : '<div class="event-meta">No Sefaria sources attached yet.</div>'}
            ${assignments.length ? `
                <div class="goal-board-public">
                    <strong>Optional follow-up:</strong>
                    <ul style="margin:6px 0 0 18px;padding:0;">
                        ${assignments.slice(0, 4).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${parentResponses.length ? `
                <div class="goal-board-public">
                    <strong>Parent responses:</strong>
                    ${parentResponses.slice(0, 3).map(response => `
                        <div class="event-meta" style="margin-top:6px;">
                            ${escapeHtml(response.body || '')}
                            ${response.created_at ? ` &middot; ${escapeHtml(formatDate(response.created_at))}` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="task-actions" style="margin-top:0;">
                <button class="task-action" onclick="enrichQuestionSources(event, ${Number(event.id || 0)}, ${sources.length ? 'true' : 'false'})">${sources.length ? 'Refresh Sefaria Sources' : 'Find Sefaria Sources'}</button>
            </div>
        </div>
    `;
}

function renderStudentEventList(events, emptyText) {
    const sorted = events
        .slice()
        .sort((a, b) => Date.parse(b.occurred_at || b.created_at || 0) - Date.parse(a.occurred_at || a.created_at || 0));
    if (!sorted.length) {
        return `<p style="color:#64748b; font-size:13px;">${escapeHtml(emptyText)}</p>`;
    }
    return sorted.slice(0, 12).map(event => `
        <div class="event-card">
            <div class="event-type">${escapeHtml(formatEventType(event.event_type))}</div>
            <div class="event-title">${escapeHtml(event.title || event.question_text || 'Student note')}</div>
            <div class="event-meta">
                ${event.topic ? `Topic: ${escapeHtml(event.topic)} &middot; ` : ''}
                ${formatDate(event.occurred_at || event.created_at)}
            </div>
            ${renderStudentEventMetrics(event)}
            ${renderGoalCheckoffActions(event)}
            ${event.question_text ? `<p style="margin-top: 8px; font-size: 13px;">Question: ${escapeHtml(event.question_text)}</p>` : ''}
            ${renderQuestionLearningBlock(event)}
            ${event.notes ? `<p style="margin-top: 8px; color: #cbd5e1; font-size: 13px;">${escapeHtml(event.notes)}</p>` : ''}
        </div>
    `).join('');
}

function renderGoalCheckoffActions(event) {
    if (event.event_type !== 'student_goal' || !event.id) return '';
    return `
        <div class="task-actions" style="margin-top:10px;">
            <button class="task-action" onclick="setGoalProgress(event, ${Number(event.id)}, 0)">Not Yet</button>
            <button class="task-action" onclick="setGoalProgress(event, ${Number(event.id)}, 50)">Half</button>
            <button class="task-action primary" onclick="setGoalProgress(event, ${Number(event.id)}, 100)">Done</button>
        </div>
    `;
}

function renderStudentEventMetrics(event) {
    const metrics = [];
    if (event.progress_percent !== null && event.progress_percent !== undefined) metrics.push(`${event.progress_percent}% progress`);
    if (event.goal_actual_value || event.goal_target_value) {
        const actual = event.goal_actual_value || 0;
        const target = event.goal_target_value ? ` / ${event.goal_target_value}` : '';
        const unit = event.goal_unit ? ` ${event.goal_unit}` : '';
        metrics.push(`${actual}${target}${unit}`);
    }
    if (event.attendance_status) metrics.push(`Attendance: ${event.attendance_status}`);
    if (event.engagement_level) metrics.push(`Engagement: ${event.engagement_level}`);
    if (event.next_check_in_date) metrics.push(`Next: ${formatDate(event.next_check_in_date)}`);
    if (event.follow_up_required) metrics.push('Follow up');
    if (!metrics.length) return '';
    return `
        <div class="task-row-meta" style="margin-top: 8px;">
            ${metrics.map(metric => `<span class="badge badge-category-accountability">${escapeHtml(metric)}</span>`).join('')}
        </div>
    `;
}

function studentProgressPercent(student, goals) {
    if (Number(student.avg_goal_progress)) return Number(student.avg_goal_progress);
    const values = goals
        .map(goal => Number(goal.progress_percent))
        .filter(value => Number.isFinite(value));
    if (values.length) {
        return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    }
    return goals.length ? Math.min(100, Math.round((goals.filter(goal => /done|met|completed|achieved/i.test(`${goal.title} ${goal.notes}`)).length / goals.length) * 100)) : 0;
}

function nextStudentCheckIn(events) {
    const dates = events
        .map(event => event.next_check_in_date)
        .filter(Boolean)
        .map(date => new Date(date))
        .filter(date => Number.isFinite(date.getTime()) && date >= new Date(new Date().toDateString()))
        .sort((a, b) => a - b);
    return dates[0] || null;
}

function studentEvents(student) {
    const studentNames = new Set([
        student.name,
        student.canonical_display_name,
        student.english_name,
        student.hebrew_name,
        student.name_en,
        student.name_he,
        ...(Array.isArray(student.aliases) ? student.aliases : [])
    ].map(normalizeLooseText).filter(Boolean));
    return accountabilityEvents.filter(event => {
        if (event.student_id) return String(event.student_id) === String(student.id || '');
        const eventName = normalizeLooseText(event.student_name || '');
        return eventName && studentNames.has(eventName);
    });
}

function sortEventsNewestFirst(a, b) {
    return Date.parse(b.occurred_at || b.created_at || 0) - Date.parse(a.occurred_at || a.created_at || 0);
}

function isStudentAnalysisEvent(event) {
    const metadata = parseJsonField(event?.metadata) || {};
    return metadata.kind === 'student_analysis'
        || metadata.analysis_key
        || String(event?.topic || '').toLowerCase() === 'student analysis';
}

function studentAnalysisEvents(student) {
    return studentEvents(student)
        .filter(isStudentAnalysisEvent)
        .slice()
        .sort(sortEventsNewestFirst);
}

function uniqueValues(values) {
    return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

function renderTelegramInputNotice() {
    return `
        <div class="container">
            <div class="ramble-box">
                <h3 style="margin-bottom: 12px; font-size: 16px;">Telegram Input</h3>
                <p style="margin-bottom: 0; font-size: 13px; color: #94a3b8;">
                    Send tasks, decisions, parent payment notes, and student meeting notes to @bneineviimacademy_bot. This dashboard only monitors what was captured.
                </p>
            </div>
        </div>
    `;
}

function renderLiveClasses() {
    const profile = liveClassWorkspaceProfile();
    const counts = liveClassSummaryCounts();
    const sortedSessions = liveSessions.slice().sort((a, b) => Date.parse(a.start_at || 0) - Date.parse(b.start_at || 0));
    const sortedMembers = members.slice().sort((a, b) => String(a.display_name || '').localeCompare(String(b.display_name || '')));
    return `
        <div class="container">
            <div class="page-heading task-heading">
                <div>
                    <div class="page-kicker">${escapeHtml(profile.kicker)}</div>
                    <h2>${escapeHtml(profile.title)}</h2>
                    <p>${escapeHtml(profile.description)}</p>
                </div>
                ${profile.memberPortal ? '<a class="primary-button" href="/member" target="_blank" rel="noopener">Member Portal</a>' : ''}
            </div>
            ${liveClassNotice ? `<div class="success-banner">${escapeHtml(liveClassNotice)}</div>` : ''}
            <section class="focus-panel" aria-label="Live class summary">
                <div class="task-overview-grid">
                    ${renderMetricButton('Sessions', counts.sessions, 'Live class sessions loaded.', "switchView('live_classes')")}
                    ${renderMetricButton('Upcoming', counts.upcoming, 'Scheduled or currently live sessions.', "switchView('live_classes')")}
                    ${renderMetricButton('Live members', counts.liveMembers, 'Members eligible for live_plus_library links.', "switchView('live_classes')")}
                    ${renderMetricButton('Library members', counts.libraryMembers, 'Library-only members can see published recordings.', "switchView('live_classes')")}
                </div>
            </section>
            ${renderOneTimeZoomAutomationReadinessPanel()}
            <section class="focus-panel" aria-label="Create live class session">
                <div class="task-section-header"><h3>Create Session</h3><span>Manual Zoom URL</span></div>
                <form class="settings-control-grid" onsubmit="createLiveSessionFromForm(event)">
                    <label>Title<input id="liveSessionTitle" type="text" required placeholder="Tonight Mishnah Class"></label>
                    <label>Start<input id="liveSessionStart" type="datetime-local" required></label>
                    <label>End<input id="liveSessionEnd" type="datetime-local"></label>
                    <label>Timezone<input id="liveSessionTimezone" type="text" value="Asia/Jerusalem"></label>
                    <label>Required tier<select id="liveSessionTier">${liveClassTierOptions('live_plus_library')}</select></label>
                    <label>Status<select id="liveSessionStatus">${liveClassStatusOptions('scheduled')}</select></label>
                    <label>Zoom URL<input id="liveSessionZoom" type="url" placeholder="https://zoom.us/..."></label>
                    <label>Reminder minutes<input id="liveSessionReminderMinutes" type="number" min="0" step="5" value="60"></label>
                    <label class="settings-wide">Notes<textarea id="liveSessionNotes" rows="2"></textarea></label>
                    <div class="task-actions settings-wide">
                        <button class="task-action primary" type="submit">Create session</button>
                    </div>
                </form>
            </section>
            <section class="focus-panel" aria-label="Live sessions">
                <div class="task-section-header"><h3>Sessions</h3><span>${sortedSessions.length}</span></div>
                ${sortedSessions.length ? `<div class="task-list">${sortedSessions.map(renderLiveSessionCard).join('')}</div>` : '<div class="empty-state">No live sessions yet.</div>'}
            </section>
            <section class="focus-panel" aria-label="Live members">
                <div class="task-section-header"><h3>Members</h3><span>${sortedMembers.length}</span></div>
                ${renderLiveMemberCreateForm()}
                ${sortedMembers.length ? `<div class="task-list">${sortedMembers.map(renderLiveMemberCard).join('')}</div>` : '<div class="empty-state">No members yet. Create the first member above.</div>'}
            </section>
        </div>
    `;
}

function renderLiveSessionCard(session) {
    const memberOptions = members
        .map(member => `<option value="${Number(member.id)}">${escapeHtml(member.display_name || member.email || `Member #${member.id}`)}</option>`)
        .join('');
    const linkChanged = session.link_changed_needs_send
        ? '<span class="status-pill urgent">Link changed; send updated link</span>'
        : '';
    return `
        <article class="task-card">
            <div class="task-card-header">
                <div>
                    <div class="task-title">${escapeHtml(session.title || 'Untitled live session')} ${linkChanged}</div>
                    <div class="task-meta">
                        <span>${escapeHtml(formatDateTime(session.start_at))}</span>
                        <span>${escapeHtml(String(session.status || '').replace(/_/g, ' '))}</span>
                        <span>${escapeHtml(String(session.required_tier || '').replace(/_/g, ' '))}</span>
                        <span>${Number(session.eligible_count || 0)} eligible</span>
                        <span>${Number(session.ineligible_count || 0)} skipped</span>
                        <span>${Number(session.attendance_count || 0)} checked in</span>
                    </div>
                </div>
            </div>
            <form class="settings-control-grid compact" onsubmit="updateLiveSessionFromForm(event, ${Number(session.id)})">
                <label>Title<input id="liveTitle${Number(session.id)}" type="text" value="${escapeHtml(session.title || '')}"></label>
                <label>Start<input id="liveStart${Number(session.id)}" type="datetime-local" value="${escapeHtml(liveClassDateTimeInput(session.start_at))}"></label>
                <label>End<input id="liveEnd${Number(session.id)}" type="datetime-local" value="${escapeHtml(liveClassDateTimeInput(session.end_at))}"></label>
                <label>Status<select id="liveStatus${Number(session.id)}">${liveClassStatusOptions(session.status)}</select></label>
                <label>Tier<select id="liveTier${Number(session.id)}">${liveClassTierOptions(session.required_tier)}</select></label>
                <label>Zoom URL<input id="liveZoom${Number(session.id)}" type="url" value="${escapeHtml(session.zoom_meeting_url || '')}"></label>
                <label>Vimeo recording<input id="liveVimeo${Number(session.id)}" type="url" value="${escapeHtml(session.vimeo_recording_url || '')}"></label>
                <label>Recording<select id="liveRecording${Number(session.id)}">${liveRecordingStatusOptions(session.recording_status)}</select></label>
                <label>Reminder minutes<input id="liveReminder${Number(session.id)}" type="number" min="0" step="5" value="${Number(session.reminder_minutes_before || 0)}"></label>
                <label class="settings-wide">Notes<textarea id="liveNotes${Number(session.id)}" rows="2">${escapeHtml(session.notes || '')}</textarea></label>
                <div class="task-actions settings-wide">
                    <button class="task-action primary" type="submit">Save session</button>
                    <button class="task-action" type="button" data-action-id="ACTION-ONETIME-LIVE-ZOOM-LINK-DRY-RUN" onclick="sendLiveZoomLinks(${Number(session.id)}, true)">Dry-run send</button>
                    <button class="task-action danger" type="button" data-action-id="ACTION-ONETIME-LIVE-ZOOM-LINK-SEND" onclick="sendLiveZoomLinks(${Number(session.id)}, false)">Send links</button>
                </div>
            </form>
            <div class="task-actions">
                <select id="liveCheckInMember${Number(session.id)}" ${memberOptions ? '' : 'disabled'}>
                    <option value="">Choose member to check in</option>
                    ${memberOptions}
                </select>
                <button class="task-action" type="button" onclick="checkInLiveMember(${Number(session.id)})" ${memberOptions ? '' : 'disabled'}>Check in</button>
            </div>
        </article>
    `;
}

function renderLiveMemberCreateForm() {
    return `
        <form class="settings-control-grid compact" onsubmit="createLiveMemberFromForm(event)">
            <label>Name<input id="liveMemberName" type="text" required placeholder="Member name"></label>
            <label>Email<input id="liveMemberEmail" type="email" placeholder="member@example.com"></label>
            <label>Phone<input id="liveMemberPhone" type="tel"></label>
            <label>Tier<select id="liveMemberTier">${liveClassTierOptions('library_only')}</select></label>
            <label>Status<select id="liveMemberStatus">${liveMemberStatusOptions('active')}</select></label>
            <label class="settings-wide">Notes<textarea id="liveMemberNotes" rows="2"></textarea></label>
            <div class="task-actions settings-wide">
                <button class="task-action primary" type="submit">Create member</button>
            </div>
        </form>
    `;
}

function renderLiveMemberCard(member) {
    const accessUrl = member.access_url || '';
    return `
        <article class="task-card">
            <div class="task-card-header">
                <div>
                    <div class="task-title">${escapeHtml(member.display_name || 'Member')}</div>
                    <div class="task-meta">
                        <span>${escapeHtml(member.email || 'no email')}</span>
                        <span>${escapeHtml(member.phone || 'no phone')}</span>
                        <span>${escapeHtml(String(member.access_tier || '').replace(/_/g, ' '))}</span>
                        <span>${escapeHtml(String(member.access_status || '').replace(/_/g, ' '))}</span>
                        <span>${member.access_enabled === false ? 'disabled' : 'enabled'}</span>
                    </div>
                </div>
            </div>
            <div class="settings-control-grid compact">
                <label>Name<input id="memberName${Number(member.id)}" type="text" value="${escapeHtml(member.display_name || '')}"></label>
                <label>Email<input id="memberEmail${Number(member.id)}" type="email" value="${escapeHtml(member.email || '')}"></label>
                <label>Phone<input id="memberPhone${Number(member.id)}" type="tel" value="${escapeHtml(member.phone || '')}"></label>
                <label>Tier<select id="memberTier${Number(member.id)}">${liveClassTierOptions(member.access_tier)}</select></label>
                <label>Status<select id="memberStatus${Number(member.id)}">${liveMemberStatusOptions(member.access_status)}</select></label>
                <label>Enabled<select id="memberEnabled${Number(member.id)}"><option value="true" ${member.access_enabled === false ? '' : 'selected'}>Enabled</option><option value="false" ${member.access_enabled === false ? 'selected' : ''}>Disabled</option></select></label>
                <label class="settings-wide">Notes<textarea id="memberNotes${Number(member.id)}" rows="2">${escapeHtml(member.notes || '')}</textarea></label>
            </div>
            <div class="task-actions">
                <button class="task-action primary" type="button" onclick="updateLiveMember(${Number(member.id)})">Save member</button>
                <button class="task-action" type="button" onclick="createLiveMemberAccessCode(${Number(member.id)}, false)">Create/copy portal link</button>
                <button class="task-action" type="button" onclick="createLiveMemberAccessCode(${Number(member.id)}, true)">Rotate link</button>
                ${accessUrl ? `<button class="task-action" type="button" onclick="copyLiveMemberUrl(${attrJson(accessUrl)})">Copy existing link</button>` : ''}
                ${accessUrl ? `<a class="task-action" href="${escapeHtml(accessUrl)}" target="_blank" rel="noopener">Open portal</a>` : ''}
            </div>
        </article>
    `;
}

// Actions
async function createLiveSessionFromForm(event) {
    event?.preventDefault?.();
    try {
        const result = await api.createLiveSession({
            title: document.getElementById('liveSessionTitle')?.value || '',
            start_at: document.getElementById('liveSessionStart')?.value || '',
            end_at: document.getElementById('liveSessionEnd')?.value || null,
            timezone: document.getElementById('liveSessionTimezone')?.value || 'Asia/Jerusalem',
            required_tier: document.getElementById('liveSessionTier')?.value || 'live_plus_library',
            status: document.getElementById('liveSessionStatus')?.value || 'scheduled',
            zoom_meeting_url: document.getElementById('liveSessionZoom')?.value || '',
            reminder_minutes_before: Number(document.getElementById('liveSessionReminderMinutes')?.value || 60),
            notes: document.getElementById('liveSessionNotes')?.value || '',
        });
        liveClassNotice = `Created live session "${result?.session?.title || 'session'}".`;
        event.target?.reset?.();
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not create live session.');
    }
}

async function updateLiveSessionFromForm(event, sessionId) {
    event?.preventDefault?.();
    const id = Number(sessionId || 0);
    if (!id) return;
    try {
        const result = await api.updateLiveSession(id, {
            title: document.getElementById(`liveTitle${id}`)?.value || '',
            start_at: document.getElementById(`liveStart${id}`)?.value || '',
            end_at: document.getElementById(`liveEnd${id}`)?.value || null,
            status: document.getElementById(`liveStatus${id}`)?.value || 'scheduled',
            required_tier: document.getElementById(`liveTier${id}`)?.value || 'live_plus_library',
            zoom_meeting_url: document.getElementById(`liveZoom${id}`)?.value || '',
            vimeo_recording_url: document.getElementById(`liveVimeo${id}`)?.value || '',
            recording_status: document.getElementById(`liveRecording${id}`)?.value || 'none',
            reminder_minutes_before: Number(document.getElementById(`liveReminder${id}`)?.value || 60),
            notes: document.getElementById(`liveNotes${id}`)?.value || '',
        });
        liveClassNotice = result?.session?.link_changed_needs_send
            ? 'Session saved. The Zoom link changed, so send the updated link when ready.'
            : 'Session saved.';
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not update live session.');
    }
}

async function sendLiveZoomLinks(sessionId, dryRun = true) {
    const id = Number(sessionId || 0);
    if (!id) return;
    if (!dryRun && !confirm('Send the current Zoom link to all eligible members for this session?')) return;
    try {
        const result = await api.sendLiveSessionZoomLink(id, { dryRun });
        const summary = result?.summary || {};
        liveClassNotice = `${dryRun ? 'Dry-run complete' : 'Send complete'}: ${Object.entries(summary).map(([key, value]) => `${value} ${key}`).join(', ') || 'no recipients'}.`;
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not send live Zoom links.');
    }
}

async function checkInLiveMember(sessionId) {
    const id = Number(sessionId || 0);
    const memberId = Number(document.getElementById(`liveCheckInMember${id}`)?.value || 0);
    if (!id || !memberId) return alert('Choose a member to check in.');
    try {
        await api.checkInLiveSession(id, { member_id: memberId, source: 'operations' });
        liveClassNotice = 'Member checked in.';
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not check in member.');
    }
}

async function createLiveMemberFromForm(event) {
    event?.preventDefault?.();
    try {
        const result = await api.createMember({
            display_name: document.getElementById('liveMemberName')?.value || '',
            email: document.getElementById('liveMemberEmail')?.value || '',
            phone: document.getElementById('liveMemberPhone')?.value || '',
            access_tier: document.getElementById('liveMemberTier')?.value || 'library_only',
            access_status: document.getElementById('liveMemberStatus')?.value || 'active',
            notes: document.getElementById('liveMemberNotes')?.value || '',
        });
        liveClassNotice = `Created member "${result?.member?.display_name || 'member'}".`;
        event.target?.reset?.();
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not create member.');
    }
}

async function createLiveMemberForStudent(studentId) {
    const student = (students || []).find(item => Number(item.id) === Number(studentId));
    if (!student) return alert('Student was not found.');
    const signup = linkedSignupForStudent(student);
    try {
        const result = await api.createMember({
            student_id: student.id,
            signup_id: student.signup_id || signup?.id || null,
            display_name: student.parent_name || signup?.parent_name || student.name || 'Member',
            email: student.parent_email || signup?.parent_email || student.email || '',
            phone: student.parent_phone || signup?.parent_phone || '',
            access_tier: 'library_only',
            access_status: 'active',
            notes: student.name ? `Created from student profile for ${student.name}.` : 'Created from student profile.',
        });
        liveClassNotice = `Created member "${result?.member?.display_name || 'member'}".`;
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not create member access.');
    }
}

async function updateLiveMember(memberId) {
    const id = Number(memberId || 0);
    if (!id) return;
    try {
        const result = await api.updateMember(id, {
            display_name: document.getElementById(`memberName${id}`)?.value || '',
            email: document.getElementById(`memberEmail${id}`)?.value || '',
            phone: document.getElementById(`memberPhone${id}`)?.value || '',
            access_tier: document.getElementById(`memberTier${id}`)?.value || 'library_only',
            access_status: document.getElementById(`memberStatus${id}`)?.value || 'active',
            access_enabled: document.getElementById(`memberEnabled${id}`)?.value !== 'false',
            notes: document.getElementById(`memberNotes${id}`)?.value || '',
        });
        liveClassNotice = `Saved member "${result?.member?.display_name || 'member'}".`;
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not update member.');
    }
}

async function createLiveMemberAccessCode(memberId, regenerate = false) {
    const id = Number(memberId || 0);
    if (!id) return;
    if (regenerate && !confirm('Rotate this member portal link? The previous link will stop working.')) return;
    try {
        const result = await api.createMemberAccessCode(id, { regenerate });
        if (result?.url) await navigator.clipboard?.writeText(result.url);
        liveClassNotice = result?.url ? 'Member portal link is ready and copied.' : 'Member portal link is ready.';
        await loadData({ background: true });
    } catch (error) {
        alert(error.message || 'Could not create member access link.');
    }
}

async function copyLiveMemberUrl(url) {
    if (!url) return;
    try {
        await navigator.clipboard?.writeText(url);
        liveClassNotice = 'Member portal link copied.';
        render();
    } catch {
        alert(url);
    }
}

window.__operationsDeferredRenderersLoaded = true;
if (typeof exposeOperationsDeferredHandlers === 'function') exposeOperationsDeferredHandlers();
