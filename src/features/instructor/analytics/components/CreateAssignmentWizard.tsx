'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Quiz {
  id: number;
  title: string;
  description?: string;
  questionCount?: number;
}

interface WizardData {
  quizId?: number;
  startTime?: Date;
  endTime?: Date;
  studentPhones?: string[];
  duration?: number; // in minutes
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
}

interface CreateAssignmentWizardProps {
  quizzes: Quiz[];
  onComplete: (data: WizardData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

type Step = 'quiz' | 'schedule' | 'students' | 'settings' | 'review';

const steps: { id: Step; title: string; description: string }[] = [
  { id: 'quiz', title: 'Select Quiz', description: 'Choose a quiz for this assignment' },
  { id: 'schedule', title: 'Schedule', description: 'Set start and end times' },
  { id: 'students', title: 'Add Students', description: 'Invite students to participate' },
  { id: 'settings', title: 'Settings', description: 'Configure quiz settings' },
  { id: 'review', title: 'Review', description: 'Review and publish' },
];

/**
 * CreateAssignmentWizard component - Multi-step wizard for creating assignments
 * Steps:
 * 1. Select quiz
 * 2. Schedule (start/end times)
 * 3. Add students (bulk registration)
 * 4. Settings (duration, attempts, shuffle)
 * 5. Review and publish
 */
export function CreateAssignmentWizard({
  quizzes,
  onComplete,
  onCancel,
  isLoading = false,
}: CreateAssignmentWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<WizardData>({
    duration: 60,
    maxAttempts: 1,
    shuffleQuestions: false,
    shuffleAnswers: false,
  });

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canGoNext = () => {
    switch (currentStep.id) {
      case 'quiz':
        return !!data.quizId;
      case 'schedule':
        return !!data.startTime && !!data.endTime && data.startTime < data.endTime;
      case 'students':
        return true; // Students can be added later
      case 'settings':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    await onComplete(data);
  };

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const selectedQuiz = quizzes.find(q => q.id === data.quizId);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="space-y-4">
          <div>
            <CardTitle>Create Assignment</CardTitle>
            <CardDescription>
              Step {currentStepIndex + 1} of {steps.length}: {currentStep.description}
            </CardDescription>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mt-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex flex-col items-center gap-2',
                index > currentStepIndex && 'opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2',
                  index < currentStepIndex && 'border-primary bg-primary text-primary-foreground',
                  index === currentStepIndex && 'border-primary',
                  index > currentStepIndex && 'border-muted'
                )}
              >
                {index < currentStepIndex ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="text-xs text-center hidden sm:block max-w-[80px]">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="min-h-[400px]">
        {/* Step 1: Select Quiz */}
        {currentStep.id === 'quiz' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select a Quiz</h3>
            <div className="grid gap-3">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => updateData({ quizId: quiz.id })}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-colors',
                    data.quizId === quiz.id
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  )}
                >
                  <div className="font-semibold">{quiz.title}</div>
                  {quiz.description && (
                    <div className="text-sm text-muted-foreground mt-1">{quiz.description}</div>
                  )}
                  {quiz.questionCount && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {quiz.questionCount} questions
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {currentStep.id === 'schedule' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Set Schedule</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <input
                  type="datetime-local"
                  value={data.startTime ? data.startTime.toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateData({ startTime: new Date(e.target.value) })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <input
                  type="datetime-local"
                  value={data.endTime ? data.endTime.toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateData({ endTime: new Date(e.target.value) })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            {data.startTime && data.endTime && data.startTime >= data.endTime && (
              <p className="text-sm text-destructive">End time must be after start time</p>
            )}
          </div>
        )}

        {/* Step 3: Add Students */}
        {currentStep.id === 'students' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add Students</h3>
            <p className="text-sm text-muted-foreground">
              Students can be added now or after creating the assignment.
              You can also share the assignment code with students.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Student Phone Numbers (Optional)</label>
              <textarea
                placeholder="Enter phone numbers separated by commas or new lines"
                value={data.studentPhones?.join('\n') || ''}
                onChange={(e) => updateData({
                  studentPhones: e.target.value.split(/[,\n]/).map(p => p.trim()).filter(Boolean)
                })}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 4: Settings */}
        {currentStep.id === 'settings' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quiz Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={data.duration || 0}
                  onChange={(e) => updateData({ duration: parseInt(e.target.value) || 0 })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="0 = unlimited"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Attempts</label>
                <input
                  type="number"
                  min="0"
                  value={data.maxAttempts || 0}
                  onChange={(e) => updateData({ maxAttempts: parseInt(e.target.value) || 0 })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="0 = unlimited"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.shuffleQuestions || false}
                  onChange={(e) => updateData({ shuffleQuestions: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">Shuffle questions for each student</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.shuffleAnswers || false}
                  onChange={(e) => updateData({ shuffleAnswers: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">Shuffle answer options</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep.id === 'review' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review Assignment</h3>
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Quiz</div>
                <div className="text-base">{selectedQuiz?.title || 'Not selected'}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Start Time</div>
                  <div className="text-base">
                    {data.startTime?.toLocaleString() || 'Not set'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">End Time</div>
                  <div className="text-base">
                    {data.endTime?.toLocaleString() || 'Not set'}
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Duration</div>
                  <div className="text-base">
                    {data.duration ? `${data.duration} minutes` : 'Unlimited'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Max Attempts</div>
                  <div className="text-base">
                    {data.maxAttempts || 'Unlimited'}
                  </div>
                </div>
              </div>
              {data.studentPhones && data.studentPhones.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Students</div>
                  <div className="text-base">{data.studentPhones.length} students to invite</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStepIndex === 0 ? onCancel : handleBack}
          disabled={isLoading}
        >
          {currentStepIndex === 0 ? (
            'Cancel'
          ) : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </>
          )}
        </Button>

        <Button
          onClick={currentStepIndex === steps.length - 1 ? handleComplete : handleNext}
          disabled={!canGoNext() || isLoading}
        >
          {isLoading ? (
            'Creating...'
          ) : currentStepIndex === steps.length - 1 ? (
            'Create Assignment'
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
