import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://rekomendasi-luma.my.id"),
  title: {
    default: "Lumahive: Rekomendasi Shopee & Racun Shopee Terbaik 2026",
    template: "%s | Racun Shopee Lumahive",
  },
  description: "Cari racun shopee terbaru, shopee haul, dan rekomendasi produk shopee viral? Temukan link shopee terpercaya, koleksi eksklusif, spill produk, dan tips belanja hemat di Lumahive.",
  keywords: [
    "rekomendasi shopee", "shopee haul", "racun shopee", "rekomendasi produk shopee", 
    "affiliate shopee", "link shopee", "shopee video", "spill produk shopee", 
    "racun shoppe", "produk viral shopee", "shopee affiliate indonesia", 
    "belanja hemat", "lifestyle", "rekomendasi produk", "pilihan terbaik", 
    "belanja murah", "referensi belanja", "shopee check", "shopee pay", 
    "diskon shopee", "voucher shopee", "racun tiktok", "barang unik shopee",
    "shopee indonesia", "promo shopee terbaru", "shopee 4.4", "shopee ramadan"
  ],
  other: {
    "geo.region": "ID",
    "geo.placename": "Indonesia",
    "geo.position": "-6.2088;106.8456",
    "ICBM": "-6.2088, 106.8456",
    "DC.title": "Lumahive Racun Shopee",
    "DC.creator": "Lumahive Team",
    "DC.description": "Pusat rekomendasi dan racun shopee terpercaya di Indonesia.",
    "DC.language": "id",
    "DC.publisher": "Lumahive",
  },
  themeColor: "#ff4d00",
  appleWebApp: {
    capable: true,
    title: "Racun Shopee",
    statusBarStyle: "default",
  },
  authors: [{ name: "Lumahive" }],
  creator: "Lumahive",
  publisher: "Lumahive",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "http://rekomendasi-luma.my.id",
    siteName: "Lumahive Racun Shopee",
    title: "Lumahive Rekomendasi Shopee: Racun Shopee & Spill Produk Terbaik",
    description: "Kumpulan racun shopee terbaru, link shopee haul viral, dan rekomendasi produk pilihan untuk gaya hidup Anda.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Lumahive Rekomendasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumahive Rekomendasi Shopee: Spill Racun Shopee Terupdate",
    description: "Mau racun shopee terbaru? Cek di sini untuk rekomendasi produk viral dan link shopee haul terpercaya.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Lumahive",
    "url": "http://rekomendasi-luma.my.id",
    "logo": "http://rekomendasi-luma.my.id/logo.png",
    "sameAs": [
      "https://www.instagram.com/lumahive",
      "https://www.tiktok.com/@lumahive"
    ]
  }

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Lumahive Racun Shopee",
    "url": "http://rekomendasi-luma.my.id",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "http://rekomendasi-luma.my.id/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://shopee.co.id" />
        <link rel="preconnect" href="https://cf.shopee.co.id" />
        <link rel="dns-prefetch" href="https://shopee.co.id" />
        <link rel="dns-prefetch" href="https://cf.shopee.co.id" />
      </head>
      <body className={`${outfit.variable} font-sans antialiased bg-background text-foreground`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
