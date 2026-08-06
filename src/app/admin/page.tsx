import { Suspense } from "react";
import { getAdminDashboardSummary } from "@/services/orders.service";
import { getAllProducts } from "@/services/products.service";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

async function DashboardContent() {
  const [summary, products] = await Promise.all([getAdminDashboardSummary(), getAllProducts()]);
  return <AdminDashboard summary={summary} productCount={products.length} />;
}

function DashboardSkeleton() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl bg-muted" />)}</div>;
}

export default function AdminDashboardPage() {
  return <Suspense fallback={<DashboardSkeleton />}><DashboardContent /></Suspense>;
}
