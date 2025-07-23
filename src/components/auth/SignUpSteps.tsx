import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineLoading } from '@/components/ui/loading-spinner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DashboardType } from '@/types/auth';
import {
  SignUpPhoneFormData,
  VerificationFormData,
  UserDetailsFormData,
} from '@/schemas/auth';

interface PhoneStepProps {
  form: UseFormReturn<SignUpPhoneFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
}

export function PhoneStep({ form, onSubmit, isSubmitting }: PhoneStepProps) {
  const t = useTranslations();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('auth.phone.label', { default: 'Phone Number' })}
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder={t('auth.phone.placeholder', { default: '+1234567890' })}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <InlineLoading />
              {t('auth.signUp.sendingCode', { default: 'Sending Code...' })}
            </>
          ) : (
            t('auth.signUp.sendCode', { default: 'Send Verification Code' })
          )}
        </Button>
      </form>
    </Form>
  );
}

interface VerificationStepProps {
  form: UseFormReturn<VerificationFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  phoneNumber: string;
  resendCooldown: number;
  onResend: () => void;
}

export function VerificationStep({
  form,
  onSubmit,
  isSubmitting,
  phoneNumber,
  resendCooldown,
  onResend,
}: VerificationStepProps) {
  const t = useTranslations();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            {t('auth.verification.instruction', {
              default: 'Enter the 6-digit code sent to'
            })} <strong>{phoneNumber}</strong>
          </p>
        </div>

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('auth.verification.label', { default: 'Verification Code' })}
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <InlineLoading />
              {t('auth.verification.verifying', { default: 'Verifying...' })}
            </>
          ) : (
            t('auth.verification.verify', { default: 'Verify Code' })
          )}
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={onResend}
            disabled={resendCooldown > 0 || isSubmitting}
            className="text-sm"
          >
            {resendCooldown > 0
              ? t('auth.verification.resendIn', {
                  default: `Resend in ${resendCooldown}s`,
                  seconds: resendCooldown
                })
              : t('auth.verification.resend', { default: 'Resend Code' })
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface UserDetailsStepProps {
  form: UseFormReturn<UserDetailsFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
}

export function UserDetailsStep({ form, onSubmit, isSubmitting }: UserDetailsStepProps) {
  const t = useTranslations();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
                    type="text"
                    placeholder={t('auth.firstName.placeholder', { default: 'John' })}
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
                    type="text"
                    placeholder={t('auth.lastName.placeholder', { default: 'Doe' })}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  placeholder={t('auth.password.placeholder', { default: 'Enter your password' })}
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('auth.confirmPassword.label', { default: 'Confirm Password' })}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('auth.confirmPassword.placeholder', { default: 'Confirm your password' })}
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
          name="dashboardType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                {t('auth.role.label', { default: 'I am a' })}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={DashboardType.STUDENT} id="student" />
                    <label htmlFor="student" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {t('auth.role.student', { default: 'Student' })}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={DashboardType.INSTRUCTOR} id="instructor" />
                    <label htmlFor="instructor" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {t('auth.role.instructor', { default: 'Instructor' })}
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <InlineLoading />
              {t('auth.signUp.creating', { default: 'Creating Account...' })}
            </>
          ) : (
            t('auth.signUp.create', { default: 'Create Account' })
          )}
        </Button>
      </form>
    </Form>
  );
}

export function CompletedStep() {
  const t = useTranslations();

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900">
        {t('auth.signUp.success.title', { default: 'Account Created Successfully!' })}
      </h3>
      
      <p className="text-sm text-gray-600">
        {t('auth.signUp.success.description', {
          default: 'Your account has been created. You will be redirected to the sign-in page shortly.'
        })}
      </p>
      
      <div className="flex justify-center">
        <InlineLoading />
      </div>
    </div>
  );
}