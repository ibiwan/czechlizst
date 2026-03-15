type InlineEditRowProps = {
  formClassName?: string;
  inputClassName?: string;
  value: string;
  placeholder?: string;
  loading?: boolean;
  autoFocus?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  saveLabel: string;
  cancelLabel: string;
  formTestId?: string;
  inputTestId?: string;
  saveTestId?: string;
  cancelTestId?: string;
};

export function InlineEditRow({
  formClassName,
  inputClassName,
  value,
  placeholder,
  loading = false,
  autoFocus = false,
  onSubmit,
  onCancel,
  onChange,
  saveLabel,
  cancelLabel,
  formTestId,
  inputTestId,
  saveTestId,
  cancelTestId
}: InlineEditRowProps) {
  return (
    <form
      className={formClassName}
      onSubmit={onSubmit}
      data-testid={formTestId}
    >
      <input
        className={inputClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        data-testid={inputTestId}
      />
      <button
        className="icon-btn detail-rename-action"
        type="submit"
        aria-label={saveLabel}
        disabled={loading}
        data-testid={saveTestId}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 16.17 4.83 12l-1.41 1.41L9 19l12-12-1.41-1.41z" />
        </svg>
      </button>
      <button
        className="icon-btn detail-rename-action"
        type="button"
        aria-label={cancelLabel}
        onClick={onCancel}
        data-testid={cancelTestId}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
        </svg>
      </button>
    </form>
  );
}
