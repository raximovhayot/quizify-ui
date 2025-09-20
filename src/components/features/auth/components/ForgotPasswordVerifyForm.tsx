'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useForgotPasswordForm } from '@/components/features/auth/hooks/useForgotPasswordForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { InlineLoading } from '@/components/ui/loading-spinner';

import { ROUTES_AUTH } from '../routes';

export function ForgotPasswordVerifyForm() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const phoneFromUrl = searchParams?.get('phone') ?? '';

  const {
    isSubmitting,
    verificationForm,
    onVerificationSubmit,
    handleResendOTP,
    resendCooldown,
  } = useForgotPasswordForm();

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {t('auth.verification.title', { default: 'Verify Your Phone' })}
        </CardTitle>
        <CardDescription>
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              {t('auth.verification.instruction', {
                default: 'Enter the 6-digit code sent to',
              })}{' '}
              <strong>{phoneFromUrl}</strong>
            </p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...verificationForm}>
          <form onSubmit={onVerificationSubmit} className="space-y-4">
            <FormField
              control={verificationForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth.verification.label', {
                      default: 'Verification Code',
                    })}
                  </FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      disabled={isSubmitting}
                      containerClassName="w-full"
                      {...field}
                    >
                      <InputOTPGroup className="w-full justify-center">
                        <InputOTPSlot index={0} className="flex-1 max-w-12" />
                        <InputOTPSlot index={1} className="flex-1 max-w-12" />
                        <InputOTPSlot index={2} className="flex-1 max-w-12" />
                        <InputOTPSeparator />
                        <InputOTPSlot index={3} className="flex-1 max-w-12" />
                        <InputOTPSlot index={4} className="flex-1 max-w-12" />
                        <InputOTPSlot index={5} className="flex-1 max-w-12" />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <InlineLoading
                    text={t('auth.verification.verifying', {
                      default: 'Verifying...',
                    })}
                  />
                </>
              ) : (
                t('auth.verification.verify', { default: 'Verify Code' })
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || isSubmitting}
                className="text-sm"
              >
                {resendCooldown > 0
                  ? t('auth.verification.resendIn', {
                      default: `Resend in ${resendCooldown}s`,
                      seconds: resendCooldown,
                    })
                  : t('auth.verification.resend', { default: 'Resend Code' })}
              </Button>
            </div>

            <div className="text-center">
              <Link
                href={ROUTES_AUTH.forgotPassword()}
                className="text-sm text-muted-foreground hover:underline"
              >
                {t('auth.verification.changePhone', {
                  default: 'Change phone number',
                })}
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
