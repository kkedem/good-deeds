import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Good Deed — Make today a little brighter",
  description:
    "Find a small, thoughtful way to make someone's day a little brighter.",
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
