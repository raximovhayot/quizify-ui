'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useInstructorQuizzes } from '@/hooks/useInstructorQuizzes';
import { QuizStatus } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function QuizzesPage() {
  const t = useTranslations();
  const [statusFilter, setStatusFilter] = useState<'all' | QuizStatus>('all');
  const [sortBy, setSortBy] = useState('created');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    quizzes,
    isLoading,
    error,
    fetchQuizzes,
    updateQuizStatus,
    deleteQuiz,
    duplicateQuiz,
    searchQuizzes
  } = useInstructorQuizzes();

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        const status = statusFilter === 'all' ? undefined : statusFilter;
        searchQuizzes(searchTerm, status);
      } else {
        const params = statusFilter === 'all' ? {} : { status: statusFilter };
        fetchQuizzes(params);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, fetchQuizzes, searchQuizzes]);

  // Handle status filter changes
  const handleStatusFilterChange = (value: string) => {
    const newStatus = value as 'all' | QuizStatus;
    setStatusFilter(newStatus);
  };

  const getStatusBadge = (status: QuizStatus) => {
    switch (status) {
      case QuizStatus.PUBLISHED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Published
          </span>
        );
      case QuizStatus.DRAFT:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3" />
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  // Handle quiz actions
  const handleUpdateStatus = async (quizId: number, newStatus: QuizStatus) => {
    await updateQuizStatus(quizId, newStatus);
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      await deleteQuiz(quizId);
    }
  };

  const handleDuplicateQuiz = async (quizId: number) => {
    await duplicateQuiz(quizId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('navigation.quizzes')}
          </h1>
          <p className="text-muted-foreground">
            Create and manage your quizzes
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Quiz
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-32">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={QuizStatus.PUBLISHED}>Published</SelectItem>
            <SelectItem value={QuizStatus.DRAFT}>Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Created Date</SelectItem>
            <SelectItem value="modified">Last Modified</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground">Loading quizzes...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchQuizzes()}>Try Again</Button>
        </div>
      )}

      {/* Quizzes List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      {getStatusBadge(quiz.status)}
                    </div>
                    <CardDescription>{quiz.description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {quiz.numberOfQuestions} questions
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {quiz.time} min
                    </div>
                    <div>
                      Created: {new Date(quiz.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newStatus = quiz.status === QuizStatus.PUBLISHED 
                          ? QuizStatus.DRAFT 
                          : QuizStatus.PUBLISHED;
                        handleUpdateStatus(quiz.id, newStatus);
                      }}
                      className={quiz.status === QuizStatus.PUBLISHED 
                        ? "text-yellow-600 hover:text-yellow-700" 
                        : "text-green-600 hover:text-green-700"
                      }
                    >
                      {quiz.status === QuizStatus.PUBLISHED ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDuplicateQuiz(quiz.id)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && quizzes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {statusFilter === 'all' 
                ? "You haven't created any quizzes yet. Get started by creating your first quiz."
                : `No quizzes with status "${statusFilter}" found. Try changing the filter.`
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Quiz
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}