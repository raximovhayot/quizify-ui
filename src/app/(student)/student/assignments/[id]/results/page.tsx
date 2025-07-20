'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { 
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  BookOpen,
  User,
  Calendar,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

interface QuestionResult {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
  earnedPoints: number;
}

interface AssignmentResult {
  id: string;
  title: string;
  description: string;
  subject: string;
  instructorName: string;
  questions: QuestionResult[];
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  timeSpent: number; // in seconds
  submittedAt: string;
  dueDate: string;
  attemptNumber: number;
  maxAttempts: number;
  status: 'passed' | 'failed';
  feedback?: string;
}

export default function AssignmentResultsPage() {
  const { hasRole, isAuthenticated, isLoading } = useAuth();
  const [result, setResult] = useState<AssignmentResult | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(true);
  const router = useRouter();
  const params = useParams();
  const t = useTranslations();
  const assignmentId = params.id as string;

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasRole('STUDENT'))) {
      router.push('/sign-in');
      return;
    }

    if (isAuthenticated && hasRole('STUDENT') && assignmentId) {
      loadResult();
    }
  }, [isAuthenticated, hasRole, isLoading, router, assignmentId]);

  const loadResult = async () => {
    setIsLoadingResult(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResult: AssignmentResult = {
        id: assignmentId,
        title: 'Mathematics Assignment #1',
        description: 'Basic algebra and geometry concepts assignment',
        subject: 'Mathematics',
        instructorName: 'Dr. Smith',
        questions: [
          {
            id: '1',
            question: 'What is 2 + 2?',
            type: 'multiple_choice',
            options: ['3', '4', '5', '6'],
            studentAnswer: '4',
            correctAnswer: '4',
            isCorrect: true,
            points: 1,
            earnedPoints: 1,
          },
          {
            id: '2',
            question: 'Is the square root of 16 equal to 4?',
            type: 'true_false',
            studentAnswer: 'true',
            correctAnswer: 'true',
            isCorrect: true,
            points: 1,
            earnedPoints: 1,
          },
          {
            id: '3',
            question: 'What is the formula for the area of a circle?',
            type: 'short_answer',
            studentAnswer: 'pi*r^2',
            correctAnswer: 'πr²',
            isCorrect: false,
            points: 2,
            earnedPoints: 0,
          },
        ],
        totalPoints: 4,
        earnedPoints: 2,
        percentage: 50,
        timeSpent: 1200, // 20 minutes
        submittedAt: '2024-07-20T15:30:00Z',
        dueDate: '2024-07-25T23:59:00Z',
        attemptNumber: 1,
        maxAttempts: 2,
        status: 'failed',
        feedback: 'Good effort! Focus on mathematical notation for better results.',
      };

      setResult(mockResult);
    } catch (error) {
      console.error('Error loading result:', error);
      router.push('/student');
    } finally {
      setIsLoadingResult(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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

  const getQuestionTypeLabel = (type: QuestionResult['type']) => {
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

  const getStatusColor = (status: AssignmentResult['status']) => {
    return status === 'passed' 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (status: AssignmentResult['status']) => {
    return status === 'passed' 
      ? <CheckCircle className="w-5 h-5 text-green-600" />
      : <XCircle className="w-5 h-5 text-red-600" />;
  };

  if (isLoading || isLoadingResult) {
    return (
      <DashboardLayout title="Assignment Results">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </DashboardLayout>
    );
  }

  if (!result) {
    return (
      <DashboardLayout title="Assignment Results">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Results not found</h2>
          <Button asChild>
            <Link href="/student">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Assignment Results">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assignment Results</h1>
            <p className="text-muted-foreground mt-1">
              Review your performance and answers
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {result.attemptNumber < result.maxAttempts && result.status === 'failed' && (
              <Button asChild>
                <Link href={`/student/assignments/${result.id}`}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Assignment
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/student">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Assignment Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{result.title}</CardTitle>
                <CardDescription className="mt-2 text-base">
                  {result.description}
                </CardDescription>
                <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{result.subject}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{result.instructorName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Attempt {result.attemptNumber} of {result.maxAttempts}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(result.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Score Summary */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Score Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {result.earnedPoints}/{result.totalPoints}
                  </div>
                  <div className={`text-2xl font-semibold ${
                    result.percentage >= 60 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.percentage}%
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {result.questions.filter(q => q.isCorrect).length}
                    </div>
                    <div className="text-muted-foreground">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">
                      {result.questions.filter(q => !q.isCorrect).length}
                    </div>
                    <div className="text-muted-foreground">Incorrect</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Submission Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Spent:</span>
                  <span className="font-medium">{formatTime(result.timeSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-medium">{formatDate(result.submittedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{formatDate(result.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${
                    new Date(result.submittedAt) <= new Date(result.dueDate) 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {new Date(result.submittedAt) <= new Date(result.dueDate) 
                      ? 'On Time' : 'Late'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructor Feedback */}
        {result.feedback && (
          <Card>
            <CardHeader>
              <CardTitle>Instructor Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{result.feedback}</p>
            </CardContent>
          </Card>
        )}

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>
              Review your answers and see the correct solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {result.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Question {index + 1}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {question.earnedPoints}/{question.points} pts
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {question.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mb-4">{question.question}</h3>

                  {/* Multiple Choice Display */}
                  {question.type === 'multiple_choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isStudentAnswer = option === question.studentAnswer;
                        const isCorrectAnswer = option === question.correctAnswer;
                        
                        return (
                          <div 
                            key={optionIndex} 
                            className={`flex items-center space-x-2 p-2 rounded ${
                              isCorrectAnswer 
                                ? 'bg-green-50 border border-green-200' 
                                : isStudentAnswer && !isCorrectAnswer
                                  ? 'bg-red-50 border border-red-200'
                                  : ''
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              isStudentAnswer ? 'bg-primary border-primary' : 'border-muted-foreground'
                            }`}>
                              {isStudentAnswer && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                            </div>
                            <span className="text-sm">{option}</span>
                            {isCorrectAnswer && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {isStudentAnswer && !isCorrectAnswer && (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* True/False Display */}
                  {question.type === 'true_false' && (
                    <div className="space-y-2">
                      {['true', 'false'].map((option) => {
                        const isStudentAnswer = option === question.studentAnswer.toLowerCase();
                        const isCorrectAnswer = option === question.correctAnswer.toLowerCase();
                        
                        return (
                          <div 
                            key={option}
                            className={`flex items-center space-x-2 p-2 rounded ${
                              isCorrectAnswer 
                                ? 'bg-green-50 border border-green-200' 
                                : isStudentAnswer && !isCorrectAnswer
                                  ? 'bg-red-50 border border-red-200'
                                  : ''
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              isStudentAnswer ? 'bg-primary border-primary' : 'border-muted-foreground'
                            }`}>
                              {isStudentAnswer && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                            </div>
                            <span className="text-sm capitalize">{option}</span>
                            {isCorrectAnswer && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {isStudentAnswer && !isCorrectAnswer && (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Short Answer Display */}
                  {question.type === 'short_answer' && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Your Answer:</p>
                        <div className={`border rounded-md p-3 ${
                          question.isCorrect 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <span className="text-sm">{question.studentAnswer || 'No answer provided'}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Correct Answer:</p>
                        <div className="border border-green-200 bg-green-50 rounded-md p-3">
                          <span className="text-sm">{question.correctAnswer}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}