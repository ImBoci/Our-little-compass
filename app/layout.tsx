import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lato" });

export const viewport: Viewport = {
  themeColor: "#ffe4e6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Our Little Compass",
  description: "Guiding our adventures together",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Compass",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${playfair.variable} ${lato.variable} font-sans`}>
        <ThemeProvider>
          <main className="relative z-10 min-h-screen flex flex-col">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}