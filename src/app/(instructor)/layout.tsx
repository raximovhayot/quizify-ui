import type { Metadata } from "next";
import Link from "next/link";
import InstructorProtectedRoute from "@/components/InstructorProtectedRoute";

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
    <InstructorProtectedRoute>
      <div className="instructor-layout">
        <header className="instructor-header bg-green-600 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold">Instructor Dashboard</h1>
            <nav className="flex space-x-4">
              <Link href="/instructor" className="hover:text-green-200">Dashboard</Link>
              <Link href="/join" className="hover:text-green-200">Join Assignment</Link>
              <Link href="/" className="hover:text-green-200">Home</Link>
            </nav>
          </div>
        </header>
        <main className="instructor-main min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
    </InstructorProtectedRoute>
  );
}
