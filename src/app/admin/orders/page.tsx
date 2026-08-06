import { Suspense } from "react";
import { getAdminOrders } from "@/services/orders.service";
import { OrdersList } from "@/components/admin/OrdersList";
import { ORDER_STATUS_VALUES } from "@/constants/orderStatus";
import type { OrderStatus } from "@/lib/db/drizzle/schema";

export async function generateMetadata() {
  return {
    title: "Orders | Admin",
  };
}

const VALID_STATUSES = new Set<string>(ORDER_STATUS_VALUES);

interface Props {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const OrdersContent = async ({ searchParams }: Props) => {
  const params = (await searchParams) ?? {};

  const statusParam =
    typeof params.status === "string" ? params.status : undefined;
  const wilayaParam =
    typeof params.wilaya === "string" ? params.wilaya : undefined;
  const pageParam = typeof params.page === "string" ? Number(params.page) : 1;

  const status =
    statusParam && VALID_STATUSES.has(statusParam)
      ? (statusParam as OrderStatus)
      : undefined;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const result = await getAdminOrders({
    status,
    wilaya: wilayaParam,
    page,
    pageSize: 20,
  });

  return (
    <OrdersList
      orders={result.orders}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      filters={{ status: status ?? "all", wilaya: wilayaParam ?? "all" }}
    />
  );
};

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-16 rounded-md bg-white/5" />
      <div className="h-16 rounded-md bg-white/5" />
      <div className="h-16 rounded-md bg-white/5" />
    </div>
  );
}

const AdminOrdersPage = ({ searchParams }: Props) => {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
};

export default AdminOrdersPage;

