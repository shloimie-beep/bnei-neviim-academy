$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $repoRoot ".runtime"
$outLog = Join-Path $runtimeDir "telegram-kimi-bridge.out.log"
$errLog = Join-Path $runtimeDir "telegram-kimi-bridge.err.log"

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
