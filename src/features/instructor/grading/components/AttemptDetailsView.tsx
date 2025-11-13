'use client';

import React from 'react';
import { useAttemptDetails, useAttemptContent } from '@/lib/api/hooks/attempts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Award,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AttemptDetailsViewProps {
  attemptId: number;
  onGrade?: (attemptId: number, score: number) => void;
  isGrading?: boolean;
}

/**
 * AttemptDetailsView component for instructors to review student attempts
 * Features:
 * - Student information
 * - Attempt timeline
 * - Question-by-question breakdown
 * - Score calculation
 * - Manual grading interface
 */
export function AttemptDetailsView({ 
  attemptId, 
  onGrade,
  isGrading = false 
}: AttemptDetailsViewProps) {
  const { data: attempt, isLoading: attemptLoading } = useAttemptDetails(attemptId);
  const { data: content, isLoading: contentLoading } = useAttemptContent(attemptId);

  if (attemptLoading || contentLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading attempt details...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attempt || !content) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Attempt not found</div>
        </CardContent>
      </Card>
    );
  }

  const correctAnswers = content.questions?.filter(q => 
    q.correctAnswer && q.userAnswer && q.correctAnswer === q.userAnswer
  ).length || 0;
  const totalQuestions = content.questions?.length || 0;
  const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const statusConfig = {
    IN_PROGRESS: { label: 'In Progress', variant: 'secondary' as const, color: 'text-blue-600' },
    SUBMITTED: { label: 'Submitted', variant: 'default' as const, color: 'text-yellow-600' },
    GRADED: { label: 'Graded', variant: 'outline' as const, color: 'text-green-600' },
  };

  const status = statusConfig[attempt.status] || statusConfig.SUBMITTED;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Attempt Details</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={status.variant}>{status.label}</Badge>
                {attempt.score !== undefined && (
                  <Badge variant="outline">
                    <Award className="mr-1 h-3 w-3" />
                    Score: {attempt.score}%
                  </Badge>
                )}
              </div>
            </div>
            {onGrade && attempt.status === 'SUBMITTED' && (
              <Button 
                onClick={() => onGrade(attemptId, scorePercentage)}
                disabled={isGrading}
              >
                <Edit className="mr-2 h-4 w-4" />
                {isGrading ? 'Grading...' : 'Grade Attempt'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Student Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Student ID</div>
                <div className="font-medium">{attempt.studentId}</div>
              </div>
            </div>

            {/* Started At */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Started</div>
                <div className="font-medium">
                  {formatDistanceToNow(new Date(attempt.startedAt), { addSuffix: true })}
                </div>
              </div>
            </div>

            {/* Submitted At */}
            {attempt.submittedAt && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Submitted</div>
                  <div className="font-medium">
                    {formatDistanceToNow(new Date(attempt.submittedAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            )}

            {/* Time Spent */}
            {attempt.timeSpent && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Time Spent</div>
                  <div className="font-medium">
                    {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Score Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="text-2xl font-bold text-green-600">
                {correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="text-2xl font-bold text-red-600">
                {totalQuestions - correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Incorrect Answers</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="text-2xl font-bold text-primary">
                {scorePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question-by-Question Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.questions?.map((question, index) => {
              const isCorrect = question.correctAnswer && question.userAnswer && 
                question.correctAnswer === question.userAnswer;
              const hasAnswer = question.userAnswer !== undefined && question.userAnswer !== null;

              return (
                <div key={question.id} className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      isCorrect && "bg-green-100 text-green-600 dark:bg-green-900/20",
                      !isCorrect && hasAnswer && "bg-red-100 text-red-600 dark:bg-red-900/20",
                      !hasAnswer && "bg-gray-100 text-gray-600 dark:bg-gray-900/20"
                    )}>
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">Question {index + 1}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {question.questionText}
                          </div>
                        </div>
                        <Badge variant={isCorrect ? "default" : "destructive"}>
                          {question.questionType}
                        </Badge>
                      </div>

                      {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                        <div className="space-y-1 ml-4">
                          {question.options.map((option) => {
                            const isSelected = Array.isArray(question.userAnswer) 
                              ? question.userAnswer.includes(option.id)
                              : question.userAnswer === option.id;
                            const isCorrectOption = option.isCorrect;

                            return (
                              <div 
                                key={option.id}
                                className={cn(
                                  "rounded-md border p-2 text-sm",
                                  isSelected && isCorrectOption && "border-green-500 bg-green-50 dark:bg-green-900/10",
                                  isSelected && !isCorrectOption && "border-red-500 bg-red-50 dark:bg-red-900/10",
                                  !isSelected && isCorrectOption && "border-green-500/50 bg-green-50/50 dark:bg-green-900/5"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {isSelected && (
                                    <span className="text-xs font-medium">
                                      {isCorrectOption ? '✓ Selected' : '✗ Selected'}
                                    </span>
                                  )}
                                  {!isSelected && isCorrectOption && (
                                    <span className="text-xs font-medium text-green-600">
                                      ✓ Correct Answer
                                    </span>
                                  )}
                                  <span>{option.text}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {(question.questionType === 'ESSAY' || question.questionType === 'FILL_IN_BLANK') && (
                        <div className="ml-4 space-y-2">
                          {question.userAnswer && (
                            <div className="rounded-md border p-3 bg-muted/50">
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                Student Answer:
                              </div>
                              <div className="text-sm">{question.userAnswer}</div>
                            </div>
                          )}
                          {question.correctAnswer && (
                            <div className="rounded-md border border-green-500/50 p-3 bg-green-50/50 dark:bg-green-900/10">
                              <div className="text-xs font-medium text-green-600 mb-1">
                                Expected Answer:
                              </div>
                              <div className="text-sm">{question.correctAnswer}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
