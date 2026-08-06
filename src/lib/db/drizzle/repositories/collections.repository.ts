import { asc, eq } from "drizzle-orm";
import { db } from "../connection";
import { collections } from "../schema";
import type {
  Collection,
  InsertCollection,
  UpdateCollection,
} from "@/lib/db/drizzle/schema";

const FOREIGN_KEY_VIOLATION_CODE = "23503";
const UNIQUE_VIOLATION_CODE = "23505";

function isForeignKeyViolation(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === FOREIGN_KEY_VIOLATION_CODE
  );
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === UNIQUE_VIOLATION_CODE
  );
}

function transformCollection(
  row: typeof collections.$inferSelect,
): Collection {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const collectionsRepository = {
  async findAll(): Promise<Collection[]> {
    const rows = await db
      .select()
      .from(collections)
      .orderBy(asc(collections.name));
    return rows.map(transformCollection);
  },

  async findById(id: number): Promise<Collection | null> {
    const [row] = await db
      .select()
      .from(collections)
      .where(eq(collections.id, id))
      .limit(1);
    return row ? transformCollection(row) : null;
  },

  async findBySlug(slug: string): Promise<Collection | null> {
    const [row] = await db
      .select()
      .from(collections)
      .where(eq(collections.slug, slug))
      .limit(1);
    return row ? transformCollection(row) : null;
  },

  /** Returns null when the slug is already taken by another collection. */
  async create(data: InsertCollection): Promise<Collection | null> {
    try {
      const [row] = await db.insert(collections).values(data).returning();
      return row ? transformCollection(row) : null;
    } catch (error) {
      if (isUniqueViolation(error)) return null;
      throw error;
    }
  },

  /** Returns null when the slug is already taken by another collection. */
  async update(
    id: number,
    data: UpdateCollection,
  ): Promise<Collection | null> {
    try {
      const [row] = await db
        .update(collections)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(collections.id, id))
        .returning();
      return row ? transformCollection(row) : null;
    } catch (error) {
      if (isUniqueViolation(error)) return null;
      throw error;
    }
  },

  /**
   * Returns `{ ok: false, reason: "in-use" }` when the collection still has
   * products referencing it (FK restrict), instead of throwing.
   */
  async delete(
    id: number,
  ): Promise<{ ok: true } | { ok: false; reason: "in-use" | "not-found" }> {
    try {
      const result = await db
        .delete(collections)
        .where(eq(collections.id, id))
        .returning({ id: collections.id });
      return result.length > 0
        ? { ok: true }
        : { ok: false, reason: "not-found" };
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return { ok: false, reason: "in-use" };
      }
      throw error;
    }
  },
};
