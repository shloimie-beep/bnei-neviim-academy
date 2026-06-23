'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-soft active:bg-accent disabled:opacity-50',
  ghost: 'bg-transparent text-ink hover:bg-line/60 active:bg-line',
  danger: 'bg-rose text-white hover:opacity-90 active:opacity-100 disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-4 text-card font-medium',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={`rounded-card transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});
