import "./globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "StudyPilot | AI Study Companion",
  description: "Generate flashcards, quizzes, explanations, and study plans with AI.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-background text-text-primary transition-colors duration-300 font-sans`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('preferredLanguage');
                  if (stored === 'tr' || stored === 'en') {
                    document.documentElement.lang = stored;
                    document.documentElement.setAttribute('data-lang', stored);
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        <div className="app-backdrop" aria-hidden="true" />
        <Providers>
          <Navbar />
          <div className="pb-24">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
