import { type FormEvent } from 'react';

type NotesDetailSectionAddFormProps = {
  createNoteLoading: boolean;
  inputPlaceholder: string;
  newNoteBody: string;
  newNoteReferenceUrl: string;
  onChangeNoteBody: (body: string) => void;
  onChangeNoteReferenceUrl: (value: string) => void;
  onCreateNote: (event: FormEvent<HTMLFormElement>) => void;
  onToggleOpen: (open: boolean) => void;
  resetNoteBody: () => void;
  resetNoteReferenceUrl: () => void;
  testIdAdd?: string;
  testIdAddCancel?: string;
  testIdAddInput?: string;
  testIdAddReference?: string;
  testIdAddSave?: string;
};

export function NotesDetailSectionAddForm({
  createNoteLoading,
  inputPlaceholder,
  newNoteBody,
  newNoteReferenceUrl,
  onChangeNoteBody,
  onChangeNoteReferenceUrl,
  onCreateNote,
  onToggleOpen,
  resetNoteBody,
  resetNoteReferenceUrl,
  testIdAdd,
  testIdAddCancel,
  testIdAddInput,
  testIdAddReference,
  testIdAddSave
}: NotesDetailSectionAddFormProps) {
  return (
    <li className="note-item" data-testid={testIdAdd}>
      <form className="note-edit-form" onSubmit={onCreateNote}>
        <div className="note-edit-fields">
          <input
            className="text-input"
            value={newNoteBody}
            onChange={(event) => onChangeNoteBody(event.target.value)}
            placeholder={inputPlaceholder}
            autoFocus
            data-testid={testIdAddInput}
          />
          <input
            className="text-input"
            value={newNoteReferenceUrl}
            onChange={(event) => onChangeNoteReferenceUrl(event.target.value)}
            placeholder="Reference (optional)"
            data-testid={testIdAddReference}
          />
        </div>
        <div className="note-edit-actions">
          <button
            className="icon-btn"
            type="submit"
            aria-label="Save note"
            disabled={createNoteLoading}
            data-testid={testIdAddSave}
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
            data-testid={testIdAddCancel}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
            </svg>
          </button>
        </div>
      </form>
    </li>
  );
}
