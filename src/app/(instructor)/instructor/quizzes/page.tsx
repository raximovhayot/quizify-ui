'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useNextAuth } from '@/hooks/useNextAuth';
import { DashboardLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { 
  Plus,
  Search,
  BookOpen,
  Users,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  Calendar
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
import { apiClient } from '@/lib/api';

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  questionsCount: number;
  studentsCount: number;
  attemptsCount: number;
  timeLimit: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  averageScore?: number;
}

type SortBy = 'title' | 'created' | 'updated' | 'students' | 'attempts';
type FilterStatus = 'all' | 'draft' | 'published' | 'archived';

export default function QuizzesPage() {
  const { user, hasRole, isAuthenticated, isLoading } = useNextAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
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

    // Load quizzes
    if (isAuthenticated && hasRole('INSTRUCTOR')) {
      loadQuizzes();
    }
  }, [isAuthenticated, hasRole, isLoading, router]);

  useEffect(() => {
    // Filter and sort quizzes
    let filtered = quizzes;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(quiz => quiz.status === filterStatus);
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
        case 'students':
          return b.studentsCount - a.studentsCount;
        case 'attempts':
          return b.attemptsCount - a.attemptsCount;
        default:
          return 0;
      }
    });

    setFilteredQuizzes(filtered);
  }, [quizzes, searchQuery, filterStatus, sortBy]);

  const loadQuizzes = async () => {
    setIsLoadingQuizzes(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Fetch quizzes from API
      const response = await apiClient.get('/quizzes', accessToken);
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      setQuizzes(response.data || []);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load quizzes');
      // Set empty array on error
      setQuizzes([]);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Delete quiz via API
      const response = await apiClient.delete(`/quizzes/${quizId}`, accessToken);
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      // Remove from local state on successful deletion
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      toast.success('Quiz deleted successfully');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const handleDuplicateQuiz = async (quizId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // First, get the original quiz details with questions
      const originalQuizResponse = await apiClient.get(`/quizzes/${quizId}`, accessToken);
      
      if (originalQuizResponse.errors && originalQuizResponse.errors.length > 0) {
        throw new Error(originalQuizResponse.errors[0].message);
      }

      const originalQuiz = originalQuizResponse.data;
      
      // Create duplicate quiz data
      const duplicateQuizData = {
        title: `${originalQuiz.title} (Copy)`,
        description: originalQuiz.description,
        subject: originalQuiz.subject,
        timeLimit: originalQuiz.timeLimit,
        status: 'draft' as const,
        questions: originalQuiz.questions || []
      };

      // Create the duplicate quiz via API
      const createResponse = await apiClient.post('/quizzes', duplicateQuizData, accessToken);
      
      if (createResponse.errors && createResponse.errors.length > 0) {
        throw new Error(createResponse.errors[0].message);
      }

      // Add the new quiz to local state
      const newQuiz = createResponse.data;
      setQuizzes(prev => [newQuiz, ...prev]);
      toast.success('Quiz duplicated successfully');
    } catch (error) {
      console.error('Error duplicating quiz:', error);
      toast.error('Failed to duplicate quiz');
    }
  };

  const getStatusColor = (status: Quiz['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading || !user) {
    return (
      <DashboardLayout title="Quizzes">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Quizzes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Quizzes</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your quizzes
            </p>
          </div>
          <Button asChild>
            <Link href="/instructor/quizzes/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
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
                  placeholder="Search quizzes..."
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
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="updated">Last Updated</option>
                  <option value="created">Date Created</option>
                  <option value="title">Title</option>
                  <option value="students">Students</option>
                  <option value="attempts">Attempts</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredQuizzes.length} of {quizzes.length} quizzes
          </p>
        </div>

        {/* Quiz Grid/List */}
        {isLoadingQuizzes ? (
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
        ) : filteredQuizzes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first quiz'}
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <Button asChild>
                    <Link href="/instructor/quizzes/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Quiz
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {quiz.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {quiz.subject}
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
                          <Link href={`/instructor/quizzes/${quiz.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/instructor/quizzes/${quiz.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateQuiz(quiz.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(quiz.status)}`}>
                      {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{quiz.questionsCount} questions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{quiz.timeLimit} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{quiz.studentsCount} students</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(quiz.updatedAt)}</span>
                    </div>
                  </div>

                  {quiz.averageScore && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Average Score</span>
                        <span className="font-medium">{quiz.averageScore}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}