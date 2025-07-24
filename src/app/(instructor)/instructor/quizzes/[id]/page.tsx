'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useNextAuth } from '@/hooks/useNextAuth';
import { DashboardLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { 
  ChevronLeft,
  Edit,
  Play,
  Clock,
  Users,
  BookOpen,
  Award,
  Settings,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  questions: Question[];
  timeLimit: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  allowReview: boolean;
  status: 'draft' | 'published' | 'archived';
  studentsCount: number;
  attemptsCount: number;
  averageScore?: number;
  createdAt: string;
  updatedAt: string;
}

export default function QuizPreviewPage() {
  const { user, hasRole, isAuthenticated, isLoading } = useNextAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();
  const params = useParams();
  const t = useTranslations();
  const quizId = params.id as string;

  useEffect(() => {
    // Check if user is authenticated and has instructor role
    if (!isLoading && (!isAuthenticated || !hasRole('INSTRUCTOR'))) {
      router.push('/sign-in');
      return;
    }

    // Load quiz data
    if (isAuthenticated && hasRole('INSTRUCTOR') && quizId) {
      loadQuiz();
    }
  }, [isAuthenticated, hasRole, isLoading, router, quizId, loadQuiz]);

  const loadQuiz = useCallback(async () => {
    setIsLoadingQuiz(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock quiz data
      const mockQuiz: Quiz = {
        id: quizId,
        title: 'Mathematics Quiz #1',
        description: 'Basic algebra and geometry concepts for beginners. This quiz covers fundamental mathematical operations, equations, and geometric principles.',
        subject: 'Mathematics',
        questions: [
          {
            id: '1',
            question: 'What is the result of 2 + 2?',
            type: 'multiple_choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            points: 1,
          },
          {
            id: '2',
            question: 'Is the square root of 16 equal to 4?',
            type: 'true_false',
            correctAnswer: 'true',
            points: 1,
          },
          {
            id: '3',
            question: 'What is the formula for the area of a circle?',
            type: 'short_answer',
            correctAnswer: 'πr²',
            points: 2,
          },
        ],
        timeLimit: 30,
        attemptsAllowed: 1,
        shuffleQuestions: false,
        showResults: true,
        allowReview: true,
        status: 'draft',
        studentsCount: 0,
        attemptsCount: 0,
        createdAt: '2024-07-15T10:00:00Z',
        updatedAt: '2024-07-16T14:30:00Z',
      };

      setQuiz(mockQuiz);
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz');
      router.push('/instructor/quizzes');
    } finally {
      setIsLoadingQuiz(false);
    }
  }, [quizId, router]);

  const handlePublishQuiz = async () => {
    if (!quiz) return;

    setIsPublishing(true);
    try {
      // TODO: Replace with actual API call
      console.log('Publishing quiz:', quiz.id);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setQuiz(prev => prev ? { ...prev, status: 'published' } : null);
      toast.success('Quiz published successfully!');
    } catch (error) {
      console.error('Error publishing quiz:', error);
      toast.error('Failed to publish quiz');
    } finally {
      setIsPublishing(false);
    }
  };

  const getQuestionTypeLabel = (type: Question['type']) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'short_answer':
        return 'Short Answer';
      default:
        return type;
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPoints = quiz?.questions.reduce((sum, q) => sum + q.points, 0) || 0;

  if (isLoading || isLoadingQuiz || !user) {
    return (
      <DashboardLayout title="Quiz Preview">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) {
    return (
      <DashboardLayout title="Quiz Preview">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
          <Button asChild>
            <Link href="/instructor/quizzes">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Quizzes
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Quiz Preview">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quiz Preview</h1>
            <p className="text-muted-foreground mt-1">
              Review how your quiz will appear to students
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {quiz.status === 'draft' && (
              <Button onClick={handlePublishQuiz} disabled={isPublishing}>
                {isPublishing ? (
                  <InlineLoading text="Publishing..." />
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Publish Quiz
                  </>
                )}
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href={`/instructor/quizzes/${quiz.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Quiz
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/instructor/quizzes">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Link>
            </Button>
          </div>
        </div>

        {/* Quiz Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <CardDescription className="mt-2 text-base">
                  {quiz.description}
                </CardDescription>
                <div className="flex items-center space-x-4 mt-4">
                  <span className="text-sm text-muted-foreground">
                    Subject: <span className="font-medium">{quiz.subject}</span>
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(quiz.status)}`}>
                    {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{quiz.questions.length}</p>
                  <p className="text-xs text-muted-foreground">Questions</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{quiz.timeLimit} min</p>
                  <p className="text-xs text-muted-foreground">Time Limit</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{totalPoints}</p>
                  <p className="text-xs text-muted-foreground">Total Points</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{quiz.studentsCount}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Quiz Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Attempts Allowed</p>
                <p className="text-sm text-muted-foreground">{quiz.attemptsAllowed}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Shuffle Questions</p>
                <p className="text-sm text-muted-foreground">
                  {quiz.shuffleQuestions ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Show Results</p>
                <p className="text-sm text-muted-foreground">
                  {quiz.showResults ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Questions Preview</span>
            </CardTitle>
            <CardDescription>
              This is how students will see your quiz questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-6 bg-muted/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Question {index + 1}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mb-4">{question.question}</h3>

                  {question.type === 'multiple_choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <div className="w-4 h-4 border border-muted-foreground rounded-full" />
                          <span className="text-sm">{option}</span>
                          {option === question.correctAnswer && (
                            <span className="text-xs text-green-600 font-medium">(Correct)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'true_false' && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border border-muted-foreground rounded-full" />
                        <span className="text-sm">True</span>
                        {question.correctAnswer.toLowerCase() === 'true' && (
                          <span className="text-xs text-green-600 font-medium">(Correct)</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border border-muted-foreground rounded-full" />
                        <span className="text-sm">False</span>
                        {question.correctAnswer.toLowerCase() === 'false' && (
                          <span className="text-xs text-green-600 font-medium">(Correct)</span>
                        )}
                      </div>
                    </div>
                  )}

                  {question.type === 'short_answer' && (
                    <div className="space-y-2">
                      <div className="border border-muted-foreground rounded-md p-3 bg-background">
                        <span className="text-sm text-muted-foreground">
                          Students will type their answer here...
                        </span>
                      </div>
                      <p className="text-xs text-green-600">
                        Expected answer: {question.correctAnswer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiz Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Created</p>
                <p className="text-muted-foreground">{formatDate(quiz.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-muted-foreground">{formatDate(quiz.updatedAt)}</p>
              </div>
              {quiz.averageScore && (
                <div>
                  <p className="font-medium">Average Score</p>
                  <p className="text-muted-foreground">{quiz.averageScore}%</p>
                </div>
              )}
              <div>
                <p className="font-medium">Total Attempts</p>
                <p className="text-muted-foreground">{quiz.attemptsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}