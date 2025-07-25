'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { InlineLoading } from '@/components/ui/loading-spinner';
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

interface ProfileCompleteFormProps {
  form: UseFormReturn<ProfileCompleteFormData>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function ProfileCompleteForm({ form, isSubmitting, onSubmit }: ProfileCompleteFormProps) {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t('auth.profileComplete.title', { default: 'Complete Your Profile' })}
          </CardTitle>
          <CardDescription>
            {t('auth.profileComplete.description', { default: 'Tell us about yourself to get started' })}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {t('auth.profileComplete.personalInfo', { default: 'Personal Information' })}
              </h3>
              
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('auth.firstName.label', { default: 'First Name' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.firstName.placeholder', { default: 'Enter your first name' })}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('auth.lastName.label', { default: 'Last Name' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.lastName.placeholder', { default: 'Enter your last name' })}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {t('auth.profileComplete.security', { default: 'Security' })}
              </h3>
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('auth.password.label', { default: 'Password' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('auth.password.placeholder', { default: 'Create a password' })}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-sm text-muted-foreground mt-2">
                      <p>{t('auth.profileComplete.passwordRequirements', { 
                        default: 'Password must contain at least:' 
                      })}</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>{t('auth.profileComplete.passwordLength', { 
                          default: '8 characters minimum' 
                        })}</li>
                        <li>{t('auth.profileComplete.passwordUppercase', { 
                          default: 'One uppercase letter' 
                        })}</li>
                        <li>{t('auth.profileComplete.passwordLowercase', { 
                          default: 'One lowercase letter' 
                        })}</li>
                        <li>{t('auth.profileComplete.passwordNumber', { 
                          default: 'One number' 
                        })}</li>
                      </ul>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Role Selection Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {t('auth.profileComplete.role', { default: 'Your Role' })}
              </h3>
              
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
                        onValueChange={(value) => field.onChange(value as unknown as DashboardType)}
                        value={field.value as unknown as string}
                        className="grid grid-cols-1 gap-4"
                        disabled={isSubmitting}
                      >
                        <div>
                          <RadioGroupItem 
                            value={DashboardType.STUDENT as unknown as string}
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
                            value={DashboardType.INSTRUCTOR as unknown as string}
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

            {/* Submit Button */}
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <InlineLoading
                  text={t('auth.profileComplete.submitting', { default: 'Completing Profile...' })}
                />
              ) : (
                t('auth.profileComplete.submit', { default: 'Complete Profile' })
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}