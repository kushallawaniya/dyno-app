Set WshShell = CreateObject("WScript.Shell")
' Runs the backend database server silently in the background (no window shown)
WshShell.Run "cmd.exe /c npm start --prefix backend", 0, false
