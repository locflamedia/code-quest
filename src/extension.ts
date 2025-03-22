import * as vscode from "vscode";
import { GamePanel } from "./webview/gamePanel";
import { GameEngine } from "./game/engine/gameEngine";

// Biến toàn cục để lưu trữ game engine
let gameEngine: GameEngine | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "code-quest" is now active!');

  // Đăng ký lệnh khởi tạo game engine
  let startEngineCommand = vscode.commands.registerCommand(
    "code-quest.startEngine",
    () => {
      if (GamePanel.currentPanel) {
        // Thông báo cho webview để bắt đầu game
        GamePanel.currentPanel.sendMessageToWebview({
          command: "startGame",
        });
      }
    }
  );
  context.subscriptions.push(startEngineCommand);

  let disposable = vscode.commands.registerCommand(
    "code-quest.startGame",
    () => {
      // Tạo hoặc hiển thị panel game
      const panel = GamePanel.createOrShow(context.extensionUri);

      // Xử lý tin nhắn từ webview
      panel.setMessageHandler((message: any) => {
        switch (message.command) {
          case "initializeGame":
            vscode.window.showInformationMessage(
              "Đang khởi tạo trò chơi Code Quest..."
            );

            // Thực hiện logic khởi tạo game
            try {
              // Lấy ID của canvas từ thông điệp
              const canvasId = message.canvasId;
              if (canvasId) {
                // Thực thi lệnh khởi động game engine
                vscode.commands.executeCommand("code-quest.startEngine");
              } else {
                throw new Error("Không tìm thấy canvas");
              }
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              vscode.window.showErrorMessage(
                `Lỗi khởi tạo game: ${errorMessage}`
              );
            }
            break;
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  // Dọn dẹp tài nguyên khi tắt extension
  if (gameEngine) {
    // Dừng game engine nếu đang chạy
    gameEngine = undefined;
  }
}
