# Deploy
node scripts/deploy_simple.js

# Show new CONTRACT_ADDRESS
Write-Output "`n--- NEW CONTRACT ADDRESS ---"
$newAddr = Get-Content .env | Select-String "CONTRACT_ADDRESS" | ForEach-Object { $_ -replace '.*=', '' }
Write-Output $newAddr

# Kill old server, start new
Write-Output "`nRestarting server with new contract..."
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500
Start-Process -FilePath node -ArgumentList 'server.js' -WorkingDirectory (Get-Location) -NoNewWindow -PassThru
Start-Sleep -Seconds 2

# Test upload
Write-Output "`n========== UPLOAD =========="
Get-Date -Format "yyyy-MM-ddTHH:mm:ssK" | Set-Content -Path final_test.txt
curl.exe -s -X POST -F "file=@final_test.txt" -F "studentName=TestUser" -F "course=Blockchain" "http://localhost:3000/upload"

# Test verify
Write-Output "`n========== VERIFY =========="
curl.exe -s -X POST -F "file=@final_test.txt" "http://localhost:3000/verify"

Write-Output "`n✓ COMPLETE!"
