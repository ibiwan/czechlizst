import { useState } from 'react';
import { type ReactNode } from 'react';
import { formatTimestamp } from '../lib/format';
import { type NoteView } from '../types/view';
import { AddSpinnerButton } from './AddSpinnerButton';

type NotesDetailSectionProps = {
  addNoteLabel: string;
  createNoteLoading: boolean;
  headerAction?: ReactNode;
  titleNode?: ReactNode;
  inputPlaceholder: string;
  newNoteBody: string;
  newNoteReferenceUrl: string;
  notes: NoteView[];
  notesError: boolean;
  notesLoading: boolean;
  onChangeNoteBody: (body: string) => void;
  onChangeNoteReferenceUrl: (value: string) => void;
  onCreateNote: (event: React.FormEvent<HTMLFormElement>) => void;
  onDeleteNote?: (noteId: number) => void;
  onUpdateNote?: (noteId: number, body: string, referenceUrl: string | null) => void;
  onToggleOpen: (open: boolean) => void;
  open: boolean;
  resetNoteBody: () => void;
  resetNoteReferenceUrl: () => void;
  testIdPrefix?: string;
  title: string;
  beforeList?: ReactNode;
  updateNoteLoading?: boolean;
  deleteNoteLoading?: boolean;
};

export function NotesDetailSection({
  addNoteLabel,
  beforeList,
  createNoteLoading,
  headerAction,
  inputPlaceholder,
  newNoteBody,
  newNoteReferenceUrl,
  notes,
  notesError,
  notesLoading,
  onChangeNoteBody,
  onChangeNoteReferenceUrl,
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
  onToggleOpen,
  open,
  resetNoteBody,
  resetNoteReferenceUrl,
  testIdPrefix,
  title,
  titleNode,
  updateNoteLoading = false,
  deleteNoteLoading = false
}: NotesDetailSectionProps) {
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingBody, setEditingBody] = useState('');
  const [editingReferenceUrl, setEditingReferenceUrl] = useState('');
  const testId = (suffix: string) => (testIdPrefix ? `${testIdPrefix}-${suffix}` : undefined);

  return (
    <section className="detail-block" data-testid={testIdPrefix}>
      <div className="panel-header" data-testid={testId('header')}>
        {titleNode ?? <h3 className="panel-title detail-title">{title}</h3>}
        {headerAction}
      </div>

      {open && (
        <form
          onSubmit={onCreateNote}
          className="inline-form note-adder"
          data-testid={testId('add-form')}
        >
          <input
            className="text-input"
            value={newNoteBody}
            onChange={(event) => onChangeNoteBody(event.target.value)}
            placeholder={inputPlaceholder}
            autoFocus
            data-testid={testId('add-input')}
          />
          <input
            className="text-input"
            value={newNoteReferenceUrl}
            onChange={(event) => onChangeNoteReferenceUrl(event.target.value)}
            placeholder="Reference (optional)"
            data-testid={testId('add-reference')}
          />
          <button
            className="mini-btn"
            type="submit"
            disabled={createNoteLoading}
            data-testid={testId('add-save')}
          >
            Save
          </button>
          <button
            className="mini-btn"
            type="button"
            onClick={() => {
              onToggleOpen(false);
              resetNoteBody();
              resetNoteReferenceUrl();
            }}
            data-testid={testId('add-cancel')}
          >
            Cancel
          </button>
        </form>
      )}

      {beforeList}

      {notesLoading && <p className="state-copy">Loading notes...</p>}
      {notesError && <p className="state-copy">Could not load notes.</p>}

      {notes.length === 0 ? (
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
      ) : (
        <>
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
          <ul className="note-list" data-testid={testId('list')}>
            {notes.map((note) => (
              <li
                key={note.id}
                className="note-item"
                data-testid={testId(`item-${note.id}`)}
              >
                {editingNoteId === note.id ? (
                  <form
                    className="inline-form in-row"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const trimmed = editingBody.trim();
                      if (!trimmed) {
                        return;
                      }
                      const refValue = editingReferenceUrl.trim();
                      onUpdateNote?.(note.id, trimmed, refValue ? refValue : null);
                      setEditingNoteId(null);
                      setEditingBody('');
                      setEditingReferenceUrl('');
                    }}
                    data-testid={testId(`edit-form-${note.id}`)}
                  >
                    <input
                      className="text-input"
                      value={editingBody}
                      onChange={(event) => setEditingBody(event.target.value)}
                      autoFocus
                      data-testid={testId(`edit-input-${note.id}`)}
                    />
                    <input
                      className="text-input"
                      value={editingReferenceUrl}
                      onChange={(event) => setEditingReferenceUrl(event.target.value)}
                      placeholder="Reference (optional)"
                      data-testid={testId(`edit-reference-${note.id}`)}
                    />
                    <button
                      className="mini-btn"
                      type="submit"
                      disabled={updateNoteLoading}
                      data-testid={testId(`edit-save-${note.id}`)}
                    >
                      Save
                    </button>
                    <button
                      className="mini-btn"
                      type="button"
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditingBody('');
                        setEditingReferenceUrl('');
                      }}
                      data-testid={testId(`edit-cancel-${note.id}`)}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="note-item-header">
                      <div className="note-item-content">
                        <p>{note.body}</p>
                        {note.referenceUrl && (
                          <p className="note-reference" data-testid={testId(`ref-${note.id}`)}>
                            {note.referenceUrl}
                          </p>
                        )}
                      </div>
                      {(onUpdateNote || onDeleteNote) && (
                        <div className="note-actions">
                          {onUpdateNote && (
                            <button
                              className="mini-btn"
                              type="button"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingBody(note.body);
                                setEditingReferenceUrl(note.referenceUrl ?? '');
                              }}
                              disabled={updateNoteLoading}
                              data-testid={testId(`edit-button-${note.id}`)}
                            >
                              Edit
                            </button>
                          )}
                          {onDeleteNote && (
                            <button
                              className="link-danger"
                              type="button"
                              onClick={() => onDeleteNote(note.id)}
                              disabled={deleteNoteLoading}
                              data-testid={testId(`delete-button-${note.id}`)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <time>{formatTimestamp(note.createdAt)}</time>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
