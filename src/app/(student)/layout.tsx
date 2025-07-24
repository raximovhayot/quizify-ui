import type { Metadata } from "next";
import Link from "next/link";
import StudentProtectedRoute from "@/components/StudentProtectedRoute";

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
  );
}
