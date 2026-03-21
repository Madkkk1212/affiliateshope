import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Lumahive Rekomendasi | Temukan Produk Pilihan Terbaik",
  description: "Platform kurasi produk terbaik untuk kebutuhan gaya hidup Anda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <style>{`
          /* Sembunyikan hanya Banner Bingkai Atas & Balon Tooltip */
          .goog-te-banner-frame, .goog-te-banner, .goog-gt-tt, #goog-gt-tt, .goog-te-balloon-frame {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
          /* Paksa letak halaman tetap di atas */
          body { top: 0 !important; position: static !important; }
          html { margin-top: 0 !important; top: 0 !important; }
          /* Pastikan Navbar dan Widget Tetap Bisa Diklik */
          nav, #google_translate_element {
            position: relative;
            z-index: 9999;
            pointer-events: auto !important;
          }
        `}</style>
      </head>
      <body className={`${outfit.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
