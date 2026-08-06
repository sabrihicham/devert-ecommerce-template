import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { revalidateCollections } from "@/app/actions";
import { collectionsRepository } from "@/lib/db/drizzle/repositories";
import { updateCollectionSchema } from "@/lib/db/drizzle/schema";
import { verifyAdmin } from "@/utils/admin";
import { collectionFields, deleteCategoryImage, uploadCategoryImage } from "../shared";

const collectionIdSchema = z.coerce.number().int().positive();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = collectionIdSchema.parse(rawId);

    const existing = await collectionsRepository.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");
    const uploadedImage = image instanceof File && image.size ? await uploadCategoryImage(image) : null;
    const fields = updateCollectionSchema.parse({ ...collectionFields(formData), imageUrl: uploadedImage ?? existing.imageUrl });

    const updated = await collectionsRepository.update(id, fields);

    if (!updated) {
      return NextResponse.json(
        { error: "A collection with that slug already exists" },
        { status: 409 },
      );
    }

    await revalidateCollections();
    if (uploadedImage && existing.imageUrl !== uploadedImage) await deleteCategoryImage(existing.imageUrl).catch(() => undefined);

    return NextResponse.json({
      success: true,
      message: "Collection updated successfully",
      data: updated,
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

    console.error("Error updating collection:", error);
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
    const id = collectionIdSchema.parse(rawId);

    const existing = await collectionsRepository.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 },
      );
    }

    const result = await collectionsRepository.delete(id);

    if (!result.ok) {
      const message =
        result.reason === "in-use"
          ? "Cannot delete a collection that still has products assigned to it"
          : "Collection not found";
      return NextResponse.json(
        { error: message },
        { status: result.reason === "in-use" ? 409 : 404 },
      );
    }

    await revalidateCollections();

    return NextResponse.json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid collection id" }, { status: 400 });
    }

    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
