(function initBnaCrmContactsIndex(global) {
    'use strict';

    function normalizePayload(payload = {}, visibleLimit = 50) {
        const cards = Array.isArray(payload.cards) ? payload.cards.slice(0, visibleLimit) : [];
        return {
            ...payload,
            cards,
            visible_limit: visibleLimit
        };
    }

    function statusText({ loading = false, cards = [], payload = {} } = {}) {
        if (loading) return 'Loading CRM contacts...';
        const visible = Number(cards.length || 0).toLocaleString();
        const filtered = Number(payload.filtered_total || cards.length || 0).toLocaleString();
        const total = Number(payload.total || cards.length || 0).toLocaleString();
        return `${visible} visible / ${filtered} matching / ${total} total.`;
    }

    function filteredEmptyText() {
        return 'No conversations yet.';
    }

    global.BnaCrmContactsIndex = Object.freeze({
        normalizePayload,
        statusText,
        filteredEmptyText
    });
})(window);
