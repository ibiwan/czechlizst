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
  value,
  colSpan = 3
}: AddEntityRowProps) {
  const rowTestId = testIdPrefix ? `${testIdPrefix}-row` : undefined;
  const formTestId = testIdPrefix ? `${testIdPrefix}-form` : undefined;
  const inputTestId = testIdPrefix ? `${testIdPrefix}-input` : undefined;
  const saveTestId = testIdPrefix ? `${testIdPrefix}-save` : undefined;
  const cancelTestId = testIdPrefix ? `${testIdPrefix}-cancel` : undefined;

  if (open) {
    return (
      <tr className="add-row-edit" data-testid={rowTestId}>
        <td colSpan={colSpan}>
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
        </td>
      </tr>
    );
  }

  return (
    <tr className="add-row" onClick={() => onToggleOpen(true)} data-testid={rowTestId}>
      <td colSpan={colSpan}>
        {labelClassName ? <span className={labelClassName}>{addLabel}</span> : addLabel}
      </td>
    </tr>
  );
}
