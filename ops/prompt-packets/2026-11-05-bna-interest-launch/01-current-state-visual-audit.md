# Current-state BNA visual audit

Evidence: .runtime/bna-interest-launch-20261105/before/baseline.json and screenshots. Actual public routes /, /join and /he/join returned 200 in isolated Chrome at 1440×900 and 390×844. Mobile home/form screenshots opened and inspected. No overflow/page errors in captured states.

VQF-20261105-001 (P1): homepage uses the historical outdoor photo/text hero and Fishing promotion instead of the exact approved gray pair/current BNA scope. Requirement REQ-20261105-002.
VQF-20261105-002 (P1): form lacks program selector, required email and preferred area, and still asks availability. Requirement REQ-20261105-003.
VQF-20261105-003 (P2): mobile home exposes historical provider navigation. Blank photo regions in the initial full-page capture were caused by lazy image capture; they are not evidence of a user-visible image failure. Requirement REQ-20261105-007.
No private or production form submission was made. Ordinary-owner baseline was subsequently inspected after normal existing owner login on desktop/mobile; private evidence is .runtime/bna-interest-launch-20261105/owner-baseline.json and owner-before-*.private.png. No authentication bypass.
DoR for public implementation: source/packet/fidelity/surface/state/action gates specified and screenshots inspected. Owner/archive implementation remains gated by its actual current-state inspection and migration inventory.
Next: 02-landing-durable-interest.product-quality.json.
