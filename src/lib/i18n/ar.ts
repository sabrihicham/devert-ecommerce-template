export const ar = {
  common: {
    store: "المتجر",
    home: "الرئيسية",
    explore: "استكشف",
    continue: "متابعة",
    cancel: "إلغاء",
    save: "حفظ",
    delete: "حذف",
    close: "إغلاق",
    loading: "جار التحميل...",
    previous: "السابق",
    next: "التالي",
    language: "Français",
  },
  nav: {
    menu: "القائمة",
    login: "تسجيل الدخول",
    orders: "طلباتي",
    profile: "الملف الشخصي",
    logout: "تسجيل الخروج",
    cart: "السلة",
    wishlist: "المفضلة",
  },
  home: {
    categoriesEyebrow: "تصفح المتجر",
    categoriesTitle: "الفئات",
    categoriesCount: "أقسام",
    exploreCategory: "استكشف القسم",
    featured: "منتجات مختارة لك",
    featuredSubtitle: "خيارات مميزة من المتجر",
    latest: "وصل حديثاً",
    latestSubtitle: "اكتشف الإضافات الجديدة",
    bestSellers: "الأكثر طلباً",
    bestSellersSubtitle: "اختيارات عملائنا",
  },
  product: {
    ingredients: "المكونات",
    usage: "طريقة الاستخدام",
    warnings: "التحذيرات",
    flavor: "النكهة",
    form: "الشكل",
    quantity: "الكمية",
    servings: "عدد الحصص",
    stock: "المخزون",
    sku: "رمز المنتج SKU",
    addToCart: "أضف إلى السلة",
    buyNow: "اشتر الآن",
    unavailable: "غير متوفر حالياً",
    outOfStock: "نفد المخزون",
  },
  cart: { title: "السلة", empty: "السلة فارغة", checkout: "إتمام الطلب", total: "المجموع" },
  checkout: { title: "إتمام الطلب", deliveryDetails: "بيانات التوصيل", orderSummary: "ملخص الطلب" },
  catalog: { product: "منتج", products: "منتجات", newest: "الأحدث", priceAsc: "السعر: من الأقل للأعلى", priceDesc: "السعر: من الأعلى للأقل", nameAsc: "الاسم: أ إلى ي", empty: "لا توجد منتجات بعد", emptyText: "ستصل منتجات جديدة قريبًا، يرجى العودة لاحقًا.", gridComfortable: "شبكة مريحة", gridCompact: "شبكة مضغوطة" },
  errors: { notFound: "الصفحة غير موجودة", generic: "حدث خطأ غير متوقع" },
} as const;

export type TranslationKeys = {
  [K in keyof typeof ar]: {
    [P in keyof (typeof ar)[K]]: string;
  };
};
