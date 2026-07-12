param(
  [string]$Path = $env:BNA_KEYHOLDER_DIR,
  [switch]$NoOpen,
  [switch]$CreateDesktopShortcut
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Path)) {
  $Path = Join-Path $env:USERPROFILE "BNA-Keyholder"
}

$resolvedPath = [System.IO.Path]::GetFullPath($Path)
New-Item -ItemType Directory -Path $resolvedPath -Force | Out-Null

$secretFiles = @(
  "openai-api-key.txt",
  "buffer-api-key.txt",
  "resend-api-key.txt",
  "stripe-secret-key.txt",
  "railway-token.txt",
  "kimi-api-key.txt",
  "vimeo-client-id.txt",
  "vimeo-client-secret.txt",
  "vimeo-access-token.txt",
  "vimeo-webhook-secret.txt",
  "vimeo-test-project-uri.txt",
  "vimeo-test-project-name.txt"
)

foreach ($fileName in $secretFiles) {
  $filePath = Join-Path $resolvedPath $fileName
  if (-not (Test-Path -LiteralPath $filePath)) {
    New-Item -ItemType File -Path $filePath -Force | Out-Null
  }
}

$readmePath = Join-Path $resolvedPath "README.txt"
if (-not (Test-Path -LiteralPath $readmePath)) {
  $readme = @"
BNA Keyholder

This folder is outside the BNA git repository. Put updated API keys or local
tokens in the matching text files here instead of pasting them into chat,
tracked repo files, screenshots, logs, or task titles.

Files:
- openai-api-key.txt
- buffer-api-key.txt
- resend-api-key.txt
- stripe-secret-key.txt
- railway-token.txt
- kimi-api-key.txt
- vimeo-client-id.txt
- vimeo-client-secret.txt
- vimeo-access-token.txt
- vimeo-webhook-secret.txt
- vimeo-test-project-uri.txt
- vimeo-test-project-name.txt

Rules:
- One secret per file.
- Plain text only.
- Do not add quotes unless the provider copied them that way.
- It is okay if a file ends with one newline.
- Codex diagnostics may report length, fingerprint, newline, quote, BOM, and
  last modified metadata. Diagnostics must never print the secret itself.
- Copying a key from here into .secrets or Railway requires an explicit
  instruction from Shloimie.

Useful commands from the BNA repo:
- npm run keyholder:open
- npm run keyholder:diagnose
"@
  Set-Content -LiteralPath $readmePath -Value $readme -Encoding UTF8
}

$logPath = Join-Path $resolvedPath "keyholder-log.jsonl"
if (-not (Test-Path -LiteralPath $logPath)) {
  New-Item -ItemType File -Path $logPath -Force | Out-Null
}

$event = [ordered]@{
  recorded_at = (Get-Date).ToString("o")
  event = "keyholder_initialized"
  path = $resolvedPath
  files = $secretFiles
}
($event | ConvertTo-Json -Compress) | Add-Content -LiteralPath $logPath -Encoding UTF8

if ($CreateDesktopShortcut) {
  $desktop = [Environment]::GetFolderPath("Desktop")
  $shortcutPath = Join-Path $desktop "BNA Keyholder.lnk"
  $repoRoot = Split-Path -Parent $PSScriptRoot
  $scriptPath = Join-Path $repoRoot "scripts\open-bna-keyholder.ps1"
  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($shortcutPath)
  $shortcut.TargetPath = "powershell.exe"
  $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
  $shortcut.WorkingDirectory = $repoRoot
  $shortcut.IconLocation = "shell32.dll,44"
  $shortcut.Description = "Open the local BNA keyholder folder"
  $shortcut.Save()
}

Write-Host "BNA keyholder ready at $resolvedPath"

if (-not $NoOpen) {
  Start-Process -FilePath explorer.exe -ArgumentList "`"$resolvedPath`""
}
