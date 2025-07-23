import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { AuthProvider } from "@/contexts/AuthContext";
import StudentProtectedRoute from "@/components/StudentProtectedRoute";
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
  title: "Quizify - Student",
  description: "Quizify application - Student pages",
};

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <StudentProtectedRoute>
            <div className="student-layout">
              <header className="student-header bg-blue-600 text-white p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <h1 className="text-xl font-semibold">Student Dashboard</h1>
                  <nav className="flex space-x-4">
                    <Link href="/student" className="hover:text-blue-200">Dashboard</Link>
                    <Link href="/join" className="hover:text-blue-200">Join Assignment</Link>
                    <Link href="/" className="hover:text-blue-200">Home</Link>
                  </nav>
                </div>
              </header>
              <main className="student-main min-h-screen bg-gray-50">
                {children}
              </main>
            </div>
          </StudentProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
