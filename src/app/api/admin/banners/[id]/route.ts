import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { bannersRepository } from "@/lib/db/drizzle/repositories";
import { verifyAdmin } from "@/utils/admin";
import {
  deleteBannerImageByUrl,
  parseBannerFields,
  safeRevalidateBanners,
  uploadBannerImage,
} from "../shared";

const bannerIdSchema = z.coerce.number().int().positive();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let uploadedImageUrl: string | null = null;

  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = bannerIdSchema.parse(rawId);

    const existingBanner = await bannersRepository.findById(id);
    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const fields = parseBannerFields(formData);
    const imageEntry = formData.get("image");

    let imageUrl = existingBanner.imageUrl;
    let previousImageUrl: string | null = null;

    if (imageEntry instanceof File && imageEntry.size > 0) {
      const uploaded = await uploadBannerImage(imageEntry);
      if (!uploaded) {
        return NextResponse.json(
          { error: "Error uploading banner image" },
          { status: 500 },
        );
      }
      uploadedImageUrl = uploaded;
      previousImageUrl = existingBanner.imageUrl;
      imageUrl = uploaded;
    }

    const updated = await bannersRepository.update(id, { ...fields, imageUrl });

    if (!updated) {
      return NextResponse.json(
        { error: "Error updating banner" },
        { status: 500 },
      );
    }

    uploadedImageUrl = null;
    if (previousImageUrl) {
      await deleteBannerImageByUrl(previousImageUrl).catch((error) => {
        console.error("Error deleting previous banner image:", error);
      });
    }

    await safeRevalidateBanners();

    return NextResponse.json({
      success: true,
      message: "Banner updated successfully",
      data: updated,
    });
  } catch (error) {
    if (uploadedImageUrl) {
      await deleteBannerImageByUrl(uploadedImageUrl).catch(() => undefined);
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid banner payload", errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = bannerIdSchema.parse(rawId);

    const existingBanner = await bannersRepository.findById(id);
    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    const deleted = await bannersRepository.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Error deleting banner" },
        { status: 500 },
      );
    }

    await deleteBannerImageByUrl(existingBanner.imageUrl).catch((error) => {
      console.error("Error deleting banner image:", error);
    });

    await safeRevalidateBanners();

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid banner id", errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
