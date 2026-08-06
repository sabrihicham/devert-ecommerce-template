import Link from "next/link";
import { LuPackage, LuShoppingBag, LuSettings } from "react-icons/lu";

const QUICK_LINKS = [
  {
    href: "/admin/products",
    label: "Manage products",
    description: "Add, edit and organize your catalog",
    icon: LuPackage,
  },
  {
    href: "/admin/orders",
    label: "Manage orders",
    description: "Track and update cash-on-delivery orders",
    icon: LuShoppingBag,
  },
  {
    href: "/admin/settings",
    label: "Store settings",
    description: "Configure your store details",
    icon: LuSettings,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="text-sm text-color-secondary">
          Welcome back — here&apos;s a quick way to get around.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded-lg border border-border-primary bg-background-secondary p-5 transition-colors hover:border-border-secondary"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-600/15 text-violet-400">
              <Icon size={20} />
            </span>
            <div>
              <h2 className="text-sm font-medium text-white">{label}</h2>
              <p className="mt-1 text-xs text-color-secondary">
                {description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
