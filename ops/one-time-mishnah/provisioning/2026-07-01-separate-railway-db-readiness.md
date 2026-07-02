# One Time Railway Provision Check

Generated: 2026-07-02T10:21:20.402Z

Apply requested: false
External write performed: false
Secret values printed: false
Target domain: join.onetimeonetime.com
Target guard ready: false
Apply allowed: false

## Required Variables

- PUBLIC_SITE_MODE: missing
- DEFAULT_WORKSPACE_KEY: missing
- DEFAULT_PROJECT_KEY: missing
- ONE_TIME_PUBLIC_DOMAIN: missing

## Blocked Live Actions

- create_or_select_railway_project
- create_or_select_railway_service
- create_or_attach_postgres_database
- write_railway_variables
- add_custom_domain
- trigger_deploy_or_promote
- mutate_dns

Blocker: Missing explicit One Time Railway service target. PUBLIC_SITE_MODE missing; expected one_time. DEFAULT_WORKSPACE_KEY missing; expected rabbi_sheller_provider. DEFAULT_PROJECT_KEY missing; expected one_time_mishnah_class. ONE_TIME_PUBLIC_DOMAIN missing; expected join.onetimeonetime.com.
