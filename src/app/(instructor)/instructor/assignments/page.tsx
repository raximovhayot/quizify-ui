'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { 
  Plus,
  Search,
  ClipboardList,
  Users,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  Code
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  assignmentCode: string;
  quizTitle: string;
  studentsCount: number;
  submissionsCount: number;
  attemptsAllowed: number;
  dueDate: string;
  status: 'active' | 'expired' | 'draft';
  createdAt: string;
  updatedAt: string;
  averageScore?: number;
}

type SortBy = 'title' | 'created' | 'updated' | 'dueDate' | 'students';
type FilterStatus = 'all' | 'active' | 'expired' | 'draft';

export default function AssignmentsPage() {
  const { user, hasRole, isAuthenticated, isLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    // Check if user is authenticated and has instructor role
    if (!isLoading && (!isAuthenticated || !hasRole('INSTRUCTOR'))) {
      router.push('/sign-in');
      return;
    }

    // Load assignments
    if (isAuthenticated && hasRole('INSTRUCTOR')) {
      loadAssignments();
    }
  }, [isAuthenticated, hasRole, isLoading, router]);

  useEffect(() => {
    // Filter and sort assignments
    let filtered = assignments;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.assignmentCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'students':
          return b.studentsCount - a.studentsCount;
        default:
          return 0;
      }
    });

    setFilteredAssignments(filtered);
  }, [assignments, searchQuery, filterStatus, sortBy]);

  const loadAssignments = async () => {
    setIsLoadingAssignments(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockAssignments: Assignment[] = [
        {
          id: '1',
          title: 'Mathematics Assignment #1',
          description: 'Basic algebra and geometry quiz assignment',
          subject: 'Mathematics',
          assignmentCode: 'MATH01',
          quizTitle: 'Mathematics Quiz #1',
          studentsCount: 25,
          submissionsCount: 18,
          attemptsAllowed: 2,
          dueDate: '2024-07-25T23:59:00Z',
          status: 'active',
          createdAt: '2024-07-15T10:00:00Z',
          updatedAt: '2024-07-16T14:30:00Z',
          averageScore: 78.5,
        },
        {
          id: '2',
          title: 'Physics Assignment - Motion',
          description: 'Understanding motion, velocity, and acceleration',
          subject: 'Physics',
          assignmentCode: 'PHYS01',
          quizTitle: 'Physics Quiz - Motion',
          studentsCount: 18,
          submissionsCount: 15,
          attemptsAllowed: 1,
          dueDate: '2024-07-30T23:59:00Z',
          status: 'active',
          createdAt: '2024-07-14T09:00:00Z',
          updatedAt: '2024-07-14T09:00:00Z',
          averageScore: 82.3,
        },
        {
          id: '3',
          title: 'Chemistry Assignment',
          description: 'Introduction to chemical elements and compounds',
          subject: 'Chemistry',
          assignmentCode: 'CHEM01',
          quizTitle: 'Chemistry Basics',
          studentsCount: 0,
          submissionsCount: 0,
          attemptsAllowed: 1,
          dueDate: '2024-08-05T23:59:00Z',
          status: 'draft',
          createdAt: '2024-07-18T16:00:00Z',
          updatedAt: '2024-07-18T16:00:00Z',
        },
      ];

      setAssignments(mockAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      // TODO: Replace with actual API call
      console.log('Deleting assignment:', assignmentId);
      
      setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
      toast.success('Assignment deleted successfully');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const handleDuplicateAssignment = async (assignmentId: string) => {
    try {
      // TODO: Replace with actual API call
      console.log('Duplicating assignment:', assignmentId);
      
      const originalAssignment = assignments.find(a => a.id === assignmentId);
      if (originalAssignment) {
        const duplicatedAssignment: Assignment = {
          ...originalAssignment,
          id: Date.now().toString(),
          title: `${originalAssignment.title} (Copy)`,
          assignmentCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          status: 'draft',
          studentsCount: 0,
          submissionsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setAssignments(prev => [duplicatedAssignment, ...prev]);
        toast.success('Assignment duplicated successfully');
      }
    } catch (error) {
      console.error('Error duplicating assignment:', error);
      toast.error('Failed to duplicate assignment');
    }
  };

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  if (isLoading || !user) {
    return (
      <DashboardLayout title="Assignments">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Assignments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your assignments
            </p>
          </div>
          <Button asChild>
            <Link href="/instructor/assignments/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="draft">Draft</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="updated">Last Updated</option>
                  <option value="created">Date Created</option>
                  <option value="title">Title</option>
                  <option value="dueDate">Due Date</option>
                  <option value="students">Students</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAssignments.length} of {assignments.length} assignments
          </p>
        </div>

        {/* Assignment Grid/List */}
        {isLoadingAssignments ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first assignment'}
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <Button asChild>
                    <Link href="/instructor/assignments/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Assignment
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {assignment.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {assignment.subject}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/instructor/assignments/${assignment.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/instructor/assignments/${assignment.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateAssignment(assignment.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-mono">
                      {assignment.assignmentCode}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {assignment.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quiz:</span>
                      <span className="font-medium truncate ml-2">{assignment.quizTitle}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{assignment.studentsCount} students</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Code className="w-4 h-4 text-muted-foreground" />
                        <span>{assignment.submissionsCount} submissions</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className={`font-medium ${
                          assignment.status === 'expired' ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {formatDueDate(assignment.dueDate)}
                        </span>
                      </div>
                    </div>

                    {assignment.averageScore && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Average Score</span>
                          <span className="font-medium">{assignment.averageScore}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}