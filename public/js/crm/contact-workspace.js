(function initBnaCrmContactWorkspace(global) {
    'use strict';

    const EMPTY_STATES = Object.freeze({
        conversations: 'No conversations yet.',
        notes: 'No notes yet.',
        follow_up: 'No follow-up scheduled.',
        tasks: 'No tasks assigned.',
        membership: 'No membership linked.',
        class_activity: 'No class activity recorded.',
        email_unavailable: 'Email is not available for this contact.',
        whatsapp_unavailable: 'WhatsApp is not available for this contact.'
    });

    const WORKSPACE_TABS = Object.freeze([
        { id: 'overview', label: 'Overview', enabled: true },
        { id: 'activity', label: 'Activity', enabled: true },
        { id: 'conversations', label: 'Conversations', enabled: true },
        { id: 'tasks', label: 'Tasks', enabled: true },
        { id: 'access', label: 'Access', enabled: true }
    ]);

    const WORKBENCH_CONTRACT = Object.freeze({
        version: 'shared-crm-v1',
        pane_count: 3,
        component_order: Object.freeze(['contacts-index', 'contact-workspace', 'contact-inspector']),
        desktop_grid: 'minmax(260px,0.78fr) minmax(0,1.12fr) minmax(240px,0.8fr)',
        tablet_breakpoint_px: 900,
        mobile_breakpoint_px: 700,
        mobile_back_control_height_px: 40
    });

    function emptyState(key) {
        return EMPTY_STATES[key] || '';
    }

    function workspaceDescription(mode = 'workspace') {
        if (mode === 'one_time') {
            return 'Search, filter, sort, open, and read local One Time CRM contact timelines from first-party records only.';
        }
        return 'Search, filter, sort, open, and read local BNA CRM contact timelines from first-party records only.';
    }

    function profileValue(kind, value) {
        const text = String(value || '').trim();
        if (text) return text;
        if (kind === 'email') return EMPTY_STATES.email_unavailable;
        if (kind === 'whatsapp' || kind === 'phone') return EMPTY_STATES.whatsapp_unavailable;
        if (kind === 'conversations') return EMPTY_STATES.conversations;
        if (kind === 'notes') return EMPTY_STATES.notes;
        if (kind === 'follow_up') return EMPTY_STATES.follow_up;
        if (kind === 'tasks') return EMPTY_STATES.tasks;
        if (kind === 'membership') return EMPTY_STATES.membership;
        if (kind === 'class_activity') return EMPTY_STATES.class_activity;
        return 'Not set';
    }

    function workspaceTabs() {
        return WORKSPACE_TABS.map(tab => ({ ...tab }));
    }

    function workbenchContract() {
        return {
            ...WORKBENCH_CONTRACT,
            component_order: [...WORKBENCH_CONTRACT.component_order]
        };
    }

    global.BnaCrmContactWorkspace = Object.freeze({
        EMPTY_STATES,
        emptyState,
        workspaceDescription,
        profileValue,
        workspaceTabs,
        workbenchContract
    });
})(window);
