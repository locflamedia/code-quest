import * as vscode from "vscode";
import { getNonce } from "../utils";

export class GamePanel {
  public static currentPanel: GamePanel | undefined;
  private static readonly viewType = "codeQuest";
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri): GamePanel {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // Nếu panel đã được hiển thị, hiển thị lại
    if (GamePanel.currentPanel) {
      GamePanel.currentPanel._panel.reveal(column);
      return GamePanel.currentPanel;
    }

    // Nếu chưa có panel, tạo panel mới
    const panel = vscode.window.createWebviewPanel(
      GamePanel.viewType,
      "Code Quest",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "out"),
          vscode.Uri.joinPath(extensionUri, "src/assets"),
        ],
      }
    );

    GamePanel.currentPanel = new GamePanel(panel, extensionUri);
    return GamePanel.currentPanel;
  }

  // Xử lý messages từ webview
  private _messageHandler: ((message: any) => void) | undefined;

  public setMessageHandler(handler: (message: any) => void): void {
    this._messageHandler = handler;
  }

  // Phương thức gửi tin nhắn đến webview
  public sendMessageToWebview(message: any): void {
    if (this._panel.webview) {
      this._panel.webview.postMessage(message);
    }
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Thiết lập nội dung HTML ban đầu
    this._update();

    // Lắng nghe khi panel đóng
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Cập nhật nội dung nếu trạng thái webview thay đổi
    this._panel.onDidChangeViewState(
      (_e: vscode.WebviewPanelOnDidChangeViewStateEvent) => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    // Xử lý messages từ webview
    this._panel.webview.onDidReceiveMessage(
      (message: any) => {
        switch (message.command) {
          case "alert":
            vscode.window.showErrorMessage(message.text);
            return;
          default:
            // Chuyển tiếp message cho handler tùy chỉnh nếu có
            if (this._messageHandler) {
              this._messageHandler(message);
            }
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    GamePanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;
    this._panel.title = "Code Quest";
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Nonce bảo mật để chỉ cho phép nội dung cụ thể
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} blob: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src ${webview.cspSource};">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Quest</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #1e1e1e;
            color: #ffffff;
            font-family: Arial, sans-serif;
          }
          
          #game-container {
            width: 800px;
            height: 600px;
            border: 2px solid #333;
            position: relative;
            overflow: hidden;
          }
          
          canvas {
            width: 100%;
            height: 100%;
            display: block;
          }
          
          #game-ui {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 10;
          }
          
          .welcome-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
          }
          
          .welcome-screen h1 {
            font-size: 3em;
            margin-bottom: 20px;
            color: #0078d7;
          }
          
          .welcome-screen p {
            font-size: 1.2em;
            margin-bottom: 30px;
            max-width: 600px;
          }
          
          .start-button {
            padding: 10px 20px;
            font-size: 1.2em;
            background-color: #0078d7;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          
          .start-button:hover {
            background-color: #005a9e;
          }
        </style>
      </head>
      <body>
        <div id="game-container">
          <div class="welcome-screen">
            <h1>Code Quest</h1>
            <p>Chào mừng đến với Code Quest! Hãy viết code để điều khiển nhân vật và giải quyết các thử thách lập trình.</p>
            <button class="start-button" id="startGame">Bắt đầu Phiêu lưu</button>
          </div>
          <canvas id="game-canvas" style="display: none;"></canvas>
          <div id="game-ui"></div>
        </div>

        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          let gameStarted = false; // Biến theo dõi trạng thái game
          
          document.getElementById('startGame').addEventListener('click', () => {
            document.querySelector('.welcome-screen').style.display = 'none';
            document.getElementById('game-canvas').style.display = 'block';
            initGame();
          });
          
          function initGame() {
            // Lấy canvas và khởi tạo game
            const canvas = document.getElementById('game-canvas');
            
            // Đảm bảo canvas có kích thước đúng
            canvas.width = 800;
            canvas.height = 600;
            
            try {
              // Gửi thông báo tới extension để khởi tạo game engine
              vscode.postMessage({
                command: 'initializeGame',
                canvasId: 'game-canvas'
              });
              
              // Hiển thị thông báo tạm thời cho người dùng biết
              const gameUI = document.getElementById('game-ui');
              if (gameUI) {
                gameUI.innerHTML = '<div style="background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px;">Đang tải trò chơi...</div>';
                
                // Xóa thông báo sau 3 giây
                setTimeout(() => {
                  if (gameUI.firstChild) {
                    gameUI.removeChild(gameUI.firstChild);
                  }
                }, 3000);
              }
            } catch (error) {
              vscode.postMessage({
                command: 'alert',
                text: 'Lỗi khi khởi tạo game: ' + error
              });
            }
          }
          
          // Lắng nghe tin nhắn từ extension
          window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
              case 'startGame':
                if (!gameStarted) {
                  startGameEngine();
                  gameStarted = true;
                }
                break;
            }
          });
          
          function startGameEngine() {
            console.log('Bắt đầu game engine trong webview');
            const canvas = document.getElementById('game-canvas');
            if (!canvas) {
              vscode.postMessage({
                command: 'alert',
                text: 'Không tìm thấy canvas'
              });
              return;
            }
            
            // Khởi tạo đối tượng game
            try {
              // Vẽ một hình cơ bản để kiểm tra canvas hoạt động
              const ctx = canvas.getContext('2d');
              if (ctx) {
                // Xóa canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Vẽ background
                ctx.fillStyle = "#333";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Vẽ người chơi ví dụ
                ctx.fillStyle = "#0078d7";
                ctx.beginPath();
                ctx.arc(100, canvas.height / 2, 25, 0, Math.PI * 2);
                ctx.fill();
                
                // Vẽ một số vật phẩm ví dụ
                const positions = [
                  { x: 200, y: 100 },
                  { x: 350, y: 200 },
                  { x: 500, y: 150 },
                  { x: 650, y: 300 },
                  { x: 400, y: 400 },
                ];
                
                positions.forEach((pos) => {
                  ctx.fillStyle = "#ffd700";
                  ctx.beginPath();
                  ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
                  ctx.fill();
                });
                
                // Vẽ text
                ctx.fillStyle = "#fff";
                ctx.font = "16px Arial";
                ctx.textAlign = "left";
                ctx.fillText("Code Quest - Phiêu lưu", 10, 30);
                ctx.fillText("Điểm: 0", 10, 60);
                
                // Thiết lập các phím điều khiển cơ bản
                setupBasicControls(canvas, ctx);
              }
              
              // Thông báo là game đã sẵn sàng
              const gameUI = document.getElementById('game-ui');
              if (gameUI) {
                gameUI.innerHTML = '<div style="background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px;">Game đã sẵn sàng! Sử dụng các phím mũi tên hoặc WASD để di chuyển.</div>';
                
                // Xóa thông báo sau 5 giây
                setTimeout(() => {
                  if (gameUI.firstChild) {
                    gameUI.removeChild(gameUI.firstChild);
                  }
                }, 5000);
              }
            } catch (error) {
              vscode.postMessage({
                command: 'alert',
                text: 'Lỗi khi khởi động game engine: ' + error
              });
            }
          }
          
          // Thiết lập điều khiển cơ bản để người dùng có thể tương tác
          function setupBasicControls(canvas, ctx) {
            const playerX = 100;
            const playerY = canvas.height / 2;
            const playerSpeed = 5;
            const playerRadius = 25;
            let score = 0;
            
            const collectibles = [
              { x: 200, y: 100, collected: false },
              { x: 350, y: 200, collected: false },
              { x: 500, y: 150, collected: false },
              { x: 650, y: 300, collected: false },
              { x: 400, y: 400, collected: false },
            ];
            
            let player = {
              x: playerX,
              y: playerY,
              radius: playerRadius,
              speed: playerSpeed
            };
            
            let keys = {};
            
            // Thiết lập sự kiện bàn phím
            window.addEventListener('keydown', (e) => {
              keys[e.key] = true;
            });
            
            window.addEventListener('keyup', (e) => {
              keys[e.key] = false;
            });
            
            // Hàm kiểm tra va chạm
            function isColliding(a, b) {
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              return distance < a.radius + b.radius;
            }
            
            // Hàm cập nhật và render game
            function gameLoop() {
              // Xóa canvas
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              // Vẽ background
              ctx.fillStyle = "#333";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Cập nhật vị trí người chơi dựa trên phím bấm
              if (keys['ArrowUp'] || keys['w']) {
                player.y -= player.speed;
              }
              if (keys['ArrowDown'] || keys['s']) {
                player.y += player.speed;
              }
              if (keys['ArrowLeft'] || keys['a']) {
                player.x -= player.speed;
              }
              if (keys['ArrowRight'] || keys['d']) {
                player.x += player.speed;
              }
              
              // Giới hạn vị trí người chơi trong canvas
              player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
              player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
              
              // Kiểm tra va chạm và thu thập vật phẩm
              collectibles.forEach((collectible, index) => {
                if (!collectible.collected) {
                  // Kiểm tra va chạm
                  if (isColliding(player, { x: collectible.x, y: collectible.y, radius: 15 })) {
                    collectible.collected = true;
                    score += 10;
                  }
                  
                  // Vẽ vật phẩm
                  ctx.fillStyle = "#ffd700";
                  ctx.beginPath();
                  ctx.arc(collectible.x, collectible.y, 15, 0, Math.PI * 2);
                  ctx.fill();
                }
              });
              
              // Vẽ người chơi
              ctx.fillStyle = "#0078d7";
              ctx.beginPath();
              ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
              ctx.fill();
              
              // Vẽ text
              ctx.fillStyle = "#fff";
              ctx.font = "16px Arial";
              ctx.textAlign = "left";
              ctx.fillText("Code Quest - Phiêu lưu", 10, 30);
              ctx.fillText("Điểm: " + score, 10, 60);
              
              // Kiểm tra nếu tất cả vật phẩm đã được thu thập
              const allCollected = collectibles.every(c => c.collected);
              if (allCollected) {
                // Hiển thị màn hình hoàn thành level
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = "#fff";
                ctx.font = "30px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Level hoàn thành!", centerX, centerY - 40);
                
                ctx.font = "20px Arial";
                ctx.fillText("Chúc mừng! Bạn đã hoàn thành thử thách", centerX, centerY);
                
                ctx.font = "16px Arial";
                ctx.fillText("Thêm nhiều level sẽ được phát triển sau", centerX, centerY + 40);
              } else {
                // Yêu cầu frame tiếp theo
                requestAnimationFrame(gameLoop);
              }
            }
            
            // Bắt đầu game loop
            gameLoop();
          }
        </script>
      </body>
      </html>`;
  }
}
