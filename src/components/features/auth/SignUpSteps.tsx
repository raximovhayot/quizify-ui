import {useTranslations} from 'next-intl';
import {UseFormReturn} from 'react-hook-form';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {InlineLoading} from '@/components/ui/loading-spinner';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    SignUpPhoneFormData,
    VerificationFormData,
} from '@/schemas/auth';

interface PhoneStepProps {
    form: UseFormReturn<SignUpPhoneFormData>;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function PhoneStep({form, onSubmit, isSubmitting}: PhoneStepProps) {
    const t = useTranslations();

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                    control={form.control}
                    name="phone"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>
                                {t('auth.phone.label', {default: 'Phone Number'})}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="tel"
                                    placeholder={t('auth.phone.placeholder', {default: '+1234567890'})}
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
                            <InlineLoading text={t('auth.signUp.sendingCode', {default: 'Sending Code...'})}/>
                        </>
                    ) : (
                        t('auth.signUp.sendCode', {default: 'Send Verification Code'})
                    )}
                </Button>
            </form>
        </Form>
    );
}

interface VerificationStepProps {
    form: UseFormReturn<VerificationFormData>;
    onSubmit: () => void;
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
                            <InlineLoading text={t('auth.verification.verifying', {default: 'Verifying...'})}/>
                        </>
                    ) : (
                        t('auth.verification.verify', {default: 'Verify Code'})
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
                            : t('auth.verification.resend', {default: 'Resend Code'})
                        }
                    </Button>
                </div>
            </form>
        </Form>
    );
}
