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
Write-Host "โหมด: รองรับการลากไฟล์บนเว็บ GitHub อัตโนมัติ 100%" -ForegroundColor White
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

            # ตรวจสอบและเคลียร์ไฟล์ในเครื่องที่ชนกับไฟล์ใหม่บน GitHub (ป้องกัน Untracked File Overwrite Loop)
            $incomingFiles = git diff --name-only HEAD..origin/main 2>$null
            $untrackedFiles = git ls-files --others --exclude-standard 2>$null
            if ($untrackedFiles -and $incomingFiles) {
                foreach ($f in $untrackedFiles) {
                    if ($incomingFiles -contains $f) {
                        Write-Host "[$currentTime] ⚡ พบไฟล์ '$f' ตรงกับบนเว็บ - เคลียร์เพื่อรับไฟล์จาก GitHub อัตโนมัติ..." -ForegroundColor Yellow
                        Remove-Item -Path $f -Force -Recurse -ErrorAction SilentlyContinue
                    }
                }
            }

            # ดึงไฟล์และรวมโค้ด (ยึดไฟล์จาก GitHub Web เป็นหลักหากขัดแย้ง)
            $pullOutput = git pull -s ort -X theirs --no-rebase origin main 2>&1
            if ($LASTEXITCODE -ne 0) {
                # หากยังติดขัด ให้เคลียร์ Conflict โดยยึดข้อมูลจาก GitHub ทั้งหมด
                git checkout --theirs . 2>$null
                git add -A 2>$null
                git commit -m "Auto-sync: merged changes from GitHub Web" --quiet 2>$null
            }

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