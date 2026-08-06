import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { revalidateCollections } from "@/app/actions";
import { collectionsRepository } from "@/lib/db/drizzle/repositories";
import { insertCollectionSchema } from "@/lib/db/drizzle/schema";
import { verifyAdmin } from "@/utils/admin";
import { collectionFields, uploadCategoryImage } from "./shared";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collections = await collectionsRepository.findAll();
  return NextResponse.json({ collections });
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get("image");
    const uploadedImage = image instanceof File && image.size ? await uploadCategoryImage(image) : null;
    const fields = insertCollectionSchema.parse({ ...collectionFields(formData), imageUrl: uploadedImage });

    const collection = await collectionsRepository.create(fields);

    if (!collection) {
      return NextResponse.json(
        { error: "A collection with that slug already exists" },
        { status: 409 },
      );
    }

    await revalidateCollections();

    return NextResponse.json({
      success: true,
      message: "Collection created successfully",
      data: collection,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid collection payload",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
