import { ReactNode } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ToastProvider } from "@/components/ui/Toast";

export default async function CatalogLayout({ children }: { children: ReactNode }) {
  const settings = await prisma.storeSettings.findFirst();
  const storeName = settings?.storeName ?? "GoRetail";
  const tagline = settings?.storeTagline ?? "Discover Our Collection";

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Top nav */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100/80">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/catalog" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-gray-950 rounded-[10px] flex items-center justify-center shadow-sm">
                <span className="text-white text-[11px] font-bold tracking-tight">GR</span>
              </div>
              <span className="text-[15px] font-bold text-gray-950 tracking-tight hidden sm:block">{storeName}</span>
            </Link>

            {/* Tagline */}
            <p className="hidden md:block text-[13px] text-gray-400 font-medium">{tagline}</p>

            {/* Admin CTA */}
            <Link
              href="/admin/login"
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Admin
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-10 mt-auto">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-950 rounded-lg flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">GR</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{storeName}</span>
              </div>
              <p className="text-xs text-gray-400">
                Powered by{" "}
                <span className="font-medium text-gray-500">GoRetail — GoCo by Lazlle &amp; Co.</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
