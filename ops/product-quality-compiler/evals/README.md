# Product Quality Compiler Evals

These evals check whether vague operator rambles compile into Product Quality
Compiler packets with the required scope, state, screenshot, accessibility,
provider-separation, no-GHL, and trace fields.

The first implementation is deterministic and local:

- no external AI API calls;
- sample compiled outputs live under `expected-outputs/`;
- fixture aliases may point to the shared valid packet fixtures;
- `run-product-quality-compiler-evals.mjs` validates each sample with
  `scripts/validate-product-quality-packets.mjs` and then checks the expected
  properties for each vague ramble.

Run:

```bash
npm run pqc:evals
```

Reports:

- `ops/product-quality-compiler/evals/latest-eval-report.md`
- `ops/product-quality-compiler/evals/latest-eval-report.json`
