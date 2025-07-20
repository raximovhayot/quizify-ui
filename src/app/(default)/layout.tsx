import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Quizify - Default",
  description: "Quizify application - Authentication and open pages",
};

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="default-layout">
        {children}
      </div>
    </AuthProvider>
  );
}
