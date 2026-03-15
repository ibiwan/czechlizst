import { formatTimestamp } from '@lib/format';
import { type NoteView } from '@app-types/view';

type NotesDetailSectionItemDisplayProps = {
  deleteNoteLoading: boolean;
  note: NoteView;
  onDeleteNote?: (noteId: number) => void;
  onStartEdit?: () => void;
  testIdEditButton?: string;
  testIdDeleteButton?: string;
  testIdReference?: string;
  updateNoteLoading: boolean;
};

export function NotesDetailSectionItemDisplay({
  deleteNoteLoading,
  note,
  onDeleteNote,
  onStartEdit,
  testIdEditButton,
  testIdDeleteButton,
  testIdReference,
  updateNoteLoading
}: NotesDetailSectionItemDisplayProps) {
  return (
    <>
      <div className="note-item-header">
        <div className="note-item-content">
          <p>{note.body}</p>
          {note.referenceUrl && (
            <p className="note-reference" data-testid={testIdReference}>
              {note.referenceUrl}
            </p>
          )}
        </div>
        {(onStartEdit || onDeleteNote) && (
          <div className="note-actions">
            {onStartEdit && (
              <button
                className="icon-btn"
                type="button"
                aria-label="Edit note"
                onClick={onStartEdit}
                disabled={updateNoteLoading}
                data-testid={testIdEditButton}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 17.25V20h2.75l8.1-8.1-2.75-2.75L4 17.25zm15.71-9.04c.39-.39.39-1.02 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-1.13 1.13 2.75 2.75 1.29-1.29z" />
                </svg>
              </button>
            )}
            {onDeleteNote && (
              <button
                className="link-danger"
                type="button"
                onClick={() => onDeleteNote(note.id)}
                disabled={deleteNoteLoading}
                data-testid={testIdDeleteButton}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      <time>{formatTimestamp(note.createdAt)}</time>
    </>
  );
}
