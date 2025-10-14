import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

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
      {isSubmitting ? (
        <>
          <Spinner className="size-4 mr-2" />
          {loadingText}
        </>
      ) : (
        submitText
      )}
    </Button>
  );
}
