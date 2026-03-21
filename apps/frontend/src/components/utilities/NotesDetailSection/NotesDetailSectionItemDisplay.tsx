import { DeleteIcon, EditIcon, IconButton } from '@utilities/IconButton';
import { formatTimestamp } from '@lib/format';
import { type NoteView } from '@app-types/view';

type NotesDetailSectionItemDisplayProps = {
  deleteNoteLoading?: boolean;
  note: NoteView;
  onDeleteNote?: (noteId: number) => void;
  onStartEdit?: () => void;
  testIdPrefix?: string;
  updateNoteLoading?: boolean;
};

export function NotesDetailSectionItemDisplay({
  deleteNoteLoading,
  note,
  onDeleteNote,
  onStartEdit,
  testIdPrefix,
  updateNoteLoading
}: NotesDetailSectionItemDisplayProps) {
  const testId = (suffix: string) => testIdPrefix ? `${testIdPrefix}-${suffix}` : undefined;

  return (
    <>
      <div className="note-item-header">
        <div className="note-main">
          <div className="note-item-content">
            <div className="note-body-row">
              <p>{note.body}</p>
              {onStartEdit && (
                <div className="note-inline-actions">
                  <IconButton
                    aria-label="Edit note"
                    onClick={() => onStartEdit()}
                    disabled={updateNoteLoading}
                    testId={testId('edit-button')}
                  >
                    <EditIcon />
                  </IconButton>
                </div>
              )}
            </div>
            {note.referenceUrl && (
              <p className="note-reference" data-testid={testId('reference')}>
                {note.referenceUrl}
              </p>
            )}
          </div>
        </div>
        {onDeleteNote && (
          <div className="note-actions">
            <IconButton
              aria-label="Delete note"
              onClick={() => onDeleteNote(note.id)}
              disabled={deleteNoteLoading}
              testId={testId('delete-button')}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        )}
      </div>
      <time>{formatTimestamp(note.createdAt)}</time>
    </>
  );
}
