import type { CollectionApiResponse } from "@/types/admin";
import type { UpdateCollection } from "@/lib/db/drizzle/schema";

export async function createCollection(
  data: FormData,
): Promise<CollectionApiResponse> {
  try {
    const response = await fetch("/api/admin/collections", {
      method: "POST",
      body: data,
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
  data: FormData;
}): Promise<CollectionApiResponse> {
  try {
    const response = await fetch(`/api/admin/collections/${id}`, {
      method: "PUT",
      body: data,
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
