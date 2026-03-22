import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://huerto.info"),
  title: "Inscripció Huerto",
  description: "Boda en Huerto: 12/03, 22:30",
  icons: {
    icon: "/logo2.jpg",
    apple: "/logo2.jpg",
  },
  openGraph: {
    title: "Inscripció Huerto",
    description: "Boda en Huerto: 12/03, 22:30",
    url: "https://huerto.info",
    siteName: "Huerto",
    images: [
      {
        url: "https://huerto.info/logo2.jpg",
        alt: "Huerto",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inscripció Huerto",
    description: "Boda en Huerto: 12/03, 22:30",
    images: ["https://huerto.info/logo2.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
