type SpinnerIconProps = {
  className?: string;
};

export function AddSpinnerIcon({ className }: SpinnerIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M11 5h2v14h-2V5zm-6 6h14v2H5v-2z" />
    </svg>
  );
}
