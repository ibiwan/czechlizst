import { type FormEvent } from 'react';

type NotesDetailSectionEditFormProps = {
  editingBody: string;
  editingReferenceUrl: string;
  onCancelEdit: () => void;
  onChangeBody: (value: string) => void;
  onChangeReferenceUrl: (value: string) => void;
  onSubmitEdit: (event: FormEvent<HTMLFormElement>) => void;
  testIdCancel?: string;
  testIdForm?: string;
  testIdInput?: string;
  testIdReference?: string;
  testIdSave?: string;
  updateNoteLoading: boolean;
};

export function NotesDetailSectionEditForm({
  editingBody,
  editingReferenceUrl,
  onCancelEdit,
  onChangeBody,
  onChangeReferenceUrl,
  onSubmitEdit,
  testIdCancel,
  testIdForm,
  testIdInput,
  testIdReference,
  testIdSave,
  updateNoteLoading
}: NotesDetailSectionEditFormProps) {
  return (
    <form className="note-edit-form" onSubmit={onSubmitEdit} data-testid={testIdForm}>
      <div className="note-edit-fields">
        <input
          className="text-input"
          value={editingBody}
          onChange={(event) => onChangeBody(event.target.value)}
          autoFocus
          data-testid={testIdInput}
        />
        <input
          className="text-input"
          value={editingReferenceUrl}
          onChange={(event) => onChangeReferenceUrl(event.target.value)}
          placeholder="Reference (optional)"
          data-testid={testIdReference}
        />
      </div>
      <div className="note-edit-actions">
        <button
          className="icon-btn"
          type="submit"
          aria-label="Save note"
          disabled={updateNoteLoading}
          data-testid={testIdSave}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 16.17 4.83 12l-1.41 1.41L9 19l12-12-1.41-1.41z" />
          </svg>
        </button>
        <button
          className="icon-btn"
          type="button"
          aria-label="Cancel edit"
          onClick={onCancelEdit}
          data-testid={testIdCancel}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
