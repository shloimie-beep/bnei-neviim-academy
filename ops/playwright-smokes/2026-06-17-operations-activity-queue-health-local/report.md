# Operations Activity / Queue Health Local Smoke

- Route: `/operations?view=tasks&section=activity&workspace=platform`
- Desktop screenshot: `desktop-operations-activity.png`
- Mobile screenshot: `mobile-operations-activity.png`
- Assertions: no horizontal overflow, Queue Health explainer present, grouped statuses visible, Activity detail/action summary present, mobile agent panel compact.

```json
{
  "desktop": {
    "activitySummaryText": "0 recent items Activity rows open the same detail/actions sheet as Tasks, with comments, timestamps, proof, queue audit status, and next actions. 0 comments visible in this filtered set.",
    "agentPanelRect": {
      "height": 103,
      "width": 981
    },
    "overflowX": 0,
    "queueExplainerText": "Queue Health tracks agent work, handoff files, ledger/changelog proof, stale work, duplicates, and safe requeue choices. It is not the human Pending lane. It answers whether machine work should keep moving, wait on a person/service, be verified, or stay untouched.",
    "queueGroups": [
      "working Working now 0",
      "waiting Waiting 0",
      "needs attention Needs attention 0",
      "verified done Verified done 0",
      "do not restart Do not restart 0",
      "review Review 0"
    ],
    "url": "http://localhost:8080/operations?view=tasks&section=activity&workspace=platform"
  },
  "mobile": {
    "activitySummaryRect": {
      "height": 120,
      "width": 329
    },
    "agentPanelRect": {
      "height": 242,
      "width": 355
    },
    "overflowX": 0,
    "queueGroupsRect": {
      "height": 150,
      "width": 329
    },
    "viewport": {
      "clientWidth": 375,
      "height": 844,
      "scrollWidth": 375,
      "width": 390
    }
  }
}
```
