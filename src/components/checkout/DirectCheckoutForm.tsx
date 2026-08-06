"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/ui/loadingButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALGERIAN_WILAYAS } from "@/constants/wilayas";
import { DirectOrderSchema } from "@/schemas/direct-order";
import type { ProductSize } from "@/lib/db/drizzle/schema";

interface Commune {
  wilayaCode: string;
  name: string;
  nameAr: string;
}

interface DirectCheckoutFormProps {
  variantId: number;
  size: ProductSize;
  defaultName?: string;
  defaultEmail?: string;
}

function parseCommunes(text: string): Commune[] {
  return text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) =>
      line
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((value) => value.replace(/^"|"$/g, "").trim()),
    )
    .filter((columns) => columns.length >= 4)
    .map(([wilayaCode, , name, nameAr]) => ({
      wilayaCode: wilayaCode.padStart(2, "0"),
      name,
      nameAr,
    }));
}

export function DirectCheckoutForm({
  variantId,
  size,
  defaultName = "",
  defaultEmail = "",
}: DirectCheckoutFormProps) {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null!);
  const emailRef = useRef<HTMLInputElement>(null!);
  const phoneRef = useRef<HTMLInputElement>(null!);
  const line1Ref = useRef<HTMLInputElement>(null!);
  const line2Ref = useRef<HTMLInputElement>(null!);
  const orderRef = useRef(crypto.randomUUID());
  const [wilaya, setWilaya] = useState("");
  const [city, setCity] = useState("");
  const [communes, setCommunes] = useState<Commune[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/communes.csv")
      .then((response) => (response.ok ? response.text() : Promise.reject()))
      .then((text) => !cancelled && setCommunes(parseCommunes(text)))
      .catch(() => !cancelled && setCommunes([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const availableCommunes = communes.filter((commune) => commune.wilayaCode === wilaya);
  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: async () => {
      const parsed = DirectOrderSchema.safeParse({
        variantId,
        size,
        orderRef: orderRef.current,
        name: nameRef.current.value,
        email: emailRef.current.value,
        phone: phoneRef.current.value,
        line1: line1Ref.current.value,
        line2: line2Ref.current.value || undefined,
        city,
        wilaya,
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the form fields");

      const response = await fetch("/api/orders/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Unable to place order");
      return data as { orderNumber: number; orderRef: string };
    },
    onSuccess: ({ orderNumber, orderRef: token }) => {
      router.replace(`/result?orderNumber=${orderNumber}&token=${encodeURIComponent(token)}`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to place order"),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    placeOrder();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" id="direct-name"><Input id="direct-name" ref={nameRef} defaultValue={defaultName} required disabled={isPending} /></Field>
        <Field label="Email" id="direct-email"><Input id="direct-email" type="email" ref={emailRef} defaultValue={defaultEmail} required disabled={isPending} /></Field>
      </div>
      <Field label="Phone number" id="direct-phone"><Input id="direct-phone" type="tel" ref={phoneRef} placeholder="e.g., 0550 12 34 56" required disabled={isPending} /></Field>
      <Field label="Address" id="direct-line1"><Input id="direct-line1" ref={line1Ref} required disabled={isPending} /></Field>
      <Field label="Address line 2 (optional)" id="direct-line2"><Input id="direct-line2" ref={line2Ref} disabled={isPending} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="direct-wilaya">Wilaya</Label><Select value={wilaya} onValueChange={(value) => { setWilaya(value); setCity(""); }} disabled={isPending}><SelectTrigger id="direct-wilaya"><SelectValue placeholder="Select a wilaya" /></SelectTrigger><SelectContent>{ALGERIAN_WILAYAS.map((item) => <SelectItem key={item.code} value={item.code}>{item.code} - {item.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="direct-city">Commune</Label><Select value={city} onValueChange={setCity} disabled={isPending || !wilaya}><SelectTrigger id="direct-city"><SelectValue placeholder="Select a commune" /></SelectTrigger><SelectContent>{availableCommunes.map((item) => <SelectItem key={`${item.wilayaCode}-${item.name}`} value={item.name}>{item.name} — {item.nameAr}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <LoadingButton type="submit" loading={isPending} disabled={isPending || !wilaya || !city} className="h-12 w-full bg-white text-black hover:bg-neutral-200">Place direct order</LoadingButton>
      <p className="text-center text-xs text-color-secondary">Cash on delivery. Your cart will remain unchanged.</p>
    </form>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div>;
}
