import { GraduationCap, Users } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { ProfileCompleteFormData } from '@/components/features/profile/hooks/useProfileComplete';
import { DashboardType } from '@/components/features/profile/types/account';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface RoleSelectionSectionProps {
  form: UseFormReturn<ProfileCompleteFormData>;
  isSubmitting: boolean;
}

export function DefaultDashboardSelection({
  form,
  isSubmitting,
}: RoleSelectionSectionProps) {
  const t = useTranslations();

  return (
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
              {t('auth.dashboardType.label', {
                default: 'Default Dashboard Selection',
              })}
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) =>
                  field.onChange(value as unknown as DashboardType)
                }
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
                  <Label htmlFor="student" className="flex cursor-pointer">
                    <Card className="w-full transition-colors hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <GraduationCap className="w-6 h-6 mr-3 text-primary" />
                        <div>
                          <CardTitle className="text-base">
                            {t('auth.dashboardType.student', {
                              default: 'Student',
                            })}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {t('auth.profileComplete.studentDescription', {
                              default: 'Take quiz and track your progress',
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
                  <Label htmlFor="instructor" className="flex cursor-pointer">
                    <Card className="w-full transition-colors hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <Users className="w-6 h-6 mr-3 text-primary" />
                        <div>
                          <CardTitle className="text-base">
                            {t('auth.dashboardType.instructor', {
                              default: 'Instructor',
                            })}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {t('auth.profileComplete.instructorDescription', {
                              default: 'Create quiz and manage assignments',
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
