import type { Metadata } from 'next';
import './globals.css';
import './brand-overrides.css';
export const metadata: Metadata = { title: 'Syuhada Motor — Bengkel POS', description: 'Dashboard operasional Bengkel POS Syuhada Motor' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="id"><body>{children}</body></html>; }
