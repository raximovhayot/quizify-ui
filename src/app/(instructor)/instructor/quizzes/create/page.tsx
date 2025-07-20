'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { 
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Settings,
  Eye,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

// Quiz creation steps
type QuizStep = 'basic-info' | 'questions' | 'settings' | 'preview';

// Form validation schemas
const basicInfoSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
  subject: z.string().min(1, 'Subject is required'),
});

const questionSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  points: z.number().min(1, 'Points must be at least 1').max(100, 'Points cannot exceed 100'),
});

const settingsSchema = z.object({
  timeLimit: z.number().min(1, 'Time limit must be at least 1 minute').max(300, 'Time limit cannot exceed 5 hours'),
  attemptsAllowed: z.number().min(1, 'At least 1 attempt must be allowed').max(10, 'Cannot exceed 10 attempts'),
  shuffleQuestions: z.boolean(),
  showResults: z.boolean(),
  allowReview: z.boolean(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
type QuestionFormData = z.infer<typeof questionSchema>;
type SettingsFormData = z.infer<typeof settingsSchema>;

interface Question extends QuestionFormData {
  id: string;
}

interface QuizData {
  basicInfo: BasicInfoFormData | null;
  questions: Question[];
  settings: SettingsFormData | null;
}

export default function CreateQuizPage() {
  const { user, hasRole, isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<QuizStep>('basic-info');
  const [quizData, setQuizData] = useState<QuizData>({
    basicInfo: null,
    questions: [],
    settings: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations();

  const basicInfoForm = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: '',
    },
  });

  const questionForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
    },
  });

  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      timeLimit: 30,
      attemptsAllowed: 1,
      shuffleQuestions: false,
      showResults: true,
      allowReview: true,
    },
  });

  useEffect(() => {
    // Check if user is authenticated and has instructor role
    if (!isLoading && (!isAuthenticated || !hasRole('INSTRUCTOR'))) {
      router.push('/sign-in');
      return;
    }
  }, [isAuthenticated, hasRole, isLoading, router]);

  const steps: Array<{
    id: QuizStep;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Quiz title, description, and subject',
      icon: BookOpen,
    },
    {
      id: 'questions',
      title: 'Questions',
      description: 'Add and manage quiz questions',
      icon: Plus,
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure quiz behavior and rules',
      icon: Settings,
    },
    {
      id: 'preview',
      title: 'Preview',
      description: 'Review and publish your quiz',
      icon: Eye,
    },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleBasicInfoSubmit = (data: BasicInfoFormData) => {
    setQuizData(prev => ({ ...prev, basicInfo: data }));
    setCurrentStep('questions');
  };

  const handleAddQuestion = (data: QuestionFormData) => {
    const newQuestion: Question = {
      ...data,
      id: editingQuestionId || Date.now().toString(),
    };

    if (editingQuestionId) {
      setQuizData(prev => ({
        ...prev,
        questions: prev.questions.map(q => q.id === editingQuestionId ? newQuestion : q),
      }));
      setEditingQuestionId(null);
    } else {
      setQuizData(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion],
      }));
    }

    questionForm.reset();
    toast.success(editingQuestionId ? 'Question updated' : 'Question added');
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    questionForm.reset(question);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
    }));
    toast.success('Question deleted');
  };

  const handleSettingsSubmit = (data: SettingsFormData) => {
    setQuizData(prev => ({ ...prev, settings: data }));
    setCurrentStep('preview');
  };

  const handleCreateQuiz = async () => {
    if (!quizData.basicInfo || quizData.questions.length === 0 || !quizData.settings) {
      toast.error('Please complete all steps before creating the quiz');
      return;
    }

    setIsSubmitting(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Transform quiz data to match API format
      const quizPayload = {
        title: quizData.basicInfo.title,
        description: quizData.basicInfo.description,
        subject: quizData.basicInfo.subject,
        timeLimit: quizData.settings.timeLimit,
        status: 'draft' as const, // Start as draft, can be published later
        questions: quizData.questions.map(q => ({
          type: q.type,
          question: q.question,
          options: q.options?.filter(opt => opt.trim() !== '') || undefined,
          correctAnswer: q.correctAnswer,
          points: q.points
        }))
      };

      // Create quiz via API
      const response = await apiClient.post('/quizzes', quizPayload, accessToken);
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }
      
      toast.success('Quiz created successfully!');
      router.push('/instructor/quizzes');
    } catch (error) {
      toast.error('Failed to create quiz. Please try again.');
      console.error('Quiz creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'basic-info':
        return quizData.basicInfo !== null;
      case 'questions':
        return quizData.questions.length > 0;
      case 'settings':
        return quizData.settings !== null;
      default:
        return false;
    }
  };

  if (isLoading || !user) {
    return (
      <DashboardLayout title="Create Quiz">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Create Quiz">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Quiz</h1>
            <p className="text-muted-foreground mt-1">
              Follow the steps to create your quiz
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/instructor/quizzes">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Quizzes
            </Link>
          </Button>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-sm font-medium ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-px mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 'basic-info' && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide basic details about your quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Quiz Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Enter quiz title"
                    {...basicInfoForm.register('title')}
                    className={basicInfoForm.formState.errors.title ? 'border-red-500' : ''}
                  />
                  {basicInfoForm.formState.errors.title && (
                    <p className="text-sm text-red-500">
                      {basicInfoForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Describe what this quiz covers"
                    {...basicInfoForm.register('description')}
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      basicInfoForm.formState.errors.description ? 'border-red-500' : ''
                    }`}
                  />
                  {basicInfoForm.formState.errors.description && (
                    <p className="text-sm text-red-500">
                      {basicInfoForm.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="e.g., Mathematics, Physics, History"
                    {...basicInfoForm.register('subject')}
                    className={basicInfoForm.formState.errors.subject ? 'border-red-500' : ''}
                  />
                  {basicInfoForm.formState.errors.subject && (
                    <p className="text-sm text-red-500">
                      {basicInfoForm.formState.errors.subject.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    Next: Add Questions
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 'questions' && (
          <div className="space-y-6">
            {/* Add Question Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingQuestionId ? 'Edit Question' : 'Add Question'}
                </CardTitle>
                <CardDescription>
                  Create questions for your quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={questionForm.handleSubmit(handleAddQuestion)} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="question" className="text-sm font-medium">
                      Question Text
                    </label>
                    <textarea
                      id="question"
                      rows={2}
                      placeholder="Enter your question"
                      {...questionForm.register('question')}
                      className={`flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        questionForm.formState.errors.question ? 'border-red-500' : ''
                      }`}
                    />
                    {questionForm.formState.errors.question && (
                      <p className="text-sm text-red-500">
                        {questionForm.formState.errors.question.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="type" className="text-sm font-medium">
                        Question Type
                      </label>
                      <select
                        id="type"
                        {...questionForm.register('type')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="points" className="text-sm font-medium">
                        Points
                      </label>
                      <Input
                        id="points"
                        type="number"
                        min="1"
                        max="100"
                        {...questionForm.register('points', { valueAsNumber: true })}
                        className={questionForm.formState.errors.points ? 'border-red-500' : ''}
                      />
                      {questionForm.formState.errors.points && (
                        <p className="text-sm text-red-500">
                          {questionForm.formState.errors.points.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="correctAnswer" className="text-sm font-medium">
                      Correct Answer
                    </label>
                    <Input
                      id="correctAnswer"
                      placeholder="Enter the correct answer"
                      {...questionForm.register('correctAnswer')}
                      className={questionForm.formState.errors.correctAnswer ? 'border-red-500' : ''}
                    />
                    {questionForm.formState.errors.correctAnswer && (
                      <p className="text-sm text-red-500">
                        {questionForm.formState.errors.correctAnswer.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    {editingQuestionId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingQuestionId(null);
                          questionForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit">
                      {editingQuestionId ? 'Update Question' : 'Add Question'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Questions List */}
            {quizData.questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Questions ({quizData.questions.length})</CardTitle>
                  <CardDescription>
                    Review and manage your quiz questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quizData.questions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Question {index + 1}
                              </span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {question.type.replace('_', ' ')}
                              </span>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {question.points} pts
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-1">{question.question}</p>
                            <p className="text-xs text-muted-foreground">
                              Correct Answer: {question.correctAnswer}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditQuestion(question)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentStep === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
              <CardDescription>
                Configure how your quiz behaves
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="timeLimit" className="text-sm font-medium">
                      Time Limit (minutes)
                    </label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="1"
                      max="300"
                      {...settingsForm.register('timeLimit', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="attemptsAllowed" className="text-sm font-medium">
                      Attempts Allowed
                    </label>
                    <Input
                      id="attemptsAllowed"
                      type="number"
                      min="1"
                      max="10"
                      {...settingsForm.register('attemptsAllowed', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    Next: Preview
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 'preview' && (
          <Card>
            <CardHeader>
              <CardTitle>Quiz Preview</CardTitle>
              <CardDescription>
                Review your quiz before publishing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{quizData.basicInfo?.title}</h3>
                  <p className="text-sm text-muted-foreground">{quizData.basicInfo?.description}</p>
                  <p className="text-sm text-muted-foreground">Subject: {quizData.basicInfo?.subject}</p>
                </div>
                <div>
                  <p className="text-sm">
                    <strong>{quizData.questions.length}</strong> questions • 
                    <strong> {quizData.settings?.timeLimit}</strong> minutes • 
                    <strong> {quizData.settings?.attemptsAllowed}</strong> attempt(s)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const prevIndex = Math.max(0, currentStepIndex - 1);
              setCurrentStep(steps[prevIndex].id);
            }}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === 'preview' ? (
            <Button onClick={handleCreateQuiz} disabled={isSubmitting}>
              {isSubmitting ? (
                <InlineLoading text="Creating Quiz..." />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Quiz
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                const nextIndex = Math.min(steps.length - 1, currentStepIndex + 1);
                setCurrentStep(steps[nextIndex].id);
              }}
              disabled={!canProceedToNext()}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}