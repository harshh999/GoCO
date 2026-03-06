import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import prisma from "@/lib/prisma";
import { ToastProvider } from "@/components/ui/Toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const settings = await prisma.storeSettings.findFirst();

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar
          storeName={settings?.storeName ?? "GoRetail"}
          userName={session.name}
          userRole={session.role}
        />
        <main className="flex-1 min-w-0 pt-0 lg:pt-0">
          {/* Mobile top padding for the fixed header */}
          <div className="h-14 lg:hidden" />
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
