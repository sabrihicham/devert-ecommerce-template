/**
 * Database seed script for the sports supplements storefront.
 *
 * Usage:
 *   npm run db:seed
 *
 * The seed is safe to run repeatedly: products are matched by name/category
 * and variants by product/color, so it updates the demo catalog instead of
 * creating duplicates.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { and, eq, sql } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import {
  collections,
  productsItems,
  productsVariants,
} from "./drizzle/schema";
import type { ProductSize } from "./drizzle/schema";

type SeedVariant = {
  color: string;
  sizes: ProductSize[];
  images: string[];
};

type SeedProduct = {
  name: string;
  description: string;
  price: string;
  category: string;
  img: string;
  isFeatured: boolean;
  variants: SeedVariant[];
};

// The current schema still uses the clothing-oriented sizes enum. For
// supplements, "color" carries the package/flavour option and S means the
// default purchasable unit. This keeps the existing cart flow compatible.
const DEFAULT_SIZE: ProductSize[] = ["S"];

const collectionSeed = [
  { name: "البروتين", slug: "protein" },
  { name: "الكرياتين", slug: "creatine" },
  { name: "ما قبل التمرين", slug: "pre-workout" },
  { name: "الأحماض الأمينية", slug: "amino-acids" },
  { name: "الفيتامينات", slug: "vitamins" },
  { name: "حوارق الدهون", slug: "fat-burners" },
];

const products: SeedProduct[] = [
  {
    name: "Whey Protein Isolate - بروتين واي معزول",
    description:
      "بروتين واي معزول سريع الامتصاص، مناسب بعد التمرين ولمن يبحث عن مصدر بروتين عملي يوميًا.",
    price: "59.99",
    category: "protein",
    img: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80",
    isFeatured: true,
    variants: [
      { color: "شوكولاتة - 1 كجم", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80"] },
      { color: "فانيليا - 1 كجم", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80"] },
    ],
  },
  {
    name: "100% Whey Protein - واي بروتين",
    description:
      "مزيج بروتين متوازن للرياضيين، بطعم غني وسهل التحضير لدعم احتياجك اليومي من البروتين.",
    price: "44.99",
    category: "protein",
    img: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=800&q=80",
    isFeatured: true,
    variants: [
      { color: "كوكيز - 2 كجم", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=800&q=80"] },
    ],
  },
  {
    name: "Creatine Monohydrate - كرياتين مونوهيدرات",
    description:
      "كرياتين مونوهيدرات نقي وسهل الذوبان، خيار أساسي للرياضيين ضمن برنامج تدريب منتظم.",
    price: "24.99",
    category: "creatine",
    img: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80",
    isFeatured: true,
    variants: [
      { color: "بدون نكهة - 300 جم", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80"] },
      { color: "بدون نكهة - 500 جم", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80"] },
    ],
  },
  {
    name: "Creatine Capsules - كبسولات الكرياتين",
    description:
      "كرياتين على شكل كبسولات للرياضيين الذين يفضلون سهولة الاستخدام أثناء التنقل.",
    price: "29.99",
    category: "creatine",
    img: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    isFeatured: false,
    variants: [
      { color: "120 كبسولة", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80"] },
    ],
  },
  {
    name: "Pre-Workout Energy - محفز ما قبل التمرين",
    description:
      "تركيبة ما قبل التمرين بنكهة منعشة لمساعدتك على بدء حصتك التدريبية بطاقة وتركيز.",
    price: "32.99",
    category: "pre-workout",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    isFeatured: true,
    variants: [
      { color: "توت أزرق - 300 جم", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"] },
      { color: "ليمون - 300 جم", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"] },
    ],
  },
  {
    name: "BCAA 2:1:1 - أحماض أمينية",
    description:
      "مزيج من الأحماض الأمينية الأساسية بنكهة خفيفة، مناسب للاستخدام قبل أو أثناء التمرين.",
    price: "27.99",
    category: "amino-acids",
    img: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=800&q=80",
    isFeatured: false,
    variants: [
      { color: "فاكهة استوائية - 300 جم", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=800&q=80"] },
    ],
  },
  {
    name: "Omega 3 Fish Oil - أوميغا 3",
    description:
      "كبسولات زيت السمك للاستخدام اليومي، خيار عملي لإضافة أوميغا 3 إلى نظامك الغذائي.",
    price: "18.99",
    category: "vitamins",
    img: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80",
    isFeatured: true,
    variants: [
      { color: "100 كبسولة", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80"] },
    ],
  },
  {
    name: "Daily Multivitamin - ملتي فيتامين",
    description:
      "مكمل متعدد الفيتامينات والمعادن للاستخدام اليومي ضمن نظام غذائي متوازن.",
    price: "21.99",
    category: "vitamins",
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    isFeatured: false,
    variants: [
      { color: "60 قرصًا", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"] },
    ],
  },
  {
    name: "L-Carnitine Liquid - إل كارنيتين",
    description:
      "إل كارنيتين سائل بنكهة منعشة، مناسب للرياضيين ضمن خطة تغذية وتمرين مدروسة.",
    price: "22.99",
    category: "fat-burners",
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    isFeatured: false,
    variants: [
      { color: "ليمون - 500 مل", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"] },
    ],
  },
  {
    name: "CLA Softgels - كبسولات CLA",
    description:
      "كبسولات سهلة الاستخدام للرياضيين الذين يتبعون برنامجًا منظمًا للتغذية والنشاط البدني.",
    price: "26.99",
    category: "fat-burners",
    img: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&q=80",
    isFeatured: false,
    variants: [
      { color: "90 كبسولة", sizes: DEFAULT_SIZE, images: ["https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&q=80"] },
    ],
  },
];

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Configure .env.local before seeding.");
  }

  const queryClient = postgres(connectionString, { max: 1, prepare: false });
  const db = drizzle(queryClient);

  try {
    console.log("Seeding sports supplements catalog...");

    await db.transaction(async (tx) => {
      await tx
        .insert(collections)
        .values(collectionSeed)
        .onConflictDoUpdate({
          target: collections.slug,
          set: { name: sql`excluded.name`, updatedAt: new Date() },
        });

      for (const product of products) {
        const existing = await tx
          .select({ id: productsItems.id })
          .from(productsItems)
          .where(and(eq(productsItems.name, product.name), eq(productsItems.category, product.category)))
          .limit(1);

        const [savedProduct] = existing.length
          ? await tx
              .update(productsItems)
              .set({
                description: product.description,
                price: product.price,
                img: product.img,
                isFeatured: product.isFeatured,
                updatedAt: new Date(),
              })
              .where(eq(productsItems.id, existing[0].id))
              .returning()
          : await tx
              .insert(productsItems)
              .values(product)
              .returning();

        if (!savedProduct) continue;

        for (const variant of product.variants) {
          await tx
            .insert(productsVariants)
            .values({ productId: savedProduct.id, ...variant })
            .onConflictDoUpdate({
              target: [productsVariants.productId, productsVariants.color],
              set: { sizes: variant.sizes, images: variant.images, updatedAt: new Date() },
            });
        }

        console.log(`  ✓ ${product.name} (${product.variants.length} options)`);
      }
    });

    console.log(`Done. Seeded ${products.length} supplement products.`);
  } finally {
    await queryClient.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
