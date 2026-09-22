# UI State Matrix

Every UI route/module in a compiled Product Quality Compiler packet must define
a state matrix before Codex implements product code.

Required states:

- `loading`
- `empty`
- `populated`
- `filtered_empty`
- `error`
- `blocked_setup`
- `preview_only`
- `success_readback`
- `permission_denied`
- `mobile_drawer_or_detail_state`

For each state, record:

- route;
- viewport;
- auth role;
- workspace/project;
- how to enter state;
- expected visible title;
- expected visible message;
- expected primary action;
- expected secondary actions;
- forbidden content;
- screenshot required;
- ARIA/semantic expectation;
- accessibility expectation;
- test/smoke assertion;
- requirement ID.

If a route truly cannot enter one of the states, the matrix must say why and
name the closest equivalent state or blocker. A missing matrix is a Definition
of Ready failure.

## One Time Examples

### CRM / Pipeline

- `loading`: skeleton list/board with a status message.
- `empty`: "No contacts in this stage yet" plus import/add/test-contact path
  only when the packet allows test data.
- `populated`: pipeline cards show name, stage, last activity, source, owner,
  and next action.
- `filtered_empty`: "No contacts match these filters" plus clear filters.
- `blocked_setup`: setup details are hidden from Rabbi unless actionable.
- `mobile_drawer_or_detail_state`: selecting a card opens detail with a clear
  back action and no trapped drawer.

### Community

- `empty`: explains that Rabbi posts prompts and students respond privately.
- `populated`: public Rabbi posts and approved public Q&A only.
- `private responses`: visible only to Rabbi/admin, not other students.
- `permission_denied`: student cannot see admin moderation controls.

### Communications

- `blocked_setup`: shows email readiness without noisy DNS internals in the
  Rabbi normal view.
- `preview_only`: dry-run/bulk preview clearly says no send occurred.
- `success_readback`: test send/sandbox proof appears only when a provider
  packet authorizes it.
