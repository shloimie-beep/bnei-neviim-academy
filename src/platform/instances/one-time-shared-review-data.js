const REVIEW_ACCESS_CODE = 'TEST-ONETIME-REVIEW-ACCESS';
const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';
const {
  rabbiFacingDriveLinksFromMap,
} = require('../../lib/bna/one-time-drive-intake-map');
const {
  buildOneTimeTrialReferralConfiguration,
} = require('../../lib/bna/one-time-product-system');

function joinUrl(baseUrl, path) {
  const normalizedBase = String(baseUrl || '').replace(/\/+$/, '');
  const normalizedPath = String(path || '/').startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function buildEmailTemplate({
  key,
  label,
  subject,
  preview_text,
  body_preview,
  recipient_scope,
  blocked_reason = 'Resend sender/domain readiness is not confirmed in this shared review environment.',
}) {
  return {
    key,
    label,
    subject,
    preview_text,
    body_preview,
    recipient_scope,
    send_readiness: 'preview_only',
    blocked_reason,
    no_send: true,
    status_label: 'No-send preview only',
  };
}

function uniqueList(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function buildProviderBillingWorkspace() {
  const billingConfig = buildOneTimeTrialReferralConfiguration();
  const launchPolicy = billingConfig.launch_trial || {};
  const renewal = launchPolicy.renewal || {};
  const notice = billingConfig.billing_notice || {};
  const refund = billingConfig.refund_review || {};
  const gates = {
    live_charges_enabled: Boolean(launchPolicy.gates?.live_charges_enabled),
    checkout_creation_enabled: Boolean(launchPolicy.gates?.checkout_session_creation_enabled),
    notice_email_send_enabled: Boolean(notice.gates?.email_send_enabled),
    stripe_refund_create_enabled: Boolean(refund.gates?.stripe_refund_create_enabled),
    access_grant_automation_enabled: Boolean(launchPolicy.gates?.access_grant_automation_enabled),
  };
  const displayPrice = notice.copy_tokens?.display_price
    || `${renewal.display_amount || '$67.00'} / ${renewal.billing_interval || 'month'}`;

  return {
    requirement_id: 'REQ-20260713-960',
    source_requirement_ids: [
      'REQ-20260713-952',
      'REQ-20260713-953',
      'REQ-20260713-954',
      'REQ-20260713-955',
      'REQ-20260713-956',
      'REQ-20260713-957',
      'REQ-20260713-958',
    ],
    status: 'sandbox_ready_live_blocked',
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    price: {
      product_name: notice.copy_tokens?.membership_name || 'One Time Mishnayos Membership',
      display_price: displayPrice,
      amount_cents: renewal.amount_cents || 6700,
      currency: renewal.currency || 'USD',
      interval: renewal.billing_interval || 'month',
      tax_behavior: renewal.tax_behavior || 'exclusive',
      stripe_trial_enabled: false,
    },
    campaign: {
      name: 'Rosh Hashanah paid conversion',
      billing_start_at: launchPolicy.billing_start_at || null,
      timezone: launchPolicy.timezone || 'Asia/Jerusalem',
      billing_authorization_required: true,
    },
    counts: {
      customers: 0,
      subscriptions: 0,
      invoices: 0,
      payments: 0,
      refund_reviews: 0,
    },
    catalog: [
      { label: 'Product', value: notice.copy_tokens?.membership_name || 'One Time Mishnayos Membership', state: 'draft ready' },
      { label: 'Price', value: displayPrice, state: 'sandbox verified' },
      { label: 'Tax', value: renewal.tax_behavior === 'exclusive' ? 'Exclusive' : 'Policy required', state: 'account readiness gated' },
      { label: 'Stripe trial', value: 'Disabled', state: 'no trial' },
    ],
    billing: [
      { label: 'Customers', value: 'Synthetic test identities only', state: 'no real customer' },
      { label: 'Subscriptions', value: 'Create after final billing start approval', state: 'blocked live' },
      { label: 'Invoices', value: 'Monthly invoice/receipt email modeled', state: 'send disabled' },
      { label: 'Payments', value: 'Sandbox smoke passed, live charges disabled', state: 'test only' },
      { label: 'Refunds', value: refund.default_refund_policy || 'non refundable except manual exception', state: 'execution disabled' },
    ],
    automations: [
      { label: 'Pre-billing notice', value: 'Preview enabled, batch/live sends disabled', state: notice.status || 'draft send disabled' },
      { label: 'Failed payment', value: 'Access suspends immediately, no grace period', state: 'modeled' },
      { label: 'Cancellation', value: refund.cancellation_default || 'cancel at period end', state: 'modeled' },
      { label: 'Referral credit', value: 'Manual review after first paid cycle', state: billingConfig.referral_credit?.status || 'manual only' },
    ],
    settings: [
      { label: 'Provider account', value: 'Stripe sandbox smoke passed locally; live account readback still gated', state: 'live readback needed' },
      { label: 'Policies', value: 'No trial, no automatic refunds, no live sends', state: 'locked local' },
      { label: 'Permissions', value: 'Price publication is separate from campaign start and customer charging', state: 'separated' },
      { label: 'Launch packet', value: 'Final start date, sender, cohort, hosted env readback', state: 'blocked' },
    ],
    blockers: uniqueList([
      ...(billingConfig.blockers || []),
      ...(notice.blockers || []),
      ...(refund.blockers || []),
      'exact_approval_required_before_live_charges_sends_refunds_or_access_changes',
    ]),
    gates,
    external_write_performed: false,
    live_payment_performed: false,
  };
}

function buildOneTimeSharedReviewData({ baseUrl = 'http://localhost:3000', checkedAt = new Date().toISOString() } = {}) {
  const adminPath = '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview';
  const reviewLinks = {
    admin: joinUrl(baseUrl, adminPath),
    admin_login: joinUrl(baseUrl, `/operations-login.html?returnTo=${encodeURIComponent(adminPath)}`),
    provider: joinUrl(baseUrl, '/provider.html?review=one-time'),
    parent: joinUrl(baseUrl, '/parent.html?review=one-time'),
    student: joinUrl(baseUrl, '/student.html?review=one-time'),
    member: joinUrl(baseUrl, '/rabbi-member?review=one-time'),
    classroom: joinUrl(baseUrl, `/one-time-classroom.html?review=one-time&code=${REVIEW_ACCESS_CODE}`),
    email_preview: joinUrl(baseUrl, '/one-time-email-review.html'),
    one_time_home: joinUrl(baseUrl, '/one-time'),
  };
  const driveDropoffLinks = rabbiFacingDriveLinksFromMap({
    root: {
      id: '16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2',
      name: 'One Time Mishnah Class - Rabbi Elie Scheller',
      webViewLink: 'https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2',
    },
    content_media_folder: {
      id: '1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv',
      name: '04 Content and Media Intake',
      webViewLink: 'https://drive.google.com/drive/folders/1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv',
    },
    lanes: [
      {
        key: 'videoDrop',
        id: '1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t',
        webViewLink: 'https://drive.google.com/drive/folders/1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t',
        actual_name: '04.00 Upload Here - Rabbi Video Drops',
      },
      {
        key: 'sourceMaterials',
        id: '15FF6m32bEIWbXQSdTtqPw4yu_QIVvCPp',
        webViewLink: 'https://drive.google.com/drive/folders/15FF6m32bEIWbXQSdTtqPw4yu_QIVvCPp',
        actual_name: '04.05 Upload Here - Slideshows and Source Materials',
      },
    ],
  });

  const student = {
    id: 'TEST-ONETIME-STUDENT-001',
    name: 'TEST Student One Time',
    display_name: 'TEST Student One Time',
    role: 'student',
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    access_code: REVIEW_ACCESS_CODE,
  };
  const parent = {
    id: 'TEST-ONETIME-PARENT-001',
    name: 'TEST Parent One Time',
    email: 'test.parent+onetime@example.test',
    role: 'parent',
    linked_students: [student.id],
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
  };
  const rabbi = {
    id: 'TEST-ONETIME-PROVIDER-RABBI',
    name: 'Eli Scheller',
    display_name: 'Rabbi Eli Scheller',
    login_username: 'ELISHELLER',
    role: 'workspace_owner',
    access_level: 'owner',
    login_state: 'whatsapp_handoff_pending',
    password_handoff: 'Password should be handed off by approved WhatsApp flow only. No WhatsApp was sent from this review.',
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
  };
  const admin = {
    id: 'TEST-ONETIME-ADMIN-SHLOIMIE',
    name: 'Shloimie',
    role: 'workspace_admin',
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
  };

  const classSession = {
    id: 'TEST-OT-CLASS-001',
    title: 'TEST Weekly Mishnah Live Class',
    masechta: 'Pesachim',
    perek: 'Perek 10',
    mishnah_range: 'Mishnah 1-2',
    starts_at: '2026-06-25T19:30:00.000Z',
    timezone: 'Asia/Jerusalem',
    duration_minutes: 45,
    status: 'review_ready',
    capacity: 12,
    enrolled_count: 1,
  };
  const zoom = {
    state: 'Protected join class ready for review',
    label: 'Zoom readiness sample',
    join_label: 'Protected Join Class action',
    join_url_state: 'not_created_for_review',
    student_visible_note: 'The portal shows readiness and access rules. No real Zoom meeting was created for this review fixture.',
    blocker: 'A real class meeting is operator-gated to prevent duplicate live Zoom meetings.',
  };
  const attendance = {
    session_id: classSession.id,
    exact_minutes: 39,
    scheduled_minutes: 45,
    percentage: 87,
    status: 'partial_present',
    on_time_state: 'late_approved',
    source: 'TEST attendance example',
  };
  const course = {
    id: 'TEST-OT-COURSE-001',
    title: 'TEST One Time Mishnayos Course',
    progress_percent: 42,
  };
  const module = {
    id: 'TEST-OT-MODULE-001',
    title: 'Pesachim Foundations',
    lesson_count: 1,
  };
  const lesson = {
    id: 'TEST-OT-LESSON-001',
    title: 'Pesachim Perek 10 - Seder Night Review',
    status: 'in_progress',
    progress_percent: 60,
  };
  const video = {
    id: 'TEST-OT-VIDEO-001',
    title: 'Pesachim Perek 10 Review Class',
    provider: 'vimeo_manual_reference',
    media_provider: 'Vimeo manual/sample reference',
    media_url: 'https://vimeo.com/1178363755/282ea2577c',
    embed_url: 'https://player.vimeo.com/video/1178363755?h=282ea2577c',
    vimeo_video_id: '1178363755',
    thumbnail_url: 'https://i.vimeocdn.com/video/2139941749-4bdcb97014af5470fbdf1c04fb8fffd550f91fad7cbf4497e63268ca3aebbf48-d?f=webp',
    duration_seconds: 2380,
    class_date: '2026-06-18',
    package_status: 'published_for_review',
    visibility: 'member_library_review',
    description: 'Manual Vimeo sample reference traced from the legacy One Time site for UI review. This is not an automated upload.',
    blocker: 'Automated Vimeo upload remains blocked until a user-level Vimeo authorization token and upload policy are approved.',
  };
  const worksheet = {
    id: 'TEST-OT-WORKSHEET-001',
    title: 'TEST Pesachim Perek 10 Worksheet',
    url: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS#worksheets',
    status: 'published_for_review',
  };
  const announcement = {
    id: 'TEST-OT-ANN-001',
    title: 'Welcome to the TEST One Time cohort',
    body: 'This announcement is safe test content for the review walkthrough.',
    visibility: 'parent_and_student',
  };
  const payment = {
    offer: '$67 USD/month',
    trial: 'No Stripe trial',
    status: 'promotional_access_until_approved_billing_start',
    access_state: 'promotional_access_review',
    stripe_state: 'test/readiness only',
    no_charge: true,
  };
  const billingWorkspace = buildProviderBillingWorkspace();
  const milestone = {
    id: 'TEST-OT-MILESTONE-001',
    title: 'First Mishnah Review Completed',
    status: 'earned_for_review',
  };
  const achievement = {
    id: 'TEST-OT-ACHIEVEMENT-001',
    title: 'First Class',
    status: 'earned_for_review',
    parent_safe_explanation: 'Attended the first TEST One Time class review session.',
  };
  const reward = {
    id: 'TEST-OT-REWARD-001',
    title: 'Individual Review Reward',
    status: 'ready_for_rabbi_review',
    lifecycle: ['earned', 'review_pending', 'approved_for_review'],
  };
  const privateQuestion = {
    id: 'TEST-OT-Q-001',
    title: 'Private question about the Mishnah',
    body: 'Can Rabbi explain why this time is used for Shema?',
    visibility: 'student_private',
    status: 'submitted_for_rabbi_review',
  };
  const supportTicket = {
    id: 'TEST-OT-SUP-001',
    title: 'Worksheet link question',
    status: 'open_for_review',
    latest_activity: 'TEST parent asked where the worksheet is located.',
  };
  const workspaceUsers = [
    {
      id: rabbi.id,
      name: rabbi.display_name,
      role: 'Workspace owner',
      login_username: rabbi.login_username,
      access_level: 'Owner of One Time workspace only',
      modules: ['Dashboard', 'CRM', 'Content', 'Automations', 'Payments', 'Settings'],
      status: 'Login username mapped; password WhatsApp handoff pending',
    },
    {
      id: admin.id,
      name: admin.name,
      role: 'Workspace admin / build support',
      login_username: 'platform scoped admin',
      access_level: 'Can support this workspace from super-admin tools',
      modules: ['Build', 'QA', 'Support', 'Settings review'],
      status: 'Platform support, not shown as Rabbi login',
    },
    {
      id: parent.id,
      name: parent.name,
      role: 'Parent',
      login_username: parent.email,
      access_level: 'Parent portal, one linked TEST student',
      modules: ['Parent dashboard', 'Payments', 'Support'],
      status: 'TEST-only preview identity',
    },
    {
      id: student.id,
      name: student.display_name,
      role: 'Student',
      login_username: student.access_code,
      access_level: 'Student/classroom portal only',
      modules: ['Live class', 'Library', 'Worksheets', 'Progress'],
      status: 'TEST-only preview identity; no bot / no BNA goals',
    },
  ];

  const loginAccess = {
    owner_display_name: rabbi.display_name,
    owner_login_username: rabbi.login_username,
    password_state: 'whatsapp_handoff_pending',
    no_password_included: true,
    whatsapp_send_state: 'not_sent_from_review',
    handoff_note: 'Prepare an approved WhatsApp message with the credential handoff after the exact recipient and body are confirmed.',
    surfaces: [
      { label: 'Provider workspace login', url: reviewLinks.provider, scope: 'Rabbi Eli Scheller scoped provider workspace' },
      { label: 'Scoped Operations login', url: reviewLinks.admin_login, scope: 'One Time Operations workspace after admin approval' },
      { label: 'Parent view', url: reviewLinks.parent, scope: 'View the TEST parent experience' },
      { label: 'Student view', url: reviewLinks.student, scope: 'View the TEST student experience' },
      { label: 'Member view', url: reviewLinks.member, scope: 'View the TEST member experience' },
      { label: 'Classroom/member library', url: reviewLinks.classroom, scope: 'View member classroom and video library' },
    ],
  };

  const crmWorkspace = {
    pipelines: [
      { title: 'New lead / homepage signup', body: 'Capture name, email, region, source, tier interest, and notes from the landing funnel.', status: 'mapped' },
      { title: 'Promotional member onboarding', body: 'Track promotional access, parent/student setup, first class, and payment readiness.', status: 'mapped' },
      { title: 'Parent/student accounts', body: 'Keep parents, students, access state, attendance, support, and member-library visibility together.', status: 'mapped' },
      { title: 'Support and private questions', body: 'Route worksheet issues, private Mishnah questions, and Rabbi replies without public chat.', status: 'mapped' },
    ],
    contact_types: ['Lead', 'Parent', 'Student', 'Member', 'Support requester', 'Referral'],
    current_records: {
      leads: 1,
      parents: 1,
      students: 1,
      support_items: 2,
    },
  };

  const contentWorkspace = {
    sections: [
      { title: 'Public landing page', body: 'Mission funnel, Vimeo hero, proof strip, FAQ, and membership signup CTA.', status: 'implemented review' },
      { title: 'Live class setup', body: `${classSession.title}: ${classSession.masechta} ${classSession.perek} ${classSession.mishnah_range}.`, status: classSession.status },
      { title: 'Video library', body: `${video.title} is embedded in the member classroom from the manual Vimeo reference.`, status: video.package_status },
      { title: 'Worksheets/source sheets', body: worksheet.title, status: worksheet.status },
      { title: 'Questions and replies', body: 'Student replies stay private until Rabbi/admin chooses what becomes visible.', status: privateQuestion.status },
      { title: 'Approved assets', body: 'Uses committed One Time logo, portrait, teaching stills, social image, and approved review marks only.', status: 'rights-safe review set' },
    ],
  };

  const automationCenter = {
    groups: [
      {
        title: 'Enrollment funnel',
        items: ['Signup intake', 'region/tier tagging', 'promotional access confirmation preview', 'parent/student account setup'],
        status: 'mapped / no external writes',
      },
      {
        title: 'Class operations',
        items: ['Class reminder preview', 'Zoom readiness gate', 'attendance summary', 'recording posted preview'],
        status: 'mapped / meeting creation gated',
      },
      {
        title: 'Content publishing',
        items: ['Vimeo/manual reference', 'member library card', 'worksheet/resource notice', 'question moderation'],
        status: 'mapped / upload gated',
      },
      {
        title: 'Payments and access',
        items: ['promotional access', 'pre-billing reminder', 'receipt preview', 'payment issue preview', 'access state'],
        status: 'mapped / no charge',
      },
      {
        title: 'Retention and support',
        items: ['Parent progress update', 'support ticket created/reply preview', 'referral/testimonial consent gate'],
        status: 'mapped / no-send preview',
      },
      {
        title: 'Credential handoff',
        items: ['Owner username ELISHELLER', 'WhatsApp password handoff draft', 'recipient/body approval required'],
        status: 'blocked until approved send',
      },
    ],
    guardrails: [
      'No WhatsApp, email, SMS, or portal message is sent from review mode.',
      'No checkout, charge, access grant, Zoom creation, Vimeo upload, or external CRM write is performed.',
      'Automations stay scoped to rabbi_sheller_provider / one_time_mishnah_class.',
    ],
  };

  const settingsCenter = {
    workspace: {
      label: 'One Time Mishnah Class',
      workspace_key: WORKSPACE_KEY,
      project_key: PROJECT_KEY,
      owner_login_username: rabbi.login_username,
      owner_display_name: rabbi.display_name,
      super_admin_cross_account_access: false,
    },
    settings: [
      { title: 'Brand colors', body: 'Black, charcoal/navy, teal/cyan, lemon-yellow, cream, and white.', status: 'applied to review UI' },
      { title: 'Workspace users', body: 'Owner, platform support admin, TEST parent, and TEST student are visible in this review.', status: 'mapped' },
      { title: 'Navigation model', body: 'Sidebar/hamburger workspace navigation with parent, student, classroom, and email-preview links.', status: 'implemented review' },
      { title: 'Login surfaces', body: 'Provider login and scoped Operations login are mapped; password handoff waits for approved WhatsApp.', status: 'mapped / handoff pending' },
      { title: 'Notification policy', body: 'Email and WhatsApp remain preview-only until sender, recipient, body, and launch policy are approved.', status: 'blocked for live send' },
      { title: 'Payment policy', body: 'Stripe/checkout remain readiness-only until live account, prices, tax/refund policy, and approval are complete.', status: 'blocked for live charge' },
    ],
  };

  const studentPortalBoundary = {
    one_time_student_portal: [
      'Live Mishnayos class',
      'Member video library',
      'Worksheets/source sheets',
      'Attendance/progress for this program',
      'Private Rabbi questions',
      'Badges, achievements, and rewards for One Time only',
    ],
    excluded_school_portal_features: [
      'BNA school accountability goals',
      'School goal checkoffs',
      'Parent-assigned consequences',
      'Device/accountability controls',
      'BNA school bot/assistant goals',
      'Other students or school household records',
    ],
    display_rule: 'One Time review mode must say No bot / no BNA goals and must not render school accountability widgets.',
  };

  const badgeSystem = {
    title: 'One Time Badge System',
    award_surface: 'Rabbi workspace / Badges and Rewards',
    student_visible_scope: 'One Time student portal only',
    badges: [
      { title: 'First Class', body: 'Awarded when the student attends the first One Time class.', status: 'earned_for_review' },
      { title: 'Thoughtful Question', body: 'Rabbi can award after a private question is reviewed.', status: 'rabbi_awardable' },
      { title: 'Worksheet Complete', body: 'Can be awarded after source sheet or worksheet completion.', status: 'automation_ready_preview' },
      { title: 'Mishnah Review Streak', body: 'Can be awarded from attendance/review streak automation.', status: 'automation_ready_preview' },
      { title: 'Clear Explanation', body: 'Rabbi can award for a strong answer or explanation.', status: 'rabbi_awardable' },
    ],
    automations: [
      'Award First Class after first attended class',
      'Suggest Thoughtful Question badge after Rabbi reviews a private question',
      'Suggest Worksheet Complete after a worksheet submission is approved',
      'Suggest Mishnah Review Streak from attendance/review cadence',
      'Notify parent/student with no-send preview until email/WhatsApp approval',
    ],
    guardrail: 'Badges do not write to BNA school accountability goals or school reward ledgers.',
  };

  const emailTemplates = [
    buildEmailTemplate({
      key: 'parent_invitation',
      label: 'Parent invitation',
      subject: 'You are invited to One Time Mishnayos',
      preview_text: 'Set up your parent portal and review your child access.',
      body_preview: 'Welcome. Use your secure parent portal to see classes, attendance, progress, videos, worksheets, payments, and support.',
      recipient_scope: 'One selected parent',
    }),
    buildEmailTemplate({
      key: 'student_invitation',
      label: 'Student invitation',
      subject: 'Your One Time Mishnayos classroom is ready',
      preview_text: 'Open your student portal for the next class and review materials.',
      body_preview: 'Your student portal includes the next class, protected Join Class readiness, lessons, worksheets, videos, achievements, and questions.',
      recipient_scope: 'One linked student',
    }),
    buildEmailTemplate({
      key: 'parent_verification',
      label: 'Parent verification',
      subject: 'Verify your One Time parent email',
      preview_text: 'Confirm your email before receiving One Time account updates.',
      body_preview: 'Use the secure verification button to confirm your parent account. This preview does not send a live verification email.',
      recipient_scope: 'One selected parent',
    }),
    buildEmailTemplate({
      key: 'student_verification',
      label: 'Student verification',
      subject: 'Confirm your One Time student access',
      preview_text: 'Your student review access is ready to verify.',
      body_preview: 'The student verification flow is shown for review only and does not activate a real login credential.',
      recipient_scope: 'One linked student',
    }),
    buildEmailTemplate({
      key: 'password_recovery',
      label: 'Password recovery',
      subject: 'Reset your One Time access',
      preview_text: 'Recover access to the One Time portal.',
      body_preview: 'A secure reset link would appear here after sender/domain readiness and reset policy are approved.',
      recipient_scope: 'Parent or student account holder',
    }),
    buildEmailTemplate({
      key: 'promotional_access_confirmation',
      label: 'Promotional access confirmation',
      subject: 'Your One Time access is ready',
      preview_text: 'Your membership access is ready for review.',
      body_preview: 'Promotional access is active in test mode. Billing is not live and no card is charged from this preview.',
      recipient_scope: 'Parent account holder',
    }),
    buildEmailTemplate({
      key: 'pre_renewal_reminder',
      label: 'Pre-renewal reminder',
      subject: 'Your One Time membership renews soon',
      preview_text: 'Review upcoming renewal and access status.',
      body_preview: 'This reminder previews renewal copy only. Live sending waits for sender/domain readiness and billing approval.',
      recipient_scope: 'Promotional access or membership parent',
    }),
    buildEmailTemplate({
      key: 'class_reminder',
      label: 'Class reminder',
      subject: 'Reminder: Mishnah class is coming up',
      preview_text: 'Your next live class and join readiness are listed in the portal.',
      body_preview: 'The protected Join Class action appears in the portal. This preview does not create or send a real Zoom meeting link.',
      recipient_scope: 'Enrolled parent and student',
    }),
    buildEmailTemplate({
      key: 'zoom_readiness_reminder',
      label: 'Zoom readiness reminder',
      subject: 'Your protected Join Class button is ready for review',
      preview_text: 'Check class time and join readiness in the portal.',
      body_preview: 'This template previews reminder language only. No Zoom meeting is created and no join URL is emailed from review mode.',
      recipient_scope: 'Live Membership parent and student',
    }),
    buildEmailTemplate({
      key: 'class_recording_available',
      label: 'Class recording available',
      subject: 'Your latest One Time class recording is ready',
      preview_text: 'Review the new recording in the member library.',
      body_preview: 'The recording notice points members back to the protected library. Automated upload and live send remain gated.',
      recipient_scope: 'Members with library access',
    }),
    buildEmailTemplate({
      key: 'new_video_library_item',
      label: 'New video/library item',
      subject: 'New Mishnah review video is available',
      preview_text: 'Continue watching the latest class review in the member library.',
      body_preview: 'A manual Vimeo reference is visible for review. Automated upload and publishing remain gated.',
      recipient_scope: 'Members with library access',
    }),
    buildEmailTemplate({
      key: 'worksheet_resource',
      label: 'Worksheet/resource',
      subject: 'New worksheet for Pesachim Perek 10',
      preview_text: 'Open the new worksheet/resource from your portal.',
      body_preview: 'The worksheet card appears in the student and parent review portals with a safe sample resource link.',
      recipient_scope: 'Enrolled parent and student',
    }),
    buildEmailTemplate({
      key: 'attendance_progress_summary',
      label: 'Attendance/progress summary',
      subject: 'This week in One Time Mishnayos',
      preview_text: 'Attendance minutes, progress, and review status are ready.',
      body_preview: 'TEST Student One Time attended 39 of 45 minutes and is 42% through the review course.',
      recipient_scope: 'Linked parent',
    }),
    buildEmailTemplate({
      key: 'milestone_notice',
      label: 'Milestone notice',
      subject: 'A One Time milestone was reached',
      preview_text: 'First Mishnah Review Completed is ready for review.',
      body_preview: 'The milestone appears in the parent and student portals with TEST-only progress data.',
      recipient_scope: 'Linked parent and student',
    }),
    buildEmailTemplate({
      key: 'achievement_earned',
      label: 'Achievement earned',
      subject: 'A new achievement was earned',
      preview_text: 'First Class achievement is ready for review.',
      body_preview: 'The achievement card is visible in the portals with a parent-safe explanation.',
      recipient_scope: 'Linked parent and student',
    }),
    buildEmailTemplate({
      key: 'reward_ready',
      label: 'Reward ready',
      subject: 'A One Time reward is ready for review',
      preview_text: 'Individual Review Reward is waiting for Rabbi review.',
      body_preview: 'The reward card previews lifecycle state only and does not ship a prize or message anyone.',
      recipient_scope: 'Linked parent and student',
    }),
    buildEmailTemplate({
      key: 'payment_receipt_preview',
      label: 'Payment receipt',
      subject: 'One Time payment receipt preview',
      preview_text: 'Receipt language for a future approved payment.',
      body_preview: 'This receipt preview is not connected to a live charge, invoice, card, Stripe checkout, or Green Invoice checkout.',
      recipient_scope: 'Parent account holder',
    }),
    buildEmailTemplate({
      key: 'payment_issue_preview',
      label: 'Payment issue',
      subject: 'Action may be needed on your One Time payment',
      preview_text: 'Payment issue language for a future approved billing workflow.',
      body_preview: 'This preview does not retry a card, revoke access, or trigger dunning. Billing policy remains approval-gated.',
      recipient_scope: 'Parent account holder',
    }),
    buildEmailTemplate({
      key: 'cancellation_request_received',
      label: 'Cancellation request',
      subject: 'We received your One Time cancellation request',
      preview_text: 'Your request is waiting for review.',
      body_preview: 'Cancellation copy is shown for review only. It does not cancel billing, remove access, or update an external provider.',
      recipient_scope: 'Parent account holder',
    }),
    buildEmailTemplate({
      key: 'support_ticket_created',
      label: 'Support ticket created',
      subject: 'We received your One Time support request',
      preview_text: 'Your support ticket is open.',
      body_preview: 'Your worksheet link question was received and is listed in the support/private questions review surface.',
      recipient_scope: 'Ticket requester',
    }),
    buildEmailTemplate({
      key: 'support_reply',
      label: 'Support reply',
      subject: 'Reply to your One Time support request',
      preview_text: 'There is an update on your support ticket.',
      body_preview: 'This preview shows the reply format only. Live email sending is disabled until sender/domain readiness is complete.',
      recipient_scope: 'Ticket requester',
    }),
  ];

  const classroom = {
    access: {
      member_label: student.display_name,
      tier: 'test_review_member',
      student_id: student.id,
      workspace_key: WORKSPACE_KEY,
      project_key: PROJECT_KEY,
    },
    today_video: {
      ...video,
      member_library_item: {
        media_url: video.media_url,
        embed_url: video.embed_url,
        thumbnail_url: video.thumbnail_url,
      },
      summary: video.description,
    },
    calendar_items: [{
      id: 'TEST-OT-CALENDAR-001',
      title: classSession.title,
      assignment_title: classSession.title,
      display_label: `${classSession.masechta} ${classSession.perek} ${classSession.mishnah_range}`,
      start_at: classSession.starts_at,
      source: 'TEST review schedule',
    }],
    curriculum: [{
      id: 1,
      title: module.title,
      description: 'Review-ready module with one lesson, one video, and one worksheet.',
    }],
    classes: [{
      id: 1,
      curriculum_unit_id: 1,
      title: lesson.title,
      description: video.description,
      class_date: video.class_date,
      package_status: video.package_status,
    }],
    participation_summary: [{
      actor_label: student.display_name,
      approved_questions: 1,
      approved_responses: 0,
      rabbi_featured: 0,
      assignment_participation: 1,
      public_rank: 1,
      public_points: 7,
      reward_labels: ['Published Question', 'Review Participant'],
    }],
    leaderboard: [{
      public_rank: 1,
      actor_label: student.display_name,
      public_points: 7,
      approved_questions: 1,
      approved_responses: 0,
      rabbi_featured: 0,
      assignment_participation: 1,
      reward_labels: ['Published Question', 'Review Participant'],
    }],
    reward_policy: {
      title: 'Approved classroom rewards',
      member_visible: true,
      positive_only: true,
    },
    top_questions: [{
      thread_title: privateQuestion.title,
      body_preview: privateQuestion.body,
      author_label: student.display_name,
    }],
    threads: [{
      id: 1001,
      title: announcement.title,
      thread_type: 'announcement',
      messages: [{
        id: 1002,
        author_name: rabbi.name,
        body: announcement.body,
      }],
    }],
  };

  const parentPortal = {
    review_mode: true,
    parent,
    student,
    class_session: classSession,
    zoom,
    attendance,
    course,
    module,
    lesson,
    video,
    worksheet,
    announcement,
    payment,
    milestone,
    achievement,
    reward,
    private_question: privateQuestion,
    support_ticket: supportTicket,
    linked_students_visible: [student],
    hidden_scope_note: 'Only TEST-ONETIME-STUDENT-001 is included in this parent review payload.',
  };

  const studentPortal = {
    review_mode: true,
    student,
    portal_scope: studentPortalBoundary,
    class_session: classSession,
    zoom,
    attendance,
    course,
    module,
    lesson,
    video,
    worksheet,
    announcement,
    payment,
    milestone,
    achievement,
    badge_system: badgeSystem,
    reward,
    private_question: privateQuestion,
    support_ticket: supportTicket,
    bot_enabled: false,
    bna_accountability_enabled: false,
    hidden_scope_note: 'This student review payload contains only TEST-ONETIME-STUDENT-001 records.',
  };

  const memberPortal = {
    review_mode: true,
    preview_mode: true,
    member: {
      id: 'TEST-ONETIME-MEMBER-001',
      display_name: 'TEST One Time Member',
      email: 'test.member+onetime@example.test',
      has_library_access: true,
      access_scopes: ['library', 'live'],
      workspace_key: WORKSPACE_KEY,
      project_key: PROJECT_KEY,
    },
    library: [{
      id: 'TEST-OT-LIB-001',
      title: video.title,
      description: video.description,
      item_type: 'video',
      media_url: video.media_url,
      required_scope: 'library',
      visibility: 'review_only',
      external_write_performed: false,
    }],
    live_sessions: [{
      id: classSession.id,
      title: classSession.title,
      start_at: classSession.starts_at,
      class_link: {
        available: false,
        status: 'review_mode_disabled',
        blocker: 'Protected Join Class is disabled in member preview mode. No Zoom meeting or host URL is exposed.',
      },
      external_write_performed: false,
    }],
    questions: [{
      question_number: 'OT-Q-000001',
      title: privateQuestion.title,
      topic: privateQuestion.title,
      question_preview: privateQuestion.body,
      review_status: 'submitted_for_review',
      staff_reply_available: false,
      source_context_returned: false,
      internal_notes_returned: false,
    }],
    support_tickets: [{
      ticket_number: 'OT-SUP-000001',
      title: supportTicket.title,
      description: supportTicket.latest_activity,
      status: supportTicket.status,
      category: 'link',
      staff_replies: [],
      source_context_returned: false,
      internal_notes_returned: false,
    }],
    write_policy: {
      no_send: true,
      no_question_write: true,
      no_support_ticket_write: true,
      no_payment_or_access_grant: true,
      external_write_performed: false,
    },
    hidden_scope_note: 'This member review payload contains only TEST-ONETIME-MEMBER-001 records and does not open a real member session.',
  };

  const adminReview = {
    rabbi,
    admin,
    workspace_users: workspaceUsers,
    login_access: loginAccess,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    modules: [
      'Workspace dashboard',
      'Users and roles',
      'Parents',
      'Students',
      'Contacts/CRM',
      'Content',
      'Automations',
      'Communications',
      'Live Class',
      'Attendance',
      'Course/Library/Worksheets',
      'Announcements',
      'Payments/Trial/Access',
      'Milestones/Achievements/Rewards',
      'Integrations/Readiness',
      'Settings',
      'Support/Private Questions',
    ],
    counts: {
      parents: 1,
      students: 1,
      classes: 1,
      attendance_examples: 1,
      videos: 1,
      worksheets: 1,
      announcements: 1,
      email_previews: emailTemplates.length,
      support_items: 2,
    },
  };

  return {
    schema_version: 'one-time-shared-review-v1',
    generated_at: checkedAt,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    access_code: REVIEW_ACCESS_CODE,
    links: reviewLinks,
    brand: {
      name: 'One Time Mishnayos',
      provider_label: 'Rabbi Scheller',
      logo: '/images/one-time/brand/onetimelogo.webp',
      hero: '/images/one-time/brand/onetime-hero-vertical.webp',
      site_config: 'config/service-provider-sites/one-time.json',
      public_review_path: '/one-time',
      source_trace: 'ops/one-time-mishnah/brand-site-review/HERO-VIDEO-TRACE.md',
    },
    identities: { rabbi, admin, parent, student },
    parent_portal: parentPortal,
    student_portal: studentPortal,
    member_portal: memberPortal,
    provider_portal: {
      review_mode: true,
      provider: rabbi,
      admin,
      workspace_users: workspaceUsers,
      login_access: loginAccess,
      crm_workspace: crmWorkspace,
      content_workspace: contentWorkspace,
      drive_dropoff_links: driveDropoffLinks,
      automation_center: automationCenter,
      settings_center: settingsCenter,
      student_portal_boundary: studentPortalBoundary,
      badge_system: badgeSystem,
      parent,
      student,
      class_session: classSession,
      zoom,
      attendance,
      course,
      module,
      lesson,
      video,
      worksheet,
      announcement,
      payment,
      billing_workspace: billingWorkspace,
      milestone,
      achievement,
      reward,
      private_question: privateQuestion,
      support_ticket: supportTicket,
      email_templates: emailTemplates,
      admin_review: adminReview,
    },
    classroom,
    email_templates: emailTemplates,
    real: [
      'Shared app routes and static UI',
      'One Time route/module structure',
      'Read-only review endpoints',
      'Preview-only email template surfaces',
      'Manual Vimeo reference workflow state using legacy Vimeo ID 1178363755',
      'Legacy One Time logo and hero image in shared review UI',
      'Parent/student/provider review scoping in TEST payloads',
    ],
    mock_test_only: [
      'TEST parent and TEST student identities',
      'Attendance minutes and course progress',
      'Billing/access example',
      'Milestone, achievement, and reward lifecycle',
      'Private question and support ticket examples',
      'Manual Vimeo sample reference and legacy site branding assets',
    ],
    external_blockers: [
      'Live email sending waits for Resend sender/domain readiness and approved send policy.',
      'Real billing/checkout waits for Stripe live-mode decision and operator approval.',
      'Real Zoom class creation remains operator-gated to prevent duplicate meetings.',
      'Automated Vimeo upload waits for user-level Vimeo authorization and upload policy.',
      'Separate Railway One Time infrastructure and DNS are intentionally paused.',
      'Hosted transcription remains blocked until a valid credential replaces the 401 credential.',
    ],
    review_order: [
      'Admin/Rabbi Operations workspace',
      'Provider portal review mode',
      'Parent portal review mode',
      'Student portal review mode',
      'Classroom/library review mode',
      'Email template preview page',
      'Record UI/workflow corrections with the NEXT-RAMBLE-TEMPLATE',
    ],
  };
}

module.exports = {
  REVIEW_ACCESS_CODE,
  buildOneTimeSharedReviewData,
};
