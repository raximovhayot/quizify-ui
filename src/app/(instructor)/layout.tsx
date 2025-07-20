import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import InstructorProtectedRoute from "@/components/InstructorProtectedRoute";
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
        <AuthProvider>
          <InstructorProtectedRoute>
            <div className="instructor-layout">
              <header className="instructor-header bg-green-600 text-white p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <h1 className="text-xl font-semibold">Instructor Dashboard</h1>
                  <nav className="flex space-x-4">
                    <a href="/instructor" className="hover:text-green-200">Dashboard</a>
                    <a href="/join" className="hover:text-green-200">Join Assignment</a>
                    <a href="/" className="hover:text-green-200">Home</a>
                  </nav>
                </div>
              </header>
              <main className="instructor-main min-h-screen bg-gray-50">
                {children}
              </main>
            </div>
          </InstructorProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
