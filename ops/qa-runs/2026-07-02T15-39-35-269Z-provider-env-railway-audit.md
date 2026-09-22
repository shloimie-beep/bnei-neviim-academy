# Provider Env Railway Audit - 2026-07-02T15:39:35.268Z

This report never includes secret values.

External write performed: false
Secret values printed: false
Railway service: one-time-web
Railway environment: production
Railway attempted: true
Railway ok: true

## Summary

- required_count: 8
- required_matched: 8
- required_missing_in_railway: 0
- required_missing_locally: 0
- required_mismatched: 0

## Fields

### ZOOM_ACCOUNT_ID
- provider: zoom
- required_for_production: true
- status: matched
- local: present=true; source=keyholder; length=22; fingerprint=6b99b0f3b092
- railway: present=true; length=22; fingerprint=6b99b0f3b092

### ZOOM_CLIENT_ID
- provider: zoom
- required_for_production: true
- status: matched
- local: present=true; source=keyholder; length=22; fingerprint=eca43b944600
- railway: present=true; length=22; fingerprint=eca43b944600

### ZOOM_CLIENT_SECRET
- provider: zoom
- required_for_production: true
- status: matched
- local: present=true; source=keyholder; length=32; fingerprint=8a1762775556
- railway: present=true; length=32; fingerprint=8a1762775556

### VIMEO_CLIENT_ID
- provider: vimeo
- required_for_production: true
- status: matched
- local: present=true; source=keyholder; length=40; fingerprint=a1ce14a700bb
- railway: present=true; length=40; fingerprint=a1ce14a700bb

### VIMEO_CLIENT_SECRET
- provider: vimeo
- required_for_production: true
- status: matched
- local: present=true; source=keyholder; length=128; fingerprint=8bbbec6b699d
- railway: present=true; length=128; fingerprint=8bbbec6b699d

### VIMEO_ACCESS_TOKEN
- provider: vimeo
- required_for_production: false
- status: not_configured
- local: present=false; source=not configured; length=0; fingerprint=none
- railway: present=false; length=0; fingerprint=none

### RESEND_API_KEY
- provider: resend
- required_for_production: true
- status: matched
- local: present=true; source=keyholder; length=36; fingerprint=425f2ccf2704
- railway: present=true; length=36; fingerprint=425f2ccf2704

### RESEND_FROM_EMAIL
- provider: resend
- required_for_production: true
- status: matched
- local: present=true; source=keyholder; length=23; fingerprint=a64728a6a2bb
- railway: present=true; length=23; fingerprint=a64728a6a2bb

### RESEND_DOMAIN
- provider: resend
- required_for_production: true
- status: matched
- local: present=true; source=keyholder; length=18; fingerprint=b1af740e7c10
- railway: present=true; length=18; fingerprint=b1af740e7c10
