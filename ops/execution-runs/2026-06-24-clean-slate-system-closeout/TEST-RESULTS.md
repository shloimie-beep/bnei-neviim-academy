# Test Results

- Preservation branch: focused One Time suites 20/20 and 37/37, staged leak scan, JSON/JSONL parse, secrets audit, diff check.
- PR #14 merge: focused owner-review/control-plane gate 72/72 after action-coverage regeneration; secrets audit and diff check passed.
- PR #15 merge: focused Rabbi/auth/provider suite 33/33 and four local browser smokes passed.
- Preservation merge: One Time suite 57/57, Rabbi suite 33/33, four browser smokes, One Time canonical journey smoke, secrets audit, and diff check passed.
- Run schema repair: `npm run bna:run:validate` passed after adding structured `expected_result` fields.
- Queue/control artifact validation: JSON/JSONL and run CLI validation passed.
- Final control closeout: `npm run bna:run:status`, `npm run bna:run:validate`, `npm run bna:run:blockers`, `npm run bna:run:next`, staged JSON/JSONL parse, `npm run secrets:audit`, and `git diff --check` passed before pushing draft PR #16.
