# RAW-20260712-006 - One Time neon landing polish deployment instruction

Source: codex_chat
Created: 2026-07-12
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Parse status: registered

## Raw text

DEPLOYMENT

After completing the implementation and passing the required tests:

1. Commit the landing-page changes.
2. Push the dedicated branch.
3. Merge the completed work into the current production branch.
4. Deploy it to the One Time production Railway service.
5. Verify the live deployment at:
   https://join.onetimeonetime.com/one-time/
6. Verify the signup page at:
   https://join.onetimeonetime.com/one-time/signup
7. Run the live landing-page and signup smoke tests.
8. If the deployment or smoke tests fail, diagnose the failure, fix it, redeploy, and repeat verification.
9. Confirm the live site is serving the expected commit SHA.

Do not wait for another visual-approval step before deployment. Complete the implementation, verification, and production deployment in this same task.

FINAL REPORT

Return:

1. Changed-file list
2. Asset source-to-destination map
3. Selected carousel images and locations
4. Any unavailable assets or placeholders
5. Desktop and mobile screenshots
6. Requirement matrix
7. Test results
8. Commit SHA
9. Production deployment ID/status
10. Live URLs and live-smoke results

## Parsed override

This supersedes the approval gate in RAW-20260712-005 for this focused landing-page polish pass. Production deployment is now required after implementation and local verification.
