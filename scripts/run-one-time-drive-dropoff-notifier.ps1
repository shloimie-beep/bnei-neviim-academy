param(
  [switch]$Send,
  [switch]$MarkExisting,
  [switch]$TestEmail,
  [string]$Recipient = $env:ONE_TIME_DRIVE_DROPOFF_NOTIFY_TO
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ScriptPath = Join-Path $RepoRoot "scripts\notify-one-time-drive-dropoffs.mjs"
$LogDir = Join-Path $RepoRoot ".runtime\one-time-drive-dropoff-notifier"
$LogPath = Join-Path $LogDir "scheduled-task.log"
$LockPath = Join-Path $LogDir "notifier.lock"

$WorktreeSecrets = Join-Path $RepoRoot ".secrets"
$MainCheckoutSecrets = Join-Path $env:USERPROFILE "BNA v2.0\.secrets"
$ClientCandidate = Join-Path $WorktreeSecrets "google-oauth-client.json"
$TokenCandidate = Join-Path $WorktreeSecrets "google-refresh-token.txt"
if (-not (Test-Path -LiteralPath $ClientCandidate)) {
  $ClientCandidate = Join-Path $MainCheckoutSecrets "google-oauth-client.json"
}
if (-not (Test-Path -LiteralPath $TokenCandidate)) {
  $TokenCandidate = Join-Path $MainCheckoutSecrets "google-refresh-token.txt"
}
if (-not $env:GOOGLE_OAUTH_CLIENT_PATH) {
  $env:GOOGLE_OAUTH_CLIENT_PATH = $ClientCandidate
}
if (-not $env:GOOGLE_REFRESH_TOKEN_PATH) {
  $env:GOOGLE_REFRESH_TOKEN_PATH = $TokenCandidate
}
if ($Recipient) {
  $env:ONE_TIME_DRIVE_DROPOFF_NOTIFY_TO = $Recipient
}

$nodeArgs = @($ScriptPath)
if ($Send) { $nodeArgs += "--send" }
if ($MarkExisting) { $nodeArgs += "--mark-existing" }
if ($TestEmail) { $nodeArgs += "--test-email" }
if ($Recipient) {
  $nodeArgs += "--recipient"
  $nodeArgs += $Recipient
}

Push-Location $RepoRoot
try {
  New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
  if (Test-Path -LiteralPath $LockPath) {
    $lock = Get-Item -LiteralPath $LockPath
    if ($lock.LastWriteTime -gt (Get-Date).AddMinutes(-10)) {
      Add-Content -LiteralPath $LogPath -Value "$(Get-Date -Format o) skipped: previous notifier run still locked"
      exit 0
    }
  }
  Set-Content -LiteralPath $LockPath -Value "$(Get-Date -Format o) pid=$PID"
  $output = & node @nodeArgs 2>&1
  $exitCode = $LASTEXITCODE
  if ($output) {
    Add-Content -LiteralPath $LogPath -Value $output
  }
  if ($exitCode -ne 0) {
    throw "Notifier exited with code $exitCode"
  }
} finally {
  Remove-Item -LiteralPath $LockPath -Force -ErrorAction SilentlyContinue
  Pop-Location
}

exit 0
