const test = require('node:test');
const assert = require('node:assert/strict');

const {
  extractInterestedParentLeads,
  hasContactLeadPipelineBuildIntent,
  hasInterestedParentLeadCaptureIntent,
} = require('../src/lib/bna/telegram-contact-lead-capture');

test('interested-parent phone ramble extracts lead cards and Kaplan secondary phone', () => {
  const text = [
    "Here is 054 111-1111 Ilana Kahan. She called me and I never got back to her.",
    "The next one is 0542222222. I didn't get his name, the guys name is Kaplan, the woman's name is Sari. This is her husband's number, and the woman's number is 0503333333. He was very interested in my philosophy.",
    'The next one his name is Uriah. His number is 053 444-4444. I called back and he did not answer, so I have to call that number back.',
    'The next one his name is Shlomo Canner. It is 052 555-5555. He was very interested and his kid went to Netzach and is 12 years old.',
    "Then we have Shifra. She's 058 666-6666. She sounded hesitant and wants me to speak with her husband.",
    'Other lady her name is Miriam Zlotnick. Her number is 052 777-7777. No answer. Her son is in 3rd grade in Gesher.',
    'Then there is Bracha Castell. Her number is 058 888-8888. Follow up with her about homeschooling.',
    'This woman is psychodrama Lagaat BaLev. Her number is 052 999-9999. They live in Yoknam and want Zoom classes in Hebrew. I gave her Rabbi Scheller number.',
    'There is a Lady Alina. She is interested and will call me back.',
    'We need a lead section, pipeline type view, contact history, WhatsApp history, notes, and tagged records.',
  ].join(' ');

  assert.equal(hasInterestedParentLeadCaptureIntent(text), true);
  assert.equal(hasContactLeadPipelineBuildIntent(text), true);

  const leads = extractInterestedParentLeads(text, { chatId: 1, messageId: 2 });
  assert.equal(leads.length, 9);

  const sari = leads.find((lead) => lead.parent_name === 'Sari Kaplan');
  assert.equal(sari.parent_phone, '0503333333');
  assert.deepEqual(sari.other_phones, ['0542222222']);
  assert.equal(sari.interest_level, 'hot');
  assert.equal(sari.status, 'interested');

  const shlomo = leads.find((lead) => lead.parent_name === 'Shlomo Canner');
  assert.equal(shlomo.student_age, 12);
  assert.ok(shlomo.tags.includes('netzach'));

  const alina = leads.find((lead) => lead.parent_name === 'Alina');
  assert.equal(alina.parent_phone, null);
  assert.equal(alina.status, 'follow_up');
});

test('contact pipeline build intent detects interested-parent workflow without a phone list', () => {
  const text = [
    'Can you figure out why the task did not get done for the parents that are interested?',
    'I wanted some sort of pipeline created from the contacts.',
    'In the parent section we need WhatsApp, previous contact history, and a way to manage their online logins.',
  ].join(' ');

  assert.equal(hasInterestedParentLeadCaptureIntent(text), false);
  assert.equal(hasContactLeadPipelineBuildIntent(text), true);
});
