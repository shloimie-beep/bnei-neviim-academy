-- Cleanup One Time UI review TEST data.
-- Deletes only rows with cleanup marker one_time_ui_review_20260702.

BEGIN;

DELETE FROM bna_communications WHERE metadata->>'cleanup_marker' = 'one_time_ui_review_20260702';
DELETE FROM bna_contact_pipeline_events WHERE metadata->>'cleanup_marker' = 'one_time_ui_review_20260702';
DELETE FROM bna_contacts WHERE metadata->>'cleanup_marker' = 'one_time_ui_review_20260702';
DELETE FROM bna_support_tickets
 WHERE source_context->>'cleanup_marker' = 'one_time_ui_review_20260702'
    OR authenticated_context->>'cleanup_marker' = 'one_time_ui_review_20260702'
    OR ticket_number LIKE 'TEST-OT-UI-%';
DELETE FROM bna_tasks WHERE ai_parsed->>'cleanup_marker' = 'one_time_ui_review_20260702';
DELETE FROM one_time_member_library_items WHERE package_snapshot->>'cleanup_marker' = 'one_time_ui_review_20260702';
DELETE FROM bna_class_sessions WHERE metadata->>'cleanup_marker' = 'one_time_ui_review_20260702';
DELETE FROM one_time_member_access WHERE metadata->>'cleanup_marker' = 'one_time_ui_review_20260702';
DELETE FROM bna_project_members WHERE metadata->>'cleanup_marker' = 'one_time_ui_review_20260702';
DELETE FROM bna_workspace_memberships WHERE metadata->>'cleanup_marker' = 'one_time_ui_review_20260702';
DELETE FROM bna_people WHERE metadata->>'cleanup_marker' = 'one_time_ui_review_20260702';

COMMIT;
