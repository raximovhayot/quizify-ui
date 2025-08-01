'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
import { Input } from '@/components/ui/input';
import { InlineLoading } from '@/components/ui/loading-spinner';

import { ROUTES_AUTH } from '../routes';

export function PageForgotPasswordVerify() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const phoneFromUrl = searchParams.get('phone') || '';
  
  const {
    isSubmitting,
    resendCooldown,
    verificationForm,
    onVerificationSubmit,
    handleResendOTP,
  } = useForgotPasswordForm();

  return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>
            {t('auth.verification.title', { default: 'Verify Your Phone' })}
          </CardTitle>
          <CardDescription>
            {t('auth.verification.description', {
              default: 'Enter the 6-digit code sent to your phone',
            })}
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
                      {t('auth.verification.code.label', {
                        default: 'Verification Code',
                      })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        disabled={isSubmitting}
                        className="text-center text-lg tracking-widest"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <InlineLoading
                    text={t('auth.verification.verifying', {
                      default: 'Verifying...',
                    })}
                  />
                ) : (
                  t('auth.verification.verify', { default: 'Verify Code' })
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 space-y-2 text-center">
            <div className="text-sm text-muted-foreground">
              {t('auth.verification.sentTo', { default: 'Code sent to' })}{' '}
              <span className="font-medium">{phoneFromUrl}</span>
            </div>
            
            {resendCooldown > 0 ? (
              <div className="text-sm text-muted-foreground">
                {t('auth.verification.resendIn', {
                  default: 'Resend code in {seconds}s',
                  seconds: resendCooldown,
                })}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOTP}
                disabled={isSubmitting}
              >
                {t('auth.verification.resend', { default: 'Resend Code' })}
              </Button>
            )}
            
            <div>
              <Link
                href={ROUTES_AUTH.forgotPassword()}
                className="text-sm text-muted-foreground hover:underline"
              >
                {t('auth.verification.changePhone', { default: 'Change phone number' })}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}