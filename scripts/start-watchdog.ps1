param(
  [switch]$Restart,
  [switch]$Once
)

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$RuntimeDir = Join-Path $Root ".runtime\watchdog"
$LockPath = Join-Path $RuntimeDir "watchdog.lock.json"
$OutLog = Join-Path $RuntimeDir "watchdog.out.log"
$ErrLog = Join-Path $RuntimeDir "watchdog.err.log"

New-Item -ItemType Directory -Force -Path $RuntimeDir | Out-Null

function Get-LockPid {
  if (!(Test-Path $LockPath)) { return $null }
  try {
    $lock = Get-Content -Raw -Path $LockPath | ConvertFrom-Json
    return [int]$lock.pid
  } catch {
    return $null
  }
}

function Test-PidAlive([int]$PidValue) {
  if (!$PidValue) { return $false }
  try {
    $null = Get-Process -Id $PidValue -ErrorAction Stop
    return $true
  } catch {
    return $false
  }
}

$existingPid = Get-LockPid
if ($existingPid -and (Test-PidAlive $existingPid)) {
  if (!$Restart) {
    Write-Host "Agent watchdog is already running as PID $existingPid"
    exit 0
  }
  Write-Host "Stopping existing agent watchdog PID $existingPid"
  Stop-Process -Id $existingPid -Force
  Start-Sleep -Seconds 1
}

if (Test-Path $LockPath) {
  Remove-Item -LiteralPath $LockPath -Force
}

if ($Once) {
  Push-Location $Root
  try {
    node scripts/agent-fleet-supervisor.mjs --watchdog --once
  } finally {
    Pop-Location
  }
  exit $LASTEXITCODE
}

$arguments = "scripts/agent-fleet-supervisor.mjs --watchdog --watch"
$process = Start-Process -FilePath "node" `
  -ArgumentList $arguments `
  -WorkingDirectory $Root `
  -RedirectStandardOutput $OutLog `
  -RedirectStandardError $ErrLog `
  -WindowStyle Hidden `
  -PassThru

Write-Host "Started agent watchdog PID $($process.Id)"
Write-Host "Logs: $OutLog"
