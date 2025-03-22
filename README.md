# Code Quest

Trò chơi phiêu lưu học lập trình trong VS Code. Code Quest cho phép người dùng viết code để điều khiển nhân vật và giải quyết các thử thách lập trình.

## Tính năng

- Học lập trình thông qua trò chơi tương tác
- Sử dụng WebView để hiển thị thế giới game
- Nhiều cấp độ học tập, từ cơ bản đến nâng cao
- Dễ dàng tích hợp vào quy trình làm việc VS Code của bạn

## Cài đặt

1. Tải xuống extension từ VS Code Marketplace (coming soon)
2. Hoặc tự build từ source code:
   - Clone repository
   - Run `npm install`
   - Run `npm run compile`
   - Press F5 để chạy trong development mode

## Cách sử dụng

1. Mở VS Code
2. Nhấn Ctrl+Shift+P (hoặc Cmd+Shift+P trên macOS)
3. Gõ "Code Quest: Bắt đầu trò chơi" và nhấn Enter

## Phát triển

Dự án được phát triển với TypeScript và VS Code API.

```
code-quest/
├── src/                  # Mã nguồn
│   ├── assets/           # Các tài nguyên như hình ảnh, âm thanh
│   ├── game/             # Logic trò chơi
│   │   ├── engine/       # Game engine
│   │   └── levels/       # Các cấp độ
│   └── webview/          # Giao diện người dùng
├── package.json          # Cấu hình dự án
└── tsconfig.json         # Cấu hình TypeScript
```

## Lộ trình phát triển

- MVP: 1 level demo hoàn chỉnh
- Phase 1-3: Mở rộng level, tính năng và cộng đồng
- Kế hoạch dài hạn: DLC, multiplayer, tích hợp học tập

## Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng đọc CONTRIBUTING.md để biết thêm chi tiết.

## Giấy phép

[MIT](LICENSE)
