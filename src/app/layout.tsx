// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";  // Add this import
import { LayoutProvider } from './LayoutProvider';
import "./globals.css";

// Metadata must be in a Server Component
export const metadata: Metadata = {
  title: "EV_TAXI",
  description: "EV_TAXI - Your Personal Taxi Platform",
};

// Fonts should be defined in the Server Component
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}