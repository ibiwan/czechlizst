type AddEntityCardProps = {
  addLabel: string;
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

export function AddEntityCard({
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
}: AddEntityCardProps) {
  const rowTestId = testIdPrefix ? `${testIdPrefix}-row` : undefined;
  const formTestId = testIdPrefix ? `${testIdPrefix}-form` : undefined;
  const inputTestId = testIdPrefix ? `${testIdPrefix}-input` : undefined;
  const saveTestId = testIdPrefix ? `${testIdPrefix}-save` : undefined;
  const cancelTestId = testIdPrefix ? `${testIdPrefix}-cancel` : undefined;

  if (open) {
    return (
      <div className="add-card-edit" data-testid={rowTestId}>
        <form onSubmit={onSubmit} className="inline-form in-row" data-testid={formTestId}>
          <input
            className="text-input"
            value={value}
            onChange={(event) => onChangeValue(event.target.value)}
            placeholder={inputPlaceholder}
            autoFocus
            data-testid={inputTestId}
          />
          <button
            className="mini-btn"
            type="submit"
            disabled={isSaving}
            data-testid={saveTestId}
          >
            Save
          </button>
          <button
            className="mini-btn"
            type="button"
            onClick={() => {
              onToggleOpen(false);
              resetValue();
            }}
            data-testid={cancelTestId}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="add-card" onClick={() => onToggleOpen(true)} data-testid={rowTestId}>
      {labelClassName ? <span className={labelClassName}>{addLabel}</span> : addLabel}
    </div>
  );
}
