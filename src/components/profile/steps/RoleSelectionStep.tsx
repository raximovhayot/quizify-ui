'use client';

import { useTranslations } from 'next-intl';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ProfileCompleteFormData } from '@/hooks/useProfileComplete';
import { DashboardType } from '@/types/account';
import { GraduationCap, Users } from 'lucide-react';

interface RoleSelectionStepProps {
  form: UseFormReturn<ProfileCompleteFormData>;
  isSubmitting: boolean;
}

export function RoleSelectionStep({ form, isSubmitting }: RoleSelectionStepProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="dashboardType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('auth.dashboardType.label', { default: 'I am a...' })}
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-1 gap-4"
                disabled={isSubmitting}
              >
                <div>
                  <RadioGroupItem 
                    value={DashboardType.STUDENT} 
                    id="student" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="student"
                    className="flex cursor-pointer"
                  >
                    <Card className="w-full transition-colors hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <GraduationCap className="w-6 h-6 mr-3 text-primary" />
                        <div>
                          <CardTitle className="text-base">
                            {t('auth.dashboardType.student', { default: 'Student' })}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {t('auth.profileComplete.studentDescription', { 
                              default: 'Take quizzes and track your progress' 
                            })}
                          </CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem 
                    value={DashboardType.INSTRUCTOR} 
                    id="instructor" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="instructor"
                    className="flex cursor-pointer"
                  >
                    <Card className="w-full transition-colors hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <Users className="w-6 h-6 mr-3 text-primary" />
                        <div>
                          <CardTitle className="text-base">
                            {t('auth.dashboardType.instructor', { default: 'Instructor' })}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {t('auth.profileComplete.instructorDescription', { 
                              default: 'Create quizzes and manage assignments' 
                            })}
                          </CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}