import { type KeyboardEvent } from 'react';

export function handleEscapeCancel(
  event: KeyboardEvent<HTMLElement>,
  onCancel: () => void
) {
  if (event.key !== 'Escape') {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  onCancel();
}
