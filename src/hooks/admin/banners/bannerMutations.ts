import type { BannerApiResponse } from "@/types/admin";

export async function createBanner(formData: FormData): Promise<BannerApiResponse> {
  try {
    const response = await fetch("/api/admin/banners", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || "Error creating banner",
        errors: result.errors,
      };
    }

    return {
      success: true,
      message: result.message || "Banner created successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "Unexpected error creating banner" };
  }
}

export async function updateBanner({
  id,
  formData,
}: {
  id: number;
  formData: FormData;
}): Promise<BannerApiResponse> {
  try {
    const response = await fetch(`/api/admin/banners/${id}`, {
      method: "PUT",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || "Error updating banner",
        errors: result.errors,
      };
    }

    return {
      success: true,
      message: result.message || "Banner updated successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "Unexpected error updating banner" };
  }
}

export async function deleteBanner(bannerId: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/banners/${bannerId}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting banner:", error);
    return false;
  }
}

export async function reorderBanners(ids: number[]): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/banners/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error reordering banners:", error);
    return false;
  }
}
