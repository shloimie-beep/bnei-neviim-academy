const REVIEW_ACCESS_CODE = 'TEST-ONETIME-REVIEW-ACCESS';
const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';

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

function buildOneTimeSharedReviewData({ baseUrl = 'http://localhost:3000', checkedAt = new Date().toISOString() } = {}) {
  const adminPath = '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview';
  const reviewLinks = {
    admin: joinUrl(baseUrl, adminPath),
    admin_login: joinUrl(baseUrl, `/operations-login.html?returnTo=${encodeURIComponent(adminPath)}`),
    provider: joinUrl(baseUrl, '/provider.html?review=one-time'),
    parent: joinUrl(baseUrl, '/parent.html?review=one-time'),
    student: joinUrl(baseUrl, '/student.html?review=one-time'),
    classroom: joinUrl(baseUrl, `/one-time-classroom.html?review=one-time&code=${REVIEW_ACCESS_CODE}`),
    email_preview: joinUrl(baseUrl, '/one-time-email-review.html'),
    one_time_home: joinUrl(baseUrl, '/one-time'),
  };

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
    name: 'Rabbi Elie Scheller',
    role: 'workspace_owner',
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
    state: 'ready_protected_reference',
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
    title: 'TEST One Time Mishnah Course',
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
    description: 'Manual Vimeo sample reference traced from the legacy OneTimeOneTime site for UI review. This is not an automated upload.',
    blocker: 'Automated Vimeo upload remains blocked until a user-level Vimeo authorization token and upload policy are approved.',
  };
  const worksheet = {
    id: 'TEST-OT-WORKSHEET-001',
    title: 'TEST Pesachim Perek 10 Worksheet',
    url: '/documents/parent-handbook',
    status: 'published_for_review',
  };
  const announcement = {
    id: 'TEST-OT-ANN-001',
    title: 'Welcome to the TEST One Time cohort',
    body: 'This announcement is safe test content for the review walkthrough.',
    visibility: 'parent_and_student',
  };
  const payment = {
    offer: '$67/month membership',
    trial: '30-day trial',
    status: 'test_trial_active',
    access_state: 'active_for_review',
    stripe_state: 'test/readiness only',
    no_charge: true,
  };
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

  const emailTemplates = [
    buildEmailTemplate({
      key: 'parent_invitation',
      label: 'Parent invitation',
      subject: 'You are invited to One Time Mishnah',
      preview_text: 'Set up your parent portal and review your child access.',
      body_preview: 'Welcome. Use your secure parent portal to see classes, attendance, progress, videos, worksheets, payments, and support.',
      recipient_scope: 'One selected parent',
    }),
    buildEmailTemplate({
      key: 'student_invitation',
      label: 'Student invitation',
      subject: 'Your One Time Mishnah classroom is ready',
      preview_text: 'Open your student portal for the next class and review materials.',
      body_preview: 'Your student portal includes the next class, protected Join Class readiness, lessons, worksheets, videos, achievements, and questions.',
      recipient_scope: 'One linked student',
    }),
    buildEmailTemplate({
      key: 'trial_confirmation',
      label: 'Trial confirmation',
      subject: 'Your 30-day One Time trial is active',
      preview_text: 'Your membership trial and access are ready for review.',
      body_preview: 'The trial is active in test mode. Billing is not live and no card is charged from this preview.',
      recipient_scope: 'Parent account holder',
    }),
    buildEmailTemplate({
      key: 'pre_renewal_reminder',
      label: 'Pre-renewal reminder',
      subject: 'Your One Time membership renews soon',
      preview_text: 'Review upcoming renewal and access status.',
      body_preview: 'This reminder previews renewal copy only. Live sending waits for sender/domain readiness and billing approval.',
      recipient_scope: 'Active trial or membership parent',
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
      subject: 'This week in One Time Mishnah',
      preview_text: 'Attendance minutes, progress, and review status are ready.',
      body_preview: 'TEST Student One Time attended 39 of 45 minutes and is 42% through the review course.',
      recipient_scope: 'Linked parent',
    }),
    buildEmailTemplate({
      key: 'achievement_reward_earned',
      label: 'Achievement/reward earned',
      subject: 'A new achievement was earned',
      preview_text: 'First Class achievement is ready for review.',
      body_preview: 'The achievement and reward cards are visible in the portals with a parent-safe explanation.',
      recipient_scope: 'Linked parent and student',
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
    }],
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
    bot_enabled: false,
    bna_accountability_enabled: false,
    hidden_scope_note: 'This student review payload contains only TEST-ONETIME-STUDENT-001 records.',
  };

  const adminReview = {
    rabbi,
    admin,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    modules: [
      'Parents',
      'Students',
      'Contacts/CRM',
      'Communications',
      'Live Class',
      'Attendance',
      'Course/Library/Worksheets',
      'Announcements',
      'Payments/Trial/Access',
      'Milestones/Achievements/Rewards',
      'Integrations/Readiness',
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
      name: 'OneTimeOneTime Mishnah',
      provider_label: 'Rabbi Scheller',
      logo: '/images/one-time/onetimelogo.webp',
      hero: '/images/one-time/onetime-hero-vertical.webp',
      public_review_path: '/one-time',
      source_trace: 'ops/one-time-mishnah/brand-site-review/HERO-VIDEO-TRACE.md',
    },
    identities: { rabbi, admin, parent, student },
    parent_portal: parentPortal,
    student_portal: studentPortal,
    provider_portal: {
      review_mode: true,
      provider: rabbi,
      admin,
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
      'Legacy OneTimeOneTime logo and hero image in shared review UI',
      'Parent/student/provider review scoping in TEST payloads',
    ],
    mock_test_only: [
      'TEST parent and TEST student identities',
      'Attendance minutes and course progress',
      'Payment/trial/access example',
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
