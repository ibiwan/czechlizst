import { useRef } from 'react';

type AddEntityInputProps = {
  addLabel: string;
  inputPlaceholder: string;
  isSaving: boolean;
  onChangeValue: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleOpen: (open: boolean) => void;
  open: boolean;
  resetValue: () => void;
  value: string;
};

export function AddEntityInput({
  addLabel,
  inputPlaceholder,
  isSaving,
  onChangeValue,
  onSubmit,
  onToggleOpen,
  open,
  resetValue,
  value
}: AddEntityInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function cancelEdit() {
    onToggleOpen(false);
    resetValue();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      cancelEdit();
    }
  }

  if (open) {
    return (
      <div className="add-entity-edit">
        <form
          className="add-entity-form"
          onKeyDown={handleKeyDown}
          onSubmit={onSubmit}
        >
          <input
            autoFocus
            className="add-entity-input"
            onChange={(event) => onChangeValue(event.target.value)}
            placeholder={inputPlaceholder}
            ref={inputRef}
            value={value}
          />
          <button
            aria-label="Save"
            className="add-entity-icon-btn"
            disabled={isSaving}
            type="submit"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M9 16.17 4.83 12l-1.41 1.41L9 19l12-12-1.41-1.41z" />
            </svg>
          </button>
          <button
            aria-label="Cancel"
            className="add-entity-icon-btn"
            onClick={cancelEdit}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
            </svg>
          </button>
        </form>
      </div>
    );
  }

  return (
    <button
      className="add-entity-trigger"
      onClick={() => onToggleOpen(true)}
      type="button"
    >
      {addLabel}
    </button>
  );
}
