import { GameObject, Player, Collectible } from "../engine/gameEngine";

export class Level1 {
  private gameObjects: GameObject[] = [];
  private player: Player;
  private collectibles: Collectible[] = [];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    // Tạo người chơi ở vị trí ban đầu
    this.player = new Player(100, height / 2);
    this.gameObjects.push(this.player);

    // Tạo các vật phẩm có thể thu thập
    this.createCollectibles();
  }

  private createCollectibles(): void {
    // Tạo các vật phẩm ở vị trí cố định
    const positions = [
      { x: 200, y: 100 },
      { x: 350, y: 200 },
      { x: 500, y: 150 },
      { x: 650, y: 300 },
      { x: 400, y: 400 },
    ];

    positions.forEach((pos) => {
      const collectible = new Collectible(pos.x, pos.y);
      this.collectibles.push(collectible);
      this.gameObjects.push(collectible);
    });
  }

  public getGameObjects(): GameObject[] {
    return this.gameObjects;
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getCollectibles(): Collectible[] {
    return this.collectibles;
  }

  public checkLevelComplete(): boolean {
    // Kiểm tra nếu tất cả vật phẩm đã được thu thập
    return this.collectibles.every((c) => c.isCollected());
  }
}
