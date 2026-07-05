param(
  [string]$TaskName = "BNA Agent Fleet",
  [int]$DelaySeconds = 60
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$Runner = Join-Path $RepoRoot "scripts\run-agent-fleet-startup.vbs"
$RuntimeDir = Join-Path $RepoRoot ".runtime\agent-fleet"
$StartupFolder = [Environment]::GetFolderPath("Startup")
$StartupRunner = Join-Path $StartupFolder "BNA-Agent-Fleet.vbs"

function Get-WindowsShortPath {
  param([string]$Path)

  try {
    $fso = New-Object -ComObject Scripting.FileSystemObject
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
      return $fso.GetFile($Path).ShortPath
    }

    if (Test-Path -LiteralPath $Path -PathType Container) {
      return $fso.GetFolder($Path).ShortPath
    }
  } catch {
    return $Path
  }

  return $Path
}

if (-not (Test-Path -LiteralPath $Runner)) {
  throw "Missing agent fleet runner at $Runner"
}

New-Item -ItemType Directory -Force -Path $RuntimeDir | Out-Null

$delay = [Math]::Max(0, $DelaySeconds)
$RunnerForTask = Get-WindowsShortPath -Path $Runner
if ($RunnerForTask -match "\s") {
  throw "Unable to resolve no-space scheduled-task runner path for $Runner"
}

$taskRun = "wscript.exe $RunnerForTask"
if ($delay -gt 0) {
  $delayMinutes = [Math]::Floor($delay / 60)
  $delaySecondsRemainder = $delay % 60
  $delayText = "$($delayMinutes.ToString().PadLeft(4, '0')):$($delaySecondsRemainder.ToString().PadLeft(2, '0'))"
}

$createArgs = @("/Create", "/TN", $TaskName, "/SC", "ONLOGON", "/TR", $taskRun, "/F")
if ($delay -gt 0) {
  $createArgs += @("/DELAY", $delayText)
}

& schtasks.exe @createArgs | Out-Null
if ($LASTEXITCODE -eq 0) {
  & schtasks.exe /Query /TN $TaskName /FO LIST
  exit 0
}

$scheduledTaskExitCode = $LASTEXITCODE

if (-not (Test-Path -LiteralPath $StartupFolder)) {
  New-Item -ItemType Directory -Force -Path $StartupFolder | Out-Null
}

$escapedRunner = $Runner.Replace('"', '""')
$startupScript = @"
Option Explicit

Dim shell, runner, command
Set shell = CreateObject("WScript.Shell")

runner = "$escapedRunner"
command = "wscript.exe " & Chr(34) & runner & Chr(34)

shell.Run command, 0, False
"@

Set-Content -LiteralPath $StartupRunner -Value $startupScript -Encoding ASCII

Write-Output "schtasks.exe failed with exit code $scheduledTaskExitCode; installed user Startup fallback instead."
Write-Output "Startup runner: $StartupRunner"
