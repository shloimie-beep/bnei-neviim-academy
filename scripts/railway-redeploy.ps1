$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "Checking Railway auth..." -ForegroundColor Cyan

try {
  $whoami = railway whoami 2>&1
  Write-Host $whoami -ForegroundColor Green
} catch {
  Write-Host "Railway CLI is not logged in on this machine yet." -ForegroundColor Red
  Write-Host "Run 'railway login' in this repo, finish the browser flow, then rerun this script." -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "Current Railway link:" -ForegroundColor Cyan
railway status

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

Write-Host ""
Write-Host "Uploading current local code to Railway..." -ForegroundColor Cyan
railway up -d --path-as-root -m "Manual deploy from local workspace" $deployRoot
