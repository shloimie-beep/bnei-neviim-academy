param(
  [string]$OutputRoot = "install-packages",
  [string]$RepoUrl = "https://github.com/shloimie-beep/bnei-neviim-academy.git",
  [switch]$IncludeSourceSnapshot
)

$ErrorActionPreference = "Stop"

function New-RandomPassword {
  $bytes = New-Object byte[] 24
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($bytes)
  } finally {
    $rng.Dispose()
  }
  return [Convert]::ToBase64String($bytes).TrimEnd("=")
}

function ConvertTo-PlainText {
  param([System.Security.SecureString]$Secure)
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

function Protect-FileAes {
  param(
    [Parameter(Mandatory=$true)][string]$InputPath,
    [Parameter(Mandatory=$true)][string]$OutputPath,
    [Parameter(Mandatory=$true)][string]$Password
  )

  $salt = New-Object byte[] 16
  $iv = New-Object byte[] 16
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($salt)
    $rng.GetBytes($iv)
  } finally {
    $rng.Dispose()
  }

  $kdf = [System.Security.Cryptography.Rfc2898DeriveBytes]::new(
    $Password,
    $salt,
    200000,
    [System.Security.Cryptography.HashAlgorithmName]::SHA256
  )
  $aes = [System.Security.Cryptography.Aes]::Create()
  $aes.KeySize = 256
  $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
  $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
  $aes.Key = $kdf.GetBytes(32)
  $aes.IV = $iv

  $plain = [IO.File]::ReadAllBytes($InputPath)
  $encryptor = $aes.CreateEncryptor()
  $cipher = $encryptor.TransformFinalBlock($plain, 0, $plain.Length)

  $header = [Text.Encoding]::ASCII.GetBytes("BNAENC1")
  $out = New-Object byte[] ($header.Length + $salt.Length + $iv.Length + $cipher.Length)
  [Array]::Copy($header, 0, $out, 0, $header.Length)
  [Array]::Copy($salt, 0, $out, $header.Length, $salt.Length)
  [Array]::Copy($iv, 0, $out, $header.Length + $salt.Length, $iv.Length)
  [Array]::Copy($cipher, 0, $out, $header.Length + $salt.Length + $iv.Length, $cipher.Length)
  [IO.File]::WriteAllBytes($OutputPath, $out)
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
BNA Laptop Installer
====================

Run START-HERE-Install-BNA.cmd.

What it does:
- Installs Git and Node.js LTS with winget if missing.
- Installs or updates the BNA app in `%USERPROFILE%\BNA v2.0`.
- Restores encrypted `.env.local` and `.secrets` when you enter the password.
- Runs npm install.
- Creates desktop/start scripts for the app, Telegram bot bridge, watchdog, and agent fleet.
- Opens local Operations at http://localhost:8080/operations.

Security:
- Secrets are encrypted in `payload\secrets.bundle.enc`.
- The password is NOT included in this ZIP and should not be sent in the same email.

Telegram warning:
- Only run the Telegram bot bridge on one laptop/server at a time, otherwise Telegram polling can fight with the other machine.
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

function ConvertTo-PlainText {
  param([System.Security.SecureString]`$Secure)
  `$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR(`$Secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR(`$ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR(`$ptr)
  }
}

function Unprotect-FileAes {
  param(
    [Parameter(Mandatory=`$true)][string]`$InputPath,
    [Parameter(Mandatory=`$true)][string]`$OutputPath,
    [Parameter(Mandatory=`$true)][string]`$Password
  )

  `$bytes = [IO.File]::ReadAllBytes(`$InputPath)
  `$header = [Text.Encoding]::ASCII.GetString(`$bytes, 0, 7)
  if (`$header -ne "BNAENC1") { throw "Encrypted secrets bundle has an invalid header." }

  `$salt = New-Object byte[] 16
  `$iv = New-Object byte[] 16
  [Array]::Copy(`$bytes, 7, `$salt, 0, 16)
  [Array]::Copy(`$bytes, 23, `$iv, 0, 16)
  `$cipherLength = `$bytes.Length - 39
  `$cipher = New-Object byte[] `$cipherLength
  [Array]::Copy(`$bytes, 39, `$cipher, 0, `$cipherLength)

  `$kdf = [System.Security.Cryptography.Rfc2898DeriveBytes]::new(
    `$Password,
    `$salt,
    200000,
    [System.Security.Cryptography.HashAlgorithmName]::SHA256
  )
  `$aes = [System.Security.Cryptography.Aes]::Create()
  `$aes.KeySize = 256
  `$aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
  `$aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
  `$aes.Key = `$kdf.GetBytes(32)
  `$aes.IV = `$iv

  try {
    `$decryptor = `$aes.CreateDecryptor()
    `$plain = `$decryptor.TransformFinalBlock(`$cipher, 0, `$cipher.Length)
    [IO.File]::WriteAllBytes(`$OutputPath, `$plain)
  } catch {
    throw "Could not decrypt secrets. The password is probably wrong."
  }
}

function Write-StartScripts {
  param([Parameter(Mandatory=`$true)][string]`$Root)

  `$loadEnv = @'
param([string]`$Root = (Split-Path -Parent `$PSScriptRoot))

function Set-EnvFromFile {
  param([string]`$Name, [string]`$Path)
  `$current = [Environment]::GetEnvironmentVariable(`$Name, "Process")
  if ((Test-Path -LiteralPath `$Path) -and -not `$current) {
    `$value = (Get-Content -LiteralPath `$Path -Raw).Trim()
    if (`$value) { Set-Item -Path ("env:" + `$Name) -Value `$value }
  }
}

function Set-EnvFromBlockFile {
  param([string]`$Path)
  if (-not (Test-Path -LiteralPath `$Path)) { return }
  foreach (`$line in (Get-Content -LiteralPath `$Path)) {
    `$trim = `$line.Trim()
    if (-not `$trim -or `$trim.StartsWith("#") -or -not `$trim.Contains("=")) { continue }
    `$parts = `$trim.Split("=", 2)
    if (`$parts[0]) { Set-Item -Path ("env:" + `$parts[0]) -Value `$parts[1] }
  }
}

`$envLocal = Join-Path `$Root ".env.local"
Set-EnvFromBlockFile `$envLocal
`$secrets = Join-Path `$Root ".secrets"
Set-EnvFromBlockFile (Join-Path `$secrets "buffer-api-key.txt")
Set-EnvFromBlockFile (Join-Path `$secrets "railway-google-env.txt")
Set-EnvFromBlockFile (Join-Path `$secrets "whapi-env.txt")
Set-EnvFromFile "DATABASE_URL" (Join-Path `$secrets "railway-database-url.txt")
Set-EnvFromFile "OPENAI_API_KEY" (Join-Path `$secrets "openai-api-key.txt")
Set-EnvFromFile "RAILWAY_TOKEN" (Join-Path `$secrets "railway-token.txt")
Set-EnvFromFile "TELEGRAM_BOT_TOKEN" (Join-Path `$secrets "telegram-bot-token.txt")
Set-EnvFromFile "TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER" (Join-Path `$secrets "telegram-rabbi-elie-scheller-bot-token.txt")
Set-EnvFromFile "GOOGLE_REFRESH_TOKEN" (Join-Path `$secrets "google-refresh-token.txt")
Set-EnvFromFile "WAPI_API_TOKEN" (Join-Path `$secrets "wapi-api-token.txt")
Set-EnvFromFile "WHAPI_API_TOKEN" (Join-Path `$secrets "whapi-api-token.txt")
if ((Test-Path -LiteralPath (Join-Path `$secrets "google-drive-pipeline.json")) -and -not `$env:GOOGLE_DRIVE_PIPELINE_CONFIG) {
  Set-Item -Path "env:GOOGLE_DRIVE_PIPELINE_CONFIG" -Value (Get-Content -LiteralPath (Join-Path `$secrets "google-drive-pipeline.json") -Raw)
}
'@
  Set-Content -LiteralPath (Join-Path `$Root "scripts\Load-BNA-Env.ps1") -Value `$loadEnv -Encoding ASCII

  `$startApp = @'
`$ErrorActionPreference = "Stop"
`$Root = `$PSScriptRoot
. (Join-Path `$Root "scripts\Load-BNA-Env.ps1") -Root `$Root
Set-Location `$Root
npm start
'@
  Set-Content -LiteralPath (Join-Path `$Root "Start-BNA-App.ps1") -Value `$startApp -Encoding ASCII

  `$startTelegram = @'
`$ErrorActionPreference = "Stop"
`$Root = `$PSScriptRoot
. (Join-Path `$Root "scripts\Load-BNA-Env.ps1") -Root `$Root
Set-Location `$Root
npm run telegram:kimi:start
'@
  Set-Content -LiteralPath (Join-Path `$Root "Start-BNA-Telegram-Bot.ps1") -Value `$startTelegram -Encoding ASCII

  `$startWatchdog = @'
`$ErrorActionPreference = "Stop"
`$Root = `$PSScriptRoot
. (Join-Path `$Root "scripts\Load-BNA-Env.ps1") -Root `$Root
Set-Location `$Root
npm run watchdog:restart
'@
  Set-Content -LiteralPath (Join-Path `$Root "Start-BNA-Watchdog.ps1") -Value `$startWatchdog -Encoding ASCII

  `$startFleet = @'
`$ErrorActionPreference = "Stop"
`$Root = `$PSScriptRoot
. (Join-Path `$Root "scripts\Load-BNA-Env.ps1") -Root `$Root
Set-Location `$Root
npm run agent:fleet:restart
'@
  Set-Content -LiteralPath (Join-Path `$Root "Start-BNA-Agent-Fleet.ps1") -Value `$startFleet -Encoding ASCII

  `$startAll = @'
`$ErrorActionPreference = "Stop"
`$Root = `$PSScriptRoot
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"`$Root\Start-BNA-App.ps1`"" -WindowStyle Minimized
Start-Sleep -Seconds 5
Start-Process "http://localhost:8080/operations"
Write-Host "BNA app started. Run Start-BNA-Telegram-Bot.cmd only on the one machine that should control Telegram polling."
'@
  Set-Content -LiteralPath (Join-Path `$Root "Start-BNA-All.ps1") -Value `$startAll -Encoding ASCII

  foreach (`$name in @("Start-BNA-App", "Start-BNA-Telegram-Bot", "Start-BNA-Watchdog", "Start-BNA-Agent-Fleet", "Start-BNA-All")) {
    `$cmdText = "@echo off`r`npowershell -NoProfile -ExecutionPolicy Bypass -File ""%~dp0`$name.ps1""`r`npause`r`n"
    Set-Content -LiteralPath (Join-Path `$Root "`$name.cmd") -Value `$cmdText -Encoding ASCII
  }
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

Write-Step "Installing BNA source"
`$sourceZip = Join-Path `$payloadDir "repo-source.zip"
if (Test-Path -LiteralPath `$sourceZip) {
  if (Test-Path -LiteralPath `$InstallDir) {
    Write-Host "Using existing install folder: `$InstallDir"
  } else {
    New-Item -ItemType Directory -Force -Path `$InstallDir | Out-Null
    Expand-Archive -LiteralPath `$sourceZip -DestinationPath `$InstallDir -Force
  }
} elseif (Test-Path -LiteralPath (Join-Path `$InstallDir ".git")) {
  Set-Location `$InstallDir
  git pull --ff-only
} elseif (Test-Path -LiteralPath (Join-Path `$InstallDir "package.json")) {
  Write-Host "Existing app folder found: `$InstallDir"
} else {
  `$parent = Split-Path -Parent `$InstallDir
  if (-not (Test-Path -LiteralPath `$parent)) { New-Item -ItemType Directory -Force -Path `$parent | Out-Null }
  git clone `$RepoUrl `$InstallDir
}

Write-Step "Restoring encrypted local secrets"
`$bundle = Join-Path `$payloadDir "secrets.bundle.enc"
if (Test-Path -LiteralPath `$bundle) {
  `$secure = Read-Host "Enter BNA installer secrets password" -AsSecureString
  `$password = ConvertTo-PlainText `$secure
  `$tempZip = Join-Path `$env:TEMP ("bna-secrets-" + [Guid]::NewGuid().ToString("N") + ".zip")
  try {
    Unprotect-FileAes -InputPath `$bundle -OutputPath `$tempZip -Password `$password
    Expand-Archive -LiteralPath `$tempZip -DestinationPath `$InstallDir -Force
  } finally {
    if (Test-Path -LiteralPath `$tempZip) { Remove-Item -LiteralPath `$tempZip -Force }
  }
  Write-Host "Secrets restored." -ForegroundColor Green
} else {
  Write-Warning "No encrypted secrets bundle was included. The app will install, but integrations will not be fully connected."
}

Write-Step "Creating local folders"
foreach (`$dir in @(".runtime", "logs", "renders", "media-drop\inbox", "media-inbox")) {
  New-Item -ItemType Directory -Force -Path (Join-Path `$InstallDir `$dir) | Out-Null
}

Write-Step "Installing npm dependencies"
Set-Location `$InstallDir
npm install

Write-Step "Creating launch scripts and desktop shortcuts"
Write-StartScripts -Root `$InstallDir
New-Shortcut -Name "BNA Start App" -Target (Join-Path `$InstallDir "Start-BNA-All.cmd")
New-Shortcut -Name "BNA Telegram Bot" -Target (Join-Path `$InstallDir "Start-BNA-Telegram-Bot.cmd")
Set-Content -LiteralPath (Join-Path ([Environment]::GetFolderPath("Desktop")) "BNA Operations.url") -Value "[InternetShortcut]`r`nURL=http://localhost:8080/operations`r`n" -Encoding ASCII

Write-Step "Install complete"
Write-Host "Installed at: `$InstallDir" -ForegroundColor Green
Write-Host "Desktop shortcuts created: BNA Start App, BNA Telegram Bot, BNA Operations." -ForegroundColor Green
Write-Host "Run Telegram on only one machine at a time." -ForegroundColor Yellow

if (-not `$SkipStart) {
  Write-Step "Starting local BNA app"
  Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File ``"`$InstallDir\Start-BNA-App.ps1``"" -WindowStyle Minimized
  Start-Sleep -Seconds 6
  Start-Process "http://localhost:8080/operations"
}
"@
  Set-Content -LiteralPath (Join-Path $PackageDir "Install-BNA-Laptop.ps1") -Value $installer -Encoding ASCII
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $repoRoot $OutputRoot
$packageName = "BNA-Laptop-Installer-$timestamp"
$packageDir = Join-Path $outputDir $packageName
$payloadDir = Join-Path $packageDir "payload"
New-Item -ItemType Directory -Force -Path $payloadDir | Out-Null

Write-InstallerFiles -PackageDir $packageDir -RepoUrl $RepoUrl

$tempRoot = Join-Path $env:TEMP ("bna-installer-" + [Guid]::NewGuid().ToString("N"))
$secretPayload = Join-Path $tempRoot "secret-payload"
New-Item -ItemType Directory -Force -Path $secretPayload | Out-Null

$envLocal = Join-Path $repoRoot ".env.local"
if (Test-Path -LiteralPath $envLocal) {
  Copy-Item -LiteralPath $envLocal -Destination (Join-Path $secretPayload ".env.local") -Force
}
$secretsDir = Join-Path $repoRoot ".secrets"
if (Test-Path -LiteralPath $secretsDir) {
  Copy-Item -LiteralPath $secretsDir -Destination (Join-Path $secretPayload ".secrets") -Recurse -Force
}

$plainSecretsZip = Join-Path $tempRoot "secrets.zip"
Compress-Archive -Path (Join-Path $secretPayload "*") -DestinationPath $plainSecretsZip -Force
$password = New-RandomPassword
$encryptedSecrets = Join-Path $payloadDir "secrets.bundle.enc"
Protect-FileAes -InputPath $plainSecretsZip -OutputPath $encryptedSecrets -Password $password

if ($IncludeSourceSnapshot) {
  $sourceRoot = Join-Path $tempRoot "repo-source"
  New-Item -ItemType Directory -Force -Path $sourceRoot | Out-Null
  $excludeDirs = @(
    ".git", "node_modules", ".next", ".runtime", ".deploy-railway",
    "renders", "logs", "media-drop", "media-inbox", "screenshots"
  )
  $excludeFiles = @(".env", ".env.local", "*.log", "lighthouse-report.html", "*.tsbuildinfo")
  robocopy $repoRoot $sourceRoot /E /XD $excludeDirs /XF $excludeFiles | Out-Null
  if ($LASTEXITCODE -gt 7) { throw "robocopy failed with code $LASTEXITCODE" }
  foreach ($path in @(
    (Join-Path $sourceRoot ".secrets"),
    (Join-Path $sourceRoot "public\organic-clip-assets"),
    (Join-Path $sourceRoot "ops\agent-fleet-runs"),
    (Join-Path $sourceRoot "ops\live-smokes"),
    (Join-Path $sourceRoot "ops\openai-smokes"),
    (Join-Path $sourceRoot "ops\playwright-smokes")
  )) {
    if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Recurse -Force }
  }
  Compress-Archive -Path (Join-Path $sourceRoot "*") -DestinationPath (Join-Path $payloadDir "repo-source.zip") -Force
}

$zipPath = Join-Path $outputDir "$packageName.zip"
if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Compress-Archive -Path (Join-Path $packageDir "*") -DestinationPath $zipPath -Force

$passwordPath = Join-Path $outputDir "$packageName-SECRETS-PASSWORD.txt"
Set-Content -LiteralPath $passwordPath -Value @"
BNA laptop installer secrets password
Package: $packageName.zip
Password: $password

Do not email this password in the same message as the installer ZIP.
"@ -Encoding UTF8

Remove-Item -LiteralPath $tempRoot -Recurse -Force

$zipItem = Get-Item -LiteralPath $zipPath
[pscustomobject]@{
  package = $zipPath
  password_file = $passwordPath
  bytes = $zipItem.Length
  include_source_snapshot = [bool]$IncludeSourceSnapshot
} | ConvertTo-Json
