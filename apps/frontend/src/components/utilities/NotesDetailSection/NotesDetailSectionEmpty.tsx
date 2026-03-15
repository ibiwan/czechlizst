import { AddSpinnerButton } from '../AddSpinnerButton';

type NotesDetailSectionEmptyProps = {
  addNoteLabel: string;
  createNoteLoading: boolean;
  open: boolean;
  onToggleOpen: (open: boolean) => void;
  testId?: string;
  testIdAdd?: string;
};

export function NotesDetailSectionEmpty({
  addNoteLabel,
  createNoteLoading,
  open,
  onToggleOpen,
  testId,
  testIdAdd
}: NotesDetailSectionEmptyProps) {
  return (
    <div className="note-empty" data-testid={testId}>
      <span className="state-copy">No notes yet.</span>
      {!open && (
        <AddSpinnerButton
          label={addNoteLabel}
          loadingLabel="Loading"
          loading={createNoteLoading}
          onClick={() => onToggleOpen(true)}
          testId={testIdAdd}
        />
      )}
    </div>
  );
}
