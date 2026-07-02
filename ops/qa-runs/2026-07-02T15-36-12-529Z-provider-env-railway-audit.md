# Provider Env Railway Audit - 2026-07-02T15:36:12.528Z

This report never includes secret values.

External write performed: false
Secret values printed: false
Railway service: one-time-web
Railway environment: production
Railway attempted: true
Railway ok: true

## Summary

- required_count: 8
- required_matched: 0
- required_missing_in_railway: 7
- required_missing_locally: 1
- required_mismatched: 0

## Fields

### ZOOM_ACCOUNT_ID
- provider: zoom
- required_for_production: true
- status: railway_missing
- local: present=true; source=keyholder; length=22; fingerprint=6b99b0f3b092
- railway: present=false; length=0; fingerprint=none

### ZOOM_CLIENT_ID
- provider: zoom
- required_for_production: true
- status: railway_missing
- local: present=true; source=keyholder; length=22; fingerprint=eca43b944600
- railway: present=false; length=0; fingerprint=none

### ZOOM_CLIENT_SECRET
- provider: zoom
- required_for_production: true
- status: railway_missing
- local: present=true; source=keyholder; length=32; fingerprint=8a1762775556
- railway: present=false; length=0; fingerprint=none

### VIMEO_CLIENT_ID
- provider: vimeo
- required_for_production: true
- status: railway_missing
- local: present=true; source=keyholder; length=40; fingerprint=a1ce14a700bb
- railway: present=false; length=0; fingerprint=none

### VIMEO_CLIENT_SECRET
- provider: vimeo
- required_for_production: true
- status: railway_missing
- local: present=true; source=keyholder; length=128; fingerprint=8bbbec6b699d
- railway: present=false; length=0; fingerprint=none

### VIMEO_ACCESS_TOKEN
- provider: vimeo
- required_for_production: false
- status: not_configured
- local: present=false; source=not configured; length=0; fingerprint=none
- railway: present=false; length=0; fingerprint=none

### RESEND_API_KEY
- provider: resend
- required_for_production: true
- status: railway_missing
- local: present=true; source=keyholder; length=36; fingerprint=425f2ccf2704
- railway: present=false; length=0; fingerprint=none

### RESEND_FROM
- provider: resend
- required_for_production: true
- status: missing_required
- local: present=false; source=not configured; length=0; fingerprint=none
- railway: present=false; length=0; fingerprint=none

### RESEND_DOMAIN
- provider: resend
- required_for_production: true
- status: railway_missing
- local: present=true; source=keyholder; length=18; fingerprint=b1af740e7c10
- railway: present=false; length=0; fingerprint=none
