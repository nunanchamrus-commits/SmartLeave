# SmartLeave Real-Time Auto-Sync Script
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Ensure Git is in PATH
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $env:Path = "C:\Program Files\Git\cmd;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

$repoDir = "D:\SmartLeave"
Set-Location $repoDir

$intervalSeconds = 10

Clear-Host
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   🚀 SmartLeave Real-Time Git Auto-Sync System      " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "โฟลเดอร์: $repoDir" -ForegroundColor White
Write-Host "สาขา (Branch): main" -ForegroundColor White
Write-Host "รอบการตรวจสอบ: ทุกๆ $intervalSeconds วินาที" -ForegroundColor White
Write-Host "กด Ctrl + C เพื่อหยุดการทำงาน" -ForegroundColor Yellow
Write-Host "------------------------------------------------------" -ForegroundColor DarkGray

$checkCount = 0

while ($true) {
    $checkCount++
    $currentTime = Get-Date -Format "HH:mm:ss"

    try {
        # ดึงสถานะล่าสุดจาก GitHub (ไม่กระทบไฟล์ในเครื่อง)
        git fetch origin main --quiet 2>$null

        $behindCount = [int](git rev-list HEAD..origin/main --count)
        $aheadCount = [int](git rev-list origin/main..HEAD --count)

        if ($behindCount -gt 0) {
            Write-Host "`n[$currentTime] 🔔 ตรวจพบการอัปเดตใหม่บน GitHub ($behindCount รายการ)!" -ForegroundColor Magenta
            Write-Host "[$currentTime] 📥 กำลังดึงไฟล์ล่าสุด (git pull)..." -ForegroundColor Cyan
            
            $pullOutput = git pull origin main
            Write-Host $pullOutput -ForegroundColor Green

            # แสดง commit ล่าสุดที่มีการอัปเดต
            $latestCommit = git log -1 --pretty=format:"Commit: %h - %s (%an, %ar)"
            Write-Host "[$currentTime] ✅ อัปเดตไฟล์เรียบร้อยแล้ว: $latestCommit`n" -ForegroundColor Green
        } elseif ($aheadCount -gt 0) {
            # เครื่องเรามีโค้ดใหม่กว่า GitHub แต่ยังไม่ได้ push
            Write-Host "`r[$currentTime] (#$checkCount) 📤 มี Commit ในเครื่องรอ Push ($aheadCount รายการ) | บน GitHub ล่าสุดแล้ว..." -NoNewline -ForegroundColor Yellow
        } else {
            # แสดงสถานะล่าสุดแบบเรียบร้อย
            Write-Host "`r[$currentTime] (#$checkCount) 🟢 ซิงค์ตรงกับ GitHub ล่าสุดแล้ว (รอรอบถัดไปใน ${intervalSeconds}s)..." -NoNewline -ForegroundColor Gray
        }
    } catch {
        Write-Host "`n[$currentTime] ⚠️ เกิดข้อผิดพลาดในการตรวจสอบ: $_" -ForegroundColor Red
    }

    Start-Sleep -Seconds $intervalSeconds
}