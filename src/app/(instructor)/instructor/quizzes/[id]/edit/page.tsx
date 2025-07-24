'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Save,
  Eye,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

// Form validation schemas (reused from create page)
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
}

export default function EditQuizPage() {
  const { user, hasRole, isAuthenticated, isLoading } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const t = useTranslations();
  const quizId = params.id as string;

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

    // Load quiz data
    if (isAuthenticated && hasRole('INSTRUCTOR') && quizId) {
      loadQuiz();
    }
  }, [isAuthenticated, hasRole, isLoading, router, quizId, loadQuiz]);

  const loadQuiz = useCallback(async () => {
    setIsLoadingQuiz(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Load quiz data from API
      const response = await apiClient.get(`/quizzes/${quizId}`, accessToken);
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      const quizData = response.data;
      
      // Transform API response to match local Quiz interface
      const loadedQuiz: Quiz = {
        id: quizData.id,
        title: quizData.title,
        description: quizData.description,
        subject: quizData.subject,
        questions: quizData.questions || [],
        timeLimit: quizData.timeLimit,
        attemptsAllowed: 1, // Default value, can be extended later
        shuffleQuestions: false, // Default value, can be extended later
        showResults: true, // Default value, can be extended later
        allowReview: true, // Default value, can be extended later
        status: quizData.status,
      };

      setQuiz(loadedQuiz);

      // Populate forms with quiz data
      basicInfoForm.reset({
        title: loadedQuiz.title,
        description: loadedQuiz.description,
        subject: loadedQuiz.subject,
      });

      settingsForm.reset({
        timeLimit: loadedQuiz.timeLimit,
        attemptsAllowed: loadedQuiz.attemptsAllowed,
        shuffleQuestions: loadedQuiz.shuffleQuestions,
        showResults: loadedQuiz.showResults,
        allowReview: loadedQuiz.allowReview,
      });
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz');
      router.push('/instructor/quizzes');
    } finally {
      setIsLoadingQuiz(false);
    }
  }, [quizId, basicInfoForm, settingsForm, router]);

  const handleSaveBasicInfo = async (data: BasicInfoFormData) => {
    if (!quiz) return;

    setIsSaving(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Update quiz basic info via API
      const updatePayload = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        timeLimit: quiz.timeLimit,
        status: quiz.status,
        questions: quiz.questions.map(q => ({
          type: q.type,
          question: q.question,
          options: q.options?.filter(opt => opt.trim() !== '') || undefined,
          correctAnswer: q.correctAnswer,
          points: q.points
        }))
      };

      const response = await apiClient.put(`/quizzes/${quiz.id}`, updatePayload, accessToken);
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }
      
      setQuiz(prev => prev ? { ...prev, ...data } : null);
      toast.success('Basic information updated');
    } catch (error) {
      console.error('Error updating basic info:', error);
      toast.error('Failed to update basic information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (data: SettingsFormData) => {
    if (!quiz) return;

    setIsSaving(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Update quiz settings via API
      const updatePayload = {
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        timeLimit: data.timeLimit,
        status: quiz.status,
        questions: quiz.questions.map(q => ({
          type: q.type,
          question: q.question,
          options: q.options?.filter(opt => opt.trim() !== '') || undefined,
          correctAnswer: q.correctAnswer,
          points: q.points
        }))
      };

      const response = await apiClient.put(`/quizzes/${quiz.id}`, updatePayload, accessToken);
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }
      
      setQuiz(prev => prev ? { ...prev, ...data } : null);
      toast.success('Settings updated');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = async (data: QuestionFormData) => {
    if (!quiz) return;

    const newQuestion: Question = {
      ...data,
      id: editingQuestionId || Date.now().toString(),
    };

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Update questions array
      let updatedQuestions: Question[];
      if (editingQuestionId) {
        updatedQuestions = quiz.questions.map(q => q.id === editingQuestionId ? newQuestion : q);
      } else {
        updatedQuestions = [...quiz.questions, newQuestion];
      }

      // Update quiz with new/modified question via API
      const updatePayload = {
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        timeLimit: quiz.timeLimit,
        status: quiz.status,
        questions: updatedQuestions.map(q => ({
          type: q.type,
          question: q.question,
          options: q.options?.filter(opt => opt.trim() !== '') || undefined,
          correctAnswer: q.correctAnswer,
          points: q.points
        }))
      };

      const response = await apiClient.put(`/quizzes/${quiz.id}`, updatePayload, accessToken);
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      // Update local state
      setQuiz(prev => prev ? {
        ...prev,
        questions: updatedQuestions,
      } : null);

      if (editingQuestionId) {
        setEditingQuestionId(null);
        toast.success('Question updated');
      } else {
        toast.success('Question added');
      }

      questionForm.reset();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    questionForm.reset(question);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!quiz) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Remove question from questions array
      const updatedQuestions = quiz.questions.filter(q => q.id !== questionId);

      // Update quiz with question removed via API
      const updatePayload = {
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        timeLimit: quiz.timeLimit,
        status: quiz.status,
        questions: updatedQuestions.map(q => ({
          type: q.type,
          question: q.question,
          options: q.options?.filter(opt => opt.trim() !== '') || undefined,
          correctAnswer: q.correctAnswer,
          points: q.points
        }))
      };

      const response = await apiClient.put(`/quizzes/${quiz.id}`, updatePayload, accessToken);
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      // Update local state
      setQuiz(prev => prev ? {
        ...prev,
        questions: updatedQuestions,
      } : null);
      
      toast.success('Question deleted');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  if (isLoading || isLoadingQuiz || !user) {
    return (
      <DashboardLayout title="Edit Quiz">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) {
    return (
      <DashboardLayout title="Edit Quiz">
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
    <DashboardLayout title="Edit Quiz">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Quiz</h1>
            <p className="text-muted-foreground mt-1">
              Modify your quiz content and settings
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline">
              <Link href={`/instructor/quizzes/${quiz.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
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

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update quiz title, description, and subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={basicInfoForm.handleSubmit(handleSaveBasicInfo)} className="space-y-4">
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
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <InlineLoading text="Saving..." />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Questions Management */}
        <div className="space-y-6">
          {/* Add/Edit Question Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingQuestionId ? 'Edit Question' : 'Add Question'}
              </CardTitle>
              <CardDescription>
                {editingQuestionId ? 'Modify the selected question' : 'Add a new question to your quiz'}
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
          {quiz.questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Questions ({quiz.questions.length})</CardTitle>
                <CardDescription>
                  Manage your quiz questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
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

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
            <CardDescription>
              Configure quiz behavior and rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={settingsForm.handleSubmit(handleSaveSettings)} className="space-y-4">
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
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <InlineLoading text="Saving..." />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}