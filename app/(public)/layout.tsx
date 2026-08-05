import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import "@/styles/base.css";
import "@/styles/components.css";
import "@/styles/booking.css";
import "@/styles/responsive.css";
// Layout Components
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

import { buildMetadata } from "@/config/metadata";
import { StructuredData, generateOrganizationSchema } from "@/components/common/StructuredData";
import { ScrollRevealInit } from "@/components/common/ScrollRevealInit";

export const metadata: Metadata = buildMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <ScrollRevealInit />
            <Header />
            <main id="main-content" className="flex-1 w-full flex flex-col">
              {children}
            </main>
            <Footer />
            <StructuredData type="Organization" data={generateOrganizationSchema()} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
