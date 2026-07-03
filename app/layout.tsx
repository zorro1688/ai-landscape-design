import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/supabase/config";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const baseUrl = process.env.BASE_URL
  ? `https://${process.env.BASE_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: "Free AI Landscape Design Generator – Redesign Your Yard in Seconds",
  description:
    "Upload a photo of your yard and get a free AI landscape design in seconds. Explore dozens of styles, get climate-smart plant suggestions, and download high-resolution concepts.",
  keywords:
    "AI landscape design, AI landscape design generator, AI garden design, backyard design AI, virtual landscape design, landscape design app",
  openGraph: {
    title: "Free AI Landscape Design Generator – Redesign Your Yard in Seconds",
    description:
      "Upload a photo of your yard and get a free AI landscape design in seconds. Explore dozens of styles and download high-resolution concepts.",
    type: "website",
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Landscape Design Generator – Redesign Your Yard in Seconds",
    description: "Upload a photo of your yard and get a free AI landscape design in seconds.",
  },
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.error("Failed to initialize Supabase session:", error);
    }
  }

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            <Header user={user} />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
