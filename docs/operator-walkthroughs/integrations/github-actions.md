# GitHub Actions / Workflow Scope Walkthrough

Purpose: independent PR checks, workflow files, release gates, and push
validation.

1. Open `/integration-setup.html#github-actions`.
2. Open https://github.com/shloimie-beep/bnei-neviim-academy/actions.
3. Current reason checks may be missing: previous branch work could not push
   workflow files because the GitHub auth lacked `workflow` scope.
4. Open https://github.com/settings/tokens or the relevant GitHub App settings.
5. Required permission:
   - classic token: `workflow` scope plus repository write access;
   - fine-grained token or GitHub App: contents write plus workflow permission
     for this repository, if available in the chosen auth path.
6. Do not store GitHub tokens in repo files.
7. After permission is added, push the branch or a tiny workflow test branch.
8. Expected success: branch push succeeds and Actions checks attach to the PR.
9. Expected failure: GitHub rejects workflow changes with a precise permission
   error.
10. Can release use local gates temporarily? Yes, only if release notes state
    that independent GitHub checks are blocked by workflow scope and list the
    local commands that passed.
11. Live acceptance requires independent checks or an explicit owner decision
    accepting local gates for the specific release.
