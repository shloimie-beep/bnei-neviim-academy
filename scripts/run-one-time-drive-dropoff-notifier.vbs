Option Explicit

Dim fso, shell, scriptDir, recipient, runner, command

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
recipient = ""

If WScript.Arguments.Count > 0 Then
  recipient = WScript.Arguments(0)
End If

If recipient = "" Then
  recipient = shell.ExpandEnvironmentStrings("%ONE_TIME_DRIVE_DROPOFF_NOTIFY_TO%")
End If

If recipient = "" Or recipient = "%ONE_TIME_DRIVE_DROPOFF_NOTIFY_TO%" Then
  recipient = "sdratler@gmail.com"
End If

runner = fso.BuildPath(scriptDir, "run-one-time-drive-dropoff-notifier.ps1")
command = "powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File " & Chr(34) & runner & Chr(34) & " -Send -Recipient " & Chr(34) & recipient & Chr(34)

shell.Run command, 0, False
