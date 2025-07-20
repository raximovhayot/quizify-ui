'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

export default function StudentDashboardPage() {
    const { user, hasRole } = useAuth();

    const studentAssignments = [
        {
            id: '1',
            title: 'Math Quiz - Basic Algebra',
            dueDate: '2024-07-15',
            status: 'pending',
            progress: 0
        },
        {
            id: '2',
            title: 'Advanced Physics Assignment',
            dueDate: '2024-07-20',
            status: 'in-progress',
            progress: 65
        },
        {
            id: '3',
            title: 'Chemistry Lab Report',
            dueDate: '2024-07-10',
            status: 'completed',
            progress: 100
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in-progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Student Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Welcome back, {user?.firstName}! Here's your learning progress.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">3</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Assignments</p>
                                <p className="text-2xl font-semibold text-gray-900">3</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">1</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Completed</p>
                                <p className="text-2xl font-semibold text-gray-900">1</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">55%</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Average Progress</p>
                                <p className="text-2xl font-semibold text-gray-900">55%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assignments */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">My Assignments</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {studentAssignments.map((assignment) => (
                            <div key={assignment.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {assignment.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                                                {assignment.status.replace('-', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex-shrink-0 w-24">
                                            <div className="bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${assignment.progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{assignment.progress}%</p>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            {assignment.status === 'completed' ? 'Review' : 'Continue'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <a
                                href="/join"
                                className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Join New Assignment
                            </a>
                            {hasRole(UserRole.INSTRUCTOR) && (
                                <a
                                    href="/instructor"
                                    className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Switch to Instructor View
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-gray-600">Completed Chemistry Lab Report</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                                <span className="text-gray-600">Started Advanced Physics Assignment</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                <span className="text-gray-600">Joined Math Quiz - Basic Algebra</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
