import { Button } from '@/components/ui/button';
import { InlineLoading } from '@/components/ui/loading-spinner';

interface SubmitButtonProps {
  isSubmitting: boolean;
  loadingText: string;
  submitText: string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
}

export function SubmitButton({
  isSubmitting,
  loadingText,
  submitText,
  disabled = false,
  className = 'w-full',
  type = 'submit',
  onClick,
}: SubmitButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={isSubmitting || disabled}
      className={className}
    >
      {isSubmitting ? <InlineLoading text={loadingText} /> : submitText}
    </Button>
  );
}
