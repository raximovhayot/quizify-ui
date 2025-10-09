import React from 'react';
import { Button } from '@/components/ui/button';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // accessible name (required)
  variant?: 'ghost' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Atom: IconButton
 * Accessible icon-only button built on top of shadcn/ui Button.
 */
export function IconButton({
  label,
  className = '',
  variant = 'ghost',
  size = 'md',
  type = 'button',
  children,
  ...rest
}: Readonly<IconButtonProps>) {
  const sizeCls = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';

  return (
    <Button
      type={type}
      variant={variant as never}
      className={`inline-flex items-center justify-center rounded-md ${sizeCls} ${className}`.trim()}
      aria-label={label}
      {...rest}
    >
      {children}
    </Button>
  );
}

export default IconButton;
