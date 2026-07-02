# Plan

## Batch 1 - Register And Route Foundation

- `REQ-20260701-616`: repair protocol drift that blocks `npm run pqc:all`.
- `REQ-20260701-601`: implement/test host-based `onetimeonetime.com` root
  routing and `/one-time` fallback without replacing the BNA homepage.
- Produce domain/DNS route plan artifacts.

## Batch 2 - Signup, CRM, Access, Member Flow

- `REQ-20260701-602` through `REQ-20260701-606`.
- Must inspect existing signup/member/access code and avoid broad visual
  redesign until Product Quality Definition of Ready passes.
- Safe implementation may add backend tests and no-bulk confirmation email
  behavior for one signup.

## Batch 3 - Automation And Provider Setup

- `REQ-20260701-607` through `REQ-20260701-612`.
- Provider writes stay blocked unless exact safe test credentials and explicit
  test action are present.

## Batch 4 - Migration/Campaign/Verification

- `REQ-20260701-613` through `REQ-20260701-615`.
- Campaign remains blocked until final copy, final segment, and final send
  packet approval.
