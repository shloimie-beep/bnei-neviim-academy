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

Write-Host "Checking Railway auth..." -ForegroundColor Cyan

$tokenFile = Join-Path $repoRoot ".secrets\railway-token.txt"
if (-not $env:RAILWAY_TOKEN -and -not $env:RAILWAY_API_TOKEN -and (Test-Path $tokenFile)) {
  $env:RAILWAY_TOKEN = (Get-Content -LiteralPath $tokenFile -Raw).Trim()
}

if ($env:RAILWAY_TOKEN -and $env:RAILWAY_API_TOKEN) {
  Write-Host "Both RAILWAY_TOKEN and RAILWAY_API_TOKEN are set. Railway only allows one auth mode at a time." -ForegroundColor Red
  exit 1
}

$usingProjectToken = [bool]$env:RAILWAY_TOKEN
if ($usingProjectToken) {
  Write-Host "Using project-scoped RAILWAY_TOKEN from environment/local secrets." -ForegroundColor Green
} else {
  try {
    $whoami = railway whoami 2>&1
    Write-Host $whoami -ForegroundColor Green
  } catch {
    Write-Host "Railway CLI is not logged in and no project token was found." -ForegroundColor Red
    Write-Host "Use a project token in .secrets\railway-token.txt, or run 'railway login' for account auth." -ForegroundColor Yellow
    exit 1
  }
}

Write-Host ""
Write-Host "Current Railway link:" -ForegroundColor Cyan
Invoke-Railway status

$railwayService = $env:RAILWAY_SERVICE_NAME
if (-not $railwayService) { $railwayService = "skillful-motivation" }
$railwayEnvironment = $env:RAILWAY_ENVIRONMENT
if (-not $railwayEnvironment) { $railwayEnvironment = "production" }

Write-Host ""
Write-Host "Target Railway service: $railwayService / $railwayEnvironment" -ForegroundColor Cyan
Invoke-Railway service status --service $railwayService --environment $railwayEnvironment

Write-Host ""
Write-Host "Preparing deploy bundle..." -ForegroundColor Cyan

$deployRoot = Join-Path $repoRoot ".deploy-railway"
if (Test-Path $deployRoot) {
  Remove-Item -LiteralPath $deployRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $deployRoot | Out-Null
Copy-Item -LiteralPath (Join-Path $repoRoot "server.js") -Destination $deployRoot
Copy-Item -LiteralPath (Join-Path $repoRoot "package.json") -Destination $deployRoot
Copy-Item -LiteralPath (Join-Path $repoRoot "railway.json") -Destination $deployRoot
Copy-Item -LiteralPath (Join-Path $repoRoot "public") -Destination $deployRoot -Recurse
if (Test-Path (Join-Path $repoRoot "src")) {
  Copy-Item -LiteralPath (Join-Path $repoRoot "src") -Destination $deployRoot -Recurse
}
if (Test-Path (Join-Path $repoRoot "tasks-pending")) {
  Copy-Item -LiteralPath (Join-Path $repoRoot "tasks-pending") -Destination $deployRoot -Recurse
}
if (Test-Path (Join-Path $repoRoot "agents")) {
  Copy-Item -LiteralPath (Join-Path $repoRoot "agents") -Destination $deployRoot -Recurse
}

Write-Host ""
Write-Host "Uploading current local code to Railway..." -ForegroundColor Cyan
Invoke-Railway up -d `
  --service $railwayService `
  --environment $railwayEnvironment `
  --path-as-root `
  -m "Manual deploy from local workspace" `
  $deployRoot
