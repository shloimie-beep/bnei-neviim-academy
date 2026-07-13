(function initBnaCrmApi(global) {
    'use strict';

    const CRM_API_ROOT = '/crm';

    function cleanFilters(filters = {}) {
        const cleaned = {};
        Object.entries(filters || {}).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            cleaned[key] = value;
        });
        return cleaned;
    }

    function queryString(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(cleanFilters(filters)).forEach(([key, value]) => {
            params.set(key, value);
        });
        const query = params.toString();
        return query ? `?${query}` : '';
    }

    function contactListPath(filters = {}) {
        return `${CRM_API_ROOT}/contacts${queryString(filters)}`;
    }

    function contactTimelinePath(contactKey, filters = {}) {
        return `${CRM_API_ROOT}/contacts/${encodeURIComponent(contactKey)}/timeline${queryString(filters)}`;
    }

    function contactConversationsPath(contactKey, filters = {}) {
        return `${CRM_API_ROOT}/contacts/${encodeURIComponent(contactKey)}/conversations${queryString(filters)}`;
    }

    function contactTasksPath(contactKey, filters = {}) {
        return `${CRM_API_ROOT}/contacts/${encodeURIComponent(contactKey)}/tasks${queryString(filters)}`;
    }

    global.BnaCrmApi = Object.freeze({
        cleanFilters,
        queryString,
        contactListPath,
        contactTimelinePath,
        contactConversationsPath,
        contactTasksPath
    });
})(window);
