param(
  [Parameter(Position = 0)]
  [string]$Profile = "bna",
  [switch]$Restart,
  [switch]$Stop,
  [switch]$Status
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $repoRoot ".runtime"
$safeProfile = ($Profile -replace '[^a-zA-Z0-9_-]', '-').ToLowerInvariant()
$profileSuffix = if ($safeProfile -and $safeProfile -ne "bna") { "-$safeProfile" } else { "" }
$outLog = Join-Path $runtimeDir "telegram-kimi-bridge$profileSuffix.out.log"
$errLog = Join-Path $runtimeDir "telegram-kimi-bridge$profileSuffix.err.log"
$lockFile = Join-Path $runtimeDir "telegram-kimi-bridge$profileSuffix.lock"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

function Assert-InRuntime {
  param([string]$PathValue)

  $runtimeFull = [System.IO.Path]::GetFullPath($runtimeDir)
  $targetFull = [System.IO.Path]::GetFullPath($PathValue)
  if (-not $targetFull.StartsWith($runtimeFull, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to touch path outside runtime directory: $targetFull"
  }
}

function Read-BridgeLock {
  if (-not (Test-Path -LiteralPath $lockFile)) {
    return $null
  }

  try {
    return Get-Content -LiteralPath $lockFile -Raw | ConvertFrom-Json
  } catch {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $archive = "$lockFile.corrupt-$stamp"
    Assert-InRuntime -PathValue $archive
    Move-Item -LiteralPath $lockFile -Destination $archive -Force
    Write-Host "Moved corrupt bridge lock to $archive" -ForegroundColor Yellow
    return $null
  }
}

function Test-PidAlive {
  param([int]$PidValue)

  if ($PidValue -le 0) {
    return $false
  }
  return [bool](Get-Process -Id $PidValue -ErrorAction SilentlyContinue)
}

function Move-BridgeLockAside {
  param([string]$Reason)

  if (-not (Test-Path -LiteralPath $lockFile)) {
    return $null
  }
  $safeReason = ($Reason -replace '[^a-zA-Z0-9_-]', '-').ToLowerInvariant()
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $archive = "$lockFile.$safeReason-$stamp"
  Assert-InRuntime -PathValue $archive
  Move-Item -LiteralPath $lockFile -Destination $archive -Force
  return $archive
}

function Get-LockPid {
  param($Lock)

  if (-not $Lock -or -not $Lock.pid) {
    return 0
  }
  return [int]$Lock.pid
}

function Show-BridgeStatus {
  $lock = Read-BridgeLock
  $pidValue = Get-LockPid -Lock $lock
  $alive = Test-PidAlive -PidValue $pidValue

  Write-Host "Telegram bridge status"
  Write-Host "  Profile: $Profile"
  Write-Host "  Running: $alive"
  Write-Host "  PID: $pidValue"
  Write-Host "  Runtime status: $($lock.runtime_status)"
  Write-Host "  Last error: $($lock.last_error_message)"
  Write-Host "  Lock: $lockFile"
  Write-Host "  Out log: $outLog"
  Write-Host "  Err log: $errLog"
}

function Set-EnvFromSecretFile {
  param(
    [string]$Name,
    [string]$RelativePath
  )

  $path = Join-Path $repoRoot $RelativePath
  if ((-not [Environment]::GetEnvironmentVariable($Name)) -and (Test-Path -LiteralPath $path)) {
    $value = (Get-Content -LiteralPath $path -Raw).Trim()
    if ($value) {
      [Environment]::SetEnvironmentVariable($Name, $value, "Process")
      Write-Host "Loaded $Name from $RelativePath" -ForegroundColor DarkGray
    }
  }
}

$lock = Read-BridgeLock
$existingPid = Get-LockPid -Lock $lock
$existingAlive = Test-PidAlive -PidValue $existingPid

if ($Status) {
  Show-BridgeStatus
  exit 0
}

if ($Stop -or $Restart) {
  if ($existingAlive) {
    Write-Host "Stopping Telegram bridge PID $existingPid" -ForegroundColor Yellow
    Stop-Process -Id $existingPid -Force
    Start-Sleep -Milliseconds 500
  }
  $archived = Move-BridgeLockAside -Reason "stopped"
  if ($archived) {
    Write-Host "Archived bridge lock at $archived" -ForegroundColor DarkGray
  }
  if ($Stop) {
    Show-BridgeStatus
    exit 0
  }
} elseif ($existingAlive) {
  Write-Host "Telegram bridge already running with PID $existingPid. Use -Restart to replace it." -ForegroundColor Green
  Show-BridgeStatus
  exit 0
} elseif ($existingPid -gt 0 -and (Test-Path -LiteralPath $lockFile)) {
  $archived = Move-BridgeLockAside -Reason "stale"
  Write-Host "Archived stale bridge lock for dead PID $existingPid at $archived" -ForegroundColor Yellow
}

Set-EnvFromSecretFile -Name "OPENAI_API_KEY" -RelativePath ".secrets/openai-api-key.txt"
Set-EnvFromSecretFile -Name "KIMI_API_KEY" -RelativePath ".secrets/kimi-api-key.txt"

$bridgeArgs = @("scripts/telegram-kimi-bridge.mjs")
if ($safeProfile -and $safeProfile -ne "bna") {
  $bridgeArgs += @("--profile", $safeProfile)
}

Write-Host "Starting Telegram -> Kimi bridge ($Profile) in $repoRoot" -ForegroundColor Cyan

$process = Start-Process node `
  -ArgumentList $bridgeArgs `
  -WorkingDirectory $repoRoot `
  -RedirectStandardOutput $outLog `
  -RedirectStandardError $errLog `
  -WindowStyle Hidden `
  -PassThru

Write-Host "Bridge PID: $($process.Id)" -ForegroundColor Green
Write-Host "Logs:" -ForegroundColor Yellow
Write-Host "  $outLog"
Write-Host "  $errLog"
