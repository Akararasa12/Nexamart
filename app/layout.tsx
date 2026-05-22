import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import SlideOutCart from "@/components/SlideOutCart";
import RAGChatbot from "@/components/RAGChatbot";
import Footer from "@/components/Footer";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"]
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "NEXAMART | Luxury Cosmetics & Skincare Solutions",
  description: "Temukan keindahan legendaris Anda dengan esens organik premium, perawatan kulit mewah, dan kosmetik berkinerja tinggi dari NEXAMART.",
  metadataBase: new URL("https://nexamart-ecommerce.vercel.app"),
  verification: {
    google: "68nuT-XKHmAg7agi9pBDjkOmNTPg--OJlKOYFiL5_Ds"
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "NEXAMART | Luxury Cosmetics & Skincare Solutions",
    description: "Temukan keindahan legendaris Anda dengan esens organik premium dari NEXAMART.",
    url: "/",
    siteName: "NEXAMART",
    locale: "id_ID",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXAMART | Luxury Cosmetics",
    description: "Luxury D2C e-commerce platform for cosmetics and skincare."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${cormorant.variable} ${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-white text-neutral-900 selection:bg-neutral-950 selection:text-white"
        suppressHydrationWarning
      >
        <CartProvider>
          <AuthProvider>
            <Header />
            
            <main className="flex-grow overflow-x-hidden">
              {children}
            </main>

            <Footer />
            
            {/* Persistent global widgets */}
            <SlideOutCart />
            <RAGChatbot />
            <BottomNavigation />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}

