'use client';

import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Trash2,
  Users,
} from 'lucide-react';

import React from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { QuizDataDTO, QuizStatus } from '../types/quiz';

export interface QuizCardProps {
  quiz: QuizDataDTO;
  onDelete?: () => void;
  onUpdateStatus?: (status: QuizStatus) => void;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function QuizCard({
  quiz,
  onDelete,
  onUpdateStatus,
  isDeleting = false,
  isUpdatingStatus = false,
  children,
  className,
}: Readonly<QuizCardProps>) {
  const t = useTranslations();
  const router = useRouter();

  const getStatusColor = (status: QuizStatus) => {
    switch (status) {
      case QuizStatus.PUBLISHED:
        return 'default';
      case QuizStatus.DRAFT:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: QuizStatus) => {
    switch (status) {
      case QuizStatus.PUBLISHED:
        return t('instructor.quiz.status.published', { fallback: 'Published' });
      case QuizStatus.DRAFT:
        return t('instructor.quiz.status.draft', { fallback: 'Draft' });
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes === 0) {
      return t('instructor.quiz.time.unlimited', { fallback: 'Unlimited' });
    }
    if (minutes < 60) {
      return t('instructor.quiz.time.minutes', {
        fallback: '{minutes}m',
        minutes,
      });
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return t('instructor.quiz.time.hours', {
        fallback: '{hours}h',
        hours,
      });
    }
    return t('instructor.quiz.time.hoursMinutes', {
      fallback: '{hours}h {minutes}m',
      hours,
      minutes: remainingMinutes,
    });
  };

  const formatAttempts = (attempts: number) => {
    if (attempts === 0) {
      return t('instructor.quiz.attempts.unlimited', { fallback: 'Unlimited' });
    }
    return t('instructor.quiz.attempts.count', {
      fallback: '{count} attempts',
      count: attempts,
    });
  };

  const handleStatusToggle = () => {
    if (!onUpdateStatus) return;

    const newStatus =
      quiz.status === QuizStatus.PUBLISHED
        ? QuizStatus.DRAFT
        : QuizStatus.PUBLISHED;
    onUpdateStatus(newStatus);
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold truncate">
                {quiz.title?.trim() ||
                  t('instructor.quiz.untitled', { fallback: 'Untitled' })}
              </h3>
              <Badge variant={getStatusColor(quiz.status)}>
                {getStatusLabel(quiz.status)}
              </Badge>
            </div>
            {quiz.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {quiz.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={isDeleting || isUpdatingStatus}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">
                  {t('common.actions', { fallback: 'Actions' })}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(ROUTES_APP.quizzes.detail(quiz.id))}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t('instructor.quiz.action.view', { fallback: 'View' })}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
              >
                <Edit className="mr-2 h-4 w-4" />
                {t('instructor.quiz.action.edit', { fallback: 'Edit' })}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onUpdateStatus && (
                <DropdownMenuItem onClick={handleStatusToggle}>
                  {quiz.status === QuizStatus.PUBLISHED ? (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      {t('instructor.quiz.action.unpublish', {
                        fallback: 'Unpublish',
                      })}
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      {t('instructor.quiz.action.publish', {
                        fallback: 'Publish',
                      })}
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('instructor.quiz.action.delete', { fallback: 'Delete' })}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('instructor.quiz.questions', { fallback: 'Questions' })}:
            </span>
            <span className="font-medium">{quiz.numberOfQuestions}</span>
          </div>

          {typeof quiz.settings?.time === 'number' && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t('instructor.quiz.time', { fallback: 'Time' })}:
              </span>
              <span className="font-medium">
                {formatTime(quiz.settings?.time)}
              </span>
            </div>
          )}

          {typeof quiz.settings?.attempt === 'number' && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t('instructor.quiz.attempts', { fallback: 'Attempts' })}:
              </span>
              <span className="font-medium">
                {formatAttempts(quiz.settings?.attempt)}
              </span>
            </div>
          )}

          {quiz.createdDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t('instructor.quiz.created', { fallback: 'Created' })}:
              </span>
              <span className="font-medium">
                {formatDate(quiz.createdDate)}
              </span>
            </div>
          )}
        </div>

        {(quiz.settings?.shuffleQuestions || quiz.settings?.shuffleAnswers) && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {quiz.settings?.shuffleQuestions && (
                <Badge variant="outline" className="text-xs">
                  {t('instructor.quiz.shuffle.questions', {
                    fallback: 'Shuffle Questions',
                  })}
                </Badge>
              )}
              {quiz.settings?.shuffleAnswers && (
                <Badge variant="outline" className="text-xs">
                  {t('instructor.quiz.shuffle.answers', {
                    fallback: 'Shuffle Answers',
                  })}
                </Badge>
              )}
            </div>
          </div>
        )}

        {children && <div className="mt-3 pt-3 border-t">{children}</div>}
      </CardContent>
    </Card>
  );
}
