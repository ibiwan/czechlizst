import { AddSpinnerButton } from '../AddSpinnerButton';

type NotesDetailSectionEmptyProps = {
  addNoteLabel?: string;
  createNoteLoading?: boolean;
  open: boolean;
  onToggleOpen: (open: boolean) => void;
  testIdPrefix?: string;
};

export function NotesDetailSectionEmpty({
  addNoteLabel = 'Add note',
  createNoteLoading = false,
  open,
  onToggleOpen,
  testIdPrefix
}: NotesDetailSectionEmptyProps) {
  const testId = (suffix: string) => testIdPrefix ? `${testIdPrefix}-${suffix}` : undefined;

  return (
    <div className="note-empty" data-testid={testId('empty')}>
      <span className="state-copy">No notes yet.</span>
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
