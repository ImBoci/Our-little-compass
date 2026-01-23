import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import RomanticBackground from "@/components/RomanticBackground";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lato" });

export const metadata: Metadata = {
  title: "Our Little Compass",
  description: "Guiding our adventures together",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lato.variable} font-sans`}>
        <RomanticBackground />
        <Providers>
          <main className="relative z-10 min-h-screen flex flex-col">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}