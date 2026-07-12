(function initBnaCrmInbox(global) {
    'use strict';

    const WORKSPACE_INBOX_SCOPES = Object.freeze({
        bna: 'bna',
        rabbi_sheller_provider: 'rabbi'
    });

    function scopeForWorkspace(workspaceKey = '') {
        return WORKSPACE_INBOX_SCOPES[String(workspaceKey || '').trim()] || 'bna';
    }

    global.BnaCrmInbox = Object.freeze({
        WORKSPACE_INBOX_SCOPES,
        scopeForWorkspace
    });
})(window);
