'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { FullPageLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Award, 
  Clock, 
  Target,
  Home,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

interface QuizResult {
  id: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeElapsed: number;
  completedAt: string;
  status: 'passed' | 'failed';
  questions: Array<{
    id: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    points: number;
  }>;
}

export default function QuizResultsPage() {
  const { hasRole, isAuthenticated, isLoading } = useAuth();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(true);
  const router = useRouter();
  const params = useParams();
  const t = useTranslations();
  const attemptId = params.id as string;

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasRole('STUDENT'))) {
      router.push('/sign-in');
      return;
    }

    if (isAuthenticated && hasRole('STUDENT') && attemptId) {
      loadQuizResult();
    }
  }, [isAuthenticated, hasRole, isLoading, router, attemptId]);

  const loadQuizResult = async () => {
    setIsLoadingResult(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // For now, we'll create mock result data since we don't have a specific results API
      // In a real implementation, this would fetch from /api/quiz-attempts/{attemptId}/results
      const mockResult: QuizResult = {
        id: attemptId,
        quizTitle: 'Mathematics Quiz #1',
        score: 3,
        maxScore: 4,
        percentage: 75,
        timeElapsed: 1200, // 20 minutes in seconds
        completedAt: new Date().toISOString(),
        status: 'passed',
        questions: [
          {
            id: '1',
            question: 'What is 2 + 2?',
            userAnswer: '4',
            correctAnswer: '4',
            isCorrect: true,
            points: 1,
          },
          {
            id: '2',
            question: 'Is the square root of 16 equal to 4?',
            userAnswer: 'true',
            correctAnswer: 'true',
            isCorrect: true,
            points: 1,
          },
          {
            id: '3',
            question: 'What is the formula for the area of a circle?',
            userAnswer: 'πr²',
            correctAnswer: 'πr²',
            isCorrect: true,
            points: 2,
          },
        ],
      };

      setResult(mockResult);
    } catch (error) {
      console.error('Error loading quiz result:', error);
      router.push('/student');
    } finally {
      setIsLoadingResult(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: 'passed' | 'failed') => {
    return status === 'passed' ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Passed
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Failed
      </Badge>
    );
  };

  if (isLoading || isLoadingResult || !result) {
    return (
      <FullPageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <InlineLoading text={t('common.loading')} />
        </div>
      </FullPageLayout>
    );
  }

  return (
    <FullPageLayout>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Award className={`w-16 h-16 ${getScoreColor(result.percentage)}`} />
            </div>
            <h1 className="text-3xl font-bold">Quiz Completed!</h1>
            <p className="text-muted-foreground">
              Here are your results for {result.quizTitle}
            </p>
          </div>

          {/* Score Summary */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <span>Your Score</span>
                {getStatusBadge(result.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className={`text-6xl font-bold ${getScoreColor(result.percentage)}`}>
                {result.percentage}%
              </div>
              <div className="text-lg text-muted-foreground">
                {result.score} out of {result.maxScore} points
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Time: {formatTime(result.timeElapsed)}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {result.questions.filter(q => q.isCorrect).length} / {result.questions.length} Correct
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          <Card>
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
              <CardDescription>
                Review your answers and see the correct solutions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">
                      Question {index + 1}: {question.question}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {question.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Your answer: </span>
                      <span className={question.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {question.userAnswer}
                      </span>
                    </div>
                    {!question.isCorrect && (
                      <div>
                        <span className="font-medium">Correct answer: </span>
                        <span className="text-green-600">{question.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button asChild>
              <Link href="/student">
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              <RotateCcw className="w-4 h-4 mr-2" />
              View Again
            </Button>
          </div>
        </div>
      </div>
    </FullPageLayout>
  );
}