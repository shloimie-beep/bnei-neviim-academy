import { type HTMLAttributes, forwardRef } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'checked' | 'rejected' | 'frozen';
};

const variantClasses = {
  default: 'surface',
  checked: 'bg-gold-soft border border-gold/30 border-s-4 border-s-gold',
  rejected: 'surface border-s-4 border-s-rose',
  frozen: 'surface opacity-50',
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', className = '', children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={`rounded-card p-5 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});
