import type { Icon } from "../types/db";

export class IconsService {
  private _initialized: boolean = false;

  private async ensureTables(): Promise<void> {
    if (this._initialized) return;
    
    await this.db.prepare(
      `CREATE TABLE IF NOT EXISTS icons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        media_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();
    
    try {
      const info = await this.db.prepare("PRAGMA table_info(icons);").all<any>();
      const columns = (info as any).results?.map((r: any) => r.name) ?? [];
      if (!columns.includes("name")) {
        await this.db.prepare("ALTER TABLE icons ADD COLUMN name TEXT").run();
      }
      if (!columns.includes("image_url")) {
        await this.db.prepare("ALTER TABLE icons ADD COLUMN image_url TEXT").run();
      }
      if (!columns.includes("media_type")) {
        await this.db.prepare("ALTER TABLE icons ADD COLUMN media_type TEXT").run();
      }
      if (!columns.includes("media_type")) {
        await this.db.prepare("ALTER TABLE icons ADD COLUMN media_type TEXT NOT NULL DEFAULT ''").run();
      }
    } catch {
      // ignore migration errors
    }
    
    this._initialized = true;
  }

  constructor(private db: D1Database) {}

  async getAllIcons(): Promise<Icon[]> {
    await this.ensureTables();
    const result = await this.db.prepare("SELECT * FROM icons ORDER BY name ASC").all<Icon>();
    return result.results;
  }

  async getIconById(id: number): Promise<Icon | null> {
    await this.ensureTables();
    const result = await this.db.prepare("SELECT * FROM icons WHERE id = ?").bind(id).first<Icon>();
    return result;
  }

  async createIcon(name: string, imageUrl: string, mediaType: string = ""): Promise<Icon> {
    await this.ensureTables();
    const result = await this.db
      .prepare("INSERT INTO icons (name, image_url, media_type) VALUES (?, ?, ?) RETURNING *")
      .bind(name, imageUrl, mediaType)
      .first<Icon>();
    
    if (!result) {
      throw new Error("Failed to create icon");
    }
    return result;
  }

  async updateIcon(id: number, name: string, imageUrl: string, mediaType: string = ""): Promise<Icon | null> {
    await this.ensureTables();
    const result = await this.db
      .prepare("UPDATE icons SET name = ?, image_url = ?,  media_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *")
      .bind(name, imageUrl, mediaType, id)
      .first<Icon>();
    
    return result;
  }

  async deleteIcon(id: number): Promise<boolean> {
    await this.ensureTables();
    const result = await this.db.prepare("DELETE FROM icons WHERE id = ?").bind(id).run();
    return result.success;
  }
}
