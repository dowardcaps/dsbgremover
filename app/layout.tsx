import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rush ID - Background Remover",
  description: "DS Prints Rush ID photo background remover and centering tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
