import { Suspense } from "react";

import { getOrderByNumber, getOrderByNumberAndRef } from "@/services/orders.service";
import { getUser } from "@/lib/auth/server";
import { pickFirst } from "@/utils/pickFirst";
import {
  ResultSkeleton,
  NoSessionError,
  SuccessHeader,
  OrderInfo,
  EmailConfirmation,
  DeliveryTimeline,
  ActionButtons,
} from "@/components/checkout";

export async function generateMetadata() {
  return {
    title: "Order Result | Ecommerce Template",
    description: "Result of your order in Ecommerce Template.",
  };
}

type Props = {
  searchParams: Promise<{ orderNumber: string | undefined; token?: string }>;
};

async function CheckoutResult({ orderNumber, token }: { orderNumber: number; token?: string }) {
  const user = await getUser();
  const order = token
    ? await getOrderByNumberAndRef(orderNumber, token)
    : await getOrderByNumber(orderNumber);

  if (!order || (!token && (!user || order.userId !== user.id))) {
    return <NoSessionError />;
  }

  return (
    <>
      <SuccessHeader />
      <OrderInfo />
      {order.customerInfo?.email && (
        <EmailConfirmation email={order.customerInfo.email} />
      )}
      <DeliveryTimeline />
      <ActionButtons />
    </>
  );
}

async function DynamicCheckoutContent({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber: string | undefined; token?: string }>;
}) {
  const params = await searchParams;
  const orderNumberParam = pickFirst(params, "orderNumber");
  const orderNumber = orderNumberParam ? Number(orderNumberParam) : NaN;

  if (!orderNumberParam || Number.isNaN(orderNumber)) {
    return <NoSessionError />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CheckoutResult orderNumber={orderNumber} token={params.token} />
    </div>
  );
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  return (
    <section className="px-6 py-12 sm:px-8">
      <Suspense fallback={<ResultSkeleton />}>
        <DynamicCheckoutContent searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
