# Stops the old Holy Flow / AIOS Telegram bridge that runs as a Windows service.
# Run from an Administrator PowerShell window.

$ErrorActionPreference = 'Continue'

$serviceName = 'aiosccbridge.exe'
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if (-not $service) {
  Write-Host "Service $serviceName was not found."
  exit 0
}

Write-Host "Stopping $serviceName..."
Stop-Service -Name $serviceName -Force -ErrorAction Continue
Start-Sleep -Seconds 3

Write-Host "Disabling $serviceName automatic startup..."
Set-Service -Name $serviceName -StartupType Disabled -ErrorAction Continue

$exe = 'C:\Users\User\holyflow-platform\bridge\daemon\aiosccbridge.exe'
if (Test-Path $exe) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $target = "$exe.disabled-$stamp"
  Write-Host "Moving old bridge executable to $target..."
  Move-Item -LiteralPath $exe -Destination $target -Force -ErrorAction Continue
}

$updated = Get-CimInstance Win32_Service -Filter "Name='$serviceName'" -ErrorAction SilentlyContinue
if ($updated) {
  $updated | Select-Object Name,State,StartMode,ProcessId,PathName | Format-List
}

