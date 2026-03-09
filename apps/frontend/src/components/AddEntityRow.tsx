type AddEntityRowProps = {
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

export function AddEntityRow({
  addLabel,
  inputPlaceholder,
  isSaving,
  onChangeValue,
  onSubmit,
  onToggleOpen,
  open,
  resetValue,
  value
}: AddEntityRowProps) {
  if (open) {
    return (
      <tr className="add-row-edit">
        <td colSpan={3}>
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
      <td colSpan={3}>{addLabel}</td>
    </tr>
  );
}
