$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $repoRoot ".runtime"
$outLog = Join-Path $runtimeDir "telegram-kimi-bridge.out.log"
$errLog = Join-Path $runtimeDir "telegram-kimi-bridge.err.log"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

Write-Host "Starting Telegram -> Kimi bridge in $repoRoot" -ForegroundColor Cyan

$process = Start-Process node `
  -ArgumentList "scripts/telegram-kimi-bridge.mjs" `
  -WorkingDirectory $repoRoot `
  -RedirectStandardOutput $outLog `
  -RedirectStandardError $errLog `
  -WindowStyle Hidden `
  -PassThru

Write-Host "Bridge PID: $($process.Id)" -ForegroundColor Green
Write-Host "Logs:" -ForegroundColor Yellow
Write-Host "  $outLog"
Write-Host "  $errLog"
