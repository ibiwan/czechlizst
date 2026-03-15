type SpinnerIconProps = {
  className?: string;
};

export function AddSpinnerLoader({ className }: SpinnerIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8V2z" />
    </svg>
  );
}
