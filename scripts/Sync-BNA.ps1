param(
  [switch]$StatusOnly,
  [switch]$Pull,
  [switch]$Push,
  [switch]$StageAll,
  [string]$CommitMessage = "",
  [switch]$Yes,
  [switch]$SkipSecretAudit,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-Checked {
  param(
    [Parameter(Mandatory=$true)][string]$FilePath,
    [string[]]$Arguments = @()
  )
  if ($DryRun) {
    Write-Host "DRY-RUN: $FilePath $($Arguments -join ' ')" -ForegroundColor Yellow
    return
  }
  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $FilePath $($Arguments -join ' ')"
  }
}

function Confirm-Action {
  param([string]$Prompt)
  if ($Yes -or $DryRun) { return }
  $answer = Read-Host "$Prompt Type YES to continue"
  if ($answer -ne "YES") {
    throw "Cancelled."
  }
}

function Get-GitRoot {
  $root = (& git rev-parse --show-toplevel 2>$null)
  if ($LASTEXITCODE -ne 0 -or -not $root) {
    throw "This script must run inside the BNA Git repository."
  }
  return (Resolve-Path -LiteralPath $root).Path
}

function Get-StatusPaths {
  $raw = (& git status --porcelain=v1)
  if ($LASTEXITCODE -ne 0) {
    throw "Could not read git status."
  }
  $paths = @()
  foreach ($line in $raw) {
    if (-not $line) { continue }
    $path = $line.Substring(3).Trim()
    if ($path -match " -> ") {
      $path = ($path -split " -> ")[-1].Trim()
    }
    if ($path) { $paths += $path.Replace("\", "/") }
  }
  return $paths
}

function Assert-NoSecretStatus {
  $paths = Get-StatusPaths
  $blocked = @()
  foreach ($path in $paths) {
    if (
      $path -match '(^|/)\.env(\.|$)' -or
      $path -match '(^|/)\.env\.local$' -or
      $path -match '(^|/)\.secrets(/|$)' -or
      $path -match '(^|/)BNA-Keyholder(/|$)' -or
      $path -match '(api[-_]?key|secret|token|credential|password).*\.(txt|json|env|ps1|md)$' -or
      $path -match '(^|/)(install-packages|\.runtime|logs|renders|media-drop|media-inbox)(/|$)'
    ) {
      $blocked += $path
    }
  }
  if ($blocked.Count -gt 0) {
    throw "Sync blocked because secret/generated paths are dirty: $($blocked -join ', ')"
  }
}

function Assert-CleanWorktree {
  $paths = Get-StatusPaths
  if ($paths.Count -gt 0) {
    throw "Worktree is not clean. Commit/stash/review changes before pulling or pushing. Dirty paths: $($paths -join ', ')"
  }
}

function Run-SecretAudit {
  if ($SkipSecretAudit) {
    Write-Host "Secret audit skipped by flag." -ForegroundColor Yellow
    return
  }
  if (Test-Path -LiteralPath "package.json") {
    Write-Step "Running secret audit"
    Invoke-Checked -FilePath "npm.cmd" -Arguments @("run", "secrets:audit")
  }
}

$repoRoot = Get-GitRoot
Set-Location $repoRoot

Write-Step "BNA Git status"
Invoke-Checked -FilePath "git" -Arguments @("remote", "-v")
Invoke-Checked -FilePath "git" -Arguments @("branch", "--show-current")
Invoke-Checked -FilePath "git" -Arguments @("status", "--short")

Assert-NoSecretStatus

if ($StatusOnly -or (-not $Pull -and -not $Push -and -not $CommitMessage -and -not $StageAll)) {
  Write-Host ""
  Write-Host "Status only. Examples:" -ForegroundColor Green
  Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\Sync-BNA.ps1 -Pull"
  Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\Sync-BNA.ps1 -StageAll -CommitMessage ""Describe the work"" -Push"
  Write-Host "Desktop sync happens by running git pull on the desktop after laptop changes are pushed."
  exit 0
}

if ($Pull) {
  Write-Step "Pulling latest from GitHub"
  Assert-CleanWorktree
  Confirm-Action "Pull latest changes with fast-forward only?"
  Invoke-Checked -FilePath "git" -Arguments @("pull", "--ff-only")
}

if ($StageAll) {
  Write-Step "Staging reviewed non-secret changes"
  Assert-NoSecretStatus
  Confirm-Action "Stage all reviewed non-secret changes?"
  Invoke-Checked -FilePath "git" -Arguments @("add", "-A")
}

if ($CommitMessage) {
  Write-Step "Creating explicit commit"
  Assert-NoSecretStatus
  if (-not $DryRun) {
    & git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
      throw "No staged changes to commit. Use -StageAll only after reviewing the files, or stage files manually."
    }
  }
  Confirm-Action "Commit staged changes with message: $CommitMessage"
  Invoke-Checked -FilePath "git" -Arguments @("commit", "-m", $CommitMessage)
}

if ($Push) {
  Write-Step "Pushing current branch to GitHub"
  Assert-NoSecretStatus
  Assert-CleanWorktree
  Run-SecretAudit
  $branch = (& git branch --show-current).Trim()
  if (-not $branch) { throw "Could not determine current branch." }
  Confirm-Action "Push branch '$branch' to origin?"
  Invoke-Checked -FilePath "git" -Arguments @("push", "-u", "origin", $branch)
  Write-Host "Pushed $branch. Pull from GitHub on the desktop to sync it there." -ForegroundColor Green
}
