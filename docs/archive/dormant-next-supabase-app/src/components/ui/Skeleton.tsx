type Props = {
  className?: string;
};

export function Skeleton({ className = '' }: Props) {
  return (
    <div
      className={`animate-pulse rounded-card bg-gold-soft/60 ${className}`}
      aria-hidden
    />
  );
}
