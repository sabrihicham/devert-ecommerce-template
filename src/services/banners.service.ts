import { bannersRepository } from "@/lib/db/drizzle/repositories";
import type { Banner } from "@/lib/db/drizzle/schema";

export async function getAllBanners(): Promise<Banner[]> {
  try {
    return await bannersRepository.findAll();
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}
