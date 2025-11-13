'use client';

import React from 'react';
import { useAttempt, useAttemptContent } from '@/lib/api/hooks/attempts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download,
  TrendingUp,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AttemptResultsViewProps {
  attemptId: number;
  onDownloadCertificate?: (attemptId: number) => void;
  passingScore?: number;
}

/**
 * AttemptResultsView component for students to review their quiz results
 * Features:
 * - Overall score display
 * - Time taken
 * - Correct/incorrect breakdown
 * - Question review with explanations
 * - Download certificate (if passed)
 */
export function AttemptResultsView({ 
  attemptId,
  onDownloadCertificate,
  passingScore = 70
}: AttemptResultsViewProps) {
  const { data: attempt, isLoading: attemptLoading } = useAttempt(attemptId);
  const { data: content, isLoading: contentLoading } = useAttemptContent(attemptId);

  if (attemptLoading || contentLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading results...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attempt || !content) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Results not found</div>
        </CardContent>
      </Card>
    );
  }

  const correctAnswers = content.questions?.filter(q => 
    q.correctAnswer && q.userAnswer && q.correctAnswer === q.userAnswer
  ).length || 0;
  const totalQuestions = content.questions?.length || 0;
  const scorePercentage = attempt.score ?? (totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0);
  const passed = scorePercentage >= passingScore;

  const timeSpentMinutes = attempt.timeSpent ? Math.floor(attempt.timeSpent / 60) : 0;
  const timeSpentSeconds = attempt.timeSpent ? attempt.timeSpent % 60 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Results</CardTitle>
            {attempt.status === 'GRADED' && (
              <Badge variant={passed ? "default" : "destructive"}>
                {passed ? 'Passed' : 'Not Passed'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Score Circle */}
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <div className={cn(
                  "flex h-32 w-32 items-center justify-center rounded-full border-8",
                  passed ? "border-green-500" : "border-red-500"
                )}>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{scorePercentage.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <Badge variant={passed ? "default" : "destructive"} className="text-xs">
                    {passed ? (
                      <>
                        <Award className="mr-1 h-3 w-3" />
                        Great Job!
                      </>
                    ) : (
                      'Keep Practicing'
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-green-50 dark:bg-green-900/10 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Correct</div>
              </div>

              <div className="rounded-lg border bg-red-50 dark:bg-red-900/10 p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div className="text-2xl font-bold text-red-600">
                    {totalQuestions - correctAnswers}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Incorrect</div>
              </div>

              <div className="rounded-lg border bg-blue-50 dark:bg-blue-900/10 p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">
                    {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Time Spent</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{correctAnswers} / {totalQuestions} questions</span>
              </div>
              <Progress 
                value={(correctAnswers / totalQuestions) * 100} 
                className="h-2"
              />
            </div>

            {/* Download Certificate */}
            {passed && onDownloadCertificate && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => onDownloadCertificate(attemptId)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Certificate
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Accuracy Rate</div>
                <div className="text-sm text-muted-foreground">
                  You answered {scorePercentage.toFixed(1)}% of questions correctly
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Time Management</div>
                <div className="text-sm text-muted-foreground">
                  Completed in {timeSpentMinutes} minutes and {timeSpentSeconds} seconds
                </div>
              </div>
            </div>
            {!passed && (
              <div className="flex items-start gap-3 rounded-lg border border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10 p-3">
                <Award className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-600">Room for Improvement</div>
                  <div className="text-sm text-muted-foreground">
                    You need {passingScore}% to pass. Review the questions below to improve your understanding.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.questions?.map((question, index) => {
              const isCorrect = question.correctAnswer && question.userAnswer && 
                question.correctAnswer === question.userAnswer;
              const hasAnswer = question.userAnswer !== undefined && question.userAnswer !== null;

              return (
                <div 
                  key={question.id} 
                  className={cn(
                    "rounded-lg border p-4",
                    isCorrect && "border-green-500/50 bg-green-50/50 dark:bg-green-900/10",
                    !isCorrect && hasAnswer && "border-red-500/50 bg-red-50/50 dark:bg-red-900/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-medium",
                      isCorrect && "bg-green-600 text-white",
                      !isCorrect && hasAnswer && "bg-red-600 text-white",
                      !hasAnswer && "bg-gray-400 text-white"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium">{question.questionText}</div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      </div>

                      {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option) => {
                            const isSelected = Array.isArray(question.userAnswer)
                              ? question.userAnswer.includes(option.id)
                              : question.userAnswer === option.id;
                            const isCorrectOption = option.isCorrect;

                            return (
                              <div
                                key={option.id}
                                className={cn(
                                  "rounded-md border p-3 text-sm transition-colors",
                                  isSelected && isCorrectOption && "border-green-500 bg-green-100 dark:bg-green-900/20",
                                  isSelected && !isCorrectOption && "border-red-500 bg-red-100 dark:bg-red-900/20",
                                  !isSelected && isCorrectOption && "border-green-500 bg-green-50 dark:bg-green-900/10"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{option.text}</span>
                                  <div className="flex items-center gap-2 text-xs font-medium">
                                    {isSelected && (
                                      <Badge variant={isCorrectOption ? "default" : "destructive"} className="text-xs">
                                        Your answer
                                      </Badge>
                                    )}
                                    {isCorrectOption && (
                                      <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                                        ✓ Correct
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {(question.questionType === 'ESSAY' || question.questionType === 'FILL_IN_BLANK') && (
                        <div className="space-y-2">
                          {question.userAnswer && (
                            <div className="rounded-md border p-3 bg-muted/50">
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                Your Answer:
                              </div>
                              <div className="text-sm">{question.userAnswer}</div>
                            </div>
                          )}
                          {question.correctAnswer && (
                            <div className="rounded-md border border-green-500/50 p-3 bg-green-50 dark:bg-green-900/10">
                              <div className="text-xs font-medium text-green-600 mb-1">
                                Correct Answer:
                              </div>
                              <div className="text-sm">{question.correctAnswer}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Explanation (if available) */}
                      {question.correctAnswer && !isCorrect && (
                        <div className="rounded-md border border-blue-500/50 bg-blue-50 dark:bg-blue-900/10 p-3">
                          <div className="text-xs font-medium text-blue-600 mb-1">
                            💡 Explanation:
                          </div>
                          <div className="text-sm text-muted-foreground">
                            The correct answer is highlighted above. Review this concept to improve your understanding.
                          </div>
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
