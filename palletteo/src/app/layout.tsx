import { Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./styles/palletteo.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Palletteo - Style Guide & Color Palette Manager",
  description: "Create, manage, and share your design system color palettes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
