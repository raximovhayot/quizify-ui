'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

export default function InstructorDashboardPage() {
    const { user, hasRole } = useAuth();

    const instructorAssignments = [
        {
            id: '1',
            title: 'Math Quiz - Basic Algebra',
            students: 25,
            submitted: 18,
            pending: 7,
            dueDate: '2024-07-15',
            status: 'active'
        },
        {
            id: '2',
            title: 'Advanced Physics Assignment',
            students: 30,
            submitted: 22,
            pending: 8,
            dueDate: '2024-07-20',
            status: 'active'
        },
        {
            id: '3',
            title: 'Chemistry Lab Report',
            students: 28,
            submitted: 28,
            pending: 0,
            dueDate: '2024-07-10',
            status: 'completed'
        }
    ];

    const recentSubmissions = [
        {
            id: '1',
            studentName: 'Alice Johnson',
            assignment: 'Math Quiz - Basic Algebra',
            submittedAt: '2024-07-08 14:30',
            status: 'pending-review'
        },
        {
            id: '2',
            studentName: 'Bob Smith',
            assignment: 'Advanced Physics Assignment',
            submittedAt: '2024-07-08 13:15',
            status: 'reviewed'
        },
        {
            id: '3',
            studentName: 'Carol Davis',
            assignment: 'Chemistry Lab Report',
            submittedAt: '2024-07-08 11:45',
            status: 'graded'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'pending-review':
                return 'bg-yellow-100 text-yellow-800';
            case 'reviewed':
                return 'bg-purple-100 text-purple-800';
            case 'graded':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Instructor Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Welcome back, {user?.firstName}! Manage your assignments and review student progress.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-6 md:grid-cols-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
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
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">83</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Students</p>
                                <p className="text-2xl font-semibold text-gray-900">83</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">68</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Submissions</p>
                                <p className="text-2xl font-semibold text-gray-900">68</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">15</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                                <p className="text-2xl font-semibold text-gray-900">15</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assignments */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">My Assignments</h2>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                            Create New Assignment
                        </button>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {instructorAssignments.map((assignment) => (
                            <div key={assignment.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {assignment.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Due: {new Date(assignment.dueDate).toLocaleDateString()} • 
                                            {assignment.students} students enrolled
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-green-600">{assignment.submitted}</p>
                                            <p className="text-xs text-gray-500">Submitted</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-yellow-600">{assignment.pending}</p>
                                            <p className="text-xs text-gray-500">Pending</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                                                {assignment.status}
                                            </span>
                                        </div>
                                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Submissions and Quick Actions */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Recent Submissions</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {recentSubmissions.map((submission) => (
                                <div key={submission.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {submission.studentName}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {submission.assignment}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {submission.submittedAt}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                                                {submission.status.replace('-', ' ')}
                                            </span>
                                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                                Review
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                                Create New Assignment
                            </button>
                            <a
                                href="/join"
                                className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                            >
                                Join Assignment
                            </a>
                            {hasRole(UserRole.STUDENT) && (
                                <a
                                    href="/student"
                                    className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Switch to Student View
                                </a>
                            )}
                        </div>

                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    <span className="text-gray-600">Graded 5 submissions</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                    <span className="text-gray-600">Created Chemistry Lab Report</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                                    <span className="text-gray-600">Updated Math Quiz deadline</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
