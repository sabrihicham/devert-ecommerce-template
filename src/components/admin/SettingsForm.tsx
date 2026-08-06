"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/ui/loadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALGERIAN_WILAYAS } from "@/constants/wilayas";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import type { BrandTheme, StoreSettings } from "@/lib/db/drizzle/schema";

interface SettingsFormProps {
  settings: StoreSettings;
}

interface FormErrors {
  [key: string]: string[] | undefined;
}

const NO_WILAYA = "none";
const BRAND_THEMES: Array<{ value: BrandTheme; name: string; description: string; color: string }> = [
  { value: "performance", name: "Performance Green", description: "Natural strength and daily health", color: "#16A34A" },
  { value: "endurance", name: "Endurance Blue", description: "Focus, hydration and endurance", color: "#2563EB" },
  { value: "energy", name: "Energy Orange", description: "Pre-workout and high intensity", color: "#EA580C" },
];

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [storePhone, setStorePhone] = useState(settings.storePhone);
  const [whatsappNumber, setWhatsappNumber] = useState(
    settings.whatsappNumber ?? "",
  );
  const [addressLine1, setAddressLine1] = useState(settings.addressLine1 ?? "");
  const [addressCity, setAddressCity] = useState(settings.addressCity ?? "");
  const [addressWilaya, setAddressWilaya] = useState(
    settings.addressWilaya ?? NO_WILAYA,
  );
  const [bannerActive, setBannerActive] = useState(settings.bannerActive);
  const [bannerText, setBannerText] = useState(settings.bannerText ?? "");
  const [minOrderAmount, setMinOrderAmount] = useState(
    settings.minOrderAmountCents != null
      ? String(settings.minOrderAmountCents / 100)
      : "",
  );
  const [maxPendingOrders, setMaxPendingOrders] = useState(
    settings.maxPendingOrdersPerPhone != null
      ? String(settings.maxPendingOrdersPerPhone)
      : "",
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [brandTheme, setBrandTheme] = useState<BrandTheme>(settings.brandTheme);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(settings.logoUrl ?? null);

  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        storeName,
        storePhone,
        whatsappNumber: whatsappNumber.trim() || null,
        addressLine1: addressLine1.trim() || null,
        addressCity: addressCity.trim() || null,
        addressWilaya: addressWilaya === NO_WILAYA ? null : addressWilaya,
        bannerActive,
        bannerText: bannerText.trim() || null,
        minOrderAmountCents:
          minOrderAmount.trim() === "" ? null : Math.round(Number(minOrderAmount) * 100),
        maxPendingOrdersPerPhone:
          maxPendingOrders.trim() === "" ? null : Number(maxPendingOrders),
        brandTheme,
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => formData.set(key, value == null ? "" : String(value)));
      formData.set("logoUrl", settings.logoUrl ?? "");
      if (logo) formData.set("logo", logo);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data?.errors) {
          setErrors(data.errors);
        }
        throw new Error(data?.error || "Failed to save settings");
      }

      return data;
    },
    onSuccess: () => {
      setErrors({});
      document.documentElement.dataset.brand = brandTheme;
      window.localStorage.setItem("store-brand-theme", brandTheme);
      toast.success("Settings saved");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveSettings();
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Store Info */}
      <section className="rounded-lg border border-border-primary bg-background-secondary p-5">
        <h2 className="text-lg font-semibold text-white">Store info</h2>
        <p className="mt-1 text-sm text-color-secondary">
          Shown to customers and used for delivery contact.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="store-logo">Store logo</Label><div className="flex items-center gap-4 rounded-xl border border-dashed border-border p-3">{logoPreview ? <Image src={logoPreview} alt="Store logo preview" width={112} height={64} className="h-16 w-28 rounded-lg object-contain bg-muted"/> : <div className="grid h-16 w-28 place-items-center rounded-lg bg-muted text-xs text-muted-foreground">No logo</div>}<Input id="store-logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="max-w-xs" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setLogo(file); setLogoPreview(URL.createObjectURL(file)); } }}/></div><p className="text-xs text-muted-foreground">PNG, JPG, WebP or SVG. Used in the storefront header and footer.</p></div>
          <div className="space-y-2">
            <Label htmlFor="storeName">
              Store name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="My Store"
              className={cn(errors.storeName && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.storeName && (
              <p className="text-sm font-medium text-red-400">{errors.storeName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storePhone">
              Phone <span className="text-red-400">*</span>
            </Label>
            <Input
              id="storePhone"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              placeholder="0555 12 34 56"
              className={cn(errors.storePhone && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.storePhone && (
              <p className="text-sm font-medium text-red-400">{errors.storePhone[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp number</Label>
            <Input
              id="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="0555 12 34 56"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressWilaya">Wilaya</Label>
            <Select value={addressWilaya} onValueChange={setAddressWilaya}>
              <SelectTrigger id="addressWilaya">
                <SelectValue placeholder="Select wilaya" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={NO_WILAYA}>Not set</SelectItem>
                {ALGERIAN_WILAYAS.map((wilaya) => (
                  <SelectItem key={wilaya.code} value={wilaya.code}>
                    {wilaya.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressCity">City</Label>
            <Input
              id="addressCity"
              value={addressCity}
              onChange={(e) => setAddressCity(e.target.value)}
              placeholder="City"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine1">Address</Label>
            <Input
              id="addressLine1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Street address"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-card-foreground">Brand appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose the color palette for your storefront and admin dashboard.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {BRAND_THEMES.map((theme) => {
            const selected = brandTheme === theme.value;
            return <button key={theme.value} type="button" onClick={() => setBrandTheme(theme.value)} className={cn("rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:border-input")} aria-pressed={selected}>
              <span className="flex items-center justify-between gap-3"><span className="h-9 w-9 rounded-lg shadow-sm" style={{ backgroundColor: theme.color }} /><span className={cn("rounded-full px-2 py-1 text-xs font-semibold", selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{selected ? "Selected" : "Select"}</span></span>
              <span className="mt-4 block font-semibold text-foreground">{theme.name}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{theme.description}</span>
            </button>;
          })}
        </div>
      </section>

      {/* Homepage Banner */}
      <section className="rounded-lg border border-border-primary bg-background-secondary p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Homepage banner</h2>
            <p className="mt-1 text-sm text-color-secondary">
              Show a short announcement at the top of the homepage.
            </p>
          </div>
          <Switch checked={bannerActive} onCheckedChange={setBannerActive} aria-label="Enable homepage banner" />
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="bannerText">Banner text</Label>
          <Textarea
            id="bannerText"
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            placeholder="Free delivery on orders over 5000 DZD"
            maxLength={280}
            className={cn(errors.bannerText && "border-red-500 focus-visible:ring-red-500")}
          />
          <div className="flex items-center justify-between">
            {errors.bannerText ? (
              <p className="text-sm font-medium text-red-400">{errors.bannerText[0]}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-color-tertiary">
              {bannerText.length}/280
            </span>
          </div>
        </div>
      </section>

      {/* Order Rules */}
      <section className="rounded-lg border border-border-primary bg-background-secondary p-5">
        <h2 className="text-lg font-semibold text-white">Order rules</h2>
        <p className="mt-1 text-sm text-color-secondary">
          Stored for reference only — not yet enforced at checkout.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="minOrderAmount">Minimum order amount (DZD)</Label>
            <Input
              id="minOrderAmount"
              type="number"
              min="0"
              inputMode="decimal"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              placeholder="No minimum"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPendingOrders">Max pending orders per phone</Label>
            <Input
              id="maxPendingOrders"
              type="number"
              min="1"
              inputMode="numeric"
              value={maxPendingOrders}
              onChange={(e) => setMaxPendingOrders(e.target.value)}
              placeholder="No limit"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.refresh()}
        >
          Reset
        </Button>
        <LoadingButton type="submit" loading={isPending}>
          Save changes
        </LoadingButton>
      </div>
    </form>
  );
}
