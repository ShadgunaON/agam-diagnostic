import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import "@/styles/base.css";
import "@/styles/admin-responsive.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

import { AdminSidebar } from "@/components/admin/navigation/AdminSidebar";
import { AdminTopbar } from "@/components/admin/layout/AdminTopbar";
import { CommandMenu } from "@/components/admin/navigation/CommandMenu";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/admin/feedback/Toast";

import { AdminAuthGuard } from "@/components/admin/layout/AdminAuthGuard";

export const metadata: Metadata = {
  title: "AGAM Diagnostics - Admin Portal",
  description: "Internal operational portal for AGAM Diagnostics",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--admin-bg)] text-[var(--admin-text-main)] font-sans overflow-hidden">
        <AuthProvider>
          <ToastProvider>
            <AdminAuthGuard>
              <div className="fixed inset-0 w-full h-full overflow-hidden bg-[var(--admin-bg)]">
                <div className="flex flex-row overflow-hidden bg-white w-full h-full admin-desktop-scale">
                <AdminSidebar />
                <div className="flex-1 flex flex-col h-full min-w-0 bg-white relative shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
                  <AdminTopbar />
                  <main className="flex-1 flex flex-col min-h-0">
                    {children}
                  </main>
                </div>
              </div>
              <CommandMenu />
              </div>
            </AdminAuthGuard>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
