import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Natee Prompt Hub',
  description: 'Natee社内プロンプト共有ツール',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
