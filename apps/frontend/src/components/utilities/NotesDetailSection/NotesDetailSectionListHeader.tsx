import { AddSpinnerButton } from '../AddSpinnerButton';

type NotesDetailSectionListHeaderProps = {
  addNoteLabel?: string;
  createNoteLoading?: boolean;
  open: boolean;
  onToggleOpen: (open: boolean) => void;
  testIdPrefix?: string;
};

export function NotesDetailSectionListHeader({
  addNoteLabel = 'Add note',
  createNoteLoading = false,
  open,
  onToggleOpen,
  testIdPrefix
}: NotesDetailSectionListHeaderProps) {
  const testId = (suffix: string) => testIdPrefix ? `${testIdPrefix}-${suffix}` : undefined;

  return (
    <div className="notes-header">
      <span className="notes-header-title">Notes</span>
      {!open && (
        <AddSpinnerButton
          label={addNoteLabel}
          loadingLabel="Loading"
          loading={createNoteLoading}
          onClick={() => onToggleOpen(true)}
          testId={testId('add-button')}
        />
      )}
    </div>
  );
}
