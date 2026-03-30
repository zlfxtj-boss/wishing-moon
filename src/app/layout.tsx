import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wishing Moon - Your Daily Moon Magic",
  description: "Daily tarot readings, moon phase tracking, and manifestation rituals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black antialiased">
        {children}
      </body>
    </html>
  );
}
