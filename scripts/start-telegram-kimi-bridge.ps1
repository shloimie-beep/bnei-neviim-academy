$Profile = if ($args.Count -gt 0 -and $args[0]) { $args[0] } else { "bna" }
$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $repoRoot ".runtime"
$safeProfile = ($Profile -replace '[^a-zA-Z0-9_-]', '-').ToLowerInvariant()
$profileSuffix = if ($safeProfile -and $safeProfile -ne "bna") { "-$safeProfile" } else { "" }
$outLog = Join-Path $runtimeDir "telegram-kimi-bridge$profileSuffix.out.log"
$errLog = Join-Path $runtimeDir "telegram-kimi-bridge$profileSuffix.err.log"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

function Set-EnvFromSecretFile {
  param(
    [string]$Name,
    [string]$RelativePath
  )

  $path = Join-Path $repoRoot $RelativePath
  if ((-not [Environment]::GetEnvironmentVariable($Name)) -and (Test-Path $path)) {
    $value = (Get-Content $path -Raw).Trim()
    if ($value) {
      [Environment]::SetEnvironmentVariable($Name, $value, "Process")
      Write-Host "Loaded $Name from $RelativePath" -ForegroundColor DarkGray
    }
  }
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
