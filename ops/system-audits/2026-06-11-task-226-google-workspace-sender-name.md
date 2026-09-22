# Task 226 - Google Workspace Sender Display Name

Checked: 2026-06-11T10:24:20+03:00

## Result

Codex could not safely change the Google Workspace/Gmail sender identity from
the available credentials. The current OAuth token only has:

- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/documents`
- `https://www.googleapis.com/auth/spreadsheets`

Read-only Gmail profile and Send-As checks returned insufficient-scope errors.
No test emails were sent.

## App-Side Findings

- `server.js` sends mail through the Gmail API in `sendGmailMessage`.
- Production Railway variables for the app service are already:
  - `GMAIL_FROM=office@bneineviimacademy.org`
  - `GMAIL_FROM_NAME=Bnei Neviim Academy Office`
- Therefore the live BNA app is already configured to create the raw From
  header as `Bnei Neviim Academy Office <office@bneineviimacademy.org>`.
- The remaining `Office P` display is most likely coming from Google Workspace
  / Gmail identity settings for the sending account or alias, or from a
  recipient-side Gmail/Google Contacts saved-name override.

## Owner Steps

Use Gmail first because it directly controls the sender name shown by Gmail's
Send mail as identity.

1. Sign in to Gmail as the account that owns `office@bneineviimacademy.org`.
2. Open Settings, then See all settings.
3. Open the Accounts and Import tab, or Accounts tab.
4. Under Send mail as, find `office@bneineviimacademy.org`.
5. Click Edit info.
6. Set the display name to `Bnei Neviim Academy Office`.
7. Save changes.
8. If `office@bneineviimacademy.org` is not the default sender, click Make
   default next to it.

If Gmail does not allow the name change, or if `Office P` still appears for new
messages after the Gmail Send mail as setting is corrected, use Google Admin:

1. Sign in at `admin.google.com` with a Workspace admin account.
2. Go to Directory, then Users.
3. Search for the account behind `office@bneineviimacademy.org`.
4. Use Rename user or Update user.
5. Change the first/last profile name to a business-name split such as:
   - First name: `Bnei Neviim Academy`
   - Last name: `Office`
6. Click Update User, then Done.

Google's admin docs say this profile name appears in emails the user sends, but
does not change the email address or sign-in username.

## If Codex Should Patch This Through API Later

The OAuth app would need to be intentionally expanded and reauthorized with
`https://www.googleapis.com/auth/gmail.settings.basic`, then Codex could list
and patch Gmail `users.settings.sendAs` display names. The current BNA Google
scope registry does not include that scope, so this would be a code/config
change plus an owner re-consent step. For this one-time sender-name correction,
the Gmail/Admin UI path is lower risk.

## References

- Gmail Help, Change the name on your Gmail account:
  https://support.google.com/mail/answer/8158
- Gmail Help, Send emails from a different address or alias:
  https://support.google.com/mail/answer/22370
- Google Workspace Admin Help, Change a user's profile name:
  https://knowledge.workspace.google.com/admin/users/change-a-users-profile-name
- Gmail API, SendAs resource and patch scope:
  https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.settings.sendAs
  https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.settings.sendAs/patch
