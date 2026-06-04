import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoL Bronze Quiz",
  description: "Quiz de League of Legends para bronzistas! Teste seus conhecimentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
