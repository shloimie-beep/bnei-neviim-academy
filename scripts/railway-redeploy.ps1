$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Invoke-Railway {
  param(
    [switch] $AllowUploadTimeout,
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

  $joinedOutput = ($output | Out-String)
  if ($exitCode -ne 0) {
    if ($AllowUploadTimeout -and $joinedOutput -match 'operation timed out' -and ($RailwayArgs -contains 'up')) {
      Write-Host "Railway upload request timed out after creating/starting an upload. Continuing so status checks can observe the deployment." -ForegroundColor Yellow
      return
    }
    throw "railway $($RailwayArgs -join ' ') failed with exit code $exitCode"
  }
}

function Invoke-RailwayJson {
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
  if ($exitCode -ne 0) {
    return $null
  }
  return ($output | Out-String)
}

function Get-RailwayTargetGuard {
  param(
    [string] $Mode
  )

  $statusFile = Join-Path ([System.IO.Path]::GetTempPath()) ("bna-railway-status-" + [System.Guid]::NewGuid().ToString("N") + ".json")
  $statusJson = Invoke-RailwayJson status --json
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  if ($statusJson) {
    [System.IO.File]::WriteAllText($statusFile, $statusJson, $utf8NoBom)
  } else {
    [System.IO.File]::WriteAllText($statusFile, "{}", $utf8NoBom)
  }

  try {
    $guardOutput = & node (Join-Path $repoRoot "scripts\railway-target-guard.mjs") $Mode --json --status-json-file $statusFile 2>&1
    $guardExitCode = $LASTEXITCODE
  } finally {
    if (Test-Path $statusFile) {
      Remove-Item -LiteralPath $statusFile -Force
    }
  }

  $guardText = ($guardOutput | Out-String)
  if ($guardText.Trim()) {
    Write-Host $guardText.Trim()
  }
  if ($guardExitCode -ne 0) {
    throw "Railway target guard blocked this command."
  }
  return ($guardText | ConvertFrom-Json)
}

Write-Host "Checking Railway auth..." -ForegroundColor Cyan

$tokenFile = Join-Path $repoRoot ".secrets\railway-token.txt"
$useAccountAuth = $env:BNA_RAILWAY_USE_ACCOUNT_AUTH -match '^(1|true|yes)$'
if (-not $useAccountAuth -and -not $env:RAILWAY_TOKEN -and -not $env:RAILWAY_API_TOKEN -and (Test-Path $tokenFile)) {
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

$targetGuard = Get-RailwayTargetGuard -Mode "deploy"
if ($targetGuard.deployment_mode -eq "github-auto") {
  Write-Host "Verified GitHub auto-deploy target. No CLI upload was performed by railway:redeploy." -ForegroundColor Green
  exit 0
}

$railwayProjectId = [string]$targetGuard.target.project_id
$railwayService = [string]$targetGuard.target.service_name
if (-not $railwayService) { $railwayService = [string]$targetGuard.target.service_id }
$railwayEnvironment = [string]$targetGuard.target.environment_name
if (-not $railwayEnvironment) { $railwayEnvironment = [string]$targetGuard.target.environment_id }
if (-not $railwayProjectId) {
  throw "Railway deploy requires BNA_RAILWAY_PROJECT_ID or RAILWAY_PROJECT_ID for explicit CLI target linking."
}
if (-not $railwayService) {
  throw "Railway deploy requires BNA_RAILWAY_SERVICE_NAME/BNA_RAILWAY_SERVICE_ID or RAILWAY_SERVICE_NAME/RAILWAY_SERVICE_ID."
}
if (-not $railwayEnvironment) {
  throw "Railway deploy requires BNA_RAILWAY_ENVIRONMENT_NAME/BNA_RAILWAY_ENVIRONMENT_ID or RAILWAY_ENVIRONMENT."
}

Write-Host ""
Write-Host "Selected Railway project: $($targetGuard.target.project_name) / $railwayProjectId" -ForegroundColor Cyan
Write-Host "Selected Railway environment: $railwayEnvironment" -ForegroundColor Cyan
Write-Host "Selected Railway service: $railwayService" -ForegroundColor Cyan
Write-Host "Expected Railway domain: $($targetGuard.target.expected_domain)" -ForegroundColor Cyan
Invoke-Railway link `
  --project $railwayProjectId `
  --environment $railwayEnvironment `
  --service $railwayService `
  --json
Invoke-Railway service status --service $railwayService --environment $railwayEnvironment

Write-Host ""
Write-Host "Preparing deploy bundle..." -ForegroundColor Cyan

$deployRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("bna-railway-deploy-" + [System.Guid]::NewGuid().ToString("N"))
if (Test-Path $deployRoot) {
  Remove-Item -LiteralPath $deployRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $deployRoot | Out-Null
$gitHead = ""
$gitBranch = ""
try {
  $gitHead = (& git -C $repoRoot rev-parse HEAD 2>$null).Trim()
  $gitBranch = (& git -C $repoRoot rev-parse --abbrev-ref HEAD 2>$null).Trim()
} catch {
  $gitHead = ""
  $gitBranch = ""
}
$deployMetadata = [ordered]@{
  commit_sha = $gitHead
  source_branch = $gitBranch
  generated_at = (Get-Date).ToUniversalTime().ToString("o")
  deployment_source = "railway:redeploy"
  target_app = [string]$targetGuard.target.app
  target_project = [string]$targetGuard.target.project_name
  target_service = [string]$railwayService
}
$deployMetadataJson = $deployMetadata | ConvertTo-Json -Depth 4
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $deployRoot "deployment-metadata.json"), $deployMetadataJson + "`n", $utf8NoBom)
Copy-Item -LiteralPath (Join-Path $repoRoot "server.js") -Destination $deployRoot
Copy-Item -LiteralPath (Join-Path $repoRoot "package.json") -Destination $deployRoot
if (Test-Path (Join-Path $repoRoot "package-lock.json")) {
  Copy-Item -LiteralPath (Join-Path $repoRoot "package-lock.json") -Destination $deployRoot
}
Copy-Item -LiteralPath (Join-Path $repoRoot "railway.json") -Destination $deployRoot
if (Test-Path (Join-Path $repoRoot ".dockerignore")) {
  Copy-Item -LiteralPath (Join-Path $repoRoot ".dockerignore") -Destination $deployRoot
}
foreach ($topLevelDoc in @("AGENTS.md", "TASKS.md", "SYSTEM-STATE.md", "PROJECT-NOTES.md", "MEMORY.md")) {
  $docPath = Join-Path $repoRoot $topLevelDoc
  if (Test-Path $docPath) {
    Copy-Item -LiteralPath $docPath -Destination $deployRoot
  }
}
Get-ChildItem -LiteralPath $repoRoot -Filter "railway-migration-*.sql" -File |
  ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $deployRoot
  }
if (Test-Path (Join-Path $repoRoot "Dockerfile")) {
  Copy-Item -LiteralPath (Join-Path $repoRoot "Dockerfile") -Destination $deployRoot
}
if (Test-Path (Join-Path $repoRoot "config")) {
  Copy-Item -LiteralPath (Join-Path $repoRoot "config") -Destination $deployRoot -Recurse
}
Copy-Item -LiteralPath (Join-Path $repoRoot "public") -Destination $deployRoot -Recurse
$generatedPublicAssets = @(
  "organic-clip-assets"
)
foreach ($assetDir in $generatedPublicAssets) {
  $assetPath = Join-Path (Join-Path $deployRoot "public") $assetDir
  if (Test-Path $assetPath) {
    Remove-Item -LiteralPath $assetPath -Recurse -Force
    Write-Host "Excluded generated public asset directory from deploy bundle: public/$assetDir" -ForegroundColor Yellow
  }
}
$learningMomentDir = Join-Path (Join-Path (Join-Path $deployRoot "public") "images") "learning-moments"
if (Test-Path $learningMomentDir) {
  Get-ChildItem -LiteralPath $learningMomentDir -File |
    Where-Object { $_.Name -notmatch '-web\.' } |
    ForEach-Object {
      Remove-Item -LiteralPath $_.FullName -Force
      Write-Host "Excluded large source image from deploy bundle: public/images/learning-moments/$($_.Name)" -ForegroundColor Yellow
    }
}
$unusedLargeImages = @(
  "images\hillel.png",
  "images\huddle.png",
  "images\reuvane-jump-ball.png",
  "images\meir-bunny.png",
  "images\l-bars.png"
)
foreach ($relativeImage in $unusedLargeImages) {
  $imagePath = Join-Path (Join-Path $deployRoot "public") $relativeImage
  if (Test-Path $imagePath) {
    Remove-Item -LiteralPath $imagePath -Force
    Write-Host "Excluded unused large image from deploy bundle: public/$($relativeImage -replace '\\','/')" -ForegroundColor Yellow
  }
}
$ffmpegPath = ""
try {
  $ffmpegPath = (& node -e "process.stdout.write(require('ffmpeg-static'))" 2>$null)
} catch {
  $ffmpegPath = ""
}
if ($ffmpegPath -and (Test-Path $ffmpegPath)) {
  Get-ChildItem -LiteralPath (Join-Path $deployRoot "public\images") -Recurse -File |
    Where-Object { $_.Extension -match '^\.(jpe?g)$' -and $_.Length -gt 1MB } |
    ForEach-Object {
      $tmpPath = "$($_.FullName).optimized$($_.Extension)"
      $previousErrorActionPreference = $ErrorActionPreference
      $ErrorActionPreference = "Continue"
      try {
        $null = & $ffmpegPath -hide_banner -loglevel error -y -i $_.FullName -vf "scale='min(1600,iw)':-2" -q:v 7 $tmpPath 2>&1
        $ffmpegExitCode = $LASTEXITCODE
      } finally {
        $ErrorActionPreference = $previousErrorActionPreference
      }
      if ($ffmpegExitCode -ne 0) {
        if (Test-Path $tmpPath) {
          Remove-Item -LiteralPath $tmpPath -Force
        }
        Write-Host "Skipped deploy image optimization for public/$((Resolve-Path -LiteralPath $_.FullName -Relative).Replace('.\deploy-railway\public\', '').Replace('\', '/'))" -ForegroundColor Yellow
      } elseif ((Test-Path $tmpPath) -and ((Get-Item -LiteralPath $tmpPath).Length -lt $_.Length)) {
        Move-Item -LiteralPath $tmpPath -Destination $_.FullName -Force
        Write-Host "Optimized deploy image: public/$((Resolve-Path -LiteralPath $_.FullName -Relative).Replace('.\deploy-railway\public\', '').Replace('\', '/'))" -ForegroundColor Yellow
      } elseif (Test-Path $tmpPath) {
        Remove-Item -LiteralPath $tmpPath -Force
      }
    }
} else {
  Write-Host "ffmpeg-static not available; skipping deploy image optimization." -ForegroundColor Yellow
}
if (Test-Path (Join-Path $repoRoot "src")) {
  Copy-Item -LiteralPath (Join-Path $repoRoot "src") -Destination $deployRoot -Recurse
}
if (Test-Path (Join-Path $repoRoot "scripts")) {
  Copy-Item -LiteralPath (Join-Path $repoRoot "scripts") -Destination $deployRoot -Recurse
}
if (Test-Path (Join-Path (Join-Path $repoRoot "content-memory") "transcript-digests")) {
  $contentMemoryDeployRoot = Join-Path $deployRoot "content-memory"
  New-Item -ItemType Directory -Path $contentMemoryDeployRoot -Force | Out-Null
  Copy-Item `
    -LiteralPath (Join-Path (Join-Path $repoRoot "content-memory") "transcript-digests") `
    -Destination $contentMemoryDeployRoot `
    -Recurse
}
if (Test-Path (Join-Path $repoRoot "ops")) {
  $opsDeployRoot = Join-Path $deployRoot "ops"
  New-Item -ItemType Directory -Path $opsDeployRoot -Force | Out-Null
  foreach ($opsFile in @("agent-task-ledger.jsonl", "agent-changelog.md", "action-registry.json", "route-registry.json")) {
    $opsFilePath = Join-Path (Join-Path $repoRoot "ops") $opsFile
    if (Test-Path $opsFilePath) {
      Copy-Item -LiteralPath $opsFilePath -Destination $opsDeployRoot
    }
  }
  $queueAuditDir = Join-Path (Join-Path $repoRoot "ops") "queue-audits"
  $latestQueueAudit = Join-Path $queueAuditDir "latest.json"
  if (Test-Path $latestQueueAudit) {
    $queueAuditDeployRoot = Join-Path $opsDeployRoot "queue-audits"
    New-Item -ItemType Directory -Path $queueAuditDeployRoot -Force | Out-Null
    Copy-Item -LiteralPath $latestQueueAudit -Destination $queueAuditDeployRoot -Force
    try {
      $queueAudit = Get-Content -LiteralPath $latestQueueAudit -Raw | ConvertFrom-Json
      $reportPaths = @()
      foreach ($item in @($queueAudit.items)) {
        foreach ($reportPath in @($item.report_paths)) {
          if ($reportPath -match '^ops/(agent-fleet-runs|openai-smokes|system-audits)/') {
            $reportPaths += $reportPath
          }
        }
      }
      foreach ($reportPath in ($reportPaths | Sort-Object -Unique)) {
        $sourceReport = Join-Path $repoRoot ($reportPath -replace '/', '\')
        if (Test-Path $sourceReport) {
          $destReport = Join-Path $deployRoot ($reportPath -replace '/', '\')
          New-Item -ItemType Directory -Path (Split-Path -Parent $destReport) -Force | Out-Null
          Copy-Item -LiteralPath $sourceReport -Destination $destReport -Force
        }
      }
    } catch {
      Write-Host "Could not parse ops/queue-audits/latest.json for referenced report files: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  }
  $issue24TraceDir = Join-Path (Join-Path (Join-Path $repoRoot "ops") "class-drive-intake") "2026-06-25-issue-24-newest-recording"
  if (Test-Path $issue24TraceDir) {
    $traceDeployDir = Join-Path (Join-Path $opsDeployRoot "class-drive-intake") "2026-06-25-issue-24-newest-recording"
    New-Item -ItemType Directory -Path $traceDeployDir -Force | Out-Null
    foreach ($traceFile in @("NEWEST-RECORDING-TRACE.json", "NEWEST-RECORDING-TRACE.md")) {
      $sourceTrace = Join-Path $issue24TraceDir $traceFile
      if (Test-Path $sourceTrace) {
        Copy-Item -LiteralPath $sourceTrace -Destination $traceDeployDir -Force
      }
    }
  }
}
if (Test-Path (Join-Path $repoRoot "tasks-pending")) {
  Copy-Item -LiteralPath (Join-Path $repoRoot "tasks-pending") -Destination $deployRoot -Recurse
}
if (Test-Path (Join-Path $repoRoot "agents")) {
  Copy-Item -LiteralPath (Join-Path $repoRoot "agents") -Destination $deployRoot -Recurse
}

Write-Host ""
Write-Host "Uploading current local code to Railway..." -ForegroundColor Cyan
Push-Location $deployRoot
try {
  if ($railwayProjectId) {
    Invoke-Railway link `
      --project $railwayProjectId `
      --environment $railwayEnvironment `
      --service $railwayService `
      --json
  }
  Invoke-Railway -AllowUploadTimeout up -d `
    --service $railwayService `
    --environment $railwayEnvironment `
    -m "Manual deploy from local workspace"
} finally {
  Pop-Location
}
