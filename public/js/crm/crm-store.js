(function initBnaCrmStore(global) {
    'use strict';

    function stableQueryKey(filters = {}) {
        const cleaned = global.BnaCrmApi?.cleanFilters ? global.BnaCrmApi.cleanFilters(filters) : filters;
        return JSON.stringify(Object.keys(cleaned || {}).sort().reduce((acc, key) => {
            acc[key] = cleaned[key];
            return acc;
        }, {}));
    }

    function selectedContactVisible(cards = [], contactId = '') {
        if (!contactId) return false;
        return (cards || []).some(card => String(card?.id) === String(contactId));
    }

    global.BnaCrmStore = Object.freeze({
        stableQueryKey,
        selectedContactVisible
    });
})(window);
