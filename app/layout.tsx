import type { Metadata } from "next";
import { Bodoni_Moda, Great_Vibes, Jost } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingCTA } from "@/components/FloatingCTA";
import { PublicOnly } from "@/components/PublicOnly";
import { SiteContentProvider } from "@/components/SiteContentProvider";
import { getSiteContent } from "@/lib/site-content.server";
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
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const { studio } = await getSiteContent();
  return {
    title: {
      default: `${studio.name} | ${studio.tagline}`,
      template: `%s | ${studio.name}`,
    },
    description: `${studio.tagline}. Since ${studio.since} · ${studio.years} Years · ${studio.weddings} Weddings. ${studio.heroLine}`,
    metadataBase: new URL("https://jkphotographychennai.com"),
    openGraph: {
      title: studio.name,
      description: studio.tagline,
      type: "website",
      locale: "en_IN",
    },
    icons: {
      icon: "/logo.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${jost.variable} ${logoScript.variable} h-full`}
    >
      <body className="min-h-full overflow-x-hidden bg-white font-sans text-zinc-900 antialiased">
        <SiteContentProvider value={content}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <PublicOnly>
            <Footer content={content} />
            <FloatingCTA />
          </PublicOnly>
        </SiteContentProvider>
      </body>
    </html>
  );
}
