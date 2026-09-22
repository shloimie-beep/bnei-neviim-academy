// Generated from src/platform/instances/one-time-rabbi-dashboard-ia.js. Do not edit by hand.
window.ONE_TIME_RABBI_DASHBOARD_IA = {
  "workspace_key": "rabbi_sheller_provider",
  "project_key": "one_time_mishnah_class",
  "main_modules": [
    {
      "id": "overview_package_status",
      "label": "Overview / Package Status",
      "short_label": "Overview",
      "default_section": "package_status",
      "operations_view": "service_providers"
    },
    {
      "id": "members_crm",
      "label": "Members / CRM",
      "short_label": "Members",
      "default_section": "members",
      "operations_view": "contacts"
    },
    {
      "id": "classes_content",
      "label": "Classes & Content",
      "short_label": "Content",
      "default_section": "library",
      "operations_view": "content"
    },
    {
      "id": "live_class_schedule",
      "label": "Live Class",
      "short_label": "Live",
      "default_section": "overview",
      "operations_view": "live_classes"
    },
    {
      "id": "program_schedule",
      "label": "Schedule",
      "short_label": "Schedule",
      "default_section": "provider",
      "operations_view": "calendar"
    },
    {
      "id": "community_questions",
      "label": "Community",
      "short_label": "Community",
      "default_section": "overview",
      "operations_view": "community"
    },
    {
      "id": "communications",
      "label": "Communications",
      "short_label": "Comms",
      "default_section": "announcements",
      "operations_view": "communications"
    },
    {
      "id": "communication_agents",
      "label": "Communication Agents",
      "short_label": "Agents",
      "default_section": "knowledge",
      "operations_view": "agents"
    },
    {
      "id": "automations",
      "label": "Automations",
      "short_label": "Auto",
      "default_section": "enrollment",
      "operations_view": "automations"
    },
    {
      "id": "payments_access",
      "label": "Payments & Access",
      "short_label": "Payments",
      "default_section": "trial_offer",
      "operations_view": "service_providers"
    },
    {
      "id": "tasks_decisions",
      "label": "Tasks & Decisions",
      "short_label": "Tasks",
      "default_section": "decisions",
      "operations_view": "tasks"
    },
    {
      "id": "reporting_readiness",
      "label": "Reporting",
      "short_label": "Reports",
      "default_section": "provider",
      "operations_view": "api_usage"
    },
    {
      "id": "connector_setup",
      "label": "Connectors",
      "short_label": "Connectors",
      "default_section": "readiness",
      "operations_view": "integrations"
    },
    {
      "id": "settings_setup",
      "label": "Settings / Setup",
      "short_label": "Setup",
      "default_section": "workspace",
      "operations_view": "settings"
    }
  ],
  "section_subsection_map": {
    "overview_package_status": {
      "label": "Overview / Package Status",
      "subsections": [
        {
          "id": "package_status",
          "label": "Package Status",
          "source_view": "service_providers",
          "source_section": "overview"
        },
        {
          "id": "launch_readiness",
          "label": "Launch Readiness",
          "source_view": "service_providers",
          "source_section": "launch"
        },
        {
          "id": "role_links",
          "label": "Role Links",
          "source_view": "service_providers",
          "source_section": "access_checklist"
        },
        {
          "id": "owner_actions",
          "label": "Owner Actions",
          "source_view": "service_providers",
          "source_section": "integration_audit"
        }
      ]
    },
    "members_crm": {
      "label": "Members / CRM",
      "subsections": [
        {
          "id": "members",
          "label": "Members",
          "source_view": "contacts",
          "source_section": "members"
        },
        {
          "id": "leads",
          "label": "Leads",
          "source_view": "contacts",
          "source_section": "leads"
        },
        {
          "id": "parents_students",
          "label": "Parents & Students",
          "source_view": "contacts",
          "source_section": "people"
        },
        {
          "id": "support_questions",
          "label": "Support & Questions",
          "source_view": "community",
          "source_section": "questions"
        }
      ]
    },
    "classes_content": {
      "label": "Classes & Content",
      "subsections": [
        {
          "id": "library",
          "label": "Library",
          "source_view": "content",
          "source_section": "one_time_library"
        },
        {
          "id": "meeting_drops",
          "label": "Meeting Drops",
          "source_view": "content",
          "source_section": "meetings"
        },
        {
          "id": "source_prep",
          "label": "Source Prep",
          "source_view": "content",
          "source_section": "research"
        },
        {
          "id": "bundles",
          "label": "Bundles",
          "source_view": "content",
          "source_section": "bundles"
        }
      ]
    },
    "live_class_schedule": {
      "label": "Live Class",
      "subsections": [
        {
          "id": "overview",
          "label": "Overview",
          "source_view": "live_classes",
          "source_section": "overview"
        },
        {
          "id": "schedule",
          "label": "Class Schedule",
          "source_view": "service_providers",
          "source_section": "schedule"
        },
        {
          "id": "worksheets",
          "label": "Worksheets",
          "source_view": "service_providers",
          "source_section": "worksheets"
        },
        {
          "id": "questions",
          "label": "Questions",
          "source_view": "service_providers",
          "source_section": "questions"
        }
      ]
    },
    "program_schedule": {
      "label": "Schedule",
      "subsections": [
        {
          "id": "provider",
          "label": "Program Schedule",
          "source_view": "calendar",
          "source_section": "provider"
        },
        {
          "id": "today",
          "label": "Today",
          "source_view": "calendar",
          "source_section": "today"
        },
        {
          "id": "week",
          "label": "Week",
          "source_view": "calendar",
          "source_section": "week"
        },
        {
          "id": "classes",
          "label": "Class Sessions",
          "source_view": "calendar",
          "source_section": "classes"
        }
      ]
    },
    "community_questions": {
      "label": "Community",
      "subsections": [
        {
          "id": "overview",
          "label": "Overview",
          "source_view": "community",
          "source_section": "overview"
        },
        {
          "id": "courses",
          "label": "Courses",
          "source_view": "community",
          "source_section": "courses"
        },
        {
          "id": "questions",
          "label": "Questions",
          "source_view": "community",
          "source_section": "questions"
        },
        {
          "id": "approvals",
          "label": "Approvals",
          "source_view": "community",
          "source_section": "approvals"
        }
      ]
    },
    "communications": {
      "label": "Communications",
      "subsections": [
        {
          "id": "announcements",
          "label": "Announcements",
          "source_view": "communications",
          "source_section": "announcements"
        },
        {
          "id": "email_previews",
          "label": "Email Previews",
          "source_view": "communications",
          "source_section": "email"
        },
        {
          "id": "support_replies",
          "label": "Support Replies",
          "source_view": "communications",
          "source_section": "support"
        },
        {
          "id": "no_send_log",
          "label": "No-send Log",
          "source_view": "communications",
          "source_section": "drafts"
        }
      ]
    },
    "communication_agents": {
      "label": "Communication Agents",
      "subsections": [
        {
          "id": "knowledge",
          "label": "Knowledge",
          "source_view": "agents",
          "source_section": "knowledge"
        },
        {
          "id": "channels",
          "label": "Channels",
          "source_view": "agents",
          "source_section": "channels"
        },
        {
          "id": "test",
          "label": "Test",
          "source_view": "agents",
          "source_section": "test"
        },
        {
          "id": "activity",
          "label": "Activity",
          "source_view": "agents",
          "source_section": "activity"
        }
      ]
    },
    "automations": {
      "label": "Automations",
      "subsections": [
        {
          "id": "enrollment",
          "label": "Enrollment",
          "source_view": "automations",
          "source_section": "enrollment"
        },
        {
          "id": "class_reminders",
          "label": "Class Reminders",
          "source_view": "automations",
          "source_section": "classes"
        },
        {
          "id": "content_publishing",
          "label": "Content Publishing",
          "source_view": "automations",
          "source_section": "content"
        },
        {
          "id": "retention_support",
          "label": "Retention & Support",
          "source_view": "automations",
          "source_section": "support"
        }
      ]
    },
    "payments_access": {
      "label": "Payments & Access",
      "subsections": [
        {
          "id": "trial_offer",
          "label": "Trial & Offer",
          "source_view": "service_providers",
          "source_section": "tiers"
        },
        {
          "id": "billing_readiness",
          "label": "Billing Readiness",
          "source_view": "service_providers",
          "source_section": "commercial"
        },
        {
          "id": "member_access",
          "label": "Member Access",
          "source_view": "service_providers",
          "source_section": "access"
        },
        {
          "id": "access_blockers",
          "label": "Access Blockers",
          "source_view": "service_providers",
          "source_section": "access_checklist"
        }
      ]
    },
    "tasks_decisions": {
      "label": "Tasks & Decisions",
      "subsections": [
        {
          "id": "decisions",
          "label": "Decisions",
          "source_view": "tasks",
          "source_section": "decisions"
        },
        {
          "id": "tasks",
          "label": "Tasks",
          "source_view": "tasks",
          "source_section": "tasks"
        },
        {
          "id": "pending_external",
          "label": "Pending External",
          "source_view": "tasks",
          "source_section": "pending"
        },
        {
          "id": "activity",
          "label": "Activity",
          "source_view": "tasks",
          "source_section": "activity"
        }
      ]
    },
    "reporting_readiness": {
      "label": "Reporting",
      "subsections": [
        {
          "id": "provider",
          "label": "Provider Reporting",
          "source_view": "api_usage",
          "source_section": "provider"
        },
        {
          "id": "overview",
          "label": "Overview",
          "source_view": "api_usage",
          "source_section": "overview"
        },
        {
          "id": "errors",
          "label": "Errors",
          "source_view": "api_usage",
          "source_section": "errors"
        },
        {
          "id": "budgets",
          "label": "Budgets / Limits",
          "source_view": "api_usage",
          "source_section": "budgets"
        }
      ]
    },
    "connector_setup": {
      "label": "Connectors",
      "subsections": [
        {
          "id": "readiness",
          "label": "Readiness",
          "source_view": "integrations",
          "source_section": "readiness"
        },
        {
          "id": "owner_setup",
          "label": "Owner Setup",
          "source_view": "integrations",
          "source_section": "owner_setup"
        },
        {
          "id": "google",
          "label": "Google",
          "source_view": "integrations",
          "source_section": "google"
        },
        {
          "id": "communications",
          "label": "Communications",
          "source_view": "integrations",
          "source_section": "communications"
        }
      ]
    },
    "settings_setup": {
      "label": "Settings / Setup",
      "subsections": [
        {
          "id": "workspace",
          "label": "Workspace",
          "source_view": "settings",
          "source_section": "workspace"
        },
        {
          "id": "users_access",
          "label": "Users & Access",
          "source_view": "settings",
          "source_section": "users_access"
        },
        {
          "id": "brand_site",
          "label": "Brand & Site",
          "source_view": "settings",
          "source_section": "branding"
        },
        {
          "id": "integrations",
          "label": "Integration Setup",
          "source_view": "settings",
          "source_section": "external_apps"
        },
        {
          "id": "guardrails",
          "label": "Guardrails",
          "source_view": "settings",
          "source_section": "automations"
        }
      ]
    }
  },
  "review_links": {
    "one_time_landing": {
      "label": "One Time Landing",
      "route": "/one-time",
      "access": "public_review",
      "audience_scope": "public_customer_review"
    },
    "operations_workspace": {
      "label": "Rabbi Operations Workspace",
      "route": "/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview",
      "access": "operations_auth_required",
      "audience_scope": "internal_private_operations"
    },
    "provider_review": {
      "label": "Provider Review",
      "route": "/provider.html?review=one-time",
      "access": "synthetic_review",
      "audience_scope": "provider_review"
    },
    "parent_review": {
      "label": "Parent Review",
      "route": "/parent.html?review=one-time",
      "access": "synthetic_review",
      "audience_scope": "parent_review"
    },
    "student_review": {
      "label": "Student Review",
      "route": "/student.html?review=one-time",
      "access": "synthetic_review",
      "audience_scope": "student_review"
    },
    "classroom_review": {
      "label": "Classroom Review",
      "route": "/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS",
      "access": "synthetic_review",
      "audience_scope": "classroom_review"
    },
    "email_preview": {
      "label": "Email Previews",
      "route": "/one-time-email-review.html",
      "access": "preview_only",
      "audience_scope": "email_preview"
    }
  },
  "internal_modules": {
    "platform_support_label": "Platform Support",
    "demoted": [
      {
        "id": "watchdog",
        "label": "Watchdog",
        "visibility": "platform_support_demoted",
        "surface": "platform_support"
      },
      {
        "id": "pipelines",
        "label": "Pipelines",
        "visibility": "platform_support_demoted",
        "surface": "platform_support"
      },
      {
        "id": "internal_dialogue",
        "label": "Internal Dialogue",
        "visibility": "platform_support_demoted",
        "surface": "platform_support"
      }
    ],
    "hidden": [
      {
        "id": "raw_implementation_handoffs",
        "label": "Implementation handoff files",
        "visibility": "hidden_from_rabbi_dashboard"
      },
      {
        "id": "tasks_pending_requirement_registers",
        "label": "Internal requirement registers",
        "visibility": "hidden_from_rabbi_dashboard"
      }
    ]
  },
  "top_rail_model": {
    "overview_package_status": {
      "module_id": "overview_package_status",
      "label": "Overview / Package Status",
      "default_item": "package_status",
      "items": [
        {
          "id": "package_status",
          "label": "Package Status",
          "source_view": "service_providers",
          "source_section": "overview"
        },
        {
          "id": "launch_readiness",
          "label": "Launch Readiness",
          "source_view": "service_providers",
          "source_section": "launch"
        },
        {
          "id": "role_links",
          "label": "Role Links",
          "source_view": "service_providers",
          "source_section": "access_checklist"
        },
        {
          "id": "owner_actions",
          "label": "Owner Actions",
          "source_view": "service_providers",
          "source_section": "integration_audit"
        }
      ]
    },
    "members_crm": {
      "module_id": "members_crm",
      "label": "Members / CRM",
      "default_item": "members",
      "items": [
        {
          "id": "members",
          "label": "Members",
          "source_view": "contacts",
          "source_section": "members"
        },
        {
          "id": "leads",
          "label": "Leads",
          "source_view": "contacts",
          "source_section": "leads"
        },
        {
          "id": "parents_students",
          "label": "Parents & Students",
          "source_view": "contacts",
          "source_section": "people"
        },
        {
          "id": "support_questions",
          "label": "Support & Questions",
          "source_view": "community",
          "source_section": "questions"
        }
      ]
    },
    "classes_content": {
      "module_id": "classes_content",
      "label": "Classes & Content",
      "default_item": "library",
      "items": [
        {
          "id": "library",
          "label": "Library",
          "source_view": "content",
          "source_section": "one_time_library"
        },
        {
          "id": "meeting_drops",
          "label": "Meeting Drops",
          "source_view": "content",
          "source_section": "meetings"
        },
        {
          "id": "source_prep",
          "label": "Source Prep",
          "source_view": "content",
          "source_section": "research"
        },
        {
          "id": "bundles",
          "label": "Bundles",
          "source_view": "content",
          "source_section": "bundles"
        }
      ]
    },
    "live_class_schedule": {
      "module_id": "live_class_schedule",
      "label": "Live Class",
      "default_item": "overview",
      "items": [
        {
          "id": "overview",
          "label": "Overview",
          "source_view": "live_classes",
          "source_section": "overview"
        },
        {
          "id": "schedule",
          "label": "Class Schedule",
          "source_view": "service_providers",
          "source_section": "schedule"
        },
        {
          "id": "worksheets",
          "label": "Worksheets",
          "source_view": "service_providers",
          "source_section": "worksheets"
        },
        {
          "id": "questions",
          "label": "Questions",
          "source_view": "service_providers",
          "source_section": "questions"
        }
      ]
    },
    "program_schedule": {
      "module_id": "program_schedule",
      "label": "Schedule",
      "default_item": "provider",
      "items": [
        {
          "id": "provider",
          "label": "Program Schedule",
          "source_view": "calendar",
          "source_section": "provider"
        },
        {
          "id": "today",
          "label": "Today",
          "source_view": "calendar",
          "source_section": "today"
        },
        {
          "id": "week",
          "label": "Week",
          "source_view": "calendar",
          "source_section": "week"
        },
        {
          "id": "classes",
          "label": "Class Sessions",
          "source_view": "calendar",
          "source_section": "classes"
        }
      ]
    },
    "community_questions": {
      "module_id": "community_questions",
      "label": "Community",
      "default_item": "overview",
      "items": [
        {
          "id": "overview",
          "label": "Overview",
          "source_view": "community",
          "source_section": "overview"
        },
        {
          "id": "courses",
          "label": "Courses",
          "source_view": "community",
          "source_section": "courses"
        },
        {
          "id": "questions",
          "label": "Questions",
          "source_view": "community",
          "source_section": "questions"
        },
        {
          "id": "approvals",
          "label": "Approvals",
          "source_view": "community",
          "source_section": "approvals"
        }
      ]
    },
    "communications": {
      "module_id": "communications",
      "label": "Communications",
      "default_item": "announcements",
      "items": [
        {
          "id": "announcements",
          "label": "Announcements",
          "source_view": "communications",
          "source_section": "announcements"
        },
        {
          "id": "email_previews",
          "label": "Email Previews",
          "source_view": "communications",
          "source_section": "email"
        },
        {
          "id": "support_replies",
          "label": "Support Replies",
          "source_view": "communications",
          "source_section": "support"
        },
        {
          "id": "no_send_log",
          "label": "No-send Log",
          "source_view": "communications",
          "source_section": "drafts"
        }
      ]
    },
    "communication_agents": {
      "module_id": "communication_agents",
      "label": "Communication Agents",
      "default_item": "knowledge",
      "items": [
        {
          "id": "knowledge",
          "label": "Knowledge",
          "source_view": "agents",
          "source_section": "knowledge"
        },
        {
          "id": "channels",
          "label": "Channels",
          "source_view": "agents",
          "source_section": "channels"
        },
        {
          "id": "test",
          "label": "Test",
          "source_view": "agents",
          "source_section": "test"
        },
        {
          "id": "activity",
          "label": "Activity",
          "source_view": "agents",
          "source_section": "activity"
        }
      ]
    },
    "automations": {
      "module_id": "automations",
      "label": "Automations",
      "default_item": "enrollment",
      "items": [
        {
          "id": "enrollment",
          "label": "Enrollment",
          "source_view": "automations",
          "source_section": "enrollment"
        },
        {
          "id": "class_reminders",
          "label": "Class Reminders",
          "source_view": "automations",
          "source_section": "classes"
        },
        {
          "id": "content_publishing",
          "label": "Content Publishing",
          "source_view": "automations",
          "source_section": "content"
        },
        {
          "id": "retention_support",
          "label": "Retention & Support",
          "source_view": "automations",
          "source_section": "support"
        }
      ]
    },
    "payments_access": {
      "module_id": "payments_access",
      "label": "Payments & Access",
      "default_item": "trial_offer",
      "items": [
        {
          "id": "trial_offer",
          "label": "Trial & Offer",
          "source_view": "service_providers",
          "source_section": "tiers"
        },
        {
          "id": "billing_readiness",
          "label": "Billing Readiness",
          "source_view": "service_providers",
          "source_section": "commercial"
        },
        {
          "id": "member_access",
          "label": "Member Access",
          "source_view": "service_providers",
          "source_section": "access"
        },
        {
          "id": "access_blockers",
          "label": "Access Blockers",
          "source_view": "service_providers",
          "source_section": "access_checklist"
        }
      ]
    },
    "tasks_decisions": {
      "module_id": "tasks_decisions",
      "label": "Tasks & Decisions",
      "default_item": "decisions",
      "items": [
        {
          "id": "decisions",
          "label": "Decisions",
          "source_view": "tasks",
          "source_section": "decisions"
        },
        {
          "id": "tasks",
          "label": "Tasks",
          "source_view": "tasks",
          "source_section": "tasks"
        },
        {
          "id": "pending_external",
          "label": "Pending External",
          "source_view": "tasks",
          "source_section": "pending"
        },
        {
          "id": "activity",
          "label": "Activity",
          "source_view": "tasks",
          "source_section": "activity"
        }
      ]
    },
    "reporting_readiness": {
      "module_id": "reporting_readiness",
      "label": "Reporting",
      "default_item": "provider",
      "items": [
        {
          "id": "provider",
          "label": "Provider Reporting",
          "source_view": "api_usage",
          "source_section": "provider"
        },
        {
          "id": "overview",
          "label": "Overview",
          "source_view": "api_usage",
          "source_section": "overview"
        },
        {
          "id": "errors",
          "label": "Errors",
          "source_view": "api_usage",
          "source_section": "errors"
        },
        {
          "id": "budgets",
          "label": "Budgets / Limits",
          "source_view": "api_usage",
          "source_section": "budgets"
        }
      ]
    },
    "connector_setup": {
      "module_id": "connector_setup",
      "label": "Connectors",
      "default_item": "readiness",
      "items": [
        {
          "id": "readiness",
          "label": "Readiness",
          "source_view": "integrations",
          "source_section": "readiness"
        },
        {
          "id": "owner_setup",
          "label": "Owner Setup",
          "source_view": "integrations",
          "source_section": "owner_setup"
        },
        {
          "id": "google",
          "label": "Google",
          "source_view": "integrations",
          "source_section": "google"
        },
        {
          "id": "communications",
          "label": "Communications",
          "source_view": "integrations",
          "source_section": "communications"
        }
      ]
    },
    "settings_setup": {
      "module_id": "settings_setup",
      "label": "Settings / Setup",
      "default_item": "workspace",
      "items": [
        {
          "id": "workspace",
          "label": "Workspace",
          "source_view": "settings",
          "source_section": "workspace"
        },
        {
          "id": "users_access",
          "label": "Users & Access",
          "source_view": "settings",
          "source_section": "users_access"
        },
        {
          "id": "brand_site",
          "label": "Brand & Site",
          "source_view": "settings",
          "source_section": "branding"
        },
        {
          "id": "integrations",
          "label": "Integration Setup",
          "source_view": "settings",
          "source_section": "external_apps"
        },
        {
          "id": "guardrails",
          "label": "Guardrails",
          "source_view": "settings",
          "source_section": "automations"
        }
      ]
    }
  },
  "mobile_label_rules": {
    "breakpoint_px": 430,
    "max_tab_label_chars": 14,
    "prefer_short_labels": true,
    "module_short_labels": {
      "overview_package_status": "Overview",
      "members_crm": "Members",
      "classes_content": "Content",
      "live_class_schedule": "Live",
      "program_schedule": "Schedule",
      "community_questions": "Community",
      "communications": "Comms",
      "communication_agents": "Agents",
      "automations": "Auto",
      "payments_access": "Payments",
      "tasks_decisions": "Tasks",
      "reporting_readiness": "Reports",
      "connector_setup": "Connectors",
      "settings_setup": "Setup"
    },
    "status_chip_short_labels": {
      "review_mode": "Scoped",
      "no_send": "Approval",
      "no_charge": "Billing",
      "no_external_write": "Guarded"
    }
  },
  "status_chip_model": [
    {
      "id": "review_mode",
      "label": "Scoped workspace",
      "short_label": "Scoped",
      "tone": "info",
      "meaning": "The Rabbi / One Time workspace is active and separated from school or platform records."
    },
    {
      "id": "no_send",
      "label": "Send approval required",
      "short_label": "Approval",
      "tone": "locked",
      "meaning": "Email, WhatsApp, SMS, and announcement sends require approval before live use."
    },
    {
      "id": "no_charge",
      "label": "Billing approval required",
      "short_label": "Billing",
      "tone": "locked",
      "meaning": "Checkout, billing, trial conversion, and access changes stay preview-only."
    },
    {
      "id": "no_external_write",
      "label": "Owner approval required",
      "short_label": "Guarded",
      "tone": "locked",
      "meaning": "Connector, media, access, billing, and provider-account changes require owner approval."
    }
  ],
  "acceptance_routes": [
    {
      "key": "one_time_landing",
      "label": "One Time Landing",
      "route": "/one-time",
      "workspace_key": "rabbi_sheller_provider",
      "project_key": "one_time_mishnah_class",
      "access": "public_review",
      "audience_scope": "public_customer_review",
      "external_write_performed": false,
      "exposes_private_operations": false,
      "public_customer_surface": true
    },
    {
      "key": "operations_workspace",
      "label": "Rabbi Operations Workspace",
      "route": "/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview",
      "workspace_key": "rabbi_sheller_provider",
      "project_key": "one_time_mishnah_class",
      "access": "operations_auth_required",
      "audience_scope": "internal_private_operations",
      "external_write_performed": false,
      "exposes_private_operations": true,
      "public_customer_surface": false
    },
    {
      "key": "provider_review",
      "label": "Provider Review",
      "route": "/provider.html?review=one-time",
      "workspace_key": "rabbi_sheller_provider",
      "project_key": "one_time_mishnah_class",
      "access": "synthetic_review",
      "audience_scope": "provider_review",
      "external_write_performed": false,
      "exposes_private_operations": false,
      "public_customer_surface": false
    },
    {
      "key": "parent_review",
      "label": "Parent Review",
      "route": "/parent.html?review=one-time",
      "workspace_key": "rabbi_sheller_provider",
      "project_key": "one_time_mishnah_class",
      "access": "synthetic_review",
      "audience_scope": "parent_review",
      "external_write_performed": false,
      "exposes_private_operations": false,
      "public_customer_surface": false
    },
    {
      "key": "student_review",
      "label": "Student Review",
      "route": "/student.html?review=one-time",
      "workspace_key": "rabbi_sheller_provider",
      "project_key": "one_time_mishnah_class",
      "access": "synthetic_review",
      "audience_scope": "student_review",
      "external_write_performed": false,
      "exposes_private_operations": false,
      "public_customer_surface": false
    },
    {
      "key": "classroom_review",
      "label": "Classroom Review",
      "route": "/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS",
      "workspace_key": "rabbi_sheller_provider",
      "project_key": "one_time_mishnah_class",
      "access": "synthetic_review",
      "audience_scope": "classroom_review",
      "external_write_performed": false,
      "exposes_private_operations": false,
      "public_customer_surface": false
    },
    {
      "key": "email_preview",
      "label": "Email Previews",
      "route": "/one-time-email-review.html",
      "workspace_key": "rabbi_sheller_provider",
      "project_key": "one_time_mishnah_class",
      "access": "preview_only",
      "audience_scope": "email_preview",
      "external_write_performed": false,
      "exposes_private_operations": false,
      "public_customer_surface": false
    }
  ]
};
