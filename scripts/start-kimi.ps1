$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "Starting Kimi Code CLI in $repoRoot" -ForegroundColor Cyan
Write-Host "Shared repo brain files:" -ForegroundColor Cyan
Write-Host "  AGENTS.md" -ForegroundColor Gray
Write-Host "  MEMORY.md" -ForegroundColor Gray
Write-Host "  TASKS.md" -ForegroundColor Gray
Write-Host "  memory/2026-05-24.md" -ForegroundColor Gray
Write-Host ""
Write-Host "First prompt to use: open KIMI-BOOTSTRAP.md and paste it into Kimi." -ForegroundColor Yellow
Write-Host ""

kimi -w $repoRoot
