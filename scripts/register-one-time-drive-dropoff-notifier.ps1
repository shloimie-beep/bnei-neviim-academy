param(
  [string]$Recipient = "sdratler@gmail.com",
  [int]$EveryMinutes = 5,
  [string]$TaskName = "BNA One Time Drive Dropoff Email"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$Runner = Join-Path $RepoRoot "scripts\run-one-time-drive-dropoff-notifier.vbs"
$LogDir = Join-Path $RepoRoot ".runtime\one-time-drive-dropoff-notifier"

if (-not (Test-Path -LiteralPath $Runner)) {
  throw "Missing notifier runner at $Runner"
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$taskRun = "wscript.exe `"$Runner`" `"$Recipient`""
& schtasks.exe /Create /TN $TaskName /SC MINUTE /MO $EveryMinutes /TR $taskRun /F | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "schtasks.exe failed with exit code $LASTEXITCODE"
}

& schtasks.exe /Query /TN $TaskName /FO LIST
