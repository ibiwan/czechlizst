type NotesDetailSectionStatusProps = {
  notesError: boolean;
  notesLoading: boolean;
};

export function NotesDetailSectionStatus({
  notesError,
  notesLoading
}: NotesDetailSectionStatusProps) {
  return (
    <>
      {notesLoading && <p className="state-copy">Loading notes...</p>}
      {notesError && <p className="state-copy">Could not load notes.</p>}
    </>
  );
}
