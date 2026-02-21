import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import Link from "next/link";
import { auth } from "@/auth";
import { AuthButton } from "@/components/AuthButton";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Psycheverse — The World",
    template: "%s | Psycheverse",
  },
  description: "The living hub of the Cult of Psyche. Discover creators, catch live signals, join the community, and ascend through The World.",
  keywords: ["cult of psyche", "psycheverse", "streamers", "community", "live streaming", "creators", "tarot", "occult", "entertainment"],
  openGraph: {
    type: "website",
    siteName: "Psycheverse",
    url: "https://psycheverse.org",
    title: "Psycheverse — The World",
    description: "The living hub of the Cult of Psyche. Discover creators, catch live signals, and ascend through The World.",
    images: [{ url: "https://psycheverse.org/og-image.png", width: 1200, height: 630, alt: "Psycheverse — The World" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Psycheverse — The World",
    description: "The living hub of the Cult of Psyche. Discover creators, catch live signals, and ascend through The World.",
    images: ["https://psycheverse.org/og-image.png"],
  },
  metadataBase: new URL("https://psycheverse.org"),
};

const navLinks = [
  { href: "/directory", label: "Directory" },
  { href: "/blog", label: "Blog" },
  { href: "/submit", label: "Submit" },
  { href: "/advertise", label: "Advertise" },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-background text-foreground font-sans`}
        suppressHydrationWarning
      >
        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}

        {/* Navigation */}
        <header className="bg-background/80 backdrop-blur-sm border-b border-secondary/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <span className="text-2xl">🜏</span>
                <span className="font-heading font-bold text-lg text-foreground hidden sm:inline">Psycheverse</span>
              </Link>

              {/* Nav Links */}
              <nav className="flex items-center gap-1 sm:gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Right side: Auth + Codex link */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <a
                  href="https://cultcodex.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-secondary border border-secondary/30 rounded-full hover:bg-secondary/10 transition-colors"
                >
                  The Library
                </a>
                <AuthButton isLoggedIn={isLoggedIn} className="bg-primary/10 text-primary hover:bg-primary/20" />
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-background border-t border-secondary/10 py-10 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🜏</span>
                  <span className="font-heading font-bold text-foreground">Psycheverse</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  The living hub of the Cult of Psyche. Where the community breathes.
                </p>
              </div>

              {/* Navigation */}
              <div>
                <h4 className="font-heading font-bold text-sm text-foreground mb-3 uppercase tracking-wider">The World</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/directory" className="hover:text-primary transition-colors">Creator Directory</Link></li>
                  <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                  <li><Link href="/submit" className="hover:text-primary transition-colors">Submit Your Signal</Link></li>
                  <li><Link href="/advertise" className="hover:text-primary transition-colors">Advertise</Link></li>
                </ul>
              </div>

              {/* Ecosystem */}
              <div>
                <h4 className="font-heading font-bold text-sm text-foreground mb-3 uppercase tracking-wider">The Circle</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="https://cultcodex.me" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">The Library — cultcodex.me</a></li>
                  <li><a href="https://cultofpsyche.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">The Gateway — cultofpsyche.com</a></li>
                  <li><Link href="/" className="text-primary">The World — psycheverse.org</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-secondary/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Cult of Psyche. All rights reserved.</p>
              <p className="text-secondary/50">Enter the Circle. Transform through ritual. Ascend through participation.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
