# Revert Backend Restructuring Script
# This moves everything back from backend/ to root
# Run this with: .\revert-restructure.ps1

Write-Host "Reverting backend restructuring..." -ForegroundColor Cyan
Write-Host ""

# Check if backend folder exists
if (-not (Test-Path "backend")) {
    Write-Host "Error: backend/ folder not found. Nothing to revert." -ForegroundColor Red
    exit 1
}

# Move src folder back
Write-Host "Moving src/ folder back to root..." -ForegroundColor Yellow
if (Test-Path "backend\src") {
    Move-Item -Path "backend\src" -Destination "." -Force
}

# Move package files back
Write-Host "Moving package.json and package-lock.json back to root..." -ForegroundColor Yellow
if (Test-Path "backend\package.json") {
    Move-Item -Path "backend\package.json" -Destination "." -Force
}
if (Test-Path "backend\package-lock.json") {
    Move-Item -Path "backend\package-lock.json" -Destination "." -Force
}

# Move .env file back
Write-Host "Moving .env file back to root..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Move-Item -Path "backend\.env" -Destination "." -Force
}

# Move node_modules back
Write-Host "Moving node_modules/ back to root..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Move-Item -Path "backend\node_modules" -Destination "." -Force
}

# Move SQL files back
Write-Host "Moving SQL files back to root..." -ForegroundColor Yellow
$sqlFiles = Get-ChildItem -Path "backend\*.sql" -ErrorAction SilentlyContinue
foreach ($file in $sqlFiles) {
    Move-Item -Path $file.FullName -Destination "." -Force
}

# Move database documentation back
Write-Host "Moving database documentation back to root..." -ForegroundColor Yellow
$docs = @("DATABASE_SETUP.md", "SETUP_DATABASE.md")
foreach ($doc in $docs) {
    if (Test-Path "backend\$doc") {
        Move-Item -Path "backend\$doc" -Destination "." -Force
    }
}

# Remove empty backend folder
Write-Host "Removing empty backend/ folder..." -ForegroundColor Yellow
$backendContents = Get-ChildItem -Path "backend" -ErrorAction SilentlyContinue
if ($backendContents.Count -eq 0) {
    Remove-Item -Path "backend" -Force
    Write-Host "  Backend folder removed" -ForegroundColor Gray
} else {
    Write-Host "  Backend folder not empty, keeping it:" -ForegroundColor Gray
    Get-ChildItem -Path "backend" | ForEach-Object { Write-Host "    - $($_.Name)" -ForegroundColor Gray }
}

Write-Host ""
Write-Host "Revert complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your project structure is back to original:" -ForegroundColor Cyan
Write-Host "  src/" -ForegroundColor White
Write-Host "  package.json" -ForegroundColor White
Write-Host "  .env" -ForegroundColor White
Write-Host "  frontendnew/" -ForegroundColor White
Write-Host ""
Write-Host "You can now run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
