$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Invoke-Railway {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $RailwayArgs
  )

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $output = & railway @RailwayArgs 2>&1
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
  $output |
    Where-Object { $_ -notmatch '^Unable to parse config file, regenerating$' } |
    ForEach-Object { Write-Host $_ }

  if ($exitCode -ne 0) {
    throw "railway $($RailwayArgs -join ' ') failed with exit code $exitCode"
  }
}

Write-Host "BNA Railway Doctor" -ForegroundColor Cyan

$tokenFile = Join-Path $repoRoot ".secrets\railway-token.txt"
if (-not $env:RAILWAY_TOKEN -and -not $env:RAILWAY_API_TOKEN -and (Test-Path $tokenFile)) {
  $env:RAILWAY_TOKEN = (Get-Content -LiteralPath $tokenFile -Raw).Trim()
}

if ($env:RAILWAY_TOKEN -and $env:RAILWAY_API_TOKEN) {
  throw "Both RAILWAY_TOKEN and RAILWAY_API_TOKEN are set. Clear one of them before running Railway commands."
}

$usingProjectToken = [bool]$env:RAILWAY_TOKEN
if ($usingProjectToken) {
  Write-Host "Using project-scoped RAILWAY_TOKEN from environment/local secrets." -ForegroundColor Green
} else {
  try {
    $whoami = railway whoami 2>&1
    Write-Host $whoami -ForegroundColor Green
  } catch {
    throw "No RAILWAY_TOKEN found and Railway CLI account auth is unavailable. Add a project token to .secrets\railway-token.txt or run 'railway login'."
  }
}

$globalRailwayDir = Join-Path $HOME ".railway"
$globalConfig = Join-Path $globalRailwayDir "config.json"
if (Test-Path $globalConfig) {
  try {
    Get-Content -LiteralPath $globalConfig -Raw | ConvertFrom-Json | Out-Null
    Write-Host "OK global Railway config is valid JSON." -ForegroundColor Green
  } catch {
    $backup = "$globalConfig.bak-$(Get-Date -Format yyyyMMdd-HHmmss)"
    Copy-Item -LiteralPath $globalConfig -Destination $backup -Force
    $json = "{`n  `"projects`": {}`n}`n"
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($globalConfig, $json, $utf8NoBom)
    Write-Host "Repaired invalid global Railway config. Backup: $backup" -ForegroundColor Yellow
  }
} else {
  New-Item -ItemType Directory -Force -Path $globalRailwayDir | Out-Null
  $json = "{`n  `"projects`": {}`n}`n"
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($globalConfig, $json, $utf8NoBom)
  Write-Host "Created global Railway config placeholder." -ForegroundColor Yellow
}

$railwayService = $env:RAILWAY_SERVICE_NAME
if (-not $railwayService) { $railwayService = "skillful-motivation" }
$railwayEnvironment = $env:RAILWAY_ENVIRONMENT
if (-not $railwayEnvironment) { $railwayEnvironment = "production" }

Write-Host "Checking Railway access..." -ForegroundColor Cyan
Invoke-Railway status

Write-Host "Checking app service target..." -ForegroundColor Cyan
Invoke-Railway service status --service $railwayService --environment $railwayEnvironment

Write-Host "Railway doctor passed for $railwayService / $railwayEnvironment." -ForegroundColor Green
