param(
  [switch]$Restart,
  [switch]$Once
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $repoRoot ".runtime\agent-fleet"
$lockPath = Join-Path $runtimeDir "supervisor.lock.json"
$outLog = Join-Path $runtimeDir "agent-fleet.out.log"
$errLog = Join-Path $runtimeDir "agent-fleet.err.log"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

function Get-LockPid {
  if (-not (Test-Path $lockPath)) {
    return $null
  }
  try {
    $lock = Get-Content $lockPath -Raw | ConvertFrom-Json
    return $lock.pid
  } catch {
    return $null
  }
}

$existingPid = Get-LockPid
if ($existingPid) {
  $existingProcess = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
  if ($existingProcess) {
    if (-not $Restart) {
      Write-Host "Agent fleet already running as PID $existingPid" -ForegroundColor Yellow
      Write-Host "Use -Restart to restart it." -ForegroundColor DarkGray
      exit 0
    }
    Write-Host "Stopping existing agent fleet PID $existingPid" -ForegroundColor Yellow
    Stop-Process -Id $existingPid -Force
    Start-Sleep -Seconds 2
  }
}

if ($Once) {
  Write-Host "Running one agent-fleet task in the foreground." -ForegroundColor Cyan
  & node "scripts/agent-fleet-supervisor.mjs" "--once" "--max-tasks" "1"
  exit $LASTEXITCODE
}

Write-Host "Starting autonomous BNA agent fleet in $repoRoot" -ForegroundColor Cyan

$process = Start-Process node `
  -ArgumentList "scripts/agent-fleet-supervisor.mjs --watch" `
  -WorkingDirectory $repoRoot `
  -RedirectStandardOutput $outLog `
  -RedirectStandardError $errLog `
  -WindowStyle Hidden `
  -PassThru

Write-Host "Agent fleet PID: $($process.Id)" -ForegroundColor Green
Write-Host "Logs:" -ForegroundColor Yellow
Write-Host "  $outLog"
Write-Host "  $errLog"
