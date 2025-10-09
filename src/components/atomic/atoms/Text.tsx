import React from 'react';

export type TextAs =
  | 'span'
  | 'p'
  | 'div'
  | 'strong'
  | 'em'
  | 'small'
  | 'label'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4';

export interface TextProps
  extends React.HTMLAttributes<HTMLElement> {
  as?: TextAs;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  muted?: boolean;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

/**
 * Atom: Text
 * Semantic typography helper with small, safe variants.
 * - No hardcoded copy; pass text via children/props.
 * - Defaults to `span` to avoid layout shifts.
 */
export function Text({
  as = 'span',
  size = 'sm',
  muted = false,
  weight = 'normal',
  align = 'left',
  className = '',
  children,
  ...rest
}: Readonly<TextProps>) {
  type Poly = React.ElementType;
  const Comp = as as Poly;

  const sizeCls =
    size === 'xs'
      ? 'text-xs'
      : size === 'sm'
      ? 'text-sm'
      : size === 'md'
      ? 'text-base'
      : 'text-lg';

  const weightCls =
    weight === 'bold'
      ? 'font-bold'
      : weight === 'semibold'
      ? 'font-semibold'
      : weight === 'medium'
      ? 'font-medium'
      : 'font-normal';

  const alignCls = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  const mutedCls = muted ? 'text-muted-foreground' : '';

  const classes = [sizeCls, weightCls, alignCls, mutedCls, className].filter(Boolean).join(' ');

  return (
    <Comp className={classes} {...rest}>
      {children}
    </Comp>
  );
}

export default Text;
