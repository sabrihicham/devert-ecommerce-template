import { Suspense } from "react";

import { getOrderByNumber } from "@/services/orders.service";
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
  searchParams: Promise<{ orderNumber: string | undefined }>;
};

async function CheckoutResult({ orderNumber }: { orderNumber: number }) {
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
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
  searchParams: Promise<{ orderNumber: string | undefined }>;
}) {
  const params = await searchParams;
  const orderNumberParam = pickFirst(params, "orderNumber");
  const orderNumber = orderNumberParam ? Number(orderNumberParam) : NaN;

  if (!orderNumberParam || Number.isNaN(orderNumber)) {
    return <NoSessionError />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CheckoutResult orderNumber={orderNumber} />
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

