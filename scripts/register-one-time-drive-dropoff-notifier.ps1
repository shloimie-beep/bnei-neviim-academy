[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string]$Recipient = "sdratler@gmail.com",
  [ValidateRange(1, 1440)]
  [int]$EveryMinutes = 5,
  [string]$TaskName = "BNA One Time Drive Dropoff Email"
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$RuntimeDir = Join-Path $RepoRoot ".runtime"
$RuntimeConfigPath = Join-Path $RuntimeDir "one-time-drive-dropoff-notifier.json"
$WatcherScript = Join-Path $RepoRoot "scripts\one-time-drive-dropoff-email-watch.mjs"
$NodeCommand = (Get-Command node -ErrorAction Stop).Source

if (-not (Test-Path -LiteralPath $WatcherScript)) {
  throw "Email watcher script not found: $WatcherScript"
}

$config = [ordered]@{
  recipient = $Recipient
  everyMinutes = $EveryMinutes
  taskName = $TaskName
  script = "scripts/one-time-drive-dropoff-email-watch.mjs"
  updatedAt = (Get-Date).ToString("o")
}

if ($PSCmdlet.ShouldProcess($RuntimeConfigPath, "Write ignored notifier runtime config")) {
  New-Item -ItemType Directory -Force -Path $RuntimeDir | Out-Null
  $config | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $RuntimeConfigPath -Encoding UTF8
}

$action = New-ScheduledTaskAction `
  -Execute $NodeCommand `
  -Argument "`"$WatcherScript`" --json" `
  -WorkingDirectory $RepoRoot

$trigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes $EveryMinutes) `
  -RepetitionDuration ([TimeSpan]::FromDays(3650))

$principal = New-ScheduledTaskPrincipal `
  -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) `
  -LogonType Interactive `
  -RunLevel Limited

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -MultipleInstances IgnoreNew `
  -StartWhenAvailable

if ($PSCmdlet.ShouldProcess($TaskName, "Register scheduled task")) {
  Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Email-only One Time Drive dropoff notifier. Runs every $EveryMinutes minutes and starts scripts\one-time-drive-dropoff-email-watch.mjs." `
    -Force | Out-Null
}

Write-Host "Task name: $TaskName"
Write-Host "Schedule: every $EveryMinutes minute(s)"
Write-Host "Script: scripts\one-time-drive-dropoff-email-watch.mjs"
$RecipientConfigured = if ([string]::IsNullOrWhiteSpace($Recipient)) { "no" } else { "yes" }
Write-Host "Recipient configured: $RecipientConfigured"
Write-Host "Notifier mode: email-only"
