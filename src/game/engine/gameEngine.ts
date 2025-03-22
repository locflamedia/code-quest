import { Level1 } from "../levels/level1";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private running: boolean = false;
  private animationFrameId: number = 0;
  private lastTimestamp: number = 0;
  private gameObjects: GameObject[] = [];
  private player: Player | null = null;
  private currentLevel: Level1 | null = null;
  private levelComplete: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Không thể tạo 2D context");
    }
    this.context = ctx;
    this.initializeGame();
  }

  private initializeGame(): void {
    // Khởi tạo level 1
    this.currentLevel = new Level1(this.canvas.width, this.canvas.height);

    // Lấy đối tượng từ level
    this.gameObjects = this.currentLevel.getGameObjects();
    this.player = this.currentLevel.getPlayer();

    // Thêm bộ lắng nghe sự kiện
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Có thể thêm các sự kiện cho trò chơi ở đây
  }

  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  public stop(): void {
    if (!this.running) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
    this.running = false;
  }

  private gameLoop(timestamp: number): void {
    // Tính delta time (thời gian giữa các frame)
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Cập nhật logic game
    this.update(deltaTime / 1000); // Chuyển đổi từ ms sang s

    // Vẽ trò chơi
    this.render();

    // Yêu cầu frame tiếp theo nếu đang chạy
    if (this.running) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  private update(deltaTime: number): void {
    if (this.levelComplete) return;

    // Cập nhật tất cả đối tượng trong game
    this.gameObjects.forEach((obj) => obj.update(deltaTime));

    // Kiểm tra va chạm giữa người chơi và các vật phẩm
    if (this.player && this.currentLevel) {
      const collectibles = this.currentLevel.getCollectibles();
      collectibles.forEach((collectible) => {
        if (
          !collectible.isCollected() &&
          this.isColliding(this.player!, collectible)
        ) {
          // Xử lý va chạm (thu thập vật phẩm)
          collectible.collect();
          // Cộng điểm cho người chơi
          this.player!.addScore(collectible.getPoints());

          // Kiểm tra hoàn thành level
          if (this.currentLevel!.checkLevelComplete()) {
            this.levelComplete = true;
            this.renderLevelComplete();
          }
        }
      });
    }
  }

  private isColliding(a: GameObject, b: GameObject): boolean {
    // Kiểm tra va chạm đơn giản giữa hai đối tượng
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
  }

  private render(): void {
    // Xóa canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Vẽ background
    this.context.fillStyle = "#333";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Vẽ tất cả đối tượng
    this.gameObjects.forEach((obj) => obj.render(this.context));

    // Hiển thị thông tin trò chơi
    this.renderUI();
  }

  private renderUI(): void {
    // Hiển thị thông tin trò chơi (điểm, mạng, vv)
    this.context.fillStyle = "#fff";
    this.context.font = "16px Arial";
    this.context.textAlign = "left";
    this.context.fillText("Code Quest - Phiêu lưu", 10, 30);

    if (this.player) {
      this.context.fillText(`Điểm: ${this.player.score}`, 10, 60);
    }

    if (this.levelComplete) {
      this.renderLevelComplete();
    }
  }

  private renderLevelComplete(): void {
    // Hiển thị màn hình hoàn thành level
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.context.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = "#fff";
    this.context.font = "30px Arial";
    this.context.textAlign = "center";
    this.context.fillText("Level hoàn thành!", centerX, centerY - 40);

    this.context.font = "20px Arial";
    this.context.fillText(
      "Chúc mừng! Bạn đã hoàn thành thử thách",
      centerX,
      centerY
    );

    this.context.font = "16px Arial";
    this.context.fillText(
      "Thêm nhiều level sẽ được phát triển sau",
      centerX,
      centerY + 40
    );
  }
}

// Class cơ sở cho tất cả đối tượng trong game
export abstract class GameObject {
  public x: number;
  public y: number;
  public radius: number = 20;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
}

// Class nhân vật người chơi
export class Player extends GameObject {
  public speed: number = 200; // Tốc độ di chuyển (pixels/giây)
  public score: number = 0;
  private keys: { [key: string]: boolean } = {};

  constructor(x: number, y: number) {
    super(x, y);
    this.radius = 25;

    // Thiết lập điều khiển bàn phím
    window.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }

  update(deltaTime: number): void {
    // Di chuyển dựa trên phím bấm
    if (this.keys["ArrowUp"] || this.keys["w"]) {
      this.y -= this.speed * deltaTime;
    }
    if (this.keys["ArrowDown"] || this.keys["s"]) {
      this.y += this.speed * deltaTime;
    }
    if (this.keys["ArrowLeft"] || this.keys["a"]) {
      this.x -= this.speed * deltaTime;
    }
    if (this.keys["ArrowRight"] || this.keys["d"]) {
      this.x += this.speed * deltaTime;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Vẽ người chơi
    ctx.fillStyle = "#0078d7";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  addScore(points: number): void {
    this.score += points;
  }
}

// Class vật phẩm có thể thu thập
export class Collectible extends GameObject {
  private collected: boolean = false;
  private points: number = 10;

  constructor(x: number, y: number) {
    super(x, y);
    this.radius = 15;
  }

  update(deltaTime: number): void {
    // Logic cập nhật vật phẩm (ví dụ: xoay, di chuyển, vv)
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;

    // Vẽ vật phẩm
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  collect(): void {
    this.collected = true;
  }

  getPoints(): number {
    return this.points;
  }

  isCollected(): boolean {
    return this.collected;
  }
}
