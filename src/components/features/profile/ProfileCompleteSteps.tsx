'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { PasswordStep } from './steps/PasswordStep';
import { RoleSelectionStep } from './steps/RoleSelectionStep';
import { useProfileComplete, ProfileCompleteFormData } from '@/hooks/useProfileComplete';

export function ProfileCompleteSteps() {
  const t = useTranslations();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const {
    form,
    isSubmitting,
    onSubmit,
  } = useProfileComplete();

  const steps = [
    {
      id: 1,
      title: t('auth.profileComplete.steps.personalInfo.title', { default: 'Personal Information' }),
      description: t('auth.profileComplete.steps.personalInfo.description', { default: 'Tell us about yourself' }),
      component: PersonalInfoStep,
    },
    {
      id: 2,
      title: t('auth.profileComplete.steps.password.title', { default: 'Create Password' }),
      description: t('auth.profileComplete.steps.password.description', { default: 'Secure your account' }),
      component: PasswordStep,
    },
    {
      id: 3,
      title: t('auth.profileComplete.steps.role.title', { default: 'Choose Your Role' }),
      description: t('auth.profileComplete.steps.role.description', { default: 'How will you use Quizify?' }),
      component: RoleSelectionStep,
    },
  ];

  const currentStepData = steps[currentStep - 1];
  const StepComponent = currentStepData.component;

  const validateCurrentStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    return isValid;
  };

  const getFieldsForStep = (step: number): (keyof ProfileCompleteFormData)[] => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName'];
      case 2:
        return ['password'];
      case 3:
        return ['dashboardType'];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      onSubmit();
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {t('auth.profileComplete.step', { default: 'Step' })} {currentStep} {t('common.of', { default: 'of' })} {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
          
          <CardTitle className="text-2xl font-bold">
            {currentStepData.title}
          </CardTitle>
          <CardDescription>
            {currentStepData.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <StepComponent form={form} isSubmitting={isSubmitting} />
            
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('common.previous', { default: 'Previous' })}
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {t('common.next', { default: 'Next' })}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <InlineLoading
                      text={t('auth.profileComplete.submitting', { default: 'Completing Profile...' })}
                    />
                  ) : (
                    t('auth.profileComplete.submit', { default: 'Complete Profile' })
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}