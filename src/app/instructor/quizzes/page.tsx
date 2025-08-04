'use client';

import {
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export default function QuizzesPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real app, this would come from API
  const quizzes = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Basic concepts of JavaScript programming',
      questions: 15,
      duration: 30,
      status: 'active',
      submissions: 23,
      averageScore: 78.5,
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      title: 'React Components',
      description: 'Understanding React component lifecycle and hooks',
      questions: 20,
      duration: 45,
      status: 'draft',
      submissions: 0,
      averageScore: 0,
      createdAt: '2024-01-20',
    },
    {
      id: 3,
      title: 'CSS Grid & Flexbox',
      description: 'Modern CSS layout techniques',
      questions: 12,
      duration: 25,
      status: 'active',
      submissions: 18,
      averageScore: 82.3,
      createdAt: '2024-01-10',
    },
    {
      id: 4,
      title: 'Node.js Basics',
      description: 'Server-side JavaScript with Node.js',
      questions: 18,
      duration: 40,
      status: 'archived',
      submissions: 45,
      averageScore: 75.2,
      createdAt: '2024-01-05',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('instructor.quizzes.title', { fallback: 'Quizzes' })}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('instructor.quizzes.subtitle', {
              fallback: 'Create and manage your quizzes',
            })}
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('instructor.quizzes.createNew', { fallback: 'Create Quiz' })}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('instructor.quizzes.searchPlaceholder', {
              fallback: 'Search quizzes...',
            })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          {t('instructor.quizzes.filter', { fallback: 'Filter' })}
        </Button>
      </div>

      {/* Quizzes Grid */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">
                  {quiz.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {quiz.description}
                </p>
                <Badge
                  variant={getStatusColor(quiz.status)}
                  className="text-xs"
                >
                  {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0 ml-2"
                    aria-label={t('instructor.quizzes.actions', {
                      fallback: 'Quiz actions',
                    })}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    {t('instructor.quizzes.view', { fallback: 'View' })}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('instructor.quizzes.edit', { fallback: 'Edit' })}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('instructor.quizzes.delete', { fallback: 'Delete' })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('instructor.quizzes.questions', { fallback: 'Questions' })}
                  :
                </span>
                <span>{quiz.questions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('instructor.quizzes.duration', { fallback: 'Duration' })}:
                </span>
                <span>{quiz.duration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('instructor.quizzes.submissions', {
                    fallback: 'Submissions',
                  })}
                  :
                </span>
                <span>{quiz.submissions}</span>
              </div>
              {quiz.submissions > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('instructor.quizzes.avgScore', {
                      fallback: 'Avg Score',
                    })}
                    :
                  </span>
                  <span className="font-medium">{quiz.averageScore}%</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                {t('instructor.quizzes.created', { fallback: 'Created' })}:{' '}
                {quiz.createdAt}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery
              ? t('instructor.quizzes.noResults', {
                  fallback: 'No quizzes found matching your search.',
                })
              : t('instructor.quizzes.noQuizzes', {
                  fallback: 'No quizzes created yet.',
                })}
          </p>
        </div>
      )}
    </div>
  );
}
