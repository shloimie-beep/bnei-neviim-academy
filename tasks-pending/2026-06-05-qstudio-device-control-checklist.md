# QStudio Allowlist And Device-Control Checklist

Date: 2026-06-05
Task: #81 Document QStudio allowlist and device-control setup checklist
Status: Documentation-only handoff

## Goal

QStudio remains the app/category/content filtering layer. BNA should only control
whether a student tablet is usable, accountability-only, or temporarily approved
for broader access.

First MVP rule: tablet access is earned. The first use case is Wake Up On Time:
an admin/parent approves the goal, a timed access session starts, and the device
returns to locked/accountability-only state when the session expires.

Do not replace QStudio in this pass.

## Setup Inventory To Confirm

- Confirm the exact filter product and admin labels. Operator notes say
  `QStudio`; official public docs found during this pass match `Qustodio`
  behavior. Keep the repo wording as QStudio until the operator confirms.
- Confirm the student-facing URL to allowlist. Current likely production entry
  point is `https://bneineviimacademy.org/student.html`.
- Add any temporary Railway/test domain only while testing, then remove it from
  child devices before production.
- Decide whether the child entry point is a web page in Chrome/Firefox, a PWA,
  a future native Android wrapper, FreeKiosk, or Headwind launcher.
- Record each test tablet: student, device name, Android version, serial/asset
  tag if available, current QStudio profile, and whether factory reset is
  allowed for Device Owner enrollment.

## QStudio Allowlist Checklist

- In the child profile, add the BNA student URL/domain to the web allowlist:
  `bneineviimacademy.org` and `www.bneineviimacademy.org`.
- If the filter product is Qustodio and an allowed site is still blocked, test
  the stricter trusted/ignore-style rule only for the BNA domain.
- If BNA runs inside an installed app, native wrapper, or kiosk browser, add that
  app under app exceptions and set it to allowed.
- If the filter product is Qustodio on Android, test whether `Always allowed`
  keeps the BNA app/browser reachable during Lock Navigation, routines, or
  paused internet.
- Keep unsupported browsers blocked. A broad browser allowlist can become an
  escape hatch unless Headwind/FreeKiosk locks it to the BNA URL.
- Verify that QStudio still blocks a known disallowed category/app after the BNA
  exception is added.
- Do not use QStudio as the BNA lock/unlock authority. It should filter content;
  BNA/MDM should decide when the device is locked, accountability-only, approved,
  expired, or manually overridden.

## Device-Control Setup Checklist

### Android Baseline

- Use Android 9+ for the first real pilot if possible. This aligns with current
  Qustodio Android compatibility and modern MDM behavior.
- Use a factory-reset tablet for Device Owner / fully managed enrollment when
  testing Headwind MDM or FreeKiosk.
- Treat screen pinning as insufficient for this project. The intended state is a
  managed kiosk/lock-task mode where the student cannot simply exit.
- Preserve emergency access requirements, such as emergency calls or parent
  contact paths, according to the selected device/filter policy.

### Headwind MDM Primary Path

- Stand up or select the Headwind MDM server/admin account.
- Enroll the Android tablet in MDM/Device Owner mode, not only basic APK mode.
- Record the Headwind device ID and map it to the BNA student/device record.
- Create an `Accountability Only` configuration:
  - Allowed app or launcher opens only the BNA student check-in URL/app.
  - Kiosk/lock-task behavior is enabled.
  - Home, recent apps, status/notification shade, settings, and non-BNA apps are
    unavailable as much as the Android version permits.
- Create an `Approved Access` configuration:
  - Parent-approved normal apps can run, still filtered by QStudio.
  - Session end returns device to Accountability Only or Locked.
- Confirm Headwind can perform the needed operations for the pilot: lock device,
  kiosk mode, block unwanted apps, basic device info, and status checks.
- Investigate the exact server-side API/config-change path before promising
  automated locking from BNA. Headwind's Android-side library exposes managed
  state, settings, logs, push, device ID, and kiosk status, but BNA still needs a
  verified server/admin path for remote lock/unlock/config switching.

### FreeKiosk Fallback Path

- Use FreeKiosk only if Headwind kiosk behavior is not enough for the
  Accountability Only state.
- Confirm Android 8+, network access, and ADB access for Device Owner setup.
- Configure the BNA student check-in URL as the fullscreen website/web app.
- If using FreeKiosk REST/remote administration, keep it local/VPN-only with a
  strong password. Do not expose a tablet admin API publicly.
- Verify that exiting the kiosk, opening settings, opening other browsers, and
  using recents/home are blocked.

## BNA App-Side Requirements For The Later Build

- Add a device/access model before real integration:
  - `devices`: student, device name, platform, provider, status, last seen,
    notes.
  - `device_access_rules`: student/device, rule type, required goal, duration,
    schedule, enabled flag.
  - `device_access_sessions`: device, student, status, start/end, approved by,
    reason, provider result.
- Use these statuses in UI and provider calls: Locked, Accountability Only,
  Approved Access, Expired, Manual Override.
- Add a `DeviceControlProvider` adapter with:
  - `lockDevice(deviceId, reason)`
  - `unlockDevice(deviceId, durationMinutes, reason)`
  - `setAccountabilityOnly(deviceId)`
  - `getDeviceStatus(deviceId)`
- Start with a mock provider for dashboard/UI testing until the Headwind or
  FreeKiosk command path is proven on a real tablet.
- Keep provider credentials server-side only. Do not put MDM, kiosk, or filter
  admin keys in browser JavaScript, Telegram messages, screenshots, or repo docs.

## Open Questions And Blockers

- Is the actual filter product QStudio, Qustodio, or another tool with similar
  naming?
- What exact child URL should be permanent: `/student.html`, a future route, a
  PWA install, or a native Android wrapper?
- Will BNA use Chrome/Firefox for the student portal, or should a kiosk browser
  be the only allowed runtime?
- Does QStudio/Qustodio `Always allowed` keep the BNA app/browser reachable
  during the strictest filtered/paused state?
- Is there a spare Android tablet that can be factory reset for Device Owner
  enrollment?
- Where will Headwind MDM be hosted, and who owns its admin credentials?
- Can Headwind switch a device between Accountability Only and Approved Access
  through a documented server/admin API, or does the first MVP require manual
  MDM config switching?
- What are the parent policy defaults: access duration, manual override rules,
  offline grace period, emergency access, and what counts as Wake Up On Time
  approval?

## Exact Next Verification Steps

1. On a test Android 9+ tablet, install/configure QStudio and assign it to a
   child profile.
2. Add `bneineviimacademy.org` and `www.bneineviimacademy.org` to the web
   allowlist, plus the temporary Railway/test domain if needed.
3. If using an app/kiosk browser/native wrapper, add it to app exceptions and
   mark it allowed or always allowed where available.
4. Put QStudio in its strictest expected state: filtered categories active,
   unsupported browsers blocked, and paused/lock-navigation behavior enabled if
   that will be used.
5. Open the BNA student portal and verify login/access-code flow, API calls,
   static assets, and check-in submission still work.
6. In the same strict state, verify a known blocked site/category/app is still
   blocked.
7. Factory reset the test tablet and enroll it in Headwind MDM Device Owner/MDM
   mode.
8. Create and apply the Headwind `Accountability Only` configuration, then
   verify only the BNA app/URL can be used.
9. Create and apply the Headwind `Approved Access` configuration, then verify
   normal approved apps open while QStudio continues filtering content.
10. Switch back to `Accountability Only` and confirm the device relocks after a
    timed/manual test.
11. If Headwind cannot meet the lock requirements, provision FreeKiosk in Device
    Owner mode with the BNA URL and repeat the kiosk escape tests.
12. Capture the exact working setup: Android version, enrollment method,
    provider, package/app names, URLs, screenshots if useful, and any API or
    manual steps needed for BNA's future `DeviceControlProvider`.

## References Consulted

- Qustodio website allow/ignore rules:
  https://help.qustodio.com/hc/en-us/articles/360005216737-How-do-I-block-or-allow-websites-using-Qustodio
- Qustodio app exceptions and Android Always allowed behavior:
  https://help.qustodio.com/hc/en-us/articles/360005216777-How-do-I-block-Games-and-apps-with-Qustodio
- Qustodio Android compatibility and limitations:
  https://help.qustodio.com/hc/en-us/articles/360005219878-I-m-having-trouble-with-Qustodio-for-Android
- Headwind MDM capabilities:
  https://h-mdm.com/headwind-mdm-capabilities/
- Headwind MDM Android-side API reference:
  https://h-mdm.com/headwind-mdm-api/
- Android lock task mode:
  https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode
- Android fully managed device requirements:
  https://developers.google.com/android/work/requirements/fully-managed-device
- FreeKiosk documentation:
  https://freekiosk.app/docs/
