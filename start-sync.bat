@echo off
chcp 65001 >nul
title SmartLeave Auto-Sync (Real-Time GitHub)
cd /d "D:\SmartLeave"
echo กำลังเริ่มต้นระบบ Auto-Sync...
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\SmartLeave\auto-sync.ps1"
pause

