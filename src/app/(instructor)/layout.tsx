import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quizify - Instructor",
  description: "Quizify application - Instructor pages",
};

export default function InstructorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="instructor-layout">
          <header className="instructor-header">
            {/* Instructor navigation will go here */}
          </header>
          <main className="instructor-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}