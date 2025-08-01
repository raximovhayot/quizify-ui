'use client';

import {useTranslations} from 'next-intl';
import {useSearchParams} from 'next/navigation';

import {useSignUpForms} from '@/components/features/auth/hooks/useSignUpForms';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {InlineLoading} from "@/components/ui/loading-spinner";

export function PageSignUpVerify() {
    const t = useTranslations();
    const searchParams = useSearchParams();
    const phoneFromUrl = searchParams.get('phone') || '';

    const {
        isSubmitting,
        resendCooldown,
        verificationForm,
        onVerificationSubmit,
        handleResendOTP,
    } = useSignUpForms();


    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    {t('auth.signUp.verification.title', {
                        default: 'Verify Phone Number',
                    })}
                </CardTitle>
                <CardDescription>
                    {t('auth.signUp.verification.description', {
                        default: 'We sent a verification code to your phone',
                    })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...verificationForm}>
                    <form onSubmit={onVerificationSubmit} className="space-y-4">
                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-600">
                                {t('auth.verification.instruction', {
                                    default: 'Enter the 6-digit code sent to',
                                })}{' '}
                                <strong>{phoneFromUrl}</strong>
                            </p>
                        </div>

                        <FormField
                            control={verificationForm.control}
                            name="otp"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('auth.verification.label', {default: 'Verification Code'})}
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
                                    <FormMessage/>
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
                                t('auth.verification.verify', {default: 'Verify Code'})
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
                                    : t('auth.verification.resend', {default: 'Resend Code'})}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}