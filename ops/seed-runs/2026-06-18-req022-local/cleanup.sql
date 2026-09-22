-- REQ-20260618-111 cleanup SQL. Deletes only TEST_REQ022 rows selected by prefix or req022 metadata.
BEGIN;
DELETE FROM bna_helper_tool_audit_log WHERE request_id LIKE 'TEST_REQ022%' OR args_redacted->>'req022_seed_key' = 'req022_safe_repeatable_seed_v1' OR args_redacted->>'run_id' = '20260618_local';
DELETE FROM bna_assignment_students ast USING bna_assignments a WHERE ast.assignment_id = a.id AND (a.metadata->>'req022_seed_key' = 'req022_safe_repeatable_seed_v1' OR a.title LIKE 'TEST_REQ022%');
DELETE FROM bna_assignments WHERE metadata->>'req022_seed_key' = 'req022_safe_repeatable_seed_v1' OR title LIKE 'TEST_REQ022%';
DELETE FROM bna_devices d USING bna_students s WHERE d.student_id = s.id AND ('test:req022' = ANY(COALESCE(s.tags, ARRAY[]::text[])) OR s.name LIKE 'TEST_REQ022%');
DELETE FROM bna_calendar_events WHERE metadata_json->>'req022_seed_key' = 'req022_safe_repeatable_seed_v1' OR title LIKE 'TEST_REQ022%';
DELETE FROM bna_learning_communities WHERE metadata_json->>'req022_seed_key' = 'req022_safe_repeatable_seed_v1' OR community_key LIKE 'test_req022%';
DELETE FROM bna_automations WHERE metadata->>'req022_seed_key' = 'req022_safe_repeatable_seed_v1' OR automation_key LIKE 'test_req022%';
DELETE FROM bna_content_jobs WHERE title LIKE 'TEST_REQ022%' OR notes LIKE '%req022_safe_repeatable_seed_v1%';
DELETE FROM bna_tasks WHERE ai_parsed->>'req022_seed_key' = 'req022_safe_repeatable_seed_v1' OR title LIKE 'TEST_REQ022%';
DELETE FROM bna_project_members WHERE metadata->>'req022_seed_key' = 'req022_safe_repeatable_seed_v1' OR person_name LIKE 'TEST_REQ022%';
DELETE FROM bna_students WHERE 'test:req022' = ANY(COALESCE(tags, ARRAY[]::text[])) OR name LIKE 'TEST_REQ022%' OR student_access_code = 'TEST_REQ022_20260618_LOCAL_STUDENT_ACCESS';
DELETE FROM bna_workspaces WHERE metadata->>'req022_seed_key' = 'req022_safe_repeatable_seed_v1' OR "key" LIKE 'test_req022%';
DELETE FROM bna_projects WHERE metadata->>'req022_seed_key' = 'req022_safe_repeatable_seed_v1' OR project_key LIKE 'test_req022%';
COMMIT;
