import type { Metadata } from "next";
import { Bodoni_Moda, Great_Vibes, Jost } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingCTA } from "@/components/FloatingCTA";
import { brand } from "@/lib/data";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

/** Matches the calligraphic JK monogram in the brand logo */
const logoScript = Great_Vibes({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} | Cinematic Wedding Filmmaking Crew`,
    template: `%s | ${brand.name}`,
  },
  description: `${brand.tagline}. Since ${brand.since} · ${brand.years} Years · ${brand.weddings} Weddings. Based in Chennai & Kerala, travelling worldwide.`,
  metadataBase: new URL("https://jkphotographychennai.com"),
  openGraph: {
    title: brand.name,
    description: brand.tagline,
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${jost.variable} ${logoScript.variable} h-full`}
    >
      <body className="min-h-full overflow-x-hidden bg-white font-sans text-zinc-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingCTA />
      </body>
    </html>
  );
}
