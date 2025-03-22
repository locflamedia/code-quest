export interface LevelData {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  objectives: string[];
  startingCode: string;
  validationCode: string;
}

export class Level {
  private data: LevelData;

  constructor(data: LevelData) {
    this.data = data;
  }

  public getId(): string {
    return this.data.id;
  }

  public getTitle(): string {
    return this.data.title;
  }

  public getDescription(): string {
    return this.data.description;
  }

  public getDifficulty(): string {
    return this.data.difficulty;
  }

  public getObjectives(): string[] {
    return this.data.objectives;
  }

  public getStartingCode(): string {
    return this.data.startingCode;
  }

  public validateCode(userCode: string): boolean {
    // Đây là một cách đơn giản để demo, trong thực tế sẽ phức tạp hơn
    try {
      // Trong phiên bản thực, chúng ta sẽ sử dụng các kỹ thuật an toàn hơn
      // để chạy và kiểm tra code của người dùng
      return true;
    } catch (error) {
      console.error("Error validating code:", error);
      return false;
    }
  }
}
