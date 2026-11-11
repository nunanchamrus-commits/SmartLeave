@echo off
chcp 65001 >nul
title SmartLeave Auto-Sync (Real-Time GitHub)
cd /d "D:\SmartLeave"

:: Ensure Git is in PATH
where git >nul 2>nul
if errorlevel 1 (
    set "PATH=C:\Program Files\Git\cmd;%PATH%"
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "D:\SmartLeave\auto-sync.ps1"
pause
