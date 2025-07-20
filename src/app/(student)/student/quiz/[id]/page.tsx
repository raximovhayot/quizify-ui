'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { FullPageLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number;
  totalPoints: number;
}

export default function QuizTakingPage() {
  const { hasRole, isAuthenticated, isLoading } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const router = useRouter();
  const params = useParams();
  const t = useTranslations();
  const quizId = params.id as string;

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0 && quiz) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && quiz) {
      // Auto-submit when time runs out
      handleSubmitQuiz();
    }
  }, [timeRemaining, quiz]);

  // Auto-save effect
  useEffect(() => {
    if (quiz && Object.keys(answers).length > 0) {
      const autoSaveTimer = setTimeout(() => {
        saveProgress();
      }, 2000); // Auto-save after 2 seconds of inactivity
      return () => clearTimeout(autoSaveTimer);
    }
  }, [answers, quiz]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasRole('STUDENT'))) {
      router.push('/sign-in');
      return;
    }

    if (isAuthenticated && hasRole('STUDENT') && quizId) {
      loadQuiz();
    }
  }, [isAuthenticated, hasRole, isLoading, router, quizId]);

  const loadQuiz = async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockQuiz: Quiz = {
        id: quizId,
        title: 'Mathematics Quiz #1',
        description: 'Basic algebra and geometry concepts',
        questions: [
          {
            id: '1',
            question: 'What is 2 + 2?',
            type: 'multiple_choice',
            options: ['3', '4', '5', '6'],
            points: 1,
          },
          {
            id: '2',
            question: 'Is the square root of 16 equal to 4?',
            type: 'true_false',
            points: 1,
          },
          {
            id: '3',
            question: 'What is the formula for the area of a circle?',
            type: 'short_answer',
            points: 2,
          },
        ],
        timeLimit: 30,
        totalPoints: 4,
      };

      setQuiz(mockQuiz);
      setTimeRemaining(mockQuiz.timeLimit * 60); // Convert to seconds
    } catch (error) {
      console.error('Error loading quiz:', error);
      router.push('/student');
    }
  };

  const saveProgress = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      console.log('Auto-saving progress:', answers);
      toast.success('Progress saved automatically');
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [answers]);

  const handleSubmitQuiz = useCallback(async () => {
    if (timeRemaining === 0) {
      // Time's up, submit immediately
      await submitQuiz();
    } else {
      // Show confirmation dialog
      setShowSubmitConfirmation(true);
    }
  }, [timeRemaining]);

  const submitQuiz = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log('Submitting quiz:', { quizId, answers });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Quiz submitted successfully!');
      router.push('/student');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirmation(false);
    }
  };

  if (isLoading || !quiz) {
    return (
      <FullPageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <InlineLoading text={t('common.loading')} />
        </div>
      </FullPageLayout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isTimeRunningOut = timeRemaining <= 300; // 5 minutes warning

  return (
    <FullPageLayout showHeader={false}>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
            <div className={`flex items-center space-x-2 text-sm ${isTimeRunningOut ? 'text-red-600' : ''}`}>
              {isTimeRunningOut && <AlertTriangle className="w-4 h-4" />}
              <Clock className="w-4 h-4" />
              <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                        className="w-4 h-4"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true_false' && (
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value="true"
                      checked={answers[currentQuestion.id] === 'true'}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                      className="w-4 h-4"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value="false"
                      checked={answers[currentQuestion.id] === 'false'}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                      className="w-4 h-4"
                    />
                    <span>False</span>
                  </label>
                </div>
              )}

              {currentQuestion.type === 'short_answer' && (
                <div className="space-y-3">
                  <Input
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={() => setIsSubmitting(true)} disabled={isSubmitting}>
                {isSubmitting ? <InlineLoading text="Submitting..." /> : 'Submit Quiz'}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Submission Confirmation Dialog */}
          <Dialog open={showSubmitConfirmation} onOpenChange={setShowSubmitConfirmation}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Quiz</DialogTitle>
                <DialogDescription>
                  Are you sure you want to submit your quiz? You have answered{' '}
                  {Object.keys(answers).length} out of {quiz.questions.length} questions.
                  {timeRemaining > 0 && (
                    <span className="block mt-2 text-sm">
                      You still have {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} remaining.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitConfirmation(false)}
                  disabled={isSubmitting}
                >
                  Continue Quiz
                </Button>
                <Button
                  onClick={submitQuiz}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <InlineLoading text="Submitting..." /> : 'Submit Quiz'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </FullPageLayout>
  );
}