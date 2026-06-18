import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lucky 20 — Number Pick Game",
  description: "Four players, one phone. Pick a number, reveal your fate.",
};

export const viewport: Viewport = {
  themeColor: "#0b0716",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
