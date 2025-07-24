'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function QuizzesPage() {
  const t = useTranslations();
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');

  // Mock data - in real implementation, this would come from API calls
  const quizzes = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Basic concepts of JavaScript programming',
      questions: 15,
      duration: 30,
      attempts: 45,
      status: 'published',
      createdAt: '2024-07-20',
      lastModified: '2024-07-22'
    },
    {
      id: 2,
      title: 'React Components',
      description: 'Understanding React component lifecycle and props',
      questions: 20,
      duration: 45,
      attempts: 38,
      status: 'published',
      createdAt: '2024-07-18',
      lastModified: '2024-07-21'
    },
    {
      id: 3,
      title: 'TypeScript Basics',
      description: 'Introduction to TypeScript type system',
      questions: 12,
      duration: 25,
      attempts: 42,
      status: 'draft',
      createdAt: '2024-07-15',
      lastModified: '2024-07-23'
    },
    {
      id: 4,
      title: 'Node.js Backend',
      description: 'Server-side development with Node.js',
      questions: 18,
      duration: 40,
      attempts: 35,
      status: 'published',
      createdAt: '2024-07-10',
      lastModified: '2024-07-20'
    },
    {
      id: 5,
      title: 'Database Design',
      description: 'Relational database concepts and SQL',
      questions: 25,
      duration: 60,
      attempts: 0,
      status: 'draft',
      createdAt: '2024-07-24',
      lastModified: '2024-07-24'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Published
          </span>
        );
      case 'draft':
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

  const filteredQuizzes = quizzes.filter(quiz => {
    if (statusFilter === 'all') return true;
    return quiz.status === statusFilter;
  });

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
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
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
            <SelectItem value="attempts">Attempts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quiz Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.length}</div>
            <p className="text-xs text-muted-foreground">
              {quizzes.filter(q => q.status === 'published').length} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizzes.reduce((sum, quiz) => sum + quiz.attempts, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all quizzes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Questions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(quizzes.reduce((sum, quiz) => sum + quiz.questions, 0) / quizzes.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per quiz
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(quizzes.reduce((sum, quiz) => sum + quiz.duration, 0) / quizzes.length)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        {filteredQuizzes.map((quiz) => (
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
                    {quiz.questions} questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {quiz.duration} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {quiz.attempts} attempts
                  </div>
                  <div>
                    Modified: {quiz.lastModified}
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
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
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