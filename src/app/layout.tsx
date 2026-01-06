import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Weekly Cut Control Tower',
  description: 'Single-user weekly check-in tracker for cut/bulk progress.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-slate-900/80 border-b border-slate-800">
          <div className="container flex items-center justify-between py-4">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              Weekly Cut Control Tower
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/checkin/new" className="hover:underline">
                New Check-in
              </Link>
            </nav>
          </div>
        </header>
        <main className="container py-6 space-y-6">{children}</main>
      </body>
    </html>
  );
}
