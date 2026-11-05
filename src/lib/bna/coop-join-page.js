'use strict';
// Keep the established renderer entry point for the existing /join routes.
const { renderInterestForm } = require('./interest-pages');
function renderCoopJoinPage(env = process.env, locale = 'en') { return renderInterestForm(env, locale); }
module.exports = { renderCoopJoinPage };
