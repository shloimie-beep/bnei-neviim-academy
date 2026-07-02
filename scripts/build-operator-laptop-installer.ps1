param(
  [string]$OutputRoot = "install-packages",
  [string]$RepoUrl = "https://github.com/shloimie-beep/bnei-neviim-academy.git",
  [switch]$IncludeSourceSnapshot
)

$ErrorActionPreference = "Stop"

function ConvertTo-JsonEnvTemplate {
  param([Parameter(Mandatory=$true)][string]$EnvExamplePath)

  $envTemplate = [ordered]@{}
  foreach ($line in (Get-Content -LiteralPath $EnvExamplePath)) {
    $trim = $line.Trim()
    if (-not $trim -or $trim.StartsWith("#") -or -not $trim.Contains("=")) { continue }
    $parts = $trim.Split("=", 2)
    $key = $parts[0].Trim()
    $value = $parts[1]
    if ($key -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') { continue }
    $envTemplate[$key] = $value
  }
  return $envTemplate
}

function New-SafeBootstrapPackage {
  param(
    [Parameter(Mandatory=$true)][string]$RepoRoot,
    [Parameter(Mandatory=$true)][string]$OutputPath
  )

  $envExample = Join-Path $RepoRoot ".env.example"
  if (-not (Test-Path -LiteralPath $envExample)) {
    throw "Missing .env.example."
  }

  $envTemplate = ConvertTo-JsonEnvTemplate -EnvExamplePath $envExample
  $package = [ordered]@{
    package_type = "bna_operator_bootstrap"
    encrypted = $false
    download_kind = "safe_non_secret"
    created_at = (Get-Date).ToUniversalTime().ToString("o")
    body = [ordered]@{
      includes_secret_values = $false
      env_template = $envTemplate
      setup_commands = @(
        "npm install",
        "npm run doctor",
        "npm run smoke:local -- --skip-tests",
        "npm run dev"
      )
      notes = @(
        "This safe bootstrap contains blank/template env values only.",
        "Use Operations > Team/Admin > Operator Setup for encrypted one-time secret export.",
        "Do not run Telegram polling or agent fleet from multiple machines at the same time."
      )
    }
  }
  $package | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
}

function Write-InstallerFiles {
  param(
    [Parameter(Mandatory=$true)][string]$PackageDir,
    [Parameter(Mandatory=$true)][string]$RepoUrl
  )

  $cmd = @'
@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-BNA-Laptop.ps1"
pause
'@
  Set-Content -LiteralPath (Join-Path $PackageDir "START-HERE-Install-BNA.cmd") -Value $cmd -Encoding ASCII

  $readme = @"
BNA Operator Laptop Installer
=============================

Run START-HERE-Install-BNA.cmd on the Windows laptop.

What it does:
- Installs/checks Git, Node.js LTS, and npm using winget when available.
- Clones or updates the BNA GitHub repo in `%USERPROFILE%\BNA v2.0`.
- Runs npm install.
- Imports a safe no-secret BNA bootstrap template into `.env.local` if one is missing.
- Creates Start/Doctor/Smoke/Sync launchers and an Operations desktop shortcut.
- Opens local Operations at http://localhost:8080/operations.

What it does NOT include:
- No API keys.
- No database URL.
- No Railway token.
- No `.secrets` folder.
- No real `.env.local` values.

To add real secrets later, use Operations > Team/Admin > Operator Setup to create an encrypted one-time secret export. Send the passphrase separately and never in the same email as the package.

Sync model:
- Laptop changes sync to GitHub by running Sync-BNA.cmd.
- Desktop gets laptop changes by running git pull from the desktop repo.
- The sync helper blocks obvious secret/generated paths and runs the repo secret audit before push.

Telegram warning:
- Run Telegram polling and the agent fleet on only one machine/server at a time.
"@
  Set-Content -LiteralPath (Join-Path $PackageDir "README-FIRST.txt") -Value $readme -Encoding UTF8

  $installer = @"
param(
  [string]`$InstallDir = "`$env:USERPROFILE\BNA v2.0",
  [string]`$RepoUrl = "$RepoUrl",
  [switch]`$SkipStart
)

`$ErrorActionPreference = "Stop"
`$packageRoot = Split-Path -Parent `$MyInvocation.MyCommand.Path
`$payloadDir = Join-Path `$packageRoot "payload"

function Write-Step([string]`$Message) {
  Write-Host ""
  Write-Host "==> `$Message" -ForegroundColor Cyan
}

function Refresh-Path {
  `$machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  `$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  `$env:Path = "`$machinePath;`$userPath"
}

function Ensure-Command {
  param(
    [Parameter(Mandatory=`$true)][string]`$Command,
    [Parameter(Mandatory=`$true)][string]`$WingetId,
    [Parameter(Mandatory=`$true)][string]`$DisplayName
  )

  if (Get-Command `$Command -ErrorAction SilentlyContinue) {
    Write-Host "`$DisplayName found." -ForegroundColor Green
    return
  }

  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "`$DisplayName is missing and winget is not available. Install `$DisplayName manually, then run this installer again."
  }

  Write-Step "Installing `$DisplayName"
  winget install --id `$WingetId -e --source winget --accept-package-agreements --accept-source-agreements
  Refresh-Path
  if (-not (Get-Command `$Command -ErrorAction SilentlyContinue)) {
    throw "`$DisplayName still was not found after install. Close and reopen PowerShell, then run this installer again."
  }
}

function Write-Launcher {
  param(
    [Parameter(Mandatory=`$true)][string]`$Name,
    [Parameter(Mandatory=`$true)][string]`$Body
  )
  Set-Content -LiteralPath (Join-Path `$InstallDir "`$Name.ps1") -Value `$Body -Encoding ASCII
  `$cmdText = "@echo off`r`npowershell -NoProfile -ExecutionPolicy Bypass -File ""%~dp0`$Name.ps1""`r`npause`r`n"
  Set-Content -LiteralPath (Join-Path `$InstallDir "`$Name.cmd") -Value `$cmdText -Encoding ASCII
}

function New-Shortcut {
  param([string]`$Name, [string]`$Target)
  `$desktop = [Environment]::GetFolderPath("Desktop")
  `$shortcutPath = Join-Path `$desktop "`$Name.lnk"
  `$shell = New-Object -ComObject WScript.Shell
  `$shortcut = `$shell.CreateShortcut(`$shortcutPath)
  `$shortcut.TargetPath = `$Target
  `$shortcut.WorkingDirectory = Split-Path -Parent `$Target
  `$shortcut.Save()
}

Write-Step "Preparing prerequisites"
Refresh-Path
Ensure-Command -Command "git" -WingetId "Git.Git" -DisplayName "Git"
Ensure-Command -Command "node" -WingetId "OpenJS.NodeJS.LTS" -DisplayName "Node.js LTS"
Ensure-Command -Command "npm" -WingetId "OpenJS.NodeJS.LTS" -DisplayName "npm"

Write-Step "Installing or updating BNA source"
if (Test-Path -LiteralPath (Join-Path `$InstallDir ".git")) {
  Set-Location `$InstallDir
  `$dirty = git status --porcelain
  if (`$dirty) {
    Write-Warning "Existing BNA repo has local changes. Skipping pull so work is not overwritten."
  } else {
    git pull --ff-only
    if (`$LASTEXITCODE -ne 0) { throw "git pull failed." }
  }
} elseif (Test-Path -LiteralPath `$InstallDir) {
  throw "Install folder already exists but is not a Git repo: `$InstallDir"
} else {
  `$parent = Split-Path -Parent `$InstallDir
  if (-not (Test-Path -LiteralPath `$parent)) { New-Item -ItemType Directory -Force -Path `$parent | Out-Null }
  git clone `$RepoUrl `$InstallDir
  if (`$LASTEXITCODE -ne 0) { throw "git clone failed." }
}

Write-Step "Installing npm dependencies"
Set-Location `$InstallDir
npm install
if (`$LASTEXITCODE -ne 0) { throw "npm install failed." }

Write-Step "Creating local folders"
foreach (`$dir in @(".runtime", "logs", "renders", "media-drop\inbox", "media-inbox")) {
  New-Item -ItemType Directory -Force -Path (Join-Path `$InstallDir `$dir) | Out-Null
}

Write-Step "Creating safe local env template"
`$safeBootstrap = Join-Path `$payloadDir "bna-operator-bootstrap-safe.json"
if ((Test-Path -LiteralPath `$safeBootstrap) -and -not (Test-Path -LiteralPath (Join-Path `$InstallDir ".env.local"))) {
  New-Item -ItemType Directory -Force -Path (Join-Path `$InstallDir ".runtime") | Out-Null
  `$localBootstrap = Join-Path `$InstallDir ".runtime\bna-operator-bootstrap-safe.json"
  Copy-Item -LiteralPath `$safeBootstrap -Destination `$localBootstrap -Force
  node scripts/import-operator-bootstrap.mjs `$localBootstrap
  if (`$LASTEXITCODE -ne 0) { throw "Safe bootstrap import failed." }
} elseif (-not (Test-Path -LiteralPath (Join-Path `$InstallDir ".env.local"))) {
  npm run setup:local
  if (`$LASTEXITCODE -ne 0) { throw "npm run setup:local failed." }
} else {
  Write-Host ".env.local already exists; not overwritten." -ForegroundColor Yellow
}

Write-Step "Creating launch and sync scripts"
`$startApp = @'
`$ErrorActionPreference = "Stop"
Set-Location `$PSScriptRoot
npm run dev
'@
Write-Launcher -Name "Start-BNA-App" -Body `$startApp

`$doctor = @'
`$ErrorActionPreference = "Stop"
Set-Location `$PSScriptRoot
npm run doctor
'@
Write-Launcher -Name "Run-BNA-Doctor" -Body `$doctor

`$smoke = @'
`$ErrorActionPreference = "Stop"
Set-Location `$PSScriptRoot
npm run smoke:local -- --skip-tests
'@
Write-Launcher -Name "Run-BNA-Smoke" -Body `$smoke

`$startAll = @'
`$ErrorActionPreference = "Stop"
`$Root = `$PSScriptRoot
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File ```"`$Root\Start-BNA-App.ps1```"" -WindowStyle Minimized
Start-Sleep -Seconds 6
Start-Process "http://localhost:8080/operations"
Write-Host "BNA app started. Telegram and agent fleet are intentionally not auto-started."
'@
Write-Launcher -Name "Start-BNA-All" -Body `$startAll

`$syncSource = Join-Path `$payloadDir "Sync-BNA.ps1"
if (Test-Path -LiteralPath `$syncSource) {
  Copy-Item -LiteralPath `$syncSource -Destination (Join-Path `$InstallDir "Sync-BNA.ps1") -Force
}
`$syncCmd = "@echo off`r`npowershell -NoProfile -ExecutionPolicy Bypass -File ""%~dp0Sync-BNA.ps1"" %*`r`npause`r`n"
Set-Content -LiteralPath (Join-Path `$InstallDir "Sync-BNA.cmd") -Value `$syncCmd -Encoding ASCII

Write-Step "Creating desktop shortcuts"
New-Shortcut -Name "BNA Start App" -Target (Join-Path `$InstallDir "Start-BNA-All.cmd")
New-Shortcut -Name "BNA Sync" -Target (Join-Path `$InstallDir "Sync-BNA.cmd")
Set-Content -LiteralPath (Join-Path ([Environment]::GetFolderPath("Desktop")) "BNA Operations.url") -Value "[InternetShortcut]`r`nURL=http://localhost:8080/operations`r`n" -Encoding ASCII

Write-Step "Install complete"
Write-Host "Installed at: `$InstallDir" -ForegroundColor Green
Write-Host "Fill `.env.local` with approved real values before expecting live integrations to work." -ForegroundColor Yellow
Write-Host "Run Telegram/agent fleet on only one machine/server at a time." -ForegroundColor Yellow

if (-not `$SkipStart) {
  Write-Step "Starting local BNA app"
  Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File ```"`$InstallDir\Start-BNA-App.ps1```"" -WindowStyle Minimized
  Start-Sleep -Seconds 6
  Start-Process "http://localhost:8080/operations"
}
"@
  Set-Content -LiteralPath (Join-Path $PackageDir "Install-BNA-Laptop.ps1") -Value $installer -Encoding ASCII
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $repoRoot $OutputRoot
$packageName = "BNA-Operator-Laptop-Safe-$timestamp"
$packageDir = Join-Path $outputDir $packageName
$payloadDir = Join-Path $packageDir "payload"

New-Item -ItemType Directory -Force -Path $payloadDir | Out-Null
Write-InstallerFiles -PackageDir $packageDir -RepoUrl $RepoUrl
New-SafeBootstrapPackage -RepoRoot $repoRoot -OutputPath (Join-Path $payloadDir "bna-operator-bootstrap-safe.json")
Copy-Item -LiteralPath (Join-Path $repoRoot "scripts\Sync-BNA.ps1") -Destination (Join-Path $payloadDir "Sync-BNA.ps1") -Force

if ($IncludeSourceSnapshot) {
  $notice = @"
Source snapshot was intentionally not implemented for this safe package.
Use the GitHub clone path so the package stays small and does not capture local untracked work.
"@
  Set-Content -LiteralPath (Join-Path $payloadDir "SOURCE-SNAPSHOT-NOTICE.txt") -Value $notice -Encoding ASCII
}

$zipPath = Join-Path $outputDir "$packageName.zip"
if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Compress-Archive -Path (Join-Path $packageDir "*") -DestinationPath $zipPath -Force

$zipItem = Get-Item -LiteralPath $zipPath
[pscustomobject]@{
  package = $zipPath
  bytes = $zipItem.Length
  includes_secret_values = $false
  includes_source_snapshot = $false
  recipient_ready = $true
} | ConvertTo-Json
