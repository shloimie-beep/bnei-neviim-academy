const { cleanString, normalizeArray, normalizeKey, stableId } = require('../core/ids');

const ONE_TIME_PROGRESS_REWARDS_REQUIREMENT_ID = 'REQ-20260619-414';
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';

function num(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(num(value))));
}

function safeText(value, fallback = '') {
  return cleanString(value, fallback);
}

function studentRef(student = {}) {
  return safeText(student.student_id || student.studentId || student.id || student.person_id || student.name || 'student');
}

function safeStudentName(student = {}, fallbackRef = '') {
  return safeText(student.display_name || student.student_name || student.name || fallbackRef || 'Student');
}

function buildOneTimeProgressRewardContract(options = {}) {
  return {
    requirement_id: ONE_TIME_PROGRESS_REWARDS_REQUIREMENT_ID,
    workspace_key: safeText(options.workspace_key || options.workspaceKey || ONE_TIME_WORKSPACE_KEY),
    project_key: safeText(options.project_key || options.projectKey || ONE_TIME_PROJECT_KEY),
    mode: 'local_seed_progress_rewards',
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    surfaces: ['student_progress', 'parent_progress', 'provider_roster', 'admin_review'],
    included_state: [
      'attendance_minutes',
      'lesson_progress',
      'milestones',
      'achievements',
      'reward_review_eligibility',
    ],
    privacy_policy: {
      parent_scope: 'linked_students_only',
      student_scope: 'own_record_only',
      provider_scope: 'workspace_students_without_private_family_notes',
      public_scope: 'aggregate_only_no_student_rows',
      public_individual_leaderboard_enabled: false,
      automatic_reward_award_enabled: false,
    },
  };
}

function buildOneTimeProgressRewardSeed(options = {}) {
  const workspaceKey = safeText(options.workspace_key || options.workspaceKey || ONE_TIME_WORKSPACE_KEY);
  const projectKey = safeText(options.project_key || options.projectKey || ONE_TIME_PROJECT_KEY);
  return {
    workspace_key: workspaceKey,
    project_key: projectKey,
    students: [
      {
        id: 'ot-student-001',
        display_name: 'Student Aleph',
        parent_ids: ['ot-parent-001'],
        private_admin_notes: 'not returned',
        guardian_email: 'private-parent-a@example.test',
      },
      {
        id: 'ot-student-002',
        display_name: 'Student Beis',
        parent_ids: ['ot-parent-002'],
        private_admin_notes: 'not returned',
        guardian_email: 'private-parent-b@example.test',
      },
    ],
    sessions: [
      { id: 'class-001', title: 'Opening Mishnah', scheduled_minutes: 45 },
      { id: 'class-002', title: 'Review And Chazarah', scheduled_minutes: 45 },
      { id: 'class-003', title: 'Perek Milestone', scheduled_minutes: 45 },
    ],
    attendance: [
      { student_id: 'ot-student-001', session_id: 'class-001', status: 'present', attended_minutes: 45 },
      { student_id: 'ot-student-001', session_id: 'class-002', status: 'present', attended_minutes: 40 },
      { student_id: 'ot-student-001', session_id: 'class-003', status: 'partial', attended_minutes: 25 },
      { student_id: 'ot-student-002', session_id: 'class-001', status: 'present', attended_minutes: 45 },
      { student_id: 'ot-student-002', session_id: 'class-002', status: 'absent', attended_minutes: 0 },
      { student_id: 'ot-student-002', session_id: 'class-003', status: 'present', attended_minutes: 45 },
    ],
    lessons: [
      { id: 'lesson-001', title: 'Mishnah 1', unit: 'Berachos', target_percent: 34 },
      { id: 'lesson-002', title: 'Mishnah 2', unit: 'Berachos', target_percent: 67 },
      { id: 'lesson-003', title: 'Mishnah 3', unit: 'Berachos', target_percent: 100 },
    ],
    lesson_progress: [
      { student_id: 'ot-student-001', lesson_id: 'lesson-001', progress_percent: 100 },
      { student_id: 'ot-student-001', lesson_id: 'lesson-002', progress_percent: 80 },
      { student_id: 'ot-student-001', lesson_id: 'lesson-003', progress_percent: 30 },
      { student_id: 'ot-student-002', lesson_id: 'lesson-001', progress_percent: 100 },
      { student_id: 'ot-student-002', lesson_id: 'lesson-002', progress_percent: 35 },
      { student_id: 'ot-student-002', lesson_id: 'lesson-003', progress_percent: 0 },
    ],
    milestones: [
      { key: 'first_class', title: 'First Class', type: 'attendance_count', threshold_value: 1 },
      { key: 'two_classes', title: 'Two Classes', type: 'attendance_count', threshold_value: 2 },
      { key: 'halfway', title: 'Halfway Through Unit', type: 'course_progress_percent', threshold_value: 50 },
      { key: 'perek_ready', title: 'Perek Ready For Review', type: 'course_progress_percent', threshold_value: 90 },
    ],
    achievements: [
      { key: 'thoughtful_question_candidate', title: 'Thoughtful Question Candidate', student_id: 'ot-student-001', status: 'review_only' },
    ],
    rewards: [
      {
        key: 'recognition_note',
        title: 'Recognition Note',
        rule_type: 'course_progress_percent',
        threshold_value: 70,
        reward_type: 'recognition',
      },
      {
        key: 'chazarah_privilege',
        title: 'Chazarah Privilege',
        rule_type: 'attendance_count',
        threshold_value: 3,
        reward_type: 'privilege',
      },
    ],
  };
}

function attendedRows(seed = {}, studentId = '') {
  return (Array.isArray(seed.attendance) ? seed.attendance : []).filter((row) => studentRef(row) === studentId);
}

function progressRows(seed = {}, studentId = '') {
  return (Array.isArray(seed.lesson_progress) ? seed.lesson_progress : []).filter((row) => studentRef(row) === studentId);
}

function attendanceSummary(seed = {}, studentId = '') {
  const sessions = Array.isArray(seed.sessions) ? seed.sessions : [];
  const sessionMinutes = new Map(sessions.map((session) => [safeText(session.id), num(session.scheduled_minutes)]));
  const rows = attendedRows(seed, studentId);
  const attendedMinutes = rows.reduce((sum, row) => sum + Math.max(0, num(row.attended_minutes)), 0);
  const scheduledMinutes = rows.reduce((sum, row) => {
    const explicit = num(row.scheduled_minutes, NaN);
    return sum + (Number.isFinite(explicit) ? explicit : num(sessionMinutes.get(safeText(row.session_id))));
  }, 0);
  const presentCount = rows.filter((row) => ['present', 'on_time', 'full_shiur'].includes(normalizeKey(row.status))).length;
  return {
    sessions_seen: rows.length,
    present_count: presentCount,
    partial_count: rows.filter((row) => normalizeKey(row.status) === 'partial').length,
    absent_count: rows.filter((row) => normalizeKey(row.status) === 'absent').length,
    attended_minutes: attendedMinutes,
    scheduled_minutes: scheduledMinutes,
    attendance_percent: scheduledMinutes ? clampPercent((attendedMinutes / scheduledMinutes) * 100) : 0,
  };
}

function courseProgressSummary(seed = {}, studentId = '') {
  const lessons = Array.isArray(seed.lessons) ? seed.lessons : [];
  const rows = progressRows(seed, studentId);
  const progressByLesson = new Map(rows.map((row) => [safeText(row.lesson_id), clampPercent(row.progress_percent)]));
  const lessonCards = lessons.map((lesson) => {
    const percent = progressByLesson.has(safeText(lesson.id)) ? progressByLesson.get(safeText(lesson.id)) : 0;
    return {
      lesson_id: safeText(lesson.id),
      title: safeText(lesson.title),
      unit: safeText(lesson.unit),
      progress_percent: percent,
      status: percent >= 100 ? 'complete' : percent > 0 ? 'in_progress' : 'not_started',
    };
  });
  const average = lessonCards.length
    ? clampPercent(lessonCards.reduce((sum, lesson) => sum + lesson.progress_percent, 0) / lessonCards.length)
    : 0;
  return {
    lessons_seen: lessonCards.length,
    lessons_complete: lessonCards.filter((lesson) => lesson.status === 'complete').length,
    progress_percent: average,
    lessons: lessonCards,
  };
}

function milestoneStatus(seed = {}, studentId = '', attendance = {}, course = {}) {
  return (Array.isArray(seed.milestones) ? seed.milestones : []).map((milestone) => {
    const type = normalizeKey(milestone.type);
    const value = type === 'attendance_count' ? num(attendance.present_count) : num(course.progress_percent);
    const threshold = num(milestone.threshold_value);
    return {
      key: normalizeKey(milestone.key || milestone.title),
      title: safeText(milestone.title),
      type,
      current_value: value,
      threshold_value: threshold,
      status: value >= threshold ? 'achieved' : 'in_progress',
      parent_visible: true,
      student_visible: true,
    };
  });
}

function achievementStatus(seed = {}, studentId = '', milestones = []) {
  const explicit = (Array.isArray(seed.achievements) ? seed.achievements : [])
    .filter((achievement) => !achievement.student_id || studentRef(achievement) === studentId)
    .map((achievement) => ({
      key: normalizeKey(achievement.key || achievement.title),
      title: safeText(achievement.title),
      status: normalizeKey(achievement.status || 'review_only'),
      parent_safe_explanation: 'Reviewed learning progress achievement.',
      public_visible: false,
    }));
  const milestoneAchievements = milestones
    .filter((milestone) => milestone.status === 'achieved')
    .map((milestone) => ({
      key: `milestone_${milestone.key}`,
      title: milestone.title,
      status: 'achieved_parent_visible',
      parent_safe_explanation: `Reached ${milestone.title}.`,
      public_visible: false,
    }));
  return [...milestoneAchievements, ...explicit];
}

function rewardReviews(seed = {}, studentId = '', attendance = {}, course = {}) {
  return (Array.isArray(seed.rewards) ? seed.rewards : []).map((reward) => {
    const ruleType = normalizeKey(reward.rule_type);
    const value = ruleType === 'attendance_count' ? num(attendance.present_count) : num(course.progress_percent);
    const threshold = num(reward.threshold_value);
    const eligible = value >= threshold;
    return {
      id: stableId('ONETIMEREWARDREVIEW', [studentId, reward.key || reward.title]),
      reward_key: normalizeKey(reward.key || reward.title),
      title: safeText(reward.title),
      reward_type: normalizeKey(reward.reward_type || 'recognition'),
      eligibility_state: eligible ? 'eligible_for_review' : 'not_yet_eligible',
      current_value: value,
      threshold_value: threshold,
      automatic_award_performed: false,
      operator_approval_required: true,
      parent_visible: eligible,
      student_visible: eligible,
    };
  });
}

function studentProgressSnapshot(seed = {}, student = {}) {
  const id = studentRef(student);
  const attendance = attendanceSummary(seed, id);
  const course = courseProgressSummary(seed, id);
  const milestones = milestoneStatus(seed, id, attendance, course);
  return {
    student_id: id,
    display_name: safeStudentName(student, id),
    attendance,
    course_progress: course,
    milestones,
    achievements: achievementStatus(seed, id, milestones),
    reward_reviews: rewardReviews(seed, id, attendance, course),
    private_admin_notes_returned: false,
    guardian_contact_returned: false,
  };
}

function safeStudentCard(student = {}) {
  return {
    student_id: student.student_id,
    display_name: student.display_name,
    attendance_percent: student.attendance.attendance_percent,
    attended_minutes: student.attendance.attended_minutes,
    course_progress_percent: student.course_progress.progress_percent,
    milestones_achieved: student.milestones.filter((milestone) => milestone.status === 'achieved').length,
    achievements_count: student.achievements.length,
    rewards_eligible_for_review: student.reward_reviews.filter((reward) => reward.eligibility_state === 'eligible_for_review').length,
  };
}

function buildOneTimeProgressRewardSnapshot(input = {}) {
  const seed = input.seed || buildOneTimeProgressRewardSeed(input);
  const students = (Array.isArray(seed.students) ? seed.students : []).map((student) => studentProgressSnapshot(seed, student));
  const groupAttendanceMinutes = students.reduce((sum, student) => sum + student.attendance.attended_minutes, 0);
  const scheduledMinutes = students.reduce((sum, student) => sum + student.attendance.scheduled_minutes, 0);
  const averageProgress = students.length
    ? clampPercent(students.reduce((sum, student) => sum + student.course_progress.progress_percent, 0) / students.length)
    : 0;
  return {
    requirement_id: ONE_TIME_PROGRESS_REWARDS_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    source: 'local_seed_or_test_data',
    workspace_key: safeText(seed.workspace_key),
    project_key: safeText(seed.project_key),
    students,
    group_summary: {
      student_count: students.length,
      attended_minutes: groupAttendanceMinutes,
      scheduled_minutes: scheduledMinutes,
      attendance_percent: scheduledMinutes ? clampPercent((groupAttendanceMinutes / scheduledMinutes) * 100) : 0,
      average_course_progress_percent: averageProgress,
      eligible_reward_reviews: students.reduce((sum, student) => sum + student.reward_reviews.filter((reward) => reward.eligibility_state === 'eligible_for_review').length, 0),
    },
    reward_policy: {
      automatic_award_performed: false,
      operator_approval_required: true,
      public_individual_leaderboard_enabled: false,
      negative_points_enabled: false,
    },
  };
}

function buildOneTimeProgressRewardViews(snapshot = buildOneTimeProgressRewardSnapshot(), options = {}) {
  const viewer = normalizeKey(options.viewer || options.role || 'provider');
  const linkedStudentIds = new Set(normalizeArray(options.linked_student_ids || options.linkedStudentIds || options.student_ids || options.studentIds).map(String));
  const ownStudentId = safeText(options.student_id || options.studentId);
  const studentRows = Array.isArray(snapshot.students) ? snapshot.students : [];
  const scopedRows = viewer === 'student'
    ? studentRows.filter((student) => student.student_id === ownStudentId)
    : viewer === 'parent'
      ? studentRows.filter((student) => linkedStudentIds.has(String(student.student_id)))
      : studentRows;
  const publicOnly = viewer === 'public';
  return {
    requirement_id: ONE_TIME_PROGRESS_REWARDS_REQUIREMENT_ID,
    viewer,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    privacy: {
      own_record_only: viewer === 'student',
      linked_students_only: viewer === 'parent',
      aggregate_only: publicOnly,
      other_student_records_returned: viewer === 'student' ? false : undefined,
      private_admin_notes_returned: false,
      guardian_contact_returned: false,
      public_individual_leaderboard_enabled: false,
    },
    group_summary: publicOnly ? {
      student_count: snapshot.group_summary.student_count,
      attendance_percent: snapshot.group_summary.attendance_percent,
      average_course_progress_percent: snapshot.group_summary.average_course_progress_percent,
    } : snapshot.group_summary,
    students: publicOnly ? [] : scopedRows.map(safeStudentCard),
  };
}

module.exports = {
  ONE_TIME_PROGRESS_REWARDS_REQUIREMENT_ID,
  buildOneTimeProgressRewardContract,
  buildOneTimeProgressRewardSeed,
  buildOneTimeProgressRewardSnapshot,
  buildOneTimeProgressRewardViews,
};
