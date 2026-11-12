import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { SessionProvider } from "@/lib/client/session";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Good Deeds — find local good deeds, earn rewards",
  description:
    "Find local good deeds, log your hours, and earn rewards from Brighton & Hove businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        <SessionProvider>
          <div className="app-shell">{children}</div>
        </SessionProvider>
      </body>
    </html>
  );
}
