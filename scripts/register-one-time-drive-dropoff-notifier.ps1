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

$Trigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes $EveryMinutes) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$Action = New-ScheduledTaskAction `
  -Execute "wscript.exe" `
  -Argument "`"$Runner`" `"$Recipient`"" `
  -WorkingDirectory $RepoRoot

$Settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $Action `
  -Trigger $Trigger `
  -Settings $Settings `
  -Description "BNA One Time Drive drop-off email notifier" `
  -Force | Out-Null

Get-ScheduledTask -TaskName $TaskName | Select-Object TaskName,State,TaskPath
Get-ScheduledTaskInfo -TaskName $TaskName |
  Select-Object LastRunTime,NextRunTime,LastTaskResult,NumberOfMissedRuns
