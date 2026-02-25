import type { Testimonial } from "../types/db";

export class TestimonialsService {
  constructor(private db: D1Database) {}

  async getAllTestimonials(): Promise<Testimonial[]> {
    const result = await this.db
      .prepare("SELECT * FROM testimonials ORDER BY created_at DESC")
      .all<Testimonial>();
    return result.results;
  }

  async getTestimonialById(id: number): Promise<Testimonial | null> {
    const result = await this.db
      .prepare("SELECT * FROM testimonials WHERE id = ?")
      .bind(id)
      .first<Testimonial>();
    return result;
  }

  async createTestimonial(name: string, description?: string | null, store?: string): Promise<Testimonial> {
    const result = await this.db
      .prepare("INSERT INTO testimonials (name, description, store) VALUES (?, ?, ?) RETURNING *")
      .bind(name, description ?? null, store ?? '')
      .first<Testimonial>();
    if (!result) throw new Error("Failed to create testimonial");
    return result;
  }

  async updateTestimonial(id: number, name: string, description?: string | null, store?: string): Promise<Testimonial | null> {
    const result = await this.db
      .prepare("UPDATE testimonials SET name = ?, description = ?, store = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *")
      .bind(name, description ?? null, store ?? '', id)
      .first<Testimonial>();
    return result;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    const result = await this.db.prepare("DELETE FROM testimonials WHERE id = ?").bind(id).run();
    return result.success;
  }
}
