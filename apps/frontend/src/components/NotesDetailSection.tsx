import { type ReactNode } from 'react';
import { formatTimestamp } from '../lib/format';
import { type NoteView } from '../types/view';

type NotesDetailSectionProps = {
  addNoteLabel: string;
  createNoteLoading: boolean;
  inputPlaceholder: string;
  newNoteBody: string;
  notes: NoteView[];
  notesError: boolean;
  notesLoading: boolean;
  onChangeNoteBody: (body: string) => void;
  onCreateNote: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleOpen: (open: boolean) => void;
  open: boolean;
  resetNoteBody: () => void;
  title: string;
  beforeList?: ReactNode;
};

export function NotesDetailSection({
  addNoteLabel,
  beforeList,
  createNoteLoading,
  inputPlaceholder,
  newNoteBody,
  notes,
  notesError,
  notesLoading,
  onChangeNoteBody,
  onCreateNote,
  onToggleOpen,
  open,
  resetNoteBody,
  title
}: NotesDetailSectionProps) {
  return (
    <section className="detail-block">
      <div className="panel-header">
        <h3 className="panel-title detail-title">{title}</h3>
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
        <p className="state-copy">No notes yet.</p>
      ) : (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id} className="note-item">
              <p>{note.body}</p>
              <time>{formatTimestamp(note.createdAt)}</time>
            </li>
          ))}
        </ul>
      )}

      {!open && (
        <button className="adder-link" type="button" onClick={() => onToggleOpen(true)}>
          {addNoteLabel}
        </button>
      )}
    </section>
  );
}
