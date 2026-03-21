import { handleEscapeCancel } from './handleEscapeCancel';

type AddEntityRowProps = {
  addLabel: string;
  colSpan?: number;
  inputPlaceholder: string;
  isSaving: boolean;
  labelClassName?: string;
  onChangeValue: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleOpen: (open: boolean) => void;
  open: boolean;
  resetValue: () => void;
  testIdPrefix?: string;
  value: string;
};


export function AddEntityRow({
  addLabel,
  inputPlaceholder,
  isSaving,
  labelClassName,
  onChangeValue,
  onSubmit,
  onToggleOpen,
  open,
  resetValue,
  testIdPrefix,
  value
}: AddEntityRowProps) {
  const rowTestId = testIdPrefix ? `${testIdPrefix}-row` : undefined;
  const formTestId = testIdPrefix ? `${testIdPrefix}-form` : undefined;
  const inputTestId = testIdPrefix ? `${testIdPrefix}-input` : undefined;
  const saveTestId = testIdPrefix ? `${testIdPrefix}-save` : undefined;
  const cancelTestId = testIdPrefix ? `${testIdPrefix}-cancel` : undefined;

  if (open) {
    const cancelEdit = () => {
      onToggleOpen(false);
      resetValue();
    };

    return (
      <div className="add-row-edit" data-testid={rowTestId}>
        <form
          onSubmit={onSubmit}
          onKeyDown={(event) => handleEscapeCancel(event, cancelEdit)}
          className="inline-form in-row"
          data-testid={formTestId}
        >
          <input
            className="text-input"
            value={value}
            onChange={(event) => onChangeValue(event.target.value)}
            placeholder={inputPlaceholder}
            autoFocus
            data-testid={inputTestId}
          />
          <button
            className="icon-btn detail-rename-action"
            type="submit"
            aria-label={`Save ${addLabel.replace('+ ', '')}`}
            disabled={isSaving}
            data-testid={saveTestId}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 16.17 4.83 12l-1.41 1.41L9 19l12-12-1.41-1.41z" />
            </svg>
          </button>
          <button
            className="icon-btn detail-rename-action"
            type="button"
            aria-label={`Cancel ${addLabel.replace('+ ', '')}`}
            onClick={cancelEdit}
            data-testid={cancelTestId}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
            </svg>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="add-row" onClick={() => onToggleOpen(true)} data-testid={rowTestId}>
      {labelClassName ? <span className={labelClassName}>{addLabel}</span> : addLabel}
    </div>
  );
}
