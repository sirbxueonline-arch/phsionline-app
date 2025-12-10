"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/preferences", label: "Preferences" },
  { href: "/settings/study-config", label: "Study Config" },
  { href: "/settings/export", label: "Data Export" },
  { href: "/settings/feedback", label: "Feedback" }
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = tabs.find((t) => pathname?.startsWith(t.href))?.href || tabs[0].href;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-slate-600 dark:text-slate-300">Update your profile and preferences.</p>
      </div>
      <Tabs defaultValue={activeTab} value={activeTab}>
        <TabsList>
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <TabsTrigger value={tab.href}>{tab.label}</TabsTrigger>
            </Link>
          ))}
        </TabsList>
        <div className="mt-6">
          <TabsContent value={activeTab}>{children}</TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
