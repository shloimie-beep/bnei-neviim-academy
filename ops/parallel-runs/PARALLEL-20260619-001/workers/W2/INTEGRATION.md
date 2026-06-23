# W2 Integration Notes

## Shared Files Not Edited

W2 did not edit:

- `public/operations.html`
- `server.js`
- `package.json`
- `package-lock.json`
- any other shared-file deny-list item

## Mount Request For Prompt 05

Prompt 05 can mount the W2 package into the existing Operations shell by adding
the following shared entrypoint wiring after review:

```html
<link rel="stylesheet" href="/css/platform-ui/platform-ui.css">
<script src="/js/platform-ui/platform-ui-fixtures.js"></script>
<script src="/js/platform-ui/platform-ui.js"></script>
```

Then mount into an owned container:

```html
<div data-platform-ui-root></div>
<script>
  window.PlatformUi.init('[data-platform-ui-root]', {
    workspaceId: currentWorkspaceKeyToPlatformUiWorkspaceId(),
    moduleKey: currentOperationsViewToPlatformUiModuleKey()
  });
</script>
```

The current isolated harness already does this at
`public/platform-ui/index.html`.

## Exported Adapter Surface

`public/js/platform-ui/platform-ui.js` exports:

- `EVENT_NAMES`
- `INTEGRATION_ENDPOINTS`
- `createInitialState`
- `visibleModuleDefinitions`
- `deriveModuleCards`
- validation helpers
- local submit helpers
- `testIntegration`
- `renderApp`
- `init`

## View Model Contracts

The UI consumes the coordinator contracts:

- `InstanceShellViewModel`
- `ModuleCardViewModel`
- `CourseViewModel`
- `CommunityViewModel`

The fixtures live in `public/js/platform-ui/platform-ui-fixtures.js`.

## Required API/View Model Binding

Prompt 05 should bind these conceptual endpoints to existing or new shared
routes only after review:

- `GET /api/bna/platform-shell-view-model`
- `GET/POST /api/bna/platform-members`
- `GET/POST /api/bna/platform-students`
- `GET/POST /api/bna/platform-communities`
- `GET/POST /api/bna/platform-courses`
- `GET/PATCH /api/bna/platform-lessons`
- `GET /api/bna/platform-video-assets`
- `GET/POST /api/bna/platform-rewards`
- `GET/POST /api/bna/platform-integrations/readiness`
- `GET /api/bna/platform-agent-runs`

These are adapter targets, not routes created by W2.

## Event Binding

The UI records and exposes these event names for Prompt 05:

- `instance.changed`
- `workspace.changed`
- `membership.changed`
- `module.visibility.changed`
- `community.created`
- `course.created`
- `lesson.video.attached`
- `integration.readiness.checked`
- `ui.instance.switch_requested`
- `ui.workspace.switch_requested`
- `ui.module.opened`
- `ui.course.opened`
- `ui.community.opened`
- `ui.provider.opened`
- `ui.reward.opened`
- `ui.prompt_queue.opened`

## External Gates

No push, deploy, Railway, DNS, production DB migration, live OAuth, Vimeo
upload, Zoom mutation, Resend send, or credential entry was performed.

Integration cards deliberately show readiness, account identity, scopes, last
check, and next action without displaying secrets.
