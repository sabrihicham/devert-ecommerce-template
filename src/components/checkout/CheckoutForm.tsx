"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { CART_QUERY_KEYS } from "@/hooks/cart/keys";
import { useSession } from "@/lib/auth/client";
import { CreateOrderSchema } from "@/schemas/checkout";

interface CheckoutFormProps {
  cartItemIds: number[];
  defaultName?: string;
  defaultEmail?: string;
}

interface Commune {
  wilayaCode: string;
  name: string;
  nameAr: string;
}

function parseCsv(text: string): Commune[] {
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

export function CheckoutForm({
  cartItemIds,
  defaultName = "",
  defaultEmail = "",
}: CheckoutFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const nameRef = useRef<HTMLInputElement>(null!);
  const emailRef = useRef<HTMLInputElement>(null!);
  const phoneRef = useRef<HTMLInputElement>(null!);
  const line1Ref = useRef<HTMLInputElement>(null!);
  const line2Ref = useRef<HTMLInputElement>(null!);
  const [wilaya, setWilaya] = useState("");
  const [city, setCity] = useState("");
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/data/communes.csv")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load communes");
        return response.text();
      })
      .then((text) => {
        if (!cancelled) setCommunes(parseCsv(text));
      })
      .catch(() => {
        if (!cancelled) setCommunes([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCommunes(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const availableCommunes = communes.filter(
    (commune) => commune.wilayaCode === wilaya,
  );

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: async () => {
      const parsed = CreateOrderSchema.safeParse({
        cartItemIds,
        name: nameRef.current.value,
        email: emailRef.current.value,
        phone: phoneRef.current.value,
        line1: line1Ref.current.value,
        line2: line2Ref.current.value,
        city,
        wilaya,
      });

      if (!parsed.success) {
        throw new Error(
          parsed.error.issues[0]?.message || "Please check the form fields",
        );
      }

      const response = await fetch("/api/user/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error placing order");
      }

      return response.json() as Promise<{ orderNumber: number }>;
    },
    onSuccess: (data) => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: CART_QUERY_KEYS.cartList(userId),
        });
        queryClient.invalidateQueries({
          queryKey: CART_QUERY_KEYS.cartDetails(userId),
        });
      }
      router.push(`/result?orderNumber=${data.orderNumber}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Error placing order",
      );
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    placeOrder();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="checkout-name">Full name</Label>
          <Input
            id="checkout-name"
            ref={nameRef}
            defaultValue={defaultName}
            placeholder="Full name"
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkout-email">Email</Label>
          <Input
            id="checkout-email"
            type="email"
            ref={emailRef}
            defaultValue={defaultEmail}
            placeholder="name@example.com"
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="checkout-phone">Phone number</Label>
        <Input
          id="checkout-phone"
          type="tel"
          ref={phoneRef}
          placeholder="e.g., 0550 12 34 56"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="checkout-line1">Address</Label>
        <Input
          id="checkout-line1"
          ref={line1Ref}
          placeholder="Street address"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="checkout-line2">
          Address line 2{" "}
          <span className="text-color-tertiary font-normal">(optional)</span>
        </Label>
        <Input
          id="checkout-line2"
          ref={line2Ref}
          placeholder="Apartment, building, floor..."
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="checkout-city">Commune</Label>
          <Select value={city} onValueChange={setCity} disabled={isPending || !wilaya}>
            <SelectTrigger id="checkout-city">
              <SelectValue
                placeholder={
                  isLoadingCommunes ? "Loading communes..." : "Select a commune"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableCommunes.map((commune) => (
                <SelectItem key={`${commune.wilayaCode}-${commune.name}`} value={commune.name}>
                  {commune.name} — {commune.nameAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkout-wilaya">Wilaya</Label>
          <Select
            value={wilaya}
            onValueChange={(value) => {
              setWilaya(value);
              setCity("");
            }}
            disabled={isPending}
          >
            <SelectTrigger id="checkout-wilaya">
              <SelectValue placeholder="Select a wilaya" />
            </SelectTrigger>
            <SelectContent>
              {ALGERIAN_WILAYAS.map((w) => (
                <SelectItem key={w.code} value={w.code}>
                  {w.code} - {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <LoadingButton
        type="submit"
        className="h-11 w-full"
        loading={isPending}
        disabled={
          isPending || !wilaya || !city || cartItemIds.length === 0
        }
      >
        Place order (Cash on delivery)
      </LoadingButton>
    </form>
  );
}
