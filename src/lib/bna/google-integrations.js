const { google } = require('googleapis');

const GOOGLE_CONNECTION_ROLES = Object.freeze({
  ADMIN_TEACHER: 'admin_teacher',
  STUDENT: 'student',
  PARENT: 'parent',
});

const GOOGLE_SCOPE_REGISTRY = Object.freeze({
  drive: 'https://www.googleapis.com/auth/drive',
  gmail_send: 'https://www.googleapis.com/auth/gmail.send',
  documents: 'https://www.googleapis.com/auth/documents',
  spreadsheets: 'https://www.googleapis.com/auth/spreadsheets',
  classroom_courses_readonly: 'https://www.googleapis.com/auth/classroom.courses.readonly',
  classroom_coursework_students: 'https://www.googleapis.com/auth/classroom.coursework.students',
  classroom_coursework_students_readonly: 'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  classroom_courseworkmaterials: 'https://www.googleapis.com/auth/classroom.courseworkmaterials',
  classroom_rosters_readonly: 'https://www.googleapis.com/auth/classroom.rosters.readonly',
  classroom_profile_emails: 'https://www.googleapis.com/auth/classroom.profile.emails',
  classroom_topics: 'https://www.googleapis.com/auth/classroom.topics',
  calendar: 'https://www.googleapis.com/auth/calendar',
  calendar_readonly: 'https://www.googleapis.com/auth/calendar.readonly',
  calendar_events: 'https://www.googleapis.com/auth/calendar.events',
  calendar_events_readonly: 'https://www.googleapis.com/auth/calendar.events.readonly',
  userinfo_email: 'https://www.googleapis.com/auth/userinfo.email',
});

const GOOGLE_SCOPE_FEATURES = Object.freeze({
  identity: [GOOGLE_SCOPE_REGISTRY.userinfo_email],
  drive_pipeline: [
    GOOGLE_SCOPE_REGISTRY.drive,
    GOOGLE_SCOPE_REGISTRY.documents,
    GOOGLE_SCOPE_REGISTRY.spreadsheets,
  ],
  gmail: [GOOGLE_SCOPE_REGISTRY.gmail_send],
  classroom_manage: [
    GOOGLE_SCOPE_REGISTRY.classroom_courses_readonly,
    GOOGLE_SCOPE_REGISTRY.classroom_coursework_students,
    GOOGLE_SCOPE_REGISTRY.classroom_coursework_students_readonly,
    GOOGLE_SCOPE_REGISTRY.classroom_courseworkmaterials,
    GOOGLE_SCOPE_REGISTRY.classroom_rosters_readonly,
    GOOGLE_SCOPE_REGISTRY.classroom_profile_emails,
    GOOGLE_SCOPE_REGISTRY.classroom_topics,
  ],
  classroom_read: [
    GOOGLE_SCOPE_REGISTRY.classroom_courses_readonly,
    GOOGLE_SCOPE_REGISTRY.classroom_coursework_students_readonly,
    GOOGLE_SCOPE_REGISTRY.classroom_rosters_readonly,
    GOOGLE_SCOPE_REGISTRY.classroom_profile_emails,
  ],
  calendar_read: [
    GOOGLE_SCOPE_REGISTRY.calendar_readonly,
    GOOGLE_SCOPE_REGISTRY.calendar_events_readonly,
  ],
  calendar_write: [GOOGLE_SCOPE_REGISTRY.calendar_events],
});

const GOOGLE_ROLE_DEFAULT_FEATURES = Object.freeze({
  [GOOGLE_CONNECTION_ROLES.ADMIN_TEACHER]: ['identity', 'classroom_manage', 'calendar_write'],
  [GOOGLE_CONNECTION_ROLES.STUDENT]: ['identity', 'classroom_read', 'calendar_read'],
  [GOOGLE_CONNECTION_ROLES.PARENT]: ['identity', 'calendar_write'],
});

const GOOGLE_ALLOWED_SCOPES_BY_ROLE = Object.freeze({
  [GOOGLE_CONNECTION_ROLES.ADMIN_TEACHER]: new Set(Object.values(GOOGLE_SCOPE_REGISTRY)),
  [GOOGLE_CONNECTION_ROLES.STUDENT]: new Set([
    GOOGLE_SCOPE_REGISTRY.userinfo_email,
    GOOGLE_SCOPE_REGISTRY.classroom_courses_readonly,
    GOOGLE_SCOPE_REGISTRY.classroom_coursework_students_readonly,
    GOOGLE_SCOPE_REGISTRY.classroom_rosters_readonly,
    GOOGLE_SCOPE_REGISTRY.classroom_profile_emails,
    GOOGLE_SCOPE_REGISTRY.calendar_readonly,
    GOOGLE_SCOPE_REGISTRY.calendar_events_readonly,
    GOOGLE_SCOPE_REGISTRY.calendar_events,
  ]),
  [GOOGLE_CONNECTION_ROLES.PARENT]: new Set([
    GOOGLE_SCOPE_REGISTRY.userinfo_email,
    GOOGLE_SCOPE_REGISTRY.calendar_readonly,
    GOOGLE_SCOPE_REGISTRY.calendar_events_readonly,
    GOOGLE_SCOPE_REGISTRY.calendar_events,
  ]),
});

function parseGoogleScopeList(value) {
  if (Array.isArray(value)) {
    return value.flatMap(parseGoogleScopeList);
  }
  return String(value || '')
    .split(/[\s,;]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function normalizeGoogleConnectionRole(value) {
  const text = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (['admin', 'teacher', 'admin_teacher', 'admin/teacher'].includes(text)) {
    return GOOGLE_CONNECTION_ROLES.ADMIN_TEACHER;
  }
  if (text === 'student') return GOOGLE_CONNECTION_ROLES.STUDENT;
  if (text === 'parent') return GOOGLE_CONNECTION_ROLES.PARENT;
  return GOOGLE_CONNECTION_ROLES.ADMIN_TEACHER;
}

function normalizeGoogleFeature(value) {
  const feature = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  return GOOGLE_SCOPE_FEATURES[feature] ? feature : '';
}

function googleScopesForConnection({
  role = GOOGLE_CONNECTION_ROLES.ADMIN_TEACHER,
  features = [],
  requestedScopes = [],
  configuredScopes = [],
  includeConfiguredScopes = false,
} = {}) {
  const connectionRole = normalizeGoogleConnectionRole(role);
  if (includeConfiguredScopes) {
    return [...new Set(parseGoogleScopeList(configuredScopes))];
  }
  const selectedFeatures = (Array.isArray(features) ? features : parseGoogleScopeList(features))
    .map(normalizeGoogleFeature)
    .filter(Boolean);
  const featureList = selectedFeatures.length
    ? selectedFeatures
    : GOOGLE_ROLE_DEFAULT_FEATURES[connectionRole] || GOOGLE_ROLE_DEFAULT_FEATURES.admin_teacher;
  const allowed = GOOGLE_ALLOWED_SCOPES_BY_ROLE[connectionRole] || GOOGLE_ALLOWED_SCOPES_BY_ROLE.admin_teacher;
  const scopes = [
    ...featureList.flatMap((feature) => GOOGLE_SCOPE_FEATURES[feature] || []),
    ...parseGoogleScopeList(requestedScopes),
  ].filter((scope) => allowed.has(scope));
  return [...new Set(scopes)];
}

function googleScopeStatus(configuredScopes = [], requiredScopes = []) {
  const configured = new Set(parseGoogleScopeList(configuredScopes));
  const required = parseGoogleScopeList(requiredScopes);
  const missing = required.filter((scope) => !configured.has(scope));
  return {
    configured_scopes: [...configured],
    required_scopes: required,
    missing_scopes: missing,
    ok: missing.length === 0,
  };
}

function createGoogleClassroomClient(auth) {
  return google.classroom({ version: 'v1', auth });
}

function createGoogleCalendarClient(auth) {
  return google.calendar({ version: 'v3', auth });
}

async function listClassroomCourses(auth, options = {}) {
  const classroom = createGoogleClassroomClient(auth);
  const courses = [];
  let pageToken;
  do {
    const result = await classroom.courses.list({
      teacherId: options.teacherId || 'me',
      courseStates: options.courseStates || ['ACTIVE'],
      pageSize: Math.min(Math.max(Number(options.pageSize || 100), 1), 100),
      pageToken,
    });
    courses.push(...(result.data?.courses || []));
    pageToken = result.data?.nextPageToken || '';
  } while (pageToken && courses.length < Number(options.limit || 300));
  return courses;
}

async function createClassroomCourseWork(auth, { courseId, requestBody }) {
  const classroom = createGoogleClassroomClient(auth);
  return classroom.courses.courseWork.create({ courseId, requestBody });
}

async function listCalendarEvents(auth, {
  calendarId = 'primary',
  timeMin,
  timeMax,
  maxResults = 50,
} = {}) {
  const calendar = createGoogleCalendarClient(auth);
  const result = await calendar.events.list({
    calendarId,
    singleEvents: true,
    orderBy: 'startTime',
    timeMin: timeMin || new Date().toISOString(),
    timeMax,
    maxResults: Math.min(Math.max(Number(maxResults || 50), 1), 250),
  });
  return result.data?.items || [];
}

async function insertCalendarEvent(auth, { calendarId = 'primary', requestBody, sendUpdates = 'none' }) {
  const calendar = createGoogleCalendarClient(auth);
  return calendar.events.insert({ calendarId, requestBody, sendUpdates });
}

async function updateCalendarEvent(auth, {
  calendarId = 'primary',
  eventId,
  requestBody,
  sendUpdates = 'none',
}) {
  const calendar = createGoogleCalendarClient(auth);
  return calendar.events.update({ calendarId, eventId, requestBody, sendUpdates });
}

async function deleteCalendarEvent(auth, { calendarId = 'primary', eventId, sendUpdates = 'none' }) {
  const calendar = createGoogleCalendarClient(auth);
  return calendar.events.delete({ calendarId, eventId, sendUpdates });
}

function resolveWorksheetPromptPreview({
  defaultPrompt = '',
  assignmentPatch = '',
  studentPatch = '',
  instructionPatch = '',
  context = {},
} = {}) {
  const sections = [
    ['Global/default assignment prompt', defaultPrompt],
    ['Assignment-level prompt patch', assignmentPatch],
    ['Student-level prompt patch', studentPatch],
    ['Parent/teacher instruction patch', instructionPatch],
    ['Current assignment context', Object.keys(context || {}).length ? JSON.stringify(context, null, 2) : ''],
  ]
    .map(([label, text]) => ({ label, text: String(text || '').trim() }))
    .filter((section) => section.text);
  return {
    sections,
    final_prompt: sections
      .map((section) => `${section.label}:\n${section.text}`)
      .join('\n\n'),
  };
}

const googleAuthService = {
  GOOGLE_CONNECTION_ROLES,
  GOOGLE_SCOPE_REGISTRY,
  GOOGLE_SCOPE_FEATURES,
  GOOGLE_ROLE_DEFAULT_FEATURES,
  parseGoogleScopeList,
  normalizeGoogleConnectionRole,
  googleScopesForConnection,
  googleScopeStatus,
};

const googleClassroomService = {
  createClient: createGoogleClassroomClient,
  listCourses: listClassroomCourses,
  createCourseWork: createClassroomCourseWork,
};

const googleCalendarService = {
  createClient: createGoogleCalendarClient,
  listEvents: listCalendarEvents,
  insertEvent: insertCalendarEvent,
  updateEvent: updateCalendarEvent,
  deleteEvent: deleteCalendarEvent,
};

const assignmentSchedulingService = {
  googleScopeStatus,
};

const worksheetGenerationService = {
  resolvePromptPreview: resolveWorksheetPromptPreview,
};

const videoProcessingService = {
  classroomAttachmentMode: 'attach_youtube_natively_when_possible',
  youtubeDownloadMode: 'optional_internal_processing',
  youtubeDownloader: 'yt-dlp',
  featureFlag: 'BNA_YTDLP_ENABLED',
  statusModel: ['pending', 'downloading', 'downloaded', 'failed', 'skipped'],
};

module.exports = {
  GOOGLE_CONNECTION_ROLES,
  GOOGLE_SCOPE_REGISTRY,
  GOOGLE_SCOPE_FEATURES,
  GOOGLE_ROLE_DEFAULT_FEATURES,
  googleAuthService,
  googleClassroomService,
  googleCalendarService,
  assignmentSchedulingService,
  worksheetGenerationService,
  videoProcessingService,
  parseGoogleScopeList,
  normalizeGoogleConnectionRole,
  googleScopesForConnection,
  googleScopeStatus,
};
