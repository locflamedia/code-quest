# Biên dịch dự án
Write-Host "Đang biên dịch dự án..."
npm run compile

# Chạy extension trong cửa sổ mới
Write-Host "Khởi động extension..."
code --extensionDevelopmentPath="$PWD" --new-window 