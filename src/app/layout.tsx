import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Command Center | Kirby Holdings",
  description: "Mission Control for Jeremy Kirby's Ventures",
  manifest: "/manifest.json",
  themeColor: "#ff5722",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HQ",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-grid">
          {children}
        </div>
      </body>
    </html>
  );
}
