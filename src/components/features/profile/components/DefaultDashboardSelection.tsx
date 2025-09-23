import { CheckCircle2, GraduationCap, Users } from 'lucide-react';
import { Path, UseFormReturn } from 'react-hook-form';

import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

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

interface DefaultDashboardSelectionProps<
  TFormValues extends { dashboardType: DashboardType },
> {
  form: UseFormReturn<TFormValues>;
  isSubmitting: boolean;
}

interface OptionItemProps {
  id: string;
  value: DashboardType;
  icon: ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}

function OptionItem({
  id,
  value,
  icon,
  title,
  description,
  disabled,
}: Readonly<OptionItemProps>) {
  return (
    <div>
      <RadioGroupItem
        value={value.toString()}
        id={id}
        className="peer sr-only"
        disabled={disabled}
      />
      <Label
        htmlFor={id}
        className="group relative w-full flex cursor-pointer rounded-xl border border-border p-[2px] transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 peer-data-[state=checked]:border-transparent peer-data-[state=checked]:bg-gradient-to-tr peer-data-[state=checked]:from-primary/60 peer-data-[state=checked]:to-primary/30 peer-data-[state=checked]:shadow-xl peer-data-[state=checked]:scale-[1.01]"
      >
        <div className="absolute right-2 top-2 opacity-0 transition-opacity peer-data-[state=checked]:opacity-100 text-primary">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
        </div>
        <Card className="w-full rounded-[10px] bg-background border-0 shadow-none">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </Label>
    </div>
  );
}

export function DefaultDashboardSelection<
  TFormValues extends { dashboardType: DashboardType },
>({
  form,
  isSubmitting,
}: Readonly<DefaultDashboardSelectionProps<TFormValues>>) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={'dashboardType' as Path<TFormValues>}
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
                  field.onChange(value as DashboardType)
                }
                value={String(field.value ?? '')}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                disabled={isSubmitting}
              >
                <OptionItem
                  id="student"
                  value={DashboardType.STUDENT}
                  icon={<GraduationCap className="w-5 h-5" />}
                  title={t('auth.dashboardType.student', {
                    default: 'Student',
                  })}
                  description={t('auth.profileComplete.studentDescription', {
                    default: 'Take quiz and track your progress',
                  })}
                  disabled={isSubmitting}
                />

                <OptionItem
                  id="instructor"
                  value={DashboardType.INSTRUCTOR}
                  icon={<Users className="w-5 h-5" />}
                  title={t('auth.dashboardType.instructor', {
                    default: 'Instructor',
                  })}
                  description={t('auth.profileComplete.instructorDescription', {
                    default: 'Create quiz and manage assignments',
                  })}
                  disabled={isSubmitting}
                />
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
