/** Seed catalog of real supplement products with official/retailer product images. */
import { config } from "dotenv";
config({ path: ".env.local" });

import { and, eq, sql } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { collections, productsItems, productsVariants } from "./drizzle/schema";

type SeedVariant = {
  flavor: string;
  form: "powder" | "capsules" | "tablets" | "liquid" | "gummies" | "bars" | "other";
  quantity: string;
  quantityUnit: "g" | "kg" | "ml" | "capsule" | "tablet" | "serving" | "piece";
  servings?: number;
  sku: string;
  price: string;
  compareAtPrice?: string;
  stock: number;
  images: string[];
};

type SeedProduct = {
  name: string;
  brand: string;
  description: string;
  ingredients: string;
  usage: string;
  warnings: string;
  tags: string[];
  category: string;
  img: string;
  isFeatured: boolean;
  variants: SeedVariant[];
};

const collectionsSeed = [
  {
    name: "البروتين",
    slug: "protein",
    description: "مساحيق البروتين لدعم احتياجك اليومي والتعافي بعد التمرين.",
    imageUrl: "https://www.optimumnutrition.com/cdn/shop/files/on-1111968_Image_01.png?v=1756452646&width=2048",
    isFeatured: true,
    displayOrder: 1,
  },
  {
    name: "الكرياتين",
    slug: "creatine",
    description: "كرياتين موثوق لدعم القوة والأداء في تمارينك اليومية.",
    imageUrl: "https://www.optimumnutrition.com/cdn/shop/files/ON_DTC_PDP_Creatine60srv_6074352_4000x4000_8caf3a00-52f7-432d-857c-2cac79bb31a3.png?width=2048",
    isFeatured: true,
    displayOrder: 2,
  },
  {
    name: "الأحماض الأمينية",
    slug: "amino-acids",
    description: "خيارات EAA وBCAA للترطيب والدعم أثناء التمرين.",
    imageUrl: "https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/12189811-2015082508750389.jpg&format=webp&width=1500&height=1500&fit=cover",
    isFeatured: true,
    displayOrder: 3,
  },
  {
    name: "ما قبل التمرين",
    slug: "pre-workout",
    description: "تركيبات ما قبل التمرين للتركيز والطاقة قبل كل حصة.",
    imageUrl: "https://www.optimumnutrition.com/cdn/shop/files/on-1146471_Image_01.png?v=1755790955&width=2048",
    isFeatured: true,
    displayOrder: 4,
  },
];

const products: SeedProduct[] = [
  {
    name: "Gold Standard 100% Whey",
    brand: "Optimum Nutrition",
    description: "بروتين واي مشهور من Optimum Nutrition، يحتوي على 24 غ بروتين في الحصة ويدعم أهداف البروتين اليومية والتعافي بعد التمرين.",
    ingredients: "Whey protein isolate, whey protein concentrate, whey peptides, cocoa, flavors, lecithin.",
    usage: "اخلط حصة واحدة مع الماء أو الحليب بعد التمرين أو حسب احتياجك الغذائي.",
    warnings: "مكمل غذائي وليس بديلًا عن النظام الغذائي المتوازن. استشر مختصًا عند الحاجة.",
    tags: ["whey", "protein", "recovery"],
    category: "protein",
    img: "https://www.optimumnutrition.com/cdn/shop/files/on-1111968_Image_01.png?v=1756452646&width=2048",
    isFeatured: true,
    variants: [
      { flavor: "Double Rich Chocolate", form: "powder", quantity: "907", quantityUnit: "g", servings: 29, sku: "ON-GS-WHEY-CHOC-907G", price: "9500", compareAtPrice: "10500", stock: 18, images: ["https://www.optimumnutrition.com/cdn/shop/files/on-1111968_Image_01.png?v=1756452646&width=2048"] },
      { flavor: "Vanilla Ice Cream", form: "powder", quantity: "2270", quantityUnit: "g", servings: 73, sku: "ON-GS-WHEY-VAN-2270G", price: "19500", compareAtPrice: "21500", stock: 10, images: ["https://www.optimumnutrition.com/cdn/shop/files/on-1111968_Image_01.png?v=1756452646&width=2048"] },
    ],
  },
  {
    name: "Impact Whey Protein",
    brand: "Myprotein",
    description: "بروتين مصل اللبن Impact Whey Protein من Myprotein، خيار عملي للاستخدام اليومي ودعم التعافي وبناء العضلات.",
    ingredients: "Whey protein concentrate, emulsifier, flavoring, sweetener.",
    usage: "اخلط 1 مكيال مع 250 مل من الماء أو الحليب.",
    warnings: "يحتوي على الحليب وقد يحتوي على الصويا. لا تتجاوز الجرعة المقترحة.",
    tags: ["myprotein", "whey", "daily protein"],
    category: "protein",
    img: "https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/10530943-2075212346863326.jpg&format=webp&width=1500&height=1500&fit=cover",
    isFeatured: true,
    variants: [
      { flavor: "Chocolate Smooth", form: "powder", quantity: "1000", quantityUnit: "g", servings: 40, sku: "MP-IMPACT-WHEY-CHOC-1KG", price: "6500", compareAtPrice: "7500", stock: 24, images: ["https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/10530943-2075212346863326.jpg&format=webp&width=1500&height=1500&fit=cover"] },
    ],
  },
  {
    name: "Micronized Creatine Powder",
    brand: "Optimum Nutrition",
    description: "كرياتين مونوهيدرات ميكروني نقي من Optimum Nutrition، مناسب للرياضيين ضمن برنامج تدريب منتظم.",
    ingredients: "100% creatine monohydrate.",
    usage: "اخلط 5 غ يوميًا مع الماء أو مشروبك المفضل.",
    warnings: "احرص على شرب كمية كافية من الماء واستشر مختصًا عند وجود حالة صحية.",
    tags: ["creatine", "strength", "performance"],
    category: "creatine",
    img: "https://www.optimumnutrition.com/cdn/shop/files/ON_DTC_PDP_Creatine60srv_6074352_4000x4000_8caf3a00-52f7-432d-857c-2cac79bb31a3.png?width=2048",
    isFeatured: true,
    variants: [
      { flavor: "Unflavored", form: "powder", quantity: "300", quantityUnit: "g", servings: 60, sku: "ON-CREATINE-MONO-300G", price: "4200", compareAtPrice: "4800", stock: 30, images: ["https://www.optimumnutrition.com/cdn/shop/files/ON_DTC_PDP_Creatine60srv_6074352_4000x4000_8caf3a00-52f7-432d-857c-2cac79bb31a3.png?width=2048"] },
    ],
  },
  {
    name: "Impact Whey Isolate",
    brand: "Myprotein",
    description: "عزل بروتين مصل اللبن Impact Whey Isolate من Myprotein، بتركيز بروتين مرتفع وملائم بعد التمرين.",
    ingredients: "Whey protein isolate, emulsifier, natural and artificial flavoring, sweetener.",
    usage: "اخلط حصة واحدة مع الماء أو الحليب، ويفضل بعد التمرين.",
    warnings: "يحتوي على مشتقات الحليب. لا تستخدمه كبديل لنظام غذائي متنوع.",
    tags: ["isolate", "whey", "low fat"],
    category: "protein",
    img: "https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/10852500-1615304620165133.jpg&format=webp&width=1500&height=1500&fit=cover",
    isFeatured: false,
    variants: [
      { flavor: "Salted Caramel", form: "powder", quantity: "1000", quantityUnit: "g", servings: 33, sku: "MP-IMPACT-ISOLATE-CARAMEL-1KG", price: "8500", compareAtPrice: "9500", stock: 12, images: ["https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/10852500-1615304620165133.jpg&format=webp&width=1500&height=1500&fit=cover"] },
    ],
  },
  {
    name: "Creatine Monohydrate",
    brand: "Myprotein",
    description: "كرياتين مونوهيدرات من Myprotein، مسحوق بدون نكهة سهل الخلط والاستخدام اليومي.",
    ingredients: "100% creatine monohydrate.",
    usage: "تناول 3 إلى 5 غ يوميًا مع الماء أو مشروبك.",
    warnings: "مكمل غذائي للبالغين. استشر مختصًا قبل الاستخدام إذا كنت تتناول أدوية.",
    tags: ["myprotein", "creatine", "unflavored"],
    category: "creatine",
    img: "https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/10852411-1935304620346456.jpg&format=webp&width=1500&height=1500&fit=cover",
    isFeatured: false,
    variants: [
      { flavor: "Unflavored", form: "powder", quantity: "250", quantityUnit: "g", servings: 50, sku: "MP-CREATINE-MONO-250G", price: "3500", compareAtPrice: "4000", stock: 20, images: ["https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/10852411-1935304620346456.jpg&format=webp&width=1500&height=1500&fit=cover"] },
    ],
  },
];

products.push(
  {
    name: "Clear Whey Protein",
    brand: "Myprotein",
    description: "بروتين واي شفاف بطعم فاكهي خفيف؛ يوفر 20 غ بروتين في الحصة كبديل منعش لمخفوق البروتين التقليدي.",
    ingredients: "Hydrolyzed whey protein isolate, natural flavoring, acids, sweetener.",
    usage: "اخلط مكيالًا مع الماء واترك الرغوة تهدأ قبل الشرب.",
    warnings: "يحتوي على مشتقات الحليب. لا تستخدمه بدل نظام غذائي متوازن.",
    tags: ["clear whey", "isolate", "refreshing"],
    category: "protein",
    img: "https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/13925107-4795165942836743.jpg&format=webp&width=1500&height=1500&fit=cover",
    isFeatured: true,
    variants: [{ flavor: "Peach Tea", form: "powder", quantity: "875", quantityUnit: "g", servings: 25, sku: "MP-CLEAR-WHEY-PEACH-875G", price: "8200", compareAtPrice: "9200", stock: 16, images: ["https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/13925107-4795165942836743.jpg&format=webp&width=1500&height=1500&fit=cover"] }],
  },
  {
    name: "Origin Pre-Workout",
    brand: "Myprotein",
    description: "تركيبة ما قبل التمرين Origin بتركيز عالٍ من الكافيين مع سيترولين مالات وبيتا ألانين لدعم الطاقة والتركيز أثناء التدريب.",
    ingredients: "Citrulline malate, beta-alanine, caffeine, L-theanine, electrolytes and flavoring.",
    usage: "اخلط مكيالًا واحدًا مع الماء قبل التمرين بـ 15 إلى 30 دقيقة.",
    warnings: "يحتوي على 300 ملغ كافيين تقريبًا في الحصة. غير مناسب للأطفال أو الحوامل أو لمن يتجنب الكافيين.",
    tags: ["pre workout", "energy", "focus"],
    category: "pre-workout",
    img: "https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/15010292-2095192163511263.jpg&format=webp&width=1500&height=1500&fit=cover",
    isFeatured: true,
    variants: [{ flavor: "Orange", form: "powder", quantity: "487", quantityUnit: "g", servings: 30, sku: "MP-ORIGIN-PRE-ORANGE-30S", price: "7800", compareAtPrice: "8800", stock: 14, images: ["https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/15010292-2095192163511263.jpg&format=webp&width=1500&height=1500&fit=cover"] }],
  },
  {
    name: "Gold Standard Pre-Workout",
    brand: "Optimum Nutrition",
    description: "مكمل ما قبل التمرين من Optimum Nutrition مع كافيين وكرياتين مونوهيدرات وبيتا ألانين لدعم الطاقة والتركيز والأداء.",
    ingredients: "Caffeine, creatine monohydrate, beta-alanine, acids, flavors and sweeteners.",
    usage: "اخلط مكيالًا واحدًا مع الماء واشربه قبل التمرين بـ 15 إلى 30 دقيقة.",
    warnings: "يحتوي على 175 ملغ كافيين في الحصة. لا تخلطه مع مصادر كافيين أخرى.",
    tags: ["optimum nutrition", "pre workout", "caffeine"],
    category: "pre-workout",
    img: "https://www.optimumnutrition.com/cdn/shop/files/on-1146471_Image_01.png?v=1755790955&width=2048",
    isFeatured: false,
    variants: [{ flavor: "Fruit Punch", form: "powder", quantity: "300", quantityUnit: "g", servings: 30, sku: "ON-GS-PRE-FRUIT-300G", price: "7200", compareAtPrice: "8200", stock: 18, images: ["https://www.optimumnutrition.com/cdn/shop/files/on-1146471_Image_01.png?v=1755790955&width=2048"] }],
  },
  {
    name: "THE EAAs",
    brand: "Myprotein",
    description: "مزيج أحماض أمينية أساسية من Myprotein مع إلكتروليتات ومكونات مساعدة للترطيب، مناسب قبل أو أثناء أو بعد التمرين.",
    ingredients: "Amino9 essential amino acids, VitaCherry, AstraGin, sodium, potassium and flavoring.",
    usage: "اخلط مكيالًا واحدًا مع 250 إلى 350 مل من الماء.",
    warnings: "مكمل غذائي وليس علاجًا. لا تتجاوز الجرعة الموصى بها.",
    tags: ["EAA", "amino acids", "hydration"],
    category: "amino-acids",
    img: "https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/12189811-2015082508750389.jpg&format=webp&width=1500&height=1500&fit=cover",
    isFeatured: false,
    variants: [{ flavor: "Snow Cone", form: "powder", quantity: "345", quantityUnit: "g", servings: 30, sku: "MP-THE-EAAS-SNOW-30S", price: "6900", compareAtPrice: "7900", stock: 11, images: ["https://main.thgimages.com?url=https://static.thcdn.com/productimg/original/12189811-2015082508750389.jpg&format=webp&width=1500&height=1500&fit=cover"] }],
  },
);

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set. Configure .env.local before seeding.");
  const queryClient = postgres(connectionString, { max: 1, prepare: false });
  const db = drizzle(queryClient);
  try {
    await db.transaction(async (tx) => {
      await tx.insert(collections).values(collectionsSeed).onConflictDoUpdate({
        target: collections.slug,
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          imageUrl: sql`excluded.image_url`,
          isFeatured: sql`excluded.is_featured`,
          displayOrder: sql`excluded.display_order`,
          updatedAt: new Date(),
        },
      });
      for (const product of products) {
        const existing = await tx.select({ id: productsItems.id }).from(productsItems).where(and(eq(productsItems.name, product.name), eq(productsItems.category, product.category))).limit(1);
        const values = { name: product.name, brand: product.brand, description: product.description, ingredients: product.ingredients, usage: product.usage, warnings: product.warnings, tags: product.tags, price: product.variants[0].price, category: product.category, img: product.img, isFeatured: product.isFeatured, stock: product.variants.reduce((sum, variant) => sum + variant.stock, 0), isBestSeller: false, isNewArrival: true, status: "published" as const };
        const [savedProduct] = existing.length ? await tx.update(productsItems).set({ ...values, updatedAt: new Date() }).where(eq(productsItems.id, existing[0].id)).returning() : await tx.insert(productsItems).values(values).returning();
        if (!savedProduct) continue;
        for (const variant of product.variants) {
          await tx.insert(productsVariants).values({ productId: savedProduct.id, ...variant }).onConflictDoUpdate({ target: productsVariants.sku, set: { ...variant, updatedAt: new Date() } });
        }
        console.log(`✓ ${product.brand} ${product.name}`);
      }
    });
    console.log(`Done. Seeded ${products.length} real supplement products.`);
  } finally { await queryClient.end(); }
}

seed().then(() => process.exit(0)).catch((error) => { console.error("Seeding failed:", error); process.exit(1); });
