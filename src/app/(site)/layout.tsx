import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Psycheverse",
  description: "The ultimate streamer hub for the Psycheverse community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-background text-foreground font-sans`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
