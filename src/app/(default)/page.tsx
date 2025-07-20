'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, isAuthenticated, isLoading, hasRole, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading authentication state
    if (isLoading) return;

    if (!isAuthenticated) {
      // Redirect unauthenticated users to sign-in page
      router.push('/sign-in');
      return;
    }

    // Redirect authenticated users to their default dashboard based on roles
    if (hasRole('STUDENT') && hasRole('INSTRUCTOR')) {
      // User has both roles, redirect to role selection or stay on home
      return;
    } else if (hasRole('INSTRUCTOR')) {
      router.push('/instructor');
      return;
    } else if (hasRole('STUDENT')) {
      router.push('/student');
      return;
    }
    // If user has no recognized roles, stay on home page
  }, [isAuthenticated, isLoading, hasRole, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if user should be redirected
  if (!isAuthenticated) {
    return null;
  }

  const getRoleBasedDashboard = () => {
    if (!isAuthenticated) return null;

    const dashboards = [];
    if (hasRole('STUDENT')) {
      dashboards.push({
        title: 'Student Dashboard',
        href: '/student',
        color: 'bg-blue-600 hover:bg-blue-700',
        description: 'Access your assignments and quizzes'
      });
    }
    if (hasRole('INSTRUCTOR')) {
      dashboards.push({
        title: 'Instructor Dashboard',
        href: '/instructor',
        color: 'bg-green-600 hover:bg-green-700',
        description: 'Manage assignments and review submissions'
      });
    }
    return dashboards;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quizify</h1>
              <p className="text-gray-600">Learning Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.firstName}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    {user?.roles?.map(role => role.name).join(', ')}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href="/sign-in"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Quizify
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive learning management system with role-based access control.
            Join assignments, take quizzes, and manage your learning journey.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Join Assignments
            </h3>
            <p className="text-gray-600 mb-4">
              Browse and join available assignments. Some may require authentication.
            </p>
            <a
              href="/join"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Browse Assignments
            </a>
          </div>

          {isAuthenticated ? (
            getRoleBasedDashboard()?.map((dashboard) => (
              <div key={dashboard.title} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {dashboard.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {dashboard.description}
                </p>
                <a
                  href={dashboard.href}
                  className={`inline-block text-white px-4 py-2 rounded-md transition-colors ${dashboard.color}`}
                >
                  Go to Dashboard
                </a>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Student Access
                </h3>
                <p className="text-gray-600 mb-4">
                  Sign in with a student account to access assignments and quizzes.
                </p>
                <a
                  href="/sign-in"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign In as Student
                </a>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Instructor Access
                </h3>
                <p className="text-gray-600 mb-4">
                  Sign in with an instructor account to manage assignments and review submissions.
                </p>
                <a
                  href="/sign-in"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Sign In as Instructor
                </a>
              </div>
            </>
          )}
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Key Features
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">S</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Student Role</h4>
              <p className="text-sm text-gray-600">Access assignments and take quizzes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">I</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instructor Role</h4>
              <p className="text-sm text-gray-600">Create and manage assignments</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">J</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Join System</h4>
              <p className="text-sm text-gray-600">Works for authenticated and guest users</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">R</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Role-Based Access</h4>
              <p className="text-sm text-gray-600">Users can have multiple roles</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
