import { Suspense } from "react";
import { getStoreSettings } from "@/services/settings.service";
import { SettingsForm } from "@/components/admin/SettingsForm";

export async function generateMetadata() {
  return {
    title: "Settings | Admin",
  };
}

async function SettingsContent() {
  const settings = await getStoreSettings();

  if (!settings) {
    return (
      <p className="text-sm text-color-secondary">
        Store settings could not be loaded.
      </p>
    );
  }

  return <SettingsForm settings={settings} />;
}

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-32 rounded-md bg-white/5" />
      <div className="h-32 rounded-md bg-white/5" />
      <div className="h-32 rounded-md bg-white/5" />
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Settings
        </h1>
        <p className="text-sm text-color-secondary">
          Store identity, homepage banner, and order rules.
        </p>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
