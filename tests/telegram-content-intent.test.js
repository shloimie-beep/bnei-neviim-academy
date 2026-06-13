const test = require('node:test');
const assert = require('node:assert/strict');

const {
  hasContentCommitToSchedulingIntent,
  hasPublicPublishNowIntent,
  parseContentOutputTypeFromText,
  shouldBlockContentDraftEditIntent,
} = require('../src/lib/bna/telegram-content-intent');
const {
  isConfirmationText,
  isHandlerBlocked,
  planTelegramIntent,
  shouldAskForExternalApproval,
  stripConfirmationPrefix,
} = require('../src/lib/bna/telegram-agent-intent');

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

test('student and parent side-menu UI request blocks accidental content-draft editing', () => {
  assert.equal(
    shouldBlockContentDraftEditIntent({
      text: [
        'All the sections like the questions and meeting recordings need to be in a dropdown menu on the side.',
        'Attendance should be a category on the side.',
        'The student login and parent login should be structured like this with filters on top.',
      ].join(' '),
      outputType: 'facebook_post',
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

test('newsletter system discussion blocks accidental content handlers', () => {
  const plan = planTelegramIntent({
    text: "He keeps getting confused. I'll say newsletter and he'll generate the newsletter when I'm talking about something else.",
  });

  assert.equal(plan.primaryIntent, 'conversation');
  assert.equal(isHandlerBlocked(plan, 'contentDraftEdit'), true);
  assert.equal(isHandlerBlocked(plan, 'weeklyReport'), true);
});

test('explicit newsletter drafting remains content generation', () => {
  const plan = planTelegramIntent({
    text: 'Please draft the weekly newsletter from this week of recordings.',
  });

  assert.equal(plan.primaryIntent, 'content_generate');
  assert.equal(isHandlerBlocked(plan, 'weeklyReport'), false);
});

test('codex prompt refinement stays in planning mode', () => {
  const plan = planTelegramIntent({
    text: 'I want to make a prompt for Codex and refine it with you in planning mode.',
  });

  assert.equal(plan.primaryIntent, 'planning');
  assert.equal(isHandlerBlocked(plan, 'contentDraftEdit'), true);
});

test('direct reply correction does not route to Codex or task capture', () => {
  const plan = planTelegramIntent({
    text: "No dude I don't want to speak to codex I want to speak to you I didn't want you to file that for codex no I want you to be aren't you able to give me that right now can't you do that for me put that text together so I can just paste it in",
  });

  assert.equal(plan.primaryIntent, 'conversation');
  assert.equal(plan.replyStrategy, 'answer_naturally');
  assert.equal(isHandlerBlocked(plan, 'codex'), true);
  assert.equal(isHandlerBlocked(plan, 'taskCapture'), true);
});

test('public publish requests require approval unless confirmed', () => {
  const plan = planTelegramIntent({
    text: 'publish now facebook | Registration is open',
  });

  assert.equal(plan.primaryIntent, 'publish_send');
  assert.equal(shouldAskForExternalApproval(plan), true);
  assert.equal(isConfirmationText('confirm publish now facebook | Registration is open'), true);
  assert.equal(stripConfirmationPrefix('confirm publish now facebook | Registration is open'), 'publish now facebook | Registration is open');
});

test('mixed internal accountability ramble mentioning WhatsApp is captured as Codex work', () => {
  const plan = planTelegramIntent({
    text: [
      'Okay so there are a couple things we need to do.',
      'We need the student login for accountability so students can mark things off.',
      'Parents should have a parent portal linked to students, with password reset and quick communication buttons.',
      'One button can say send WhatsApp to give them their login, but this is a system feature.',
      'Parent meeting recordings should upload, get parsed with AI, and update accountability.',
      'We need an internal or external people filter, add Esty Dratler, delete the Codex test parent, and change the DNS for www.',
    ].join(' '),
  });

  assert.equal(plan.primaryIntent, 'codex_work');
  assert.equal(shouldAskForExternalApproval(plan), false);
  assert.equal(isHandlerBlocked(plan, 'latestDriveIngest'), true);
  assert.equal(isHandlerBlocked(plan, 'contentDraftEdit'), true);
});

test('task comment requeue request routes to Codex work', () => {
  const plan = planTelegramIntent({
    text: [
      'I keep adding comments right now.',
      'Make sure when I push that button the comments go back into the queue.',
      'It needs to be ingested again and dealt with.',
      'Tell Codex to check the comments and make sure those buttons are working.',
    ].join(' '),
  });

  assert.equal(plan.primaryIntent, 'codex_work');
  assert.equal(shouldAskForExternalApproval(plan), false);
  assert.equal(isHandlerBlocked(plan, 'contentDraftEdit'), true);
  assert.equal(isHandlerBlocked(plan, 'publish'), true);
});

test('research-section source-sheet requests from content discussions route to Codex work', () => {
  const plan = planTelegramIntent({
    text: [
      'In terms of all the topics we are discussing in the content being uploaded,',
      'the research section needs to be developed.',
      'It should bring sources and source sheets for the topics from recordings, with links to Safari.',
      'The topics need to be expanded upon in the research section.',
    ].join(' '),
  });

  assert.equal(plan.primaryIntent, 'codex_work');
  assert.equal(shouldAskForExternalApproval(plan), false);
  assert.equal(isHandlerBlocked(plan, 'latestDriveIngest'), true);
  assert.equal(isHandlerBlocked(plan, 'weeklyTranscriptTopic'), true);
});

test('WhatsApp parser cleanup request routes to Codex instead of draft editing', () => {
  const plan = planTelegramIntent({
    text: [
      'Fix up the parsing mechanism for WhatsApp posts.',
      'I do not need to see the WhatsApp post automatically in Telegram after I load something up.',
      'Tasks I record myself saying are ending up in WhatsApp posts.',
      'Technical backend corrections should go to decisions or tasks for Codex, not into the content section.',
    ].join(' '),
  });

  assert.equal(plan.primaryIntent, 'codex_work');
  assert.equal(shouldAskForExternalApproval(plan), false);
  assert.equal(isHandlerBlocked(plan, 'contentDraftEdit'), true);
  assert.equal(isHandlerBlocked(plan, 'latestDriveIngest'), true);
});

test('interested-parent lead update does not become public send approval', () => {
  const plan = planTelegramIntent({
    text: [
      'Here are numbers that called me and were interested: 054 111-1111 Ilana Kahan.',
      'Sari Kaplan is 0502222222 and her husband is 0543333333.',
      'These are warm inbound leads from Facebook ads.',
      'We need a lead section with a pipeline view so I can track what I am sending to them and see WhatsApp history and notes.',
    ].join(' '),
  });

  assert.equal(plan.primaryIntent, 'codex_work');
  assert.equal(shouldAskForExternalApproval(plan), false);
  assert.equal(isHandlerBlocked(plan, 'publish'), true);
});

test('mixed video task mentioning Facebook and YouTube does not become publish approval', () => {
  const plan = planTelegramIntent({
    text: [
      'Another task is to take the video that we put on Facebook and YouTube.',
      'The first image is black because it fades in and that becomes the Facebook ad thumbnail.',
      'I need Codex to change it, maybe trim the first second from the raw clip.',
      'Put that in the task for me to do.',
    ].join(' '),
  });

  assert.equal(plan.primaryIntent, 'codex_work');
  assert.equal(shouldAskForExternalApproval(plan), false);
  assert.equal(isHandlerBlocked(plan, 'latestVideoEdit'), true);
});

test('content commit to scheduler is not treated as public publish now', () => {
  const text = 'Commit this Facebook post to Buffer so I can schedule it.';
  const plan = planTelegramIntent({ text });

  assert.equal(hasContentCommitToSchedulingIntent(text), true);
  assert.equal(hasPublicPublishNowIntent(text), false);
  assert.equal(shouldAskForExternalApproval(plan), false);
  assert.equal(isHandlerBlocked(plan, 'contentApproval'), false);
});

test('legacy GHL scheduler wording still maps to scheduler commit intent', () => {
  const text = 'Create a GHL draft for this Facebook post.';

  assert.equal(hasContentCommitToSchedulingIntent(text), true);
  assert.equal(hasPublicPublishNowIntent(text), false);
});

test('publish now remains a public publish action requiring approval', () => {
  const text = 'Publish now this Facebook post.';
  const plan = planTelegramIntent({ text });

  assert.equal(hasPublicPublishNowIntent(text), true);
  assert.equal(plan.primaryIntent, 'publish_send');
  assert.equal(shouldAskForExternalApproval(plan), true);
});
