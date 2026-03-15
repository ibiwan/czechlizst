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
            {open && (
              <li className="note-item" data-testid={testId('add-form')}>
                <form className="note-edit-form" onSubmit={onCreateNote}>
                  <div className="note-edit-fields">
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
                  </div>
                  <div className="note-edit-actions">
                    <button
                      className="icon-btn"
                      type="submit"
                      aria-label="Save note"
                      disabled={createNoteLoading}
                      data-testid={testId('add-save')}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 16.17 4.83 12l-1.41 1.41L9 19l12-12-1.41-1.41z" />
                      </svg>
                    </button>
                    <button
                      className="icon-btn"
                      type="button"
                      aria-label="Cancel note"
                      onClick={() => {
                        onToggleOpen(false);
                        resetNoteBody();
                        resetNoteReferenceUrl();
                      }}
                      data-testid={testId('add-cancel')}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </li>
            )}
            {notes.map((note) => (
              <li
                key={note.id}
                className="note-item"
                data-testid={testId(`item-${note.id}`)}
              >
                {editingNoteId === note.id ? (
                  <form
                    className="note-edit-form"
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
                    <div className="note-edit-fields">
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
                    </div>
                    <div className="note-edit-actions">
                      <button
                        className="icon-btn"
                        type="submit"
                        aria-label="Save note"
                        disabled={updateNoteLoading}
                        data-testid={testId(`edit-save-${note.id}`)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M9 16.17 4.83 12l-1.41 1.41L9 19l12-12-1.41-1.41z" />
                        </svg>
                      </button>
                      <button
                        className="icon-btn"
                        type="button"
                        aria-label="Cancel edit"
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditingBody('');
                          setEditingReferenceUrl('');
                        }}
                        data-testid={testId(`edit-cancel-${note.id}`)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
                        </svg>
                      </button>
                    </div>
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
                              className="icon-btn"
                              type="button"
                              aria-label="Edit note"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingBody(note.body);
                                setEditingReferenceUrl(note.referenceUrl ?? '');
                              }}
                              disabled={updateNoteLoading}
                              data-testid={testId(`edit-button-${note.id}`)}
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

      {notes.length === 0 && open && (
        <ul className="note-list" data-testid={testId('list')}>
          <li className="note-item" data-testid={testId('add-form')}>
            <form className="note-edit-form" onSubmit={onCreateNote}>
              <div className="note-edit-fields">
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
              </div>
              <div className="note-edit-actions">
                <button
                  className="icon-btn"
                  type="submit"
                  aria-label="Save note"
                  disabled={createNoteLoading}
                  data-testid={testId('add-save')}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 16.17 4.83 12l-1.41 1.41L9 19l12-12-1.41-1.41z" />
                  </svg>
                </button>
                <button
                  className="icon-btn"
                  type="button"
                  aria-label="Cancel note"
                  onClick={() => {
                    onToggleOpen(false);
                    resetNoteBody();
                    resetNoteReferenceUrl();
                  }}
                  data-testid={testId('add-cancel')}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
                  </svg>
                </button>
              </div>
            </form>
          </li>
        </ul>
      )}
    </section>
  );
}
