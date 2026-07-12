(function initBnaCrmActions(global) {
    'use strict';

    function whatsappHref(phone = '') {
        const digits = String(phone || '').replace(/[^0-9]/g, '');
        return digits ? `https://wa.me/${digits}` : '';
    }

    function emailAvailable(card = {}) {
        return Boolean(String(card.email || '').trim());
    }

    function whatsappAvailable(card = {}) {
        return Boolean(whatsappHref(card.phone));
    }

    function unavailableTooltip(channel) {
        if (channel === 'email') return global.BnaCrmContactWorkspace?.emptyState('email_unavailable') || 'Email is not available for this contact.';
        if (channel === 'whatsapp') return global.BnaCrmContactWorkspace?.emptyState('whatsapp_unavailable') || 'WhatsApp is not available for this contact.';
        return 'This action is not available for this contact.';
    }

    global.BnaCrmActions = Object.freeze({
        whatsappHref,
        emailAvailable,
        whatsappAvailable,
        unavailableTooltip
    });
})(window);
