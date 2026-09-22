@echo off
setlocal

set "REPO_ROOT=%~dp0.."
set "RECIPIENT=%~1"
if "%RECIPIENT%"=="" set "RECIPIENT=%ONE_TIME_DRIVE_DROPOFF_NOTIFY_TO%"
if "%RECIPIENT%"=="" set "RECIPIENT=sdratler@gmail.com"

set "LOG_DIR=%REPO_ROOT%\.runtime\one-time-drive-dropoff-notifier"
set "LOG_PATH=%LOG_DIR%\scheduled-task.log"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

start "BNA Drive Dropoff Notifier" /min "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "%REPO_ROOT%\scripts\run-one-time-drive-dropoff-notifier.ps1" -Send -Recipient "%RECIPIENT%"
exit /b 0
