import { useState } from 'react';
import { type ReactNode } from 'react';
import { formatTimestamp } from '../lib/format';
import { type NoteView } from '../types/view';

type NotesDetailSectionProps = {
  addNoteLabel: string;
  createNoteLoading: boolean;
  headerAction?: ReactNode;
  titleNode?: ReactNode;
  inputPlaceholder: string;
  newNoteBody: string;
  notes: NoteView[];
  notesError: boolean;
  notesLoading: boolean;
  onChangeNoteBody: (body: string) => void;
  onCreateNote: (event: React.FormEvent<HTMLFormElement>) => void;
  onDeleteNote?: (noteId: number) => void;
  onUpdateNote?: (noteId: number, body: string) => void;
  onToggleOpen: (open: boolean) => void;
  open: boolean;
  resetNoteBody: () => void;
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
  notes,
  notesError,
  notesLoading,
  onChangeNoteBody,
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
  onToggleOpen,
  open,
  resetNoteBody,
  title,
  titleNode,
  updateNoteLoading = false,
  deleteNoteLoading = false
}: NotesDetailSectionProps) {
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingBody, setEditingBody] = useState('');

  return (
    <section className="detail-block">
      <div className="panel-header">
        {titleNode ?? <h3 className="panel-title detail-title">{title}</h3>}
        {headerAction}
      </div>

      {open && (
        <form onSubmit={onCreateNote} className="inline-form note-adder">
          <input
            className="text-input"
            value={newNoteBody}
            onChange={(event) => onChangeNoteBody(event.target.value)}
            placeholder={inputPlaceholder}
            autoFocus
          />
          <button className="mini-btn" type="submit" disabled={createNoteLoading}>
            Save
          </button>
          <button
            className="mini-btn"
            type="button"
            onClick={() => {
              onToggleOpen(false);
              resetNoteBody();
            }}
          >
            Cancel
          </button>
        </form>
      )}

      {beforeList}

      {notesLoading && <p className="state-copy">Loading notes...</p>}
      {notesError && <p className="state-copy">Could not load notes.</p>}

      {notes.length === 0 ? (
        <div className="note-empty">
          <span className="state-copy">No notes yet.</span>
          {!open && (
            <button className="list-add-header" type="button" onClick={() => onToggleOpen(true)}>
              <span className="list-add-header-icon" aria-hidden="true">
                +
              </span>
              <span className="list-add-header-label">{addNoteLabel}</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="notes-header">
            <span className="notes-header-title">Notes</span>
            {!open && (
              <button className="list-add-header" type="button" onClick={() => onToggleOpen(true)}>
                <span className="list-add-header-icon" aria-hidden="true">
                  +
                </span>
                <span className="list-add-header-label">{addNoteLabel}</span>
              </button>
            )}
          </div>
          <ul className="note-list">
            {notes.map((note) => (
              <li key={note.id} className="note-item">
                {editingNoteId === note.id ? (
                  <form
                    className="inline-form in-row"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const trimmed = editingBody.trim();
                      if (!trimmed) {
                        return;
                      }
                      onUpdateNote?.(note.id, trimmed);
                      setEditingNoteId(null);
                      setEditingBody('');
                    }}
                  >
                    <input
                      className="text-input"
                      value={editingBody}
                      onChange={(event) => setEditingBody(event.target.value)}
                      autoFocus
                    />
                    <button className="mini-btn" type="submit" disabled={updateNoteLoading}>
                      Save
                    </button>
                    <button
                      className="mini-btn"
                      type="button"
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditingBody('');
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="note-item-header">
                      <p>{note.body}</p>
                      {(onUpdateNote || onDeleteNote) && (
                        <div className="note-actions">
                          {onUpdateNote && (
                            <button
                              className="mini-btn"
                              type="button"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingBody(note.body);
                              }}
                              disabled={updateNoteLoading}
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
