'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole, Assignment } from '@/types/auth';
import { useState, useEffect } from 'react';

// Mock assignments data - in a real app, this would come from an API
const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Math Quiz - Basic Algebra',
    requiresAuth: false,
    allowedRoles: [UserRole.STUDENT]
  },
  {
    id: '2',
    title: 'Advanced Physics Assignment',
    requiresAuth: true,
    allowedRoles: [UserRole.STUDENT]
  },
  {
    id: '3',
    title: 'Create New Quiz',
    requiresAuth: true,
    allowedRoles: [UserRole.INSTRUCTOR]
  },
  {
    id: '4',
    title: 'Review Student Submissions',
    requiresAuth: true,
    allowedRoles: [UserRole.INSTRUCTOR]
  },
  {
    id: '5',
    title: 'Collaborative Project',
    requiresAuth: true,
    allowedRoles: [UserRole.STUDENT, UserRole.INSTRUCTOR]
  }
];

export default function JoinPage() {
  const { user, hasAnyRole, isLoading, isAuthenticated } = useAuth();
  const [availableAssignments, setAvailableAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    // Filter assignments based on user authentication and roles
    const filtered = mockAssignments.filter(assignment => {
      // If assignment doesn't require auth, show it to everyone
      if (!assignment.requiresAuth) {
        return true;
      }

      // If assignment requires auth but user is not authenticated, don't show it
      if (!isAuthenticated) {
        return false;
      }

      // If user is authenticated, check if they have the required roles
      if (assignment.allowedRoles && assignment.allowedRoles.length > 0) {
        return hasAnyRole(assignment.allowedRoles);
      }

      // If no specific roles required but auth is required, show to authenticated users
      return true;
    });

    setAvailableAssignments(filtered);
  }, [isAuthenticated, hasAnyRole]);

  const handleJoinAssignment = (assignment: Assignment) => {
    if (assignment.requiresAuth && !isAuthenticated) {
      // Redirect to sign-in with the assignment context
      window.location.href = `/sign-in?redirect=/join&assignment=${assignment.id}`;
      return;
    }

    // Handle joining the assignment based on user role
    if (assignment.allowedRoles?.includes(UserRole.STUDENT) && hasAnyRole([UserRole.STUDENT])) {
      window.location.href = '/student';
    } else if (assignment.allowedRoles?.includes(UserRole.INSTRUCTOR) && hasAnyRole([UserRole.INSTRUCTOR])) {
      window.location.href = '/instructor';
    } else {
      alert('You do not have permission to access this assignment.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Join an Assignment
          </h1>
          <p className="text-lg text-gray-600">
            {isAuthenticated 
              ? `Welcome back, ${user?.firstName}! Here are your available assignments.`
              : 'Browse available assignments. Some may require authentication to join.'
            }
          </p>
        </div>

        {isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Logged in as: {user?.phone}
                </p>
                <p className="text-sm text-blue-600">
                  Roles: {user?.roles?.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {assignment.title}
              </h3>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm text-gray-500">Authentication:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    assignment.requiresAuth 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {assignment.requiresAuth ? 'Required' : 'Not Required'}
                  </span>
                </div>

                {assignment.allowedRoles && assignment.allowedRoles.length > 0 && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">Roles:</span>
                    <div className="ml-2 flex gap-1">
                      {assignment.allowedRoles.map((role: UserRole) => (
                        <span
                          key={role}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleJoinAssignment(assignment)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                {assignment.requiresAuth && !isAuthenticated 
                  ? 'Sign In to Join' 
                  : 'Join Assignment'
                }
              </button>
            </div>
          ))}
        </div>

        {availableAssignments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No assignments available at the moment.
            </p>
            {!isAuthenticated && (
              <p className="text-gray-400 mt-2">
                <a href="/sign-in" className="text-blue-600 hover:underline">
                  Sign in
                </a> to see more assignments.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
