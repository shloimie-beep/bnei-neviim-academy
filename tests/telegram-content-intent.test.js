const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseContentOutputTypeFromText,
  shouldBlockContentDraftEditIntent,
} = require('../src/lib/bna/telegram-content-intent');

const SIGNUP_MESSAGE = "On the signup page these documents that you made so there's an issue that first of all the top toolbar and the bottom toolbar like blocking the document so it should open up a new page. Also the cash and credit buttons aren't working, and make sure there's an email that goes to the person after they sign up.";

test('generic signup email/document bug is not inferred as newsletter output', () => {
  assert.equal(parseContentOutputTypeFromText(SIGNUP_MESSAGE), null);
});

test('signup page work blocks accidental content-draft edit routing', () => {
  assert.equal(
    shouldBlockContentDraftEditIntent({
      text: SIGNUP_MESSAGE,
      outputType: 'weekly_newsletter',
    }),
    true
  );
});

test('explicit content output edits still route to content-draft editing', () => {
  assert.equal(
    shouldBlockContentDraftEditIntent({
      text: 'Edit output #41 and make the weekly newsletter shorter.',
      outputId: 41,
      outputType: 'weekly_newsletter',
    }),
    false
  );
});

test('newsletter wording still maps to weekly newsletter output', () => {
  assert.equal(
    parseContentOutputTypeFromText('Please revise the weekly newsletter draft.'),
    'weekly_newsletter'
  );
});
