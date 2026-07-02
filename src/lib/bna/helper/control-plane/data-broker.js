'use strict';

const { redactValue } = require('../redaction');
const { addDataRef, addDenial, makeId } = require('./evidence');
const { recordDataAccess, recordDenial } = require('./audit-ledger');

function scopeType(context = {}) {
  return context.effectiveScope?.type || 'none';
}

function linkedChildIds(context = {}) {
  const scope = context.effectiveScope || {};
  return (scope.linkedChildIds || scope.linked_child_ids || []).map((id) => String(id));
}

function denyData(reasonCode, message) {
  const error = new Error(message);
  error.code = reasonCode;
  error.safe = true;
  return error;
}

function assertParentLinkedChild(context = {}, childId = '') {
  if (scopeType(context) !== 'parent') {
    throw denyData('wrong_scope', 'Parent-linked child data requires parent scope.');
  }
  const allowed = linkedChildIds(context);
  if (!allowed.includes(String(childId))) {
    throw denyData('not_linked_child', 'Parent may only access linked children.');
  }
}

function assertStudentOwn(context = {}, studentId = '') {
  if (scopeType(context) !== 'student') {
    throw denyData('wrong_scope', 'Student data requires student scope.');
  }
  const own = context.effectiveScope?.studentId || context.effectiveScope?.student_id || '';
  if (String(own) !== String(studentId)) {
    throw denyData('student_scope_mismatch', 'Student may only access own student-safe data.');
  }
}

function assertProviderScope(context = {}, workspaceKey = '', projectKey = '') {
  const scope = context.effectiveScope || {};
  if (!['project', 'provider'].includes(scope.type)) {
    throw denyData('wrong_scope', 'Provider data requires provider workspace scope.');
  }
  const scopedWorkspace = scope.workspaceKey || scope.workspace_key || '';
  const scopedProject = scope.projectKey || scope.project_key || '';
  if (workspaceKey && scopedWorkspace && String(workspaceKey) !== String(scopedWorkspace)) {
    throw denyData('workspace_scope_mismatch', 'Provider may only access its own workspace.');
  }
  if (projectKey && scopedProject && String(projectKey) !== String(scopedProject)) {
    throw denyData('project_scope_mismatch', 'Provider may only access its own project.');
  }
}

function assertOneTimeClassroomScope(context = {}, classroomId = '') {
  const scope = context.effectiveScope || {};
  if (scope.type !== 'classroom') {
    throw denyData('wrong_scope', 'One Time classroom data requires classroom scope.');
  }
  const scopedClassroomId = scope.classroomId || scope.classroom_id || '';
  if (classroomId && scopedClassroomId && String(classroomId) !== String(scopedClassroomId)) {
    throw denyData('classroom_scope_mismatch', 'Classroom member may only access assigned classroom data.');
  }
}

function maskStudentSafe(row = {}) {
  const blocked = new Set([
    'parent_email',
    'parent_phone',
    'parent_name',
    'billing',
    'payment',
    'internal_notes',
    'staff_notes',
    'source_context',
    'access_code',
    'password_hash',
    'password',
    'secret',
    'token',
    'api_key',
  ]);
  return Object.fromEntries(
    Object.entries(row || {}).filter(([key]) => !blocked.has(String(key).toLowerCase()))
  );
}

async function readScopedData(query = {}, context = {}, options = {}) {
  const db = options.db || null;
  const evidence = options.evidence || null;
  const kind = String(query.kind || '').trim();
  try {
    if (!db || typeof db.query !== 'function') {
      const ref = {
        data_ref_id: makeId('helper_data_ref'),
        kind,
        status: 'unavailable',
        row_count: 0,
        redaction_applied: true,
        reason: 'db_not_available',
        rows: [],
      };
      if (evidence) addDataRef(evidence, ref);
      await recordDataAccess(db, context, { data_ref_id: ref.data_ref_id, query_kind: kind, row_count: 0 });
      return ref;
    }

    let rows = [];
    if (kind === 'parent.linkedChild') {
      assertParentLinkedChild(context, query.child_id || query.childId);
      const result = await db.query(
        `SELECT id, name, name_en, grade, status, updated_at
         FROM bna_students
         WHERE id = $1
         LIMIT 1`,
        [query.child_id || query.childId]
      );
      rows = result.rows.map(maskStudentSafe);
    } else if (kind === 'parent.linkedChildren') {
      if (scopeType(context) !== 'parent') throw denyData('wrong_scope', 'Linked children require parent scope.');
      const ids = linkedChildIds(context);
      if (!ids.length) rows = [];
      else {
        const result = await db.query(
          `SELECT id, name, name_en, grade, status, updated_at
           FROM bna_students
           WHERE id = ANY($1::int[])
           ORDER BY name`,
          [ids.map(Number).filter(Number.isFinite)]
        );
        rows = result.rows.map(maskStudentSafe);
      }
    } else if (kind === 'student.ownDashboard') {
      assertStudentOwn(context, query.student_id || query.studentId || context.effectiveScope?.studentId || context.effectiveScope?.student_id);
      const result = await db.query(
        `SELECT id, name, name_en, grade, status, updated_at
         FROM bna_students
         WHERE id = $1
         LIMIT 1`,
        [query.student_id || query.studentId || context.effectiveScope?.studentId || context.effectiveScope?.student_id]
      );
      rows = result.rows.map(maskStudentSafe);
    } else if (kind === 'provider.workspaceTasks') {
      const scope = context.effectiveScope || {};
      assertProviderScope(context, query.workspace_key || scope.workspaceKey || scope.workspace_key, query.project_key || scope.projectKey || scope.project_key);
      const projectKey = query.project_key || scope.projectKey || scope.project_key;
      const result = await db.query(
        `SELECT id, title, display_title, summary, stage, task_kind, assigned_to, updated_at
         FROM bna_tasks
         WHERE COALESCE(project_key, '') = $1
         ORDER BY updated_at DESC NULLS LAST, id DESC
         LIMIT $2`,
        [projectKey, Math.max(1, Math.min(Number(query.limit || 25), 100))]
      );
      rows = result.rows;
    } else if (kind === 'oneTime.classroomSummary') {
      assertOneTimeClassroomScope(context, query.classroom_id || query.classroomId || context.effectiveScope?.classroomId || context.effectiveScope?.classroom_id);
      rows = [{
        classroom_id: query.classroom_id || query.classroomId || context.effectiveScope?.classroomId || context.effectiveScope?.classroom_id,
        workspace_key: context.effectiveScope?.workspaceKey || context.effectiveScope?.workspace_key,
        project_key: context.effectiveScope?.projectKey || context.effectiveScope?.project_key,
        note: 'Classroom summary uses scoped classroom context only. Add table-specific adapter if needed.',
      }];
    } else {
      throw denyData('unsupported_data_query', `Unsupported scoped data query: ${kind || 'unknown'}.`);
    }

    const ref = {
      data_ref_id: makeId('helper_data_ref'),
      kind,
      status: 'resolved',
      row_count: rows.length,
      redaction_applied: true,
      rows: redactValue(rows),
    };
    if (evidence) addDataRef(evidence, ref);
    await recordDataAccess(db, context, { data_ref_id: ref.data_ref_id, query_kind: kind, row_count: rows.length });
    return ref;
  } catch (error) {
    const denial = {
      kind: 'unsafe_data_request',
      reason_code: error.code || 'data_access_denied',
      user_safe_reason: error.safe ? error.message : 'The helper could not read that data safely from this scope.',
      repair: { status: 'not_allowed', reason: error.code || 'data_access_denied' },
    };
    if (evidence) addDenial(evidence, denial);
    await recordDenial(db, context, denial);
    throw error;
  }
}

module.exports = {
  assertOneTimeClassroomScope,
  assertParentLinkedChild,
  assertProviderScope,
  assertStudentOwn,
  maskStudentSafe,
  readScopedData,
};
