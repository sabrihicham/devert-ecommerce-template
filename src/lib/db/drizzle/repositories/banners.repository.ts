import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../connection";
import { homepageBanners } from "../schema";
import type { Banner, InsertBanner, UpdateBanner } from "@/lib/db/drizzle/schema";

function transformBanner(row: typeof homepageBanners.$inferSelect): Banner {
  return {
    id: row.id,
    imageUrl: row.imageUrl,
    title: row.title,
    subtitle: row.subtitle,
    linkUrl: row.linkUrl,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const bannersRepository = {
  async findAll(): Promise<Banner[]> {
    const rows = await db
      .select()
      .from(homepageBanners)
      .orderBy(asc(homepageBanners.sortOrder), asc(homepageBanners.id));
    return rows.map(transformBanner);
  },

  async findActive(): Promise<Banner[]> {
    const rows = await db
      .select()
      .from(homepageBanners)
      .where(eq(homepageBanners.isActive, true))
      .orderBy(asc(homepageBanners.sortOrder), asc(homepageBanners.id));
    return rows.map(transformBanner);
  },

  async findById(id: number): Promise<Banner | null> {
    const [row] = await db
      .select()
      .from(homepageBanners)
      .where(eq(homepageBanners.id, id))
      .limit(1);
    return row ? transformBanner(row) : null;
  },

  async create(data: InsertBanner): Promise<Banner | null> {
    const [row] = await db.insert(homepageBanners).values(data).returning();
    return row ? transformBanner(row) : null;
  },

  async update(id: number, data: UpdateBanner): Promise<Banner | null> {
    const [row] = await db
      .update(homepageBanners)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(homepageBanners.id, id))
      .returning();
    return row ? transformBanner(row) : null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(homepageBanners)
      .where(eq(homepageBanners.id, id))
      .returning({ id: homepageBanners.id });
    return result.length > 0;
  },

  /** Bulk-updates sortOrder to match the given ordered array of banner IDs. */
  async reorder(orderedIds: number[]): Promise<boolean> {
    if (orderedIds.length === 0) return true;

    await db.transaction(async (tx) => {
      await Promise.all(
        orderedIds.map((id, index) =>
          tx
            .update(homepageBanners)
            .set({ sortOrder: index, updatedAt: new Date() })
            .where(eq(homepageBanners.id, id)),
        ),
      );
    });

    const rows = await db
      .select({ id: homepageBanners.id })
      .from(homepageBanners)
      .where(inArray(homepageBanners.id, orderedIds));
    return rows.length === orderedIds.length;
  },
};
