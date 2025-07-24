import type { Metadata } from "next";

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
    <div className="default-layout">
      {children}
    </div>
  );
}
