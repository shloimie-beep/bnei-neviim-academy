import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { listActions } = require('../src/lib/actions/registry');
const { buildToolRegistry } = require('../src/lib/bna/helper/tool-registry');

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const opsDir = path.join(repoRoot, 'ops');
const jsonPath = path.join(opsDir, 'helper-tool-parity-map.json');
const mdPath = path.join(opsDir, 'helper-tool-parity-map.md');

const PROMPT_REQUESTED_TOOLS = [
  'show_operating_goals',
  'capture_ramble',
  'distill_ramble',
  'create_goal',
  'update_goal_status',
  'create_decision',
  'create_pending_item',
  'create_codex_task',
  'run_watchdog_audit',
  'show_prompt_intake_status',
  'link_prompt_to_goal',
  'show_thursday_blockers',
  'list_tasks',
  'create_task',
  'update_task',
  'add_task_comment',
  'mark_task_done',
  'mark_task_verified',
  'add_decision_comment',
  'reprocess_decision',
  'convert_decision_to_task',
  'create_pending_access_item',
  'mark_pending_received',
  'archive_duplicate_pending',
  'list_students',
  'create_student',
  'update_student',
  'create_student_goal',
  'create_assignment',
  'create_accountability_note',
  'update_goal_progress',
  'show_student_progress',
  'create_parent_visible_summary',
  'create_student_question',
  'create_shoutout_draft',
  'show_parent_students',
  'show_student_progress_for_parent',
  'create_parent_question',
  'reset_student_login',
  'update_parent_helper_profile',
  'show_payment_status_if_allowed',
  'show_my_assignments',
  'show_my_goals',
  'explain_assignment',
  'submit_checkoff',
  'submit_question',
  'submit_worksheet_answer',
  'ask_for_help',
  'list_content_jobs',
  'create_content_job',
  'parse_recording',
  'create_class_session',
  'create_course',
  'create_lesson',
  'create_worksheet',
  'create_source_sheet_draft',
  'create_library_item',
  'attach_drive_file',
  'attach_vimeo_url',
  'draft_parent_update',
  'draft_social_post',
  'update_rabbi_brand_kit',
  'draft_mishnayos_landing_page',
  'create_class_calendar_draft',
  'create_product_tier_draft',
  'create_student_question_queue',
  'create_worksheet_from_transcript',
  'create_mishnah_source_sheet_draft',
  'show_one_time_launch_checklist',
  'create_provider_workspace',
  'update_provider_profile',
  'create_provider_landing_page',
  'update_provider_brand_kit',
  'upload_provider_asset_reference',
  'create_provider_offer',
  'list_provider_leads',
  'create_provider_lead',
  'update_provider_lead',
  'draft_provider_message',
  'create_provider_automation_draft',
  'show_provider_integration_status',
  'show_integrations',
  'save_integration_secret',
  'test_integration_connection',
  'create_resend_setup_task',
  'create_buffer_setup_task',
  'create_wapi_setup_task',
  'create_vimeo_setup_task',
  'create_zoom_setup_task',
  'create_stripe_setup_task',
  'create_dns_setup_task',
  'draft_email',
  'draft_whatsapp',
  'draft_buffer_post',
  'preview_send',
  'send_email_after_confirmation',
  'schedule_buffer_after_confirmation',
  'send_whatsapp_after_confirmation',
  'list_payment_roster',
  'create_payment_intake',
  'update_payment_status',
  'draft_payment_reminder',
  'send_payment_reminder_after_confirmation',
  'show_stripe_status',
  'create_checkout_draft_only',
  'list_calendar_sessions',
  'create_calendar_event_draft',
  'update_calendar_event_draft',
  'mark_attendance',
  'create_zoom_meeting_after_confirmation_and_credentials',
];

const TOOL_ALIASES = {
  create_codex_task: 'create_codex_work_item',
  create_pending_item: 'create_pending_blocker',
  create_pending_access_item: 'create_pending_blocker',
  show_integrations: 'show_integration_status',
  show_provider_integration_status: 'show_integration_status',
  save_integration_secret: 'save_provider_api_key',
  test_integration_connection: 'show_integration_status',
  create_resend_setup_task: 'create_integration_setup_task',
  create_buffer_setup_task: 'create_integration_setup_task',
  create_wapi_setup_task: 'create_integration_setup_task',
  create_vimeo_setup_task: 'create_integration_setup_task',
  create_zoom_setup_task: 'create_integration_setup_task',
  create_stripe_setup_task: 'create_integration_setup_task',
  attach_vimeo_url: 'attach_vimeo_url_to_library_item',
  draft_buffer_post: 'draft_social_post',
  schedule_buffer_after_confirmation: 'schedule_social_post_via_buffer',
  send_email_after_confirmation: 'send_email',
  show_prompt_intake_status: 'audit_queue_status',
  show_thursday_blockers: 'show_integration_status',
  list_tasks: 'show_task_report',
  list_content_jobs: 'create_content_item',
  create_content_job: 'create_content_item',
  create_class_calendar_draft: 'create_task',
  create_product_tier_draft: 'create_task',
  create_provider_automation_draft: 'create_integration_setup_task',
  draft_provider_message: 'draft_email',
  draft_parent_update: 'draft_email',
  create_mishnah_source_sheet_draft: 'create_worksheet',
  create_source_sheet_draft: 'create_worksheet',
};

function helperToolNameFor(actionId) {
  return TOOL_ALIASES[actionId] || actionId;
}

function surfacesForAction(action = {}) {
  const contexts = new Set(action.page_contexts || []);
  const routes = (action.related_routes || []).join(' ');
  const surfaces = new Set();
  if (routes.includes('/operations') || ['tasks', 'dashboard', 'contacts', 'content', 'communications', 'calendar', 'settings', 'admin', 'api_usage', 'pipelines'].some((item) => contexts.has(item))) surfaces.add('operations');
  if (routes.includes('/parent') || [...contexts].some((item) => item.includes('parent'))) surfaces.add('parent');
  if (routes.includes('/student') || [...contexts].some((item) => item.includes('student'))) surfaces.add('student');
  if (routes.includes('/provider') || [...contexts].some((item) => item.includes('provider'))) surfaces.add('provider');
  if (routes.includes('/one-time') || routes.includes('/rabbi') || [...contexts].some((item) => item.includes('rabbi'))) surfaces.add('rabbi');
  if (!surfaces.size) surfaces.add('operations');
  return [...surfaces];
}

function fileForSurface(surface) {
  return {
    operations: 'public/operations.html',
    parent: 'public/parent.html',
    student: 'public/student.html',
    provider: 'public/provider.html',
    rabbi: 'public/rabbi.html',
    public: 'public/index.html',
    family: 'public/parent.html',
  }[surface] || 'public/operations.html';
}

function endpointForAction(action = {}) {
  const id = action.action_id || '';
  if (id === 'create_task') return ['/api/bna/tasks', 'POST'];
  if (id === 'create_decision') return ['/api/bna/tasks', 'POST'];
  if (id === 'update_task_stage') return ['/api/bna/tasks/:id', 'PATCH'];
  if (id === 'add_timeline_note') return ['/api/bna/internal-dialogue/messages', 'POST'];
  if (id.includes('email')) return ['/api/bna/communications/email/drafts', 'POST'];
  if (id.includes('calendar')) return ['/api/bna/calendar-events', 'POST'];
  if (id.includes('provider')) return ['/api/bna/service-providers', 'POST/PATCH'];
  if (id.includes('student')) return ['/api/bna/students', 'GET/POST/PATCH'];
  if (id.includes('ticket')) return ['/api/bna/tickets', 'POST'];
  if (id.includes('newsletter') || id.includes('content') || id.includes('worksheet')) return ['/api/bna/content', 'GET/POST'];
  return ['', ''];
}

function statusFor({ surface, actionId, actionApproval, helperTool }) {
  if (surface === 'student' && !helperTool) return 'student_safe_only';
  if (!helperTool) {
    if (/(send|publish|schedule|stripe|checkout|zoom|vimeo|dns|whatsapp|buffer|payment)/i.test(actionId)) return 'external_blocker';
    return 'tool_needed';
  }
  if (helperTool.available === false) {
    if (helperTool.unavailableReason === 'missing_integration') return 'external_blocker';
    return 'tool_needed';
  }
  if (actionApproval || helperTool.requiresConfirmation) return 'requires_confirmation';
  return 'tool_available';
}

function scopeRulesFor(surface, action = {}, helperTool = null) {
  const rules = [];
  if (surface === 'operations') rules.push('admin/super_admin or scoped workspace login required');
  if (surface === 'rabbi') rules.push('one_time_mishnah_class scope only');
  if (surface === 'provider') rules.push('provider workspace only; no other providers or BNA private student data');
  if (surface === 'parent') rules.push('own family and parent-visible records only');
  if (surface === 'student') rules.push('student-safe own records only');
  if (helperTool?.requiresConfirmation) rules.push('explicit confirmation required before execution');
  if (helperTool?.sideEffectLevel) rules.push(`side_effect:${helperTool.sideEffectLevel}`);
  if (Array.isArray(action.allowed_roles) && action.allowed_roles.length) rules.push(`roles:${action.allowed_roles.slice(0, 6).join(',')}`);
  return rules;
}

function buildActionRecords(actions, helperToolsByName) {
  const records = [];
  for (const action of actions) {
    const actionId = action.action_id;
    const toolName = helperToolNameFor(actionId);
    const helperTool = helperToolsByName.get(toolName) || null;
    const [apiEndpoint, method] = endpointForAction(action);
    for (const surface of surfacesForAction(action)) {
      records.push({
        surface,
        label: action.label,
        current_file: fileForSurface(surface),
        api_endpoint: apiEndpoint,
        method,
        helper_tool_name: helperTool ? helperTool.name : toolName,
        scope_rules: scopeRulesFor(surface, action, helperTool),
        confirmation_required: Boolean(action.approval_required || helperTool?.requiresConfirmation),
        status: statusFor({ surface, actionId, actionApproval: action.approval_required, helperTool }),
        notes: helperTool
          ? `Typed action ${actionId} maps to helper tool ${helperTool.name}.`
          : `Typed action ${actionId} has no direct helper wrapper yet.`,
      });
    }
  }
  return records;
}

function buildHelperOnlyRecords(actions, helperTools) {
  const actionIds = new Set(actions.map((action) => helperToolNameFor(action.action_id)));
  return helperTools
    .filter((tool) => !actionIds.has(tool.name))
    .map((tool) => ({
      surface: tool.category === 'video' ? 'rabbi' : 'operations',
      label: tool.name.replace(/_/g, ' '),
      current_file: 'src/lib/bna/helper/tool-registry.js',
      api_endpoint: '/api/bna/helper/message',
      method: 'POST',
      helper_tool_name: tool.name,
      scope_rules: scopeRulesFor(tool.category === 'video' ? 'rabbi' : 'operations', {}, tool),
      confirmation_required: Boolean(tool.requiresConfirmation),
      status: tool.available === false
        ? (tool.unavailableReason === 'missing_integration' ? 'external_blocker' : 'tool_needed')
        : (tool.requiresConfirmation ? 'requires_confirmation' : 'tool_available'),
      notes: `Helper registry tool with side effect ${tool.sideEffectLevel || 'internal_write'}.`,
    }));
}

function buildPromptInventoryRecords(existingLabels, helperToolsByName) {
  return PROMPT_REQUESTED_TOOLS
    .filter((toolName) => !existingLabels.has(toolName))
    .map((toolName) => {
      const helperName = helperToolNameFor(toolName);
      const helperTool = helperToolsByName.get(helperName) || null;
      const surface = /student|worksheet|assignment|checkoff|my_/.test(toolName)
        ? 'student'
        : /parent|family|child/.test(toolName)
          ? 'parent'
          : /provider|lead|offer|brand/.test(toolName)
            ? 'provider'
            : /rabbi|mishnah|class|source|library/.test(toolName)
              ? 'rabbi'
              : 'operations';
      return {
        surface,
        label: toolName.replace(/_/g, ' '),
        current_file: helperTool ? 'src/lib/bna/helper/tool-registry.js' : 'tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md',
        api_endpoint: helperTool ? '/api/bna/helper/message' : '',
        method: helperTool ? 'POST' : '',
        helper_tool_name: helperName,
        scope_rules: scopeRulesFor(surface, {}, helperTool),
        confirmation_required: Boolean(helperTool?.requiresConfirmation || /(send|publish|schedule|payment|checkout|zoom|dns|access)/.test(toolName)),
        status: helperTool
          ? (helperTool.requiresConfirmation ? 'requires_confirmation' : 'tool_available')
          : (/(send|publish|schedule|payment|checkout|zoom|dns|stripe|wapi|whatsapp|vimeo)/.test(toolName) ? 'external_blocker' : 'tool_needed'),
        notes: helperTool ? 'Covered by an existing helper wrapper or alias.' : 'Requested in prompt inventory; wrapper or surface-specific handler still needed.',
      };
    });
}

function writeMarkdown(records) {
  const counts = records.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {});
  const bySurface = records.reduce((acc, record) => {
    acc[record.surface] = (acc[record.surface] || 0) + 1;
    return acc;
  }, {});
  const sampleRows = records
    .slice(0, 120)
    .map((record) => `| ${record.surface} | ${record.label} | ${record.helper_tool_name} | ${record.status} | ${record.confirmation_required ? 'yes' : 'no'} | ${record.current_file} |`)
    .join('\n');
  return [
    '# Helper Tool Parity Map',
    '',
    'Generated from `src/lib/actions/registry.js`, `src/lib/bna/helper/tool-registry.js`, and the 2026-06-16 on-page scoped helper prompt.',
    '',
    '## Summary',
    '',
    ...Object.entries(counts).sort().map(([status, count]) => `- ${status}: ${count}`),
    '',
    '## Surfaces',
    '',
    ...Object.entries(bySurface).sort().map(([surface, count]) => `- ${surface}: ${count}`),
    '',
    '## Notes',
    '',
    '- `tool_available` means a helper wrapper exists and can run within the resolved scope.',
    '- `requires_confirmation` means the helper can plan the action but must show a confirmation gate before execution.',
    '- `tool_needed` means the current UI/action exists or was requested, but the helper wrapper is not implemented yet.',
    '- `external_blocker` means live execution depends on credentials, account ownership, or approval-gated external systems.',
    '- `student_safe_only` means the action belongs behind child-safe student scoping before a general helper can expose it.',
    '',
    '## Records',
    '',
    '| Surface | Label | Helper tool | Status | Confirm | File |',
    '|---|---|---|---|---|---|',
    sampleRows,
    '',
    `Full machine-readable map: \`ops/helper-tool-parity-map.json\` (${records.length} records).`,
    '',
  ].join('\n');
}

const actions = listActions();
const registry = buildToolRegistry();
const helperTools = registry.tools;
const helperToolsByName = new Map(helperTools.map((tool) => [tool.name, tool]));
const records = [
  ...buildActionRecords(actions, helperToolsByName),
  ...buildHelperOnlyRecords(actions, helperTools),
];
const existingLabels = new Set(records.map((record) => record.helper_tool_name));
records.push(...buildPromptInventoryRecords(existingLabels, helperToolsByName));

records.sort((a, b) => `${a.surface}:${a.label}`.localeCompare(`${b.surface}:${b.label}`));
fs.mkdirSync(opsDir, { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(records, null, 2)}\n`);
fs.writeFileSync(mdPath, writeMarkdown(records));
console.log(`Wrote ${records.length} helper parity records.`);
