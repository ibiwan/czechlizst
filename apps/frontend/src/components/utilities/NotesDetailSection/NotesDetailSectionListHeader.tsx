import { AddSpinnerButton } from '../AddSpinnerButton';

type NotesDetailSectionListHeaderProps = {
  addNoteLabel: string;
  createNoteLoading: boolean;
  open: boolean;
  onToggleOpen: (open: boolean) => void;
  testIdAdd?: string;
};

export function NotesDetailSectionListHeader({
  addNoteLabel,
  createNoteLoading,
  open,
  onToggleOpen,
  testIdAdd
}: NotesDetailSectionListHeaderProps) {
  return (
    <div className="notes-header">
      <span className="notes-header-title">Notes</span>
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
