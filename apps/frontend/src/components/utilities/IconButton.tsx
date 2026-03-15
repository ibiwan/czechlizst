import { type MouseEvent, type ReactNode } from 'react';

type IconButtonProps = {
  'aria-label': string;
  children: ReactNode;
  disabled?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  testId?: string;
};

export function IconButton({ 'aria-label': ariaLabel, children, disabled, onClick, testId }: IconButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onClick(event);
  }

  return (
    <button
      className="icon-btn"
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

export const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
  </svg>
);

export const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 17.25V20h2.75l8.1-8.1-2.75-2.75L4 17.25zm15.71-9.04c.39-.39.39-1.02 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-1.13 1.13 2.75 2.75 1.29-1.29z" />
  </svg>
);

export const SaveIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 16.17 4.83 12l-1.41 1.41L9 19l12-12-1.41-1.41z" />
  </svg>
);

export const CancelIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
  </svg>
);
