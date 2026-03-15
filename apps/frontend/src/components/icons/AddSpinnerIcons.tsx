type SpinnerIconProps = {
  className: string;
};

export function AddSpinnerIcon({ className }: SpinnerIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 1 1"
      fill="none"
      stroke="white"
      strokeWidth="0.12"
      strokeLinecap="round"
    >
      <line x1="0.1" y1="0.5" x2="0.9" y2="0.5" />
      <line x1="0.5" y1="0.1" x2="0.5" y2="0.9" />
    </svg>
  );
}

export function AddSpinnerLoader({ className }: SpinnerIconProps) {
  return (
    <svg className={className} viewBox="0 0 1 1">
      <circle
        className="opacity-25"
        cx="0.5"
        cy="0.5"
        r="0.4"
        stroke="white"
        strokeWidth="0.12"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="white"
        d="M0.5 0.1 A 0.4 0.4 0 0 1 0.9 0.5 L 0.8 0.5 A 0.3 0.3 0 0 0 0.5 0.2 Z"
      />
    </svg>
  );
}
