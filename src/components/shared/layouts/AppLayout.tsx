'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/shared/navigation/Header';
import { Sidebar } from '@/components/shared/navigation/Sidebar';
import { AppBreadcrumb } from '@/components/shared/navigation/AppBreadcrumb';
import { useNextAuth } from '@/hooks/useNextAuth';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
  showBreadcrumb?: boolean;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
  className?: string;
}

export function AppLayout({
  children,
  title,
  showSidebar = true,
  showBreadcrumb = true,
  breadcrumbItems,
  className
}: AppLayoutProps) {
  const { isAuthenticated } = useNextAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header title={title} />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        {showSidebar && isAuthenticated && (
          <aside className="hidden md:block">
            <Sidebar />
          </aside>
        )}
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb */}
          {showBreadcrumb && (
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container px-4 py-3">
                <AppBreadcrumb items={breadcrumbItems} />
              </div>
            </div>
          )}
          
          {/* Page Content */}
          <div className={cn("flex-1 overflow-auto", className)}>
            <div className="container px-4 py-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Specialized layouts for different sections
export function DashboardLayout({ 
  children, 
  title,
  className 
}: { 
  children: ReactNode; 
  title?: string;
  className?: string;
}) {
  return (
    <AppLayout 
      title={title}
      showSidebar={true}
      showBreadcrumb={true}
      className={className}
    >
      {children}
    </AppLayout>
  );
}

export function AuthLayout({ 
  children, 
  title 
}: { 
  children: ReactNode; 
  title?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} showUserMenu={false} />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export function FullPageLayout({ 
  children, 
  title,
  showHeader = true 
}: { 
  children: ReactNode; 
  title?: string;
  showHeader?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header title={title} />}
      <main className={cn(
        "flex-1",
        showHeader ? "h-[calc(100vh-4rem)]" : "h-screen"
      )}>
        {children}
      </main>
    </div>
  );
}

// Mobile-responsive sidebar overlay
export function MobileSidebarOverlay({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">
        <Sidebar />
      </div>
    </>
  );
}