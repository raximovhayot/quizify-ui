'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { ClipboardList, Users, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Form validation schema
const joinAssignmentSchema = z.object({
  assignmentCode: z.string()
    .min(1, 'Assignment code is required')
    .min(6, 'Assignment code must be at least 6 characters')
    .max(8, 'Assignment code cannot exceed 8 characters')
    .regex(/^[A-Z0-9]+$/, 'Assignment code must contain only uppercase letters and numbers'),
});

type JoinAssignmentFormData = z.infer<typeof joinAssignmentSchema>;

interface AssignmentInfo {
  id: string;
  title: string;
  description: string;
  subject: string;
  quizTitle: string;
  dueDate: string;
  attemptsAllowed: number;
  timeLimit: number;
  questionsCount: number;
  instructorName: string;
  studentsCount: number;
}

export default function JoinAssignmentPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentInfo, setAssignmentInfo] = useState<AssignmentInfo | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const prefilledCode = searchParams.get('code');

  const form = useForm<JoinAssignmentFormData>({
    resolver: zodResolver(joinAssignmentSchema),
    defaultValues: {
      assignmentCode: prefilledCode || '',
    },
  });

  useEffect(() => {
    // If code is prefilled, automatically search for assignment
    if (prefilledCode) {
      handleSearchAssignment({ assignmentCode: prefilledCode });
    }
  }, [prefilledCode]);

  const handleSearchAssignment = async (data: JoinAssignmentFormData) => {
    setIsSubmitting(true);
    setAssignmentInfo(null);

    try {
      // TODO: Replace with actual API call
      console.log('Searching for assignment:', data.assignmentCode);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock assignment data
      const mockAssignment: AssignmentInfo = {
        id: '1',
        title: 'Mathematics Assignment #1',
        description: 'Basic algebra and geometry quiz assignment covering fundamental concepts',
        subject: 'Mathematics',
        quizTitle: 'Mathematics Quiz #1',
        dueDate: '2024-07-25T23:59:00Z',
        attemptsAllowed: 2,
        timeLimit: 30,
        questionsCount: 15,
        instructorName: 'Dr. Smith',
        studentsCount: 25,
      };

      setAssignmentInfo(mockAssignment);
      toast.success('Assignment found!');
    } catch (error) {
      toast.error('Assignment not found. Please check the code and try again.');
      console.error('Assignment search error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinAssignment = async () => {
    if (!assignmentInfo || !isAuthenticated) return;

    setIsJoining(true);

    try {
      // TODO: Replace with actual API call
      console.log('Joining assignment:', assignmentInfo.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Successfully joined assignment!');
      router.push('/student');
    } catch (error) {
      toast.error('Failed to join assignment. Please try again.');
      console.error('Join assignment error:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const formatDueDate = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = dueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    if (diffDays < 0) {
      return `${formattedDate} (Overdue)`;
    } else if (diffDays === 0) {
      return `${formattedDate} (Due today)`;
    } else if (diffDays === 1) {
      return `${formattedDate} (Due tomorrow)`;
    } else {
      return `${formattedDate} (Due in ${diffDays} days)`;
    }
  };

  if (isLoading) {
    return (
      <AuthLayout title="Join Assignment">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Join Assignment">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
              <ClipboardList className="w-6 h-6" />
              <span>{t('assignment.joinAssignment')}</span>
            </CardTitle>
            <CardDescription>
              Enter the assignment code provided by your instructor
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(handleSearchAssignment)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="assignmentCode" className="text-sm font-medium">
                  {t('assignment.assignmentCode')}
                </label>
                <Input
                  id="assignmentCode"
                  placeholder="e.g., MATH01"
                  {...form.register('assignmentCode')}
                  className={`text-center text-lg font-mono ${
                    form.formState.errors.assignmentCode ? 'border-red-500' : ''
                  }`}
                  onChange={(e) => {
                    // Auto-uppercase the input
                    e.target.value = e.target.value.toUpperCase();
                    form.setValue('assignmentCode', e.target.value);
                  }}
                />
                {form.formState.errors.assignmentCode && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.assignmentCode.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <InlineLoading text="Searching..." />
                ) : (
                  'Find Assignment'
                )}
              </Button>
            </form>

            {/* Assignment Information */}
            {assignmentInfo && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">{assignmentInfo.title}</CardTitle>
                  <CardDescription>
                    {assignmentInfo.subject} • Instructor: {assignmentInfo.instructorName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {assignmentInfo.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{assignmentInfo.quizTitle}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{assignmentInfo.timeLimit} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{assignmentInfo.studentsCount} students joined</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="w-4 h-4 text-muted-foreground" />
                      <span>{assignmentInfo.questionsCount} questions</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">
                        {formatDueDate(assignmentInfo.dueDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Attempts Allowed:</span>
                      <span className="font-medium">{assignmentInfo.attemptsAllowed}</span>
                    </div>
                  </div>

                  {isAuthenticated ? (
                    <Button
                      onClick={handleJoinAssignment}
                      disabled={isJoining}
                      className="w-full"
                    >
                      {isJoining ? (
                        <InlineLoading text="Joining..." />
                      ) : (
                        'Join Assignment'
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground text-center">
                        You need to sign in to join this assignment
                      </p>
                      <Button asChild className="w-full">
                        <Link href={`/sign-in?assignment=${assignmentInfo.id}&redirect=/join?code=${form.getValues('assignmentCode')}`}>
                          Sign In to Join
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Help Text */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an assignment code?
              </p>
              <p className="text-xs text-muted-foreground">
                Ask your instructor for the assignment code to join.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
