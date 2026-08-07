"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { BasicInfoData } from "@/types/admin";

export interface CategoryOption { value: string; label: string }
export type BasicInfoInitialData = Partial<BasicInfoData>;
export type BasicInfoRef = BasicInfoData & { reset: () => void };

const emptyData: BasicInfoData = { name: "", nameFr: "", description: "", descriptionFr: "", brand: "", ingredients: "", ingredientsFr: "", usage: "", usageFr: "", warnings: "", warningsFr: "", tags: [], tagsFr: [], price: 0, compareAtPrice: null, category: "", isFeatured: false };

export const BasicInfo = forwardRef<BasicInfoRef, { errors?: Record<string, string[]>; initialData?: BasicInfoInitialData; categories: CategoryOption[] }>(({ errors, initialData, categories }, ref) => {
  const [data, setData] = useState<BasicInfoData>({ ...emptyData, ...initialData, tags: initialData?.tags ?? [], tagsFr: initialData?.tagsFr ?? [] });
  useImperativeHandle(ref, () => ({ ...data, reset: () => setData(emptyData) }), [data]);
  const set = (key: keyof BasicInfoData, value: unknown) => setData((current) => ({ ...current, [key]: value }));
  const textField = (key: keyof BasicInfoData, label: string, placeholder: string, multiline = false) => <div className="space-y-2"><Label>{label} *</Label>{multiline ? <Textarea value={String(data[key] ?? "")} onChange={(event) => set(key, event.target.value)} placeholder={placeholder} className={cn("min-h-24", errors?.[key] && "border-red-500")} /> : <Input value={String(data[key] ?? "")} onChange={(event) => set(key, event.target.value)} placeholder={placeholder} className={cn(errors?.[key] && "border-red-500")} />}{errors?.[key] && <p className="text-sm text-red-400">{errors[key][0]}</p>}</div>;
  const tagsField = (key: "tags" | "tagsFr", label: string, placeholder: string) => <div className="space-y-2"><Label>{label}</Label><Input value={data[key].join(", ")} onChange={(event) => set(key, event.target.value.split(",").map((value) => value.trim()).filter(Boolean))} placeholder={placeholder} /></div>;
  return <div className="space-y-6">
    <section dir="rtl" className="space-y-5 rounded-2xl border border-primary/20 bg-primary/5 p-4"><div><p className="text-sm font-bold text-primary">العربية</p><p className="text-xs text-muted-foreground">النسخة الأساسية المطلوبة</p></div>{textField("name", "اسم المنتج", "اسم المكمل")}{textField("description", "الوصف", "وصف المنتج", true)}{textField("ingredients", "المكونات", "المكونات الأساسية", true)}{textField("usage", "طريقة الاستخدام", "طريقة الاستخدام", true)}{textField("warnings", "التحذيرات", "تنبيهات الاستخدام", true)}{tagsField("tags", "الوسوم العربية", "بروتين، رياضة، استشفاء")}</section>
    <section dir="ltr" className="space-y-5 rounded-2xl border border-border bg-muted/30 p-4"><div><p className="text-sm font-bold text-primary">Français</p><p className="text-xs text-muted-foreground">Version française du contenu</p></div>{textField("nameFr", "Nom du produit", "Nom du complément")}{textField("descriptionFr", "Description", "Description du produit", true)}{textField("ingredientsFr", "Ingrédients", "Ingrédients principaux", true)}{textField("usageFr", "Mode d’utilisation", "Conseils d’utilisation", true)}{textField("warningsFr", "Avertissements", "Précautions d’emploi", true)}{tagsField("tagsFr", "Mots-clés", "protéines, sport, récupération")}</section>
    <section dir="rtl" className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label>العلامة التجارية *</Label><Input value={data.brand} onChange={(event) => set("brand", event.target.value)} /></div><div className="space-y-2"><Label>الفئة *</Label><Select value={data.category} onValueChange={(value) => set("category", value)}><SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>السعر (دج) *</Label><Input type="number" min="0" step="0.01" value={data.price || ""} onChange={(event) => set("price", Number(event.target.value))} /></div><div className="space-y-2"><Label>السعر قبل التخفيض</Label><Input type="number" min="0" step="0.01" value={data.compareAtPrice ?? ""} onChange={(event) => set("compareAtPrice", event.target.value ? Number(event.target.value) : null)} /></div><label className="flex items-center justify-between rounded-lg border p-4 sm:col-span-2"><span>منتج مميز</span><input type="checkbox" checked={data.isFeatured} onChange={(event) => set("isFeatured", event.target.checked)} /></label></section>
  </div>;
});
BasicInfo.displayName = "BasicInfo";
