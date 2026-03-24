# Script giải quyết tất cả Git merge conflicts trong backend
# Chiến lược: Giữ phần HEAD (phiên bản mới hơn)

$baseDir = "d:\Web\Skins\backend"
$extensions = @("*.java", "*.xml", "*.properties", "*.yml", "*.yaml")

$conflictFiles = @()
foreach ($ext in $extensions) {
    $files = Get-ChildItem -Recurse -Path $baseDir -Include $ext -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -match "<<<<<<< HEAD") {
            $conflictFiles += $file.FullName
        }
    }
}

Write-Host "Found $($conflictFiles.Count) files with conflicts"
Write-Host "================================================"

$fixed = 0
$errors = 0

foreach ($filePath in $conflictFiles) {
    try {
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Pattern để loại bỏ conflict markers và giữ phần HEAD
        # Mẫu: <<<<<<< HEAD \n [HEAD content] \n ======= \n [other content] \n >>>>>>> commit
        
        # Dùng regex để giải quyết conflicts - giữ phần HEAD
        $pattern = '<<<<<<< HEAD\r?\n(.*?)=======\r?\n.*?>>>>>>>[^\n]*\r?\n?'
        $newContent = [regex]::Replace($content, $pattern, '$1', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        
        # Kiểm tra xem có còn conflict markers không
        if ($newContent -match "<<<<<<< HEAD" -or $newContent -match "=======" -or $newContent -match ">>>>>>>") {
            Write-Host "WARN: Still has conflicts after fix: $filePath" -ForegroundColor Yellow
            
            # Thử approach khác: xử lý từng block
            $lines = $content -split '\r?\n'
            $result = @()
            $inConflict = $false
            $inHead = $false
            
            foreach ($line in $lines) {
                if ($line -match '^<<<<<<< ') {
                    $inConflict = $true
                    $inHead = $true
                    continue
                }
                if ($line -match '^=======$' -and $inConflict) {
                    $inHead = $false
                    continue
                }
                if ($line -match '^>>>>>>> ' -and $inConflict) {
                    $inConflict = $false
                    $inHead = $false
                    continue
                }
                
                if (-not $inConflict -or $inHead) {
                    $result += $line
                }
            }
            
            $newContent = $result -join "`r`n"
        }
        
        # Ghi nội dung đã sửa ra file (giữ nguyên encoding)
        [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
        
        Write-Host "FIXED: $filePath" -ForegroundColor Green
        $fixed++
    }
    catch {
        Write-Host "ERROR: $filePath - $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "================================================"
Write-Host "Fixed: $fixed files" -ForegroundColor Green
Write-Host "Errors: $errors files" -ForegroundColor Red

# Kiểm tra lại
Write-Host ""
Write-Host "Verifying - files still with conflicts:"
$remaining = 0
foreach ($ext in $extensions) {
    $files = Get-ChildItem -Recurse -Path $baseDir -Include $ext -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -match "<<<<<<< HEAD") {
            Write-Host "REMAINING CONFLICT: $($file.FullName)" -ForegroundColor Red
            $remaining++
        }
    }
}

if ($remaining -eq 0) {
    Write-Host "All conflicts resolved!" -ForegroundColor Green
} else {
    Write-Host "$remaining files still have conflicts!" -ForegroundColor Red
}
