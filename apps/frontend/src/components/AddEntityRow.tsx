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
  value,
  colSpan = 3
}: AddEntityRowProps) {
  if (open) {
    return (
      <tr className="add-row-edit">
        <td colSpan={colSpan}>
          <form onSubmit={onSubmit} className="inline-form in-row">
            <input
              className="text-input"
              value={value}
              onChange={(event) => onChangeValue(event.target.value)}
              placeholder={inputPlaceholder}
              autoFocus
            />
            <button className="mini-btn" type="submit" disabled={isSaving}>
              Save
            </button>
            <button
              className="mini-btn"
              type="button"
              onClick={() => {
                onToggleOpen(false);
                resetValue();
              }}
            >
              Cancel
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="add-row" onClick={() => onToggleOpen(true)}>
      <td colSpan={colSpan}>
        {labelClassName ? <span className={labelClassName}>{addLabel}</span> : addLabel}
      </td>
    </tr>
  );
}
