#!/usr/bin/env pwsh
# Push each changed/new file as a separate commit

$files = @(
    "backend/server.js",
    "backend/models/EstateProfile.js",
    "backend/controllers/estateController.js",
    "backend/routes/estateRoutes.js",
    "frontend/src/App.jsx",
    "frontend/src/features/vendor/VendorLayout.jsx",
    "frontend/src/features/vendor/EstateBuilder.jsx",
    "frontend/src/features/wine-farm/WineFarmPage.jsx",
    "frontend/src/features/wine-farm/EstateDetail.jsx",
    "frontend/.env"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        git add $file
        $name = Split-Path $file -Leaf
        git commit -m "feat: update $name"
        Write-Host "Committed: $file" -ForegroundColor Green
    } else {
        Write-Host "Skipped (not found): $file" -ForegroundColor Yellow
    }
}

git push origin main
Write-Host "`nAll files pushed successfully." -ForegroundColor Cyan
