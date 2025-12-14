import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Metadata } from "next";

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
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
