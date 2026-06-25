param(
  [switch]$Restart,
  [switch]$Once,
  [switch]$Stop,
  [switch]$Status,
  [switch]$OpenLog,
  [int]$MaxStartAttempts = 3
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$RuntimeDir = Join-Path $RepoRoot ".runtime\agent-fleet"
$LockPath = Join-Path $RuntimeDir "supervisor.lock.json"
$StartupPath = Join-Path $RuntimeDir "startup.json"
$OutLog = Join-Path $RuntimeDir "agent-fleet.out.log"
$ErrLog = Join-Path $RuntimeDir "agent-fleet.err.log"

New-Item -ItemType Directory -Force -Path $RuntimeDir | Out-Null

function Get-CurrentLoginName {
  try {
    return [Security.Principal.WindowsIdentity]::GetCurrent().Name
  } catch {
    return $env:USERNAME
  }
}

function Get-Lock {
  if (!(Test-Path $LockPath)) { return $null }
  try {
    return Get-Content -Raw -Path $LockPath | ConvertFrom-Json
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

function Write-StartupMetadata([int]$PidValue, [int]$Attempt) {
  $metadata = [ordered]@{
    script = "scripts/start-agent-fleet.ps1"
    pid = $PidValue
    mode = if ($Once) { "once" } else { "watch" }
    login_context = Get-CurrentLoginName
    machine = $env:COMPUTERNAME
    max_start_attempts = $MaxStartAttempts
    attempt = $Attempt
    started_at = (Get-Date).ToString("o")
    stdout_log = $OutLog
    stderr_log = $ErrLog
    log_policy = "Local runtime logs only; do not paste secrets or raw credentials into chat, tracked files, or screenshots."
  }
  $metadata | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 -Path $StartupPath
}

function Write-StatusReport {
  $lock = Get-Lock
  $pidValue = if ($lock -and $lock.pid) { [int]$lock.pid } else { 0 }
  $running = Test-PidAlive $pidValue
  Write-Host "Agent fleet status"
  Write-Host "  Running: $running"
  Write-Host "  PID: $pidValue"
  Write-Host "  Login context: $(Get-CurrentLoginName)"
  Write-Host "  Lock: $LockPath"
  Write-Host "  Startup metadata: $StartupPath"
  Write-Host "  Out log: $OutLog"
  Write-Host "  Err log: $ErrLog"
}

function Stop-ExistingFleet {
  $lock = Get-Lock
  $pidValue = if ($lock -and $lock.pid) { [int]$lock.pid } else { 0 }
  if ($pidValue -and (Test-PidAlive $pidValue)) {
    Write-Host "Stopping agent fleet PID $pidValue" -ForegroundColor Yellow
    Stop-Process -Id $pidValue -Force
    Start-Sleep -Seconds 1
  }
  if (Test-Path $LockPath) {
    Remove-Item -LiteralPath $LockPath -Force
  }
}

if ($OpenLog) {
  foreach ($logPath in @($OutLog, $ErrLog)) {
    if (!(Test-Path $logPath)) {
      New-Item -ItemType File -Force -Path $logPath | Out-Null
    }
  }
  Start-Process -FilePath "notepad.exe" -ArgumentList $OutLog
  Start-Process -FilePath "notepad.exe" -ArgumentList $ErrLog
  exit 0
}

if ($Status) {
  Write-StatusReport
  exit 0
}

if ($Stop) {
  Stop-ExistingFleet
  Write-StatusReport
  exit 0
}

$existingLock = Get-Lock
$existingPid = if ($existingLock -and $existingLock.pid) { [int]$existingLock.pid } else { 0 }
if ($existingPid -and (Test-PidAlive $existingPid)) {
  if (!$Restart) {
    Write-Host "Agent fleet already running as PID $existingPid" -ForegroundColor Yellow
    Write-Host "Use -Restart to restart it, -Status to inspect, -Stop to stop, or -OpenLog to inspect logs." -ForegroundColor DarkGray
    exit 0
  }
  Stop-ExistingFleet
} elseif (Test-Path $LockPath) {
  Remove-Item -LiteralPath $LockPath -Force
}

if ($Once) {
  Write-Host "Running one agent-fleet task in the foreground as $(Get-CurrentLoginName)." -ForegroundColor Cyan
  Push-Location $RepoRoot
  try {
    node "scripts/agent-fleet-supervisor.mjs" "--once" "--max-tasks" "1"
  } finally {
    Pop-Location
  }
  exit $LASTEXITCODE
}

Write-Host "Starting autonomous BNA agent fleet in $RepoRoot as $(Get-CurrentLoginName)" -ForegroundColor Cyan
$attemptLimit = [Math]::Max(1, [Math]::Min($MaxStartAttempts, 10))
for ($attempt = 1; $attempt -le $attemptLimit; $attempt++) {
  $process = Start-Process -FilePath "node" `
    -ArgumentList "scripts/agent-fleet-supervisor.mjs --watch" `
    -WorkingDirectory $RepoRoot `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog `
    -WindowStyle Hidden `
    -PassThru
  Start-Sleep -Seconds 2
  if (Test-PidAlive $process.Id) {
    Write-StartupMetadata -PidValue $process.Id -Attempt $attempt
    Write-Host "Agent fleet PID: $($process.Id)" -ForegroundColor Green
    Write-Host "Logs:" -ForegroundColor Yellow
    Write-Host "  $OutLog"
    Write-Host "  $ErrLog"
    exit 0
  }
  Write-Host "Agent fleet start attempt $attempt failed." -ForegroundColor Yellow
}

Write-Host "Agent fleet failed to start after $attemptLimit attempts. Inspect logs with -OpenLog." -ForegroundColor Red
exit 1
