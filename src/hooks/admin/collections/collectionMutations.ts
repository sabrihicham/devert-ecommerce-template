import type { CollectionApiResponse } from "@/types/admin";
import type { InsertCollection, UpdateCollection } from "@/lib/db/drizzle/schema";

export async function createCollection(
  data: InsertCollection,
): Promise<CollectionApiResponse> {
  try {
    const response = await fetch("/api/admin/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || "Error creating collection",
        errors: result.errors,
      };
    }

    return {
      success: true,
      message: result.message || "Collection created successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "Unexpected error creating collection" };
  }
}

export async function updateCollection({
  id,
  data,
}: {
  id: number;
  data: UpdateCollection;
}): Promise<CollectionApiResponse> {
  try {
    const response = await fetch(`/api/admin/collections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || "Error updating collection",
        errors: result.errors,
      };
    }

    return {
      success: true,
      message: result.message || "Collection updated successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "Unexpected error updating collection" };
  }
}

export async function deleteCollection(id: number): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`/api/admin/collections/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.error || "Error deleting collection" };
    }

    return { success: true, message: result.message || "Collection deleted" };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "Unexpected error deleting collection" };
  }
}
