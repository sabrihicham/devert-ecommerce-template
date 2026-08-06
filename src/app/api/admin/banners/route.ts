import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { bannersRepository } from "@/lib/db/drizzle/repositories";
import { verifyAdmin } from "@/utils/admin";
import {
  deleteBannerImageByUrl,
  nextSortOrder,
  parseBannerFields,
  safeRevalidateBanners,
  uploadBannerImage,
} from "./shared";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const banners = await bannersRepository.findAll();
  return NextResponse.json({ banners });
}

export async function POST(request: NextRequest) {
  let uploadedImageUrl: string | null = null;

  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const imageEntry = formData.get("image");

    if (!(imageEntry instanceof File) || imageEntry.size === 0) {
      return NextResponse.json(
        { error: "Banner image is required" },
        { status: 400 },
      );
    }

    const fields = parseBannerFields(formData);

    const imageUrl = await uploadBannerImage(imageEntry);
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Error uploading banner image" },
        { status: 500 },
      );
    }
    uploadedImageUrl = imageUrl;

    // Default new banners to the end of the list unless a sortOrder was supplied.
    const sortOrder = formData.get("sortOrder")
      ? fields.sortOrder
      : await nextSortOrder();

    const banner = await bannersRepository.create({
      ...fields,
      sortOrder,
      imageUrl,
    });

    if (!banner) {
      return NextResponse.json(
        { error: "Error creating banner" },
        { status: 500 },
      );
    }

    uploadedImageUrl = null;
    await safeRevalidateBanners();

    return NextResponse.json({
      success: true,
      message: "Banner created successfully",
      data: banner,
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

    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
