# Product Quality Compiler Validation

Generated: 2026-07-01T12:14:23.085Z
Mode: fixtures
Files scanned: 13
Passed: 13
Failed: 0

## PASS ops/product-quality-compiler/fixtures/invalid-app-visible-no-deploy-gate.json
Expected failure codes: PQC_APP_VISIBLE_NO_DEPLOY_GATE
Actual failure codes: PQC_MISSING_STATE_MATRIX, PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI, PQC_APP_VISIBLE_NO_DEPLOY_GATE

| Code | Path | Message |
|---|---|---|
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.loading` | Missing state_matrix entry: loading |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.empty` | Missing state_matrix entry: empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.populated` | Missing state_matrix entry: populated |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.filtered_empty` | Missing state_matrix entry: filtered_empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.error` | Missing state_matrix entry: error |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.blocked_setup` | Missing state_matrix entry: blocked_setup |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.preview_only` | Missing state_matrix entry: preview_only |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.success_readback` | Missing state_matrix entry: success_readback |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.permission_denied` | Missing state_matrix entry: permission_denied |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.mobile_drawer_or_detail_state` | Missing state_matrix entry: mobile_drawer_or_detail_state |
| PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI | `$.external_provider_policy` | External provider or write language must be separate, out-of-scope, sandbox-only, or approval-gated. |
| PQC_APP_VISIBLE_NO_DEPLOY_GATE | `$.deployment_gate` | App-visible packets cannot use NOT_REQUIRED_DOC_ONLY deployment gate. |

## PASS ops/product-quality-compiler/fixtures/invalid-ghl-like-without-no-ghl.json
Expected failure codes: PQC_GHL_WITHOUT_NO_GHL
Actual failure codes: PQC_MISSING_STATE_MATRIX, PQC_MISSING_SCREENSHOTS, PQC_GHL_WITHOUT_NO_GHL, PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI

| Code | Path | Message |
|---|---|---|
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.loading` | Missing state_matrix entry: loading |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.empty` | Missing state_matrix entry: empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.populated` | Missing state_matrix entry: populated |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.filtered_empty` | Missing state_matrix entry: filtered_empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.error` | Missing state_matrix entry: error |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.blocked_setup` | Missing state_matrix entry: blocked_setup |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.preview_only` | Missing state_matrix entry: preview_only |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.success_readback` | Missing state_matrix entry: success_readback |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.permission_denied` | Missing state_matrix entry: permission_denied |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.mobile_drawer_or_detail_state` | Missing state_matrix entry: mobile_drawer_or_detail_state |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 1440 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 1024 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 768 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 430 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 390 |
| PQC_GHL_WITHOUT_NO_GHL | `$.security_privacy.no_ghl_runtime` | GHL-like language requires security_privacy.no_ghl_runtime true. |
| PQC_GHL_WITHOUT_NO_GHL | `$.product_quality_expansion.first_party_pattern_interpretation` | GHL-like language requires first_party_pattern_interpretation. |
| PQC_GHL_WITHOUT_NO_GHL | `$.external_provider_policy` | GHL-like language cannot approve an external provider write in the same packet. |
| PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI | `$.external_provider_policy` | External provider or write language must be separate, out-of-scope, sandbox-only, or approval-gated. |

## PASS ops/product-quality-compiler/fixtures/invalid-no-out-of-scope.json
Expected failure codes: PQC_MISSING_OUT_OF_SCOPE
Actual failure codes: PQC_MISSING_OUT_OF_SCOPE, PQC_MISSING_STATE_MATRIX

| Code | Path | Message |
|---|---|---|
| PQC_MISSING_OUT_OF_SCOPE | `$.out_of_scope` | Every UI/product packet needs explicit out-of-scope items. |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.loading` | Missing state_matrix entry: loading |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.empty` | Missing state_matrix entry: empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.populated` | Missing state_matrix entry: populated |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.filtered_empty` | Missing state_matrix entry: filtered_empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.error` | Missing state_matrix entry: error |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.blocked_setup` | Missing state_matrix entry: blocked_setup |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.preview_only` | Missing state_matrix entry: preview_only |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.success_readback` | Missing state_matrix entry: success_readback |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.permission_denied` | Missing state_matrix entry: permission_denied |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.mobile_drawer_or_detail_state` | Missing state_matrix entry: mobile_drawer_or_detail_state |

## PASS ops/product-quality-compiler/fixtures/invalid-no-state-matrix.json
Expected failure codes: PQC_MISSING_STATE_MATRIX
Actual failure codes: PQC_MISSING_STATE_MATRIX, PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI

| Code | Path | Message |
|---|---|---|
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.loading` | Missing state_matrix entry: loading |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.empty` | Missing state_matrix entry: empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.populated` | Missing state_matrix entry: populated |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.filtered_empty` | Missing state_matrix entry: filtered_empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.error` | Missing state_matrix entry: error |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.blocked_setup` | Missing state_matrix entry: blocked_setup |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.preview_only` | Missing state_matrix entry: preview_only |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.success_readback` | Missing state_matrix entry: success_readback |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.permission_denied` | Missing state_matrix entry: permission_denied |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.mobile_drawer_or_detail_state` | Missing state_matrix entry: mobile_drawer_or_detail_state |
| PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI | `$.external_provider_policy` | External provider or write language must be separate, out-of-scope, sandbox-only, or approval-gated. |

## PASS ops/product-quality-compiler/fixtures/invalid-no-view-class.json
Expected failure codes: PQC_MISSING_VIEW_CLASS
Actual failure codes: PQC_MISSING_VIEW_CLASS, PQC_MISSING_STATE_MATRIX, PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI

| Code | Path | Message |
|---|---|---|
| PQC_MISSING_VIEW_CLASS | `$.view_classes` | Every UI/product packet needs at least one view class. |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.loading` | Missing state_matrix entry: loading |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.empty` | Missing state_matrix entry: empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.populated` | Missing state_matrix entry: populated |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.filtered_empty` | Missing state_matrix entry: filtered_empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.error` | Missing state_matrix entry: error |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.blocked_setup` | Missing state_matrix entry: blocked_setup |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.preview_only` | Missing state_matrix entry: preview_only |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.success_readback` | Missing state_matrix entry: success_readback |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.permission_denied` | Missing state_matrix entry: permission_denied |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.mobile_drawer_or_detail_state` | Missing state_matrix entry: mobile_drawer_or_detail_state |
| PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI | `$.external_provider_policy` | External provider or write language must be separate, out-of-scope, sandbox-only, or approval-gated. |

## PASS ops/product-quality-compiler/fixtures/invalid-ui-no-screenshots.json
Expected failure codes: PQC_MISSING_SCREENSHOTS
Actual failure codes: PQC_MISSING_STATE_MATRIX, PQC_MISSING_SCREENSHOTS, PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI

| Code | Path | Message |
|---|---|---|
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.loading` | Missing state_matrix entry: loading |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.empty` | Missing state_matrix entry: empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.populated` | Missing state_matrix entry: populated |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.filtered_empty` | Missing state_matrix entry: filtered_empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.error` | Missing state_matrix entry: error |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.blocked_setup` | Missing state_matrix entry: blocked_setup |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.preview_only` | Missing state_matrix entry: preview_only |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.success_readback` | Missing state_matrix entry: success_readback |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.permission_denied` | Missing state_matrix entry: permission_denied |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.mobile_drawer_or_detail_state` | Missing state_matrix entry: mobile_drawer_or_detail_state |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 1440 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 1024 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 768 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 430 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 390 |
| PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI | `$.external_provider_policy` | External provider or write language must be separate, out-of-scope, sandbox-only, or approval-gated. |

## PASS ops/product-quality-compiler/fixtures/invalid-vague-clean-only.json
Expected failure codes: PQC_VAGUE_UNEXPANDED
Actual failure codes: PQC_MISSING_STATE_MATRIX, PQC_MISSING_SCREENSHOTS, PQC_VAGUE_UNEXPANDED, PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI

| Code | Path | Message |
|---|---|---|
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.loading` | Missing state_matrix entry: loading |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.empty` | Missing state_matrix entry: empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.populated` | Missing state_matrix entry: populated |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.filtered_empty` | Missing state_matrix entry: filtered_empty |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.error` | Missing state_matrix entry: error |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.blocked_setup` | Missing state_matrix entry: blocked_setup |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.preview_only` | Missing state_matrix entry: preview_only |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.success_readback` | Missing state_matrix entry: success_readback |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.permission_denied` | Missing state_matrix entry: permission_denied |
| PQC_MISSING_STATE_MATRIX | `$.state_matrix.mobile_drawer_or_detail_state` | Missing state_matrix entry: mobile_drawer_or_detail_state |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 1440 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 1024 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 768 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 430 |
| PQC_MISSING_SCREENSHOTS | `$.visual_quality.screenshot_requirements` | Missing required screenshot viewport: 390 |
| PQC_VAGUE_UNEXPANDED | `$.product_quality_expansion.expanded_phrases` | Vague phrase "clean" appears in executable fields without a matching product_quality_expansion entry. |
| PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI | `$.external_provider_policy` | External provider or write language must be separate, out-of-scope, sandbox-only, or approval-gated. |

## PASS ops/product-quality-compiler/fixtures/valid-clean-ui-visual-audit.json

## PASS ops/product-quality-compiler/fixtures/valid-community-section.json

## PASS ops/product-quality-compiler/fixtures/valid-control-tower-super-ramble.json

## PASS ops/product-quality-compiler/fixtures/valid-rabbi-crm-like-ghl.json

## PASS ops/product-quality-compiler/fixtures/valid-v3-browser-prompt-injection.json

## PASS ops/product-quality-compiler/fixtures/valid-v3-router-dag-just-finish-it.json

