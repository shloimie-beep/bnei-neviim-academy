const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const studentHtml = fs.readFileSync('public/student.html', 'utf8');
const parentHtml = fs.readFileSync('public/parent.html', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const signupDocumentsJs = fs.readFileSync('public/js/signup-documents.js', 'utf8');

test('server exposes student daily checkoff and message APIs', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_goal_board_checkins/);
  assert.match(server, /UNIQUE \(goal_id, date\)/);
  assert.match(server, /app\.post\('\/api\/student-portal\/goals\/:id\/day-checkoff'/);
  assert.match(server, /recalculateGoalProgressFromDailyCheckins/);
  assert.match(server, /app\.post\('\/api\/student-portal\/message-rabbi'/);
  assert.match(server, /sendTelegramNotification/);
});

test('server exposes portal-safe questions, attendance, and Sefaria enrichment', () => {
  assert.match(server, /function safeQuestionView/);
  assert.match(server, /function safeAttendanceView/);
  assert.match(server, /getStudentQuestionsForPortal/);
  assert.match(server, /getStudentAttendanceForPortal/);
  assert.match(server, /searchSefariaSourcesForQuestion/);
  assert.match(server, /https:\/\/www\.sefaria\.org\/api\/search\/text\/_search/);
  assert.match(server, /app\.post\('\/api\/bna\/accountability\/:id\/sefaria-sources'/);
  assert.match(server, /app\.post\('\/api\/bna\/accountability\/enrich-question-sources'/);
  assert.match(server, /source_note: 'Sefaria source suggestions for learning/);
});

test('parent auth uses password accounts, reset tokens, legacy magic links, and HttpOnly session', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_parent_password_accounts/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_parent_password_reset_tokens/);
  assert.match(server, /parentPasswordHash/);
  assert.match(server, /verifyParentPassword/);
  assert.match(server, /crypto\.scryptSync/);
  assert.match(server, /app\.post\('\/api\/parent-portal\/login'/);
  assert.match(server, /app\.post\('\/api\/parent-portal\/password\/request'/);
  assert.match(server, /app\.post\('\/api\/parent-portal\/password\/reset'/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_parent_magic_links/);
  assert.match(server, /token_hash TEXT NOT NULL UNIQUE/);
  assert.match(server, /sha256Hex\(token\)/);
  assert.doesNotMatch(server, /plaintext_secret|token TEXT NOT NULL/);
  assert.match(server, /PARENT_SESSION_COOKIE_NAME/);
  assert.match(server, /HttpOnly/);
  assert.match(server, /app\.get\('\/api\/parent-portal\/session'/);
  assert.match(server, /app\.get\('\/api\/parent-portal'/);
});

test('transaction-scoped database helpers do not issue parallel client queries', () => {
  assert.doesNotMatch(
    server,
    /async function findParentAccessRecords[\s\S]*?Promise\.all[\s\S]*?function parentAccessEligible/
  );
  assert.doesNotMatch(
    server,
    /async function ensureTorahSeedStudents[\s\S]*?Promise\.all[\s\S]*?async function getTorahStudents/
  );
});

test('operations can send parent login links by email or confirmed WhatsApp', () => {
  assert.match(server, /app\.post\('\/api\/bna\/parent-access\/link'/);
  assert.match(server, /sendParentMagicLinkWhatsApp/);
  assert.match(server, /sendWhatsapp && String\(body\.confirm \|\| ''\)\.trim\(\) !== 'SEND_WHATSAPP'/);
  assert.match(server, /records\?\.students\?\.length \|\| records\?\.signups\?\.length \|\| records\?\.leads\?\.length/);
  assert.match(server, /Parent portal login link sent by WhatsApp/);
  assert.match(server, /A secure parent portal link was sent by WhatsApp\. It expires in 30 minutes\./);
  assert.match(server, /No email was sent/);
  assert.match(operationsHtml, /function renderParentPortalActionButtons/);
  assert.match(operationsHtml, /sendParentAccessLink\(event, '\$\{escapeHtml\(contactType\)\}', \$\{id\}, 'open'\)/);
  assert.match(operationsHtml, /send_whatsapp: channel === 'whatsapp'/);
  assert.match(operationsHtml, /send_email: channel === 'email'/);
  assert.match(operationsHtml, /confirm: 'SEND_WHATSAPP'/);
  assert.match(operationsHtml, /async function tryCopyText/);
  assert.match(operationsHtml, /Parent portal opened in a new tab/);
  assert.match(operationsHtml, /No email was sent/);
  assert.match(operationsHtml, /clipboard copy was unavailable/);
  assert.match(operationsHtml, /The parent can open it directly without typing their email again/);
  assert.match(operationsHtml, /Open Parent Portal/);
  assert.match(operationsHtml, /Email Login Link/);
  assert.match(operationsHtml, /WhatsApp Login Link/);
  assert.doesNotMatch(operationsHtml, /Email Parent Login/);
});

test('duplicate cleanup archives known test parent records only by canonical email match', () => {
  assert.match(server, /archiveKnownTestParentDuplicates/);
  assert.match(server, /isKnownTestDuplicateName/);
  assert.match(server, /findActiveRecordsByParentEmail\(email/);
  assert.match(server, /canonical_kind/);
  assert.match(server, /status = 'archived'/);
  assert.match(server, /status = 'inactive'/);
});

test('student portal renders history, next meeting, daily rows, and rabbi message box', () => {
  assert.match(studentHtml, /torahHistoryChart/);
  assert.match(studentHtml, /portalMenuToggle/);
  assert.match(studentHtml, /portalSidebar/);
  assert.match(studentHtml, /portalNav/);
  assert.match(studentHtml, /goalStatusFilter/);
  assert.match(studentHtml, /torahClassMetric/);
  assert.match(studentHtml, /class_trip_percentage/);
  assert.match(studentHtml, /nextMeetingStrip/);
  assert.match(studentHtml, /renderGoalDailyRows/);
  assert.match(studentHtml, /data-day-checkoff/);
  assert.match(studentHtml, /\/api\/student-portal\/goals\/\$\{encodeURIComponent\(goalId\)\}\/day-checkoff/);
  assert.match(studentHtml, /Talk to your rabbi about anything/);
  assert.match(studentHtml, /\/api\/student-portal\/message-rabbi/);
});

test('student portal rejects invalid credentials and clears stored access codes', () => {
  assert.match(server, /const STUDENT_PORTAL_AUTH_MAX_FAILURES = 8/);
  assert.match(server, /function recordStudentPortalAuthFailure/);
  assert.match(server, /async function getStudentForPortalCredential/);
  assert.match(server, /res\.status\(401\)\.json\(\{ error: 'A valid student access code is required' \}\)/);
  assert.match(server, /res\.status\(401\)\.json\(\{ error: 'Invalid or expired student access code' \}\)/);
  assert.match(server, /res\.status\(429\)\.json\(\{ error: 'Too many failed access attempts/);
  assert.match(server, /await getStudentForPortalCredential\(req, res, code/);
  assert.doesNotMatch(server, /Student access code was not found/);
  assert.doesNotMatch(server, /Student access code is required/);
  assert.match(studentHtml, /function handlePortalCredentialError/);
  assert.match(studentHtml, /localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.match(studentHtml, /if \(handlePortalCredentialError\(error\)\) return/);
  assert.match(studentHtml, /Coming soon/);
});

test('parent portal uses login, calendar navigation, help, and scoped visible student data', () => {
  assert.match(parentHtml, /\/api\/parent-portal\/login/);
  assert.match(parentHtml, /\/api\/parent-portal\/password\/request/);
  assert.match(parentHtml, /\/api\/parent-portal\/password\/reset/);
  assert.match(parentHtml, /\/api\/parent-portal\/session\?token=/);
  assert.match(parentHtml, /\/api\/parent-portal/);
  assert.match(parentHtml, /type="password"/i);
  assert.match(parentHtml, /els\.requestForm\.classList\.add\('hidden'\)/);
  assert.match(parentHtml, /Opening parent portal/);
  assert.match(parentHtml, /renderStudent/);
  assert.match(parentHtml, /portalMenuToggle/);
  assert.match(parentHtml, /parentPortalSidebar/);
  assert.match(parentHtml, /data-parent-section-select/);
  assert.match(parentHtml, /data-parent-section-panel/);
  assert.match(parentHtml, /activeParentSection = 'home'/);
  assert.match(parentHtml, /\{ id: 'home', label: t\('home'\)/);
  assert.match(parentHtml, /function parentChildrenLabel/);
  assert.match(parentHtml, /\{ id: 'children', label: parentChildrenLabel\(data\)/);
  assert.match(parentHtml, /\{ id: 'calendar', label: t\('calendar'\)/);
  assert.match(parentHtml, /\{ id: 'learning', label: t\('learningHub'\)/);
  assert.match(parentHtml, /\{ id: 'messages', label: t\('messagesHelp'\)/);
  assert.match(parentHtml, /\{ id: 'providers', label: t\('providerIndex'\)/);
  assert.match(parentHtml, /\{ id: 'account', label: t\('account'\)/);
  assert.doesNotMatch(parentHtml, /\{ id: 'settings', label: t\('settings'\)/);
  assert.match(parentHtml, /function renderCalendarView/);
  assert.match(parentHtml, /data-calendar-day/);
  assert.match(parentHtml, /daily_completion_percentage/);
  assert.match(parentHtml, /he-IL/);
  assert.match(parentHtml, /renderParentStudentGoals/);
  assert.match(parentHtml, /class_trip_percentage/);
  assert.match(parentHtml, /renderGoals/);
  assert.match(parentHtml, /renderDailyWeeks/);
  assert.match(parentHtml, /renderQuestions/);
  assert.match(parentHtml, /renderAttendance/);
  assert.match(parentHtml, /renderAttendanceSummary/);
  assert.match(parentHtml, /renderFinancialSummary/);
  assert.match(parentHtml, /whatsappDock/);
  assert.match(parentHtml, /WhatsApp Rabbi Shloimie/);
  assert.match(parentHtml, /readOnlyChildSnapshot/);
  assert.match(parentHtml, /readOnlyParentNote/);
  assert.doesNotMatch(parentHtml, /data-parent-response-send/);
  assert.match(parentHtml, /data-parent-help-form/);
  assert.match(parentHtml, /\/api\/parent-portal\/help/);
  assert.doesNotMatch(parentHtml, /data-student-open=/);
  assert.doesNotMatch(parentHtml, /data-student-reset=/);
  assert.doesNotMatch(parentHtml, /Questions and sources/);
  assert.doesNotMatch(parentHtml, /source-list/);
});

test('parent help and question actions are internally tagged for staff routing', () => {
  assert.match(server, /function parentInteractionTags/);
  assert.match(server, /parent_question/);
  assert.match(server, /portal_help/);
  assert.match(server, /technology_issue/);
  assert.match(server, /student_question/);
  assert.match(server, /billing_question/);
  assert.match(server, /assignment_question/);
  assert.match(server, /access_issue/);
  assert.match(server, /mergeParentRecordTags/);
  assert.match(server, /app\.post\('\/api\/parent-portal\/help'/);
  assert.match(server, /source: 'web'/);
  assert.match(server, /created_by: 'parent_portal'/);
  assert.match(server, /PARENT_HELP_EMAIL/);
  assert.match(server, /sendGmailMessage/);
  assert.match(server, /app\.post\('\/api\/parent-portal\/students\/:studentId\/access-code'/);
  assert.match(server, /student_access_reset: regenerate/);
});

test('parent meeting-recording backend remains guarded while parent UI is read-only', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_parent_meeting_uploads/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_parent_accountability_pipelines/);
  assert.match(server, /transcribeMediaWithOpenAI/);
  assert.match(server, /generateMixedRecordingParse/);
  assert.match(server, /parent-meeting-upload-v1/);
  assert.match(server, /Parent-created goals must be parent_visible true, student_visible false, approval_required true, and approval_status pending_review/);
  assert.match(server, /app\.post\('\/api\/parent-portal\/students\/:studentId\/meeting-recordings'/);
  assert.match(server, /app\.put\('\/api\/parent-portal\/students\/:studentId\/accountability-pipeline'/);
  assert.match(server, /getParentPortalStudentForSession\(session\.parentEmail, studentId\)/);
  assert.match(server, /queueParentMeetingUploadProcessing\(upload\.id\)/);
  assert.match(server, /INSERT INTO bna_accountability_events/);
  assert.match(server, /event_type, student_id, student_name, title, notes, topic/);
  assert.match(server, /parentReviewGoalBoardPayload/);
  assert.match(server, /checklist: Array\.isArray\(payload\.checklist\) \? payload\.checklist : explicitGoalBoard\.checklist \?\? existingGoalBoard\.checklist/);
  assert.match(server, /const nextAgreement = \{/);
  assert.match(server, /bedtime_time: payload\.bedtime_time \?\? explicitGoalBoard\.bedtime_time/);
  assert.match(server, /chosen_consequence: payload\.chosen_consequence \?\? explicitGoalBoard\.chosen_consequence/);
  assert.match(server, /const nextConsequence = \{/);
  assert.match(server, /recovery_path: payload\.recovery_path \?\? explicitGoalBoard\.recovery_path/);
  assert.match(server, /source: 'parent_meeting'/);
  assert.match(server, /student_visible: false/);
  assert.match(server, /approval_status: 'pending_review'/);
  assert.doesNotMatch(parentHtml, /data-meeting-upload-form=/);
  assert.doesNotMatch(parentHtml, /name="recording" type="file"/);
  assert.doesNotMatch(parentHtml, /data-parser-instructions=/);
  assert.doesNotMatch(parentHtml, /\/api\/parent-portal\/students\/\$\{encodeURIComponent\(studentId\)\}\/meeting-recordings/);
  assert.match(parentHtml, /renderMeetingUploads/);
});

test('parent chat backend remains guarded while parent UI shows read-only messages and help path', () => {
  assert.match(server, /app\.post\('\/api\/parent-portal\/students\/:studentId\/chat'/);
  assert.match(server, /getParentPortalStudentForSession\(session\.parentEmail, studentId, client\)/);
  assert.match(server, /createParentChatAccountabilityUpdate/);
  assert.match(server, /parent-chat-v1/);
  assert.match(server, /parent_chat: true/);
  assert.match(server, /visibility: 'parent_review'/);
  assert.match(server, /source: 'parent_update'/);
  assert.match(server, /student_visible: false/);
  assert.match(server, /approval_required: true/);
  assert.match(server, /parentChatSourceId\(communication\.id\)/);
  assert.match(server, /sendTelegramNotification\(\[/);
  assert.doesNotMatch(parentHtml, /data-parent-chat-form=/);
  assert.match(parentHtml, /parentMessagesOnly/);
  assert.match(parentHtml, /parentMessagesHelp/);
  assert.match(parentHtml, /renderParentChat/);
  assert.match(parentHtml, /renderParentChatMessages/);
  assert.doesNotMatch(parentHtml, /\/api\/parent-portal\/students\/\$\{encodeURIComponent\(studentId\)\}\/chat/);
});

test('student checkoffs and parent messages create parent review notifications', () => {
  assert.match(server, /createParentActionNotification/);
  assert.match(server, /parentNotificationSourceId/);
  assert.match(server, /metadata->>'parent_notification' = 'true'/);
  assert.match(server, /'decision', \$1, \$2, \$3, \$4, \$5,/);
  assert.match(server, /stampGoalParentReview/);
  assert.match(server, /app\.post\('\/api\/student-portal\/message-parent'/);
  assert.match(server, /app\.post\('\/api\/parent-portal\/notifications\/:id\/respond'/);
  assert.match(server, /getParentPortalStudentForSession\(session\.parentEmail, notification\.student_id, client\)/);
  assert.match(server, /applyParentNotificationAction/);
  assert.match(parentHtml, /renderParentNotifications/);
  assert.match(parentHtml, /data-parent-notification-action="approve"/);
  assert.match(parentHtml, /data-parent-notification-action="deny"/);
  assert.match(parentHtml, /\/api\/parent-portal\/notifications\/\$\{encodeURIComponent\(notificationId\)\}\/respond/);
  assert.match(studentHtml, /parentMessageSection/);
  assert.match(studentHtml, /\/api\/student-portal\/message-parent/);
});

test('portal payloads exclude admin-only analysis and private meeting details', () => {
  assert.match(server, /metadata\.visibility === 'admin_only' \|\| metadata\.kind === 'student_analysis'/);
  assert.match(server, /if \(row\.event_type === 'private_meeting'\) return false/);
  assert.match(server, /safeGoalBoardStudentView/);
  assert.match(server, /SELECT id, name, name_en, name_he, parent_name, parent_email, parent_phone, current_school, tags, status\s+FROM bna_students\s+WHERE student_access_code = \$1/);
  assert.match(server, /getStudentPortalPayload\(\{\s+id: student\.id,\s+name: student\.name,\s+parent_name: student\.parent_name,\s+parent_email: student\.parent_email,/);
  assert.doesNotMatch(studentHtml, /Student Analysis/);
  assert.doesNotMatch(parentHtml, /Student Analysis/);
});

test('student portal loads student-visible calendar events and localized student names', () => {
  assert.match(server, /ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS name_en TEXT/);
  assert.match(server, /ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS name_he TEXT/);
  assert.match(server, /function studentLocalizedNames/);
  assert.match(server, /getCalendarEventsForStudentPortal/);
  assert.match(server, /visibility = ANY\(\$2::text\[\]\)/);
  assert.match(server, /status NOT IN \('cancelled', 'archived'\)/);
  assert.match(server, /calendar_events: calendarEvents/);
  assert.match(server, /localized_names: localizedNames/);

  assert.match(studentHtml, /function studentDisplayName/);
  assert.match(studentHtml, /studentDisplayName\(data\?\.student\)/);
  assert.match(studentHtml, /data\?\.calendar_events/);
  assert.match(studentHtml, /event\.start_at \|\| event\.date/);
  assert.match(studentHtml, /studentCalendarVisibilityLabel/);
  assert.match(studentHtml, /text\.match\(\/\^\(\\d\{4\}\)-\(\\d\{2\}\)-\(\\d\{2\}\)/);
  assert.match(studentHtml, /end\.setHours\(23, 59, 59, 999\)/);
});

test('parent portal supports Hebrew defaults and goal section filters', () => {
  assert.match(server, /HEBREW_PARENT_PORTAL_TAGS/);
  assert.match(server, /hebrew_speaking/);
  assert.match(server, /parent_portal_hebrew/);
  assert.match(server, /resolveParentPortalLanguage/);
  assert.match(server, /preferred_language: preferredLanguage/);
  assert.match(server, /direction: preferredLanguage === 'he' \? 'rtl' : 'ltr'/);
  assert.match(server, /signupStudentTags/);
  assert.match(server, /COALESCE\(bna_students\.tags, ARRAY\[\]::text\[\]\) \|\| EXCLUDED\.tags/);
  assert.match(parentHtml, /data-language="he"/);
  assert.match(parentHtml, /document\.documentElement\.dir = language === 'he' \? 'rtl' : 'ltr'/);
  assert.match(parentHtml, /data-goal-section-filter/);
  assert.match(parentHtml, /data-goal-status-filter/);
  assert.match(parentHtml, /personal_home/);
  assert.match(parentHtml, /permissions/);
  assert.match(parentHtml, /incentives/);
});

test('student portal exposes Hebrew and English source labels while parent portal uses coaching labels', () => {
  assert.match(studentHtml, /data-lang="he"/);
  assert.match(studentHtml, /data-lang="en"/);
  assert.match(studentHtml, /questionsTitle: 'השאלות שלי'/);
  assert.match(studentHtml, /sefariaSources: 'מקורות ספריא'/);
  assert.match(studentHtml, /optionalFollowUp: 'לימוד המשך אפשרי'/);
  assert.match(studentHtml, /document\.documentElement\.dir = language === 'he' \? 'rtl' : 'ltr'/);
  assert.match(studentHtml, /source\.heRef \|\| source\.he_ref \|\| source\.hebrew_ref \|\| source\.ref/);

  assert.match(parentHtml, /data-language="he"/);
  assert.match(parentHtml, /data-language="en"/);
  assert.match(parentHtml, /parentCoaching: 'Parent coaching'/);
  assert.match(parentHtml, /interestTopics: 'Interest topics'/);
  assert.match(parentHtml, /struggleSignals: 'What he may be working through'/);
  assert.match(parentHtml, /openEndedQuestions: 'Open-ended parent questions'/);
  assert.match(parentHtml, /respondToQuestion: 'תגובה לשאלה'/);
  assert.match(parentHtml, /document\.documentElement\.dir = language === 'he' \? 'rtl' : 'ltr'/);
  assert.doesNotMatch(parentHtml, /source\.heRef \|\| source\.he_ref \|\| source\.hebrew_ref \|\| source\.ref/);
  assert.doesNotMatch(parentHtml, /\$\{escapeHtml\(t\('sefariaSources'\)\)\}/);
  assert.doesNotMatch(parentHtml, /\$\{escapeHtml\(t\('sendResponse'\)\)\}/);
});

test('student portal renders question source suggestions and parent responses', () => {
  assert.match(studentHtml, /questionsSection/);
  assert.match(studentHtml, /renderQuestions/);
  assert.match(studentHtml, /safeSefariaUrl/);
  assert.match(studentHtml, /sefariaSourceLabel/);
  assert.match(studentHtml, /source\.heRef \|\| source\.he_ref \|\| source\.hebrew_ref \|\| source\.ref/);
  assert.match(studentHtml, /<details class="question-card">/);
  assert.match(studentHtml, /<details class="goal-card/);
  assert.match(studentHtml, /Sefaria sources/);
  assert.match(studentHtml, /parent_responses/);
});

test('parent portal renders coaching summaries instead of student source sheets', () => {
  assert.match(server, /function parentQuestionCoachingView/);
  assert.match(server, /return audience === 'parent' \? parentQuestionCoachingView\(row, view\) : view/);
  assert.match(server, /sources: \[\]/);
  assert.match(server, /function parentVisibleText/);
  assert.match(server, /containsInternalParentPortalText/);
  assert.match(server, /parentQuestionHasVisibleText/);
  assert.match(parentHtml, /function renderParentQuestionCoaching/);
  assert.match(parentHtml, /question\.parent_coaching/);
  assert.match(parentHtml, /open_ended_questions/);
  assert.doesNotMatch(parentHtml, /renderQuestionSources\(question\.sources\)/);
  assert.doesNotMatch(parentHtml, /renderQuestionAssignments\(question\.assignments\)/);
});

test('parent question response endpoint is scoped by parent session', () => {
  assert.match(server, /app\.post\('\/api\/parent-portal\/questions\/:id\/respond'/);
  assert.match(server, /getValidParentSession\(cookies\[PARENT_SESSION_COOKIE_NAME\]/);
  assert.match(server, /normalizeEmail\(question\.parent_email\) !== session\.parentEmail/);
  assert.match(server, /safeQuestionView\(updated, \{ audience: 'parent' \}\)/);
  assert.match(server, /bna_contact_communications/);
  assert.doesNotMatch(server, /parent_email:\s*response\.parent_email/);
});

test('student and parent portals expose weekly meeting slots, attendance, financial reminders, and Rabbi contact', () => {
  assert.match(server, /getWeeklyPrivateMeetingSlotForStudent/);
  assert.match(server, /active_internal_boys_one_per_weekday/);
  assert.match(server, /start_time: '09:00'/);
  assert.match(server, /end_time: '10:00'/);
  assert.match(server, /class_trip_percentage: Number\(torahSummary\.group\?\.groupPercentage/);
  assert.match(server, /attendanceSummaryView/);
  assert.match(server, /signupFinancialSummaryView/);
  assert.match(server, /rabbiShloimieContactView/);
  assert.match(server, /weekly_private_meeting/);
  assert.match(server, /attendance_summary/);
  assert.match(server, /financial = signupFinancialSummaryView/);
  assert.match(server, /RABBI_SHLOIMIE_WHATSAPP_NUMBER/);
  assert.match(studentHtml, /weekly_private_meeting/);
  assert.match(studentHtml, /WhatsApp Rabbi Shloimie/);
  assert.match(studentHtml, /Talk to Rabbi Shloimie/);
  assert.match(parentHtml, /Financial status/);
  assert.match(parentHtml, /Present by default/);
});

test('July 1 registration renewal flow requires four visible signatures and avoids unconfirmed payment-link fallback', () => {
  assert.match(server, /REQUIRED_SIGNUP_AGREEMENT_DEFINITIONS = \[/);
  assert.match(server, /\]\.filter\(\(definition\) => !\['registration_intake_form', 'parent_agreement_signature_page'\]\.includes\(definition\.agreement_type\)\)/);
  assert.match(signupDocumentsJs, /submitMissing: 'Please open and sign all four required registration documents before submitting\.'/);
  assert.match(signupDocumentsJs, /title: \{ en: 'Handbook'/);
  assert.match(signupDocumentsJs, /title: \{ en: 'Tuition'/);
  assert.match(signupDocumentsJs, /title: \{ en: 'Waiver'/);
  assert.match(signupDocumentsJs, /title: \{ en: 'Student Handbook'/);
  assert.match(server, /registration_renewal: Boolean\(existingSignup\)/);
  assert.match(server, /tuition_year_starts_on: '2026-07-01'/);
  assert.match(server, /yearly_amount_ils: DEFAULT_TUITION_AMOUNT \* 12/);
  assert.match(server, /payment_link_status: PAYMENT_LINK \? 'configured' : 'unconfirmed'/);
  assert.match(server, /const PAYMENT_LINK = process\.env\.PAYMENT_LINK \|\| ''/);
  assert.match(server, /buildRequiredSignupAgreementRecords/);
  assert.match(server, /requiredAgreementRecords\.length/);
  assert.match(server, /ON CONFLICT \(signup_id, agreement_type, agreement_version\) DO UPDATE SET/);
});
