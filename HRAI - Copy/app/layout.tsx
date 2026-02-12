import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "derivHR — AI-Powered HR Operations",
  description: "Deriv Group HR Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
