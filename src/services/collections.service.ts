import { collectionsRepository } from "@/lib/db/drizzle/repositories";
import type { Collection } from "@/lib/db/drizzle/schema";

export async function getAllCollections(): Promise<Collection[]> {
  try {
    return await collectionsRepository.findAll();
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}
