import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navigation/NavBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Golden West Business News - AI-Powered Publishing",
  description: "Golden West Business News - AI-powered publishing platform for professional journalism",
  keywords: ["news", "business", "journalism", "AI", "publishing", "mobile"],
  authors: [{ name: "Golden West Business News" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Golden West Business News" />
      </head>
      <body className="font-sans antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
