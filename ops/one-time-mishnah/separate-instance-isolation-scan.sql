SELECT 'bna_students_outside_onetime' AS check_name, COUNT(*)::int AS count
FROM bna_students s
LEFT JOIN bna_projects p ON p.id = COALESCE(s.project_id, s.workspace_id)
WHERE COALESCE(p.project_key, '') <> 'one_time_mishnah_class';

SELECT 'bna_payments_present' AS check_name, COUNT(*)::int AS count
FROM bna_payment_intake;

SELECT 'private_messages_present' AS check_name, COUNT(*)::int AS count
FROM bna_communications
WHERE COALESCE(project_id, -1) <> (SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1);

SELECT 'one_time_test_fixtures' AS check_name, COUNT(*)::int AS count
FROM bna_people
WHERE email LIKE '%@example.test'
  AND preferred_name LIKE 'TEST%';