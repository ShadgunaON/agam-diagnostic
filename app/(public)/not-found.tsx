import Link from 'next/link';
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">404</h2>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Page Not Found</h3>
          <p className="text-slate-600 mb-6">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors shadow-sm"
          >
            Return to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
