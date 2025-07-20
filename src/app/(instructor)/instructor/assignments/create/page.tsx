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
  ClipboardList,
  BookOpen,
  Settings,
  Eye,
  Save
} from 'lucide-react';
import Link from 'next/link';

// Assignment creation steps
type AssignmentStep = 'basic-info' | 'quiz-selection' | 'settings' | 'preview';

// Form validation schemas
const basicInfoSchema = z.object({
  title: z.string().min(1, 'Assignment title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
  subject: z.string().min(1, 'Subject is required'),
  dueDate: z.string().min(1, 'Due date is required'),
});

const settingsSchema = z.object({
  assignmentCode: z.string().min(6, 'Code must be at least 6 characters').max(8, 'Code cannot exceed 8 characters'),
  attemptsAllowed: z.number().min(1, 'At least 1 attempt must be allowed').max(10, 'Cannot exceed 10 attempts'),
  allowLateSubmission: z.boolean(),
  showResults: z.boolean(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
type SettingsFormData = z.infer<typeof settingsSchema>;

interface AssignmentData {
  basicInfo: BasicInfoFormData | null;
  selectedQuizId: string | null;
  settings: SettingsFormData | null;
}

export default function CreateAssignmentPage() {
  const { user, hasRole, isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<AssignmentStep>('basic-info');
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    basicInfo: null,
    selectedQuizId: null,
    settings: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableQuizzes, setAvailableQuizzes] = useState<Array<{id: string, title: string, questionsCount: number}>>([]);
  const router = useRouter();
  const t = useTranslations();

  const basicInfoForm = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      dueDate: '',
    },
  });

  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      assignmentCode: generateAssignmentCode(),
      attemptsAllowed: 1,
      allowLateSubmission: false,
      showResults: true,
    },
  });

  useEffect(() => {
    // Check if user is authenticated and has instructor role
    if (!isLoading && (!isAuthenticated || !hasRole('INSTRUCTOR'))) {
      router.push('/sign-in');
      return;
    }

    // Load available quizzes
    if (isAuthenticated && hasRole('INSTRUCTOR')) {
      loadAvailableQuizzes();
    }
  }, [isAuthenticated, hasRole, isLoading, router]);

  const loadAvailableQuizzes = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Load quizzes from API
      const response = await apiClient.get('/quizzes', accessToken);
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      // Transform quiz data to match the expected format
      const quizzes = (response.data || []).map((quiz: { id: string; title: string; questionsCount: number }) => ({
        id: quiz.id,
        title: quiz.title,
        questionsCount: quiz.questionsCount
      }));

      setAvailableQuizzes(quizzes);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load available quizzes');
      setAvailableQuizzes([]);
    }
  };

  function generateAssignmentCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const steps = [
    {
      id: 'basic-info' as AssignmentStep,
      title: 'Basic Information',
      description: 'Assignment details and due date',
      icon: ClipboardList,
    },
    {
      id: 'quiz-selection' as AssignmentStep,
      title: 'Quiz Selection',
      description: 'Choose quiz for assignment',
      icon: BookOpen,
    },
    {
      id: 'settings' as AssignmentStep,
      title: 'Settings',
      description: 'Configure assignment behavior',
      icon: Settings,
    },
    {
      id: 'preview' as AssignmentStep,
      title: 'Preview',
      description: 'Review and create assignment',
      icon: Eye,
    },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleBasicInfoSubmit = (data: BasicInfoFormData) => {
    setAssignmentData(prev => ({ ...prev, basicInfo: data }));
    setCurrentStep('quiz-selection');
  };

  const handleQuizSelection = (quizId: string) => {
    setAssignmentData(prev => ({ ...prev, selectedQuizId: quizId }));
    setCurrentStep('settings');
  };

  const handleSettingsSubmit = (data: SettingsFormData) => {
    setAssignmentData(prev => ({ ...prev, settings: data }));
    setCurrentStep('preview');
  };

  const handleCreateAssignment = async () => {
    if (!assignmentData.basicInfo || !assignmentData.selectedQuizId || !assignmentData.settings) {
      toast.error('Please complete all steps before creating the assignment');
      return;
    }

    setIsSubmitting(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Transform assignment data to match API format
      const assignmentPayload = {
        title: assignmentData.basicInfo.title,
        description: assignmentData.basicInfo.description,
        subject: assignmentData.basicInfo.subject,
        quizId: assignmentData.selectedQuizId,
        attemptsAllowed: assignmentData.settings.attemptsAllowed,
        dueDate: assignmentData.basicInfo.dueDate,
        status: 'active' as const
      };

      // Create assignment via API
      const response = await apiClient.post('/assignments', assignmentPayload, accessToken);
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }
      
      toast.success('Assignment created successfully!');
      router.push('/instructor/assignments');
    } catch (error) {
      toast.error('Failed to create assignment. Please try again.');
      console.error('Assignment creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <DashboardLayout title="Create Assignment">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Create Assignment">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Assignment</h1>
            <p className="text-muted-foreground mt-1">
              Follow the steps to create your assignment
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/instructor/assignments">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Assignments
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
              <CardTitle>Assignment Information</CardTitle>
              <CardDescription>
                Provide basic details about your assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Assignment Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Enter assignment title"
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
                    placeholder="Describe the assignment"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="e.g., Mathematics, Physics"
                      {...basicInfoForm.register('subject')}
                      className={basicInfoForm.formState.errors.subject ? 'border-red-500' : ''}
                    />
                    {basicInfoForm.formState.errors.subject && (
                      <p className="text-sm text-red-500">
                        {basicInfoForm.formState.errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="dueDate" className="text-sm font-medium">
                      Due Date
                    </label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      {...basicInfoForm.register('dueDate')}
                      className={basicInfoForm.formState.errors.dueDate ? 'border-red-500' : ''}
                    />
                    {basicInfoForm.formState.errors.dueDate && (
                      <p className="text-sm text-red-500">
                        {basicInfoForm.formState.errors.dueDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    Next: Select Quiz
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Quiz Selection Step */}
        {currentStep === 'quiz-selection' && (
          <Card>
            <CardHeader>
              <CardTitle>Select Quiz</CardTitle>
              <CardDescription>
                Choose a quiz to use for this assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      assignmentData.selectedQuizId === quiz.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleQuizSelection(quiz.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {quiz.questionsCount} questions
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        assignmentData.selectedQuizId === quiz.id 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {assignmentData.selectedQuizId === quiz.id && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Step */}
        {currentStep === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Assignment Settings</CardTitle>
              <CardDescription>
                Configure assignment behavior and access code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="assignmentCode" className="text-sm font-medium">
                      Assignment Code
                    </label>
                    <Input
                      id="assignmentCode"
                      placeholder="Enter assignment code"
                      {...settingsForm.register('assignmentCode')}
                      className={settingsForm.formState.errors.assignmentCode ? 'border-red-500' : ''}
                    />
                    {settingsForm.formState.errors.assignmentCode && (
                      <p className="text-sm text-red-500">
                        {settingsForm.formState.errors.assignmentCode.message}
                      </p>
                    )}
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
                      className={settingsForm.formState.errors.attemptsAllowed ? 'border-red-500' : ''}
                    />
                    {settingsForm.formState.errors.attemptsAllowed && (
                      <p className="text-sm text-red-500">
                        {settingsForm.formState.errors.attemptsAllowed.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowLateSubmission"
                      {...settingsForm.register('allowLateSubmission')}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="allowLateSubmission" className="text-sm font-medium">
                      Allow late submissions
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showResults"
                      {...settingsForm.register('showResults')}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="showResults" className="text-sm font-medium">
                      Show results to students
                    </label>
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

        {/* Preview Step */}
        {currentStep === 'preview' && (
          <Card>
            <CardHeader>
              <CardTitle>Assignment Preview</CardTitle>
              <CardDescription>
                Review your assignment before creating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg">{assignmentData.basicInfo?.title}</h3>
                  <p className="text-muted-foreground mt-1">{assignmentData.basicInfo?.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <span>Subject: {assignmentData.basicInfo?.subject}</span>
                    <span>Due: {assignmentData.basicInfo?.dueDate && new Date(assignmentData.basicInfo.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Selected Quiz</h4>
                  {assignmentData.selectedQuizId && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="font-medium">
                        {availableQuizzes.find(q => q.id === assignmentData.selectedQuizId)?.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {availableQuizzes.find(q => q.id === assignmentData.selectedQuizId)?.questionsCount} questions
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Assignment Settings</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Access Code:</span>
                      <span className="ml-2 font-mono font-medium">{assignmentData.settings?.assignmentCode}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Attempts:</span>
                      <span className="ml-2">{assignmentData.settings?.attemptsAllowed}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Late Submissions:</span>
                      <span className="ml-2">{assignmentData.settings?.allowLateSubmission ? 'Allowed' : 'Not allowed'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Show Results:</span>
                      <span className="ml-2">{assignmentData.settings?.showResults ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
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
            <Button onClick={handleCreateAssignment} disabled={isSubmitting}>
              {isSubmitting ? (
                <InlineLoading text="Creating Assignment..." />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Assignment
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                const nextIndex = Math.min(steps.length - 1, currentStepIndex + 1);
                setCurrentStep(steps[nextIndex].id);
              }}
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