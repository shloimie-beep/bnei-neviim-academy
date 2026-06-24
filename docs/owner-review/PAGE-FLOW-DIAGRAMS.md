# Page Flow Diagrams

These diagrams summarize the owner-review journeys verified locally in
`docs/owner-review/ROLE-FLOW-QA.md`.

## Public Website

```mermaid
flowchart LR
  Home["/"] --> School["/school"]
  Home --> Families["/parents"]
  Home --> Providers["/providers"]
  Home --> OneTime["/one-time"]
  Home --> Blog["/blog"]
  Home --> Register["/signup.html"]
  Home --> ParentLogin["/parent/login"]
  Home --> StudentLogin["/student/login"]
  Home --> ProviderLogin["/provider"]
  Home --> Assistant["Shared public website assistant"]
```
## One Time Member

```mermaid
flowchart LR
  Landing["/one-time"] --> MemberHome["/rabbi-member"]
  MemberHome --> Library["/member-library"]
  MemberHome --> Classroom["/one-time-classroom"]
  MemberHome --> Support["Questions/support on member home"]
  Library --> Classroom
  Classroom --> Support
  MemberHome --> Logout["/rabbi-member?logout=1"]
  MemberHome --> PublicHome["/"]
  MemberHome --> Assistant["one_time_member assistant surface"]
```

## Parent And Student

```mermaid
flowchart TB
  PublicHome["/"] --> ParentLogin["/parent/login"]
  PublicHome --> StudentLogin["/student/login"]
  ParentLogin --> ParentPortal["/parent"]
  StudentLogin --> StudentPortal["/student"]
  ParentPortal --> ParentChild["Linked-child dashboard and saved views"]
  ParentPortal --> ParentHelp["Scoped Assistant/help and tickets"]
  ParentPortal --> ParentLogout["Logout / login recovery"]
  StudentPortal --> StudentOwnData["Own schedule, goals, questions, worksheets"]
  StudentPortal --> StudentHelp["Student-safe Assistant/help"]
  StudentPortal --> StudentLogout["Logout / stale-code recovery"]
```

## Provider

```mermaid
flowchart LR
  Directory["/providers"] --> Profile["/providers/:slug"]
  Directory --> Join["/providers/join?onboard=provider"]
  Join --> ProviderLogin["/provider"]
  ProviderLogin --> ProviderWorkspace["Provider workspace"]
  ProviderWorkspace --> Studio["Service Provider Studio"]
  ProviderWorkspace --> Content["Courses / Library / Communications"]
  ProviderWorkspace --> Assistant["provider_workspace assistant surface"]
  Participant["/provider-participant"] --> MemberHome["/rabbi-member"]
  Participant --> AssistantMember["one_time_member assistant surface"]
```

## Operations / Super Admin

```mermaid
flowchart TB
  OpsLogin["/operations-login.html"] --> Ops["/operations"]
  Ops --> Dashboard["Dashboard"]
  Ops --> Tasks["Tasks / Decisions / Agent Work"]
  Ops --> Providers["Provider and One Time workspaces"]
  Ops --> Campaigns["Campaigns / Automations / Communications"]
  Ops --> ControlCenter["Assistant Control Center"]
  Ops --> Helper["Operations helper Ask / Search"]
  Ops --> Audit["Audit / watchdog / route evidence"]
```
