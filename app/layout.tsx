import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KYC Verification App",
  description: "Secure KYC verification process",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-white flex items-center justify-center p-4`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
