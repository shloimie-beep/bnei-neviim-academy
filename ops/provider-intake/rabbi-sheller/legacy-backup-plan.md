# Legacy Backup Plan

Before any code import or migration:

1. Confirm source access.
2. Export or clone the existing app into a private audit location.
3. Save a read-only snapshot of schema/config without secrets.
4. Record current production URL, host, runtime, and deploy path.
5. Record how to restore the current app if an experiment fails.
6. Do not modify Rabbi's live production app from BNA unless Shloimie and Rabbi approve the exact action.

Backup evidence to collect:

- Repo/Replit snapshot reference.
- Database/schema export reference.
- Vimeo/library export/map reference.
- Payment/customer export reference.
- Restore owner and restore steps.
