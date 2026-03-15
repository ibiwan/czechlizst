import { type FormEvent } from 'react';
import { type NoteView } from '@app-types/view';
import { NotesDetailSectionEditForm } from './NotesDetailSectionEditForm';
import { NotesDetailSectionItemDisplay } from './NotesDetailSectionItemDisplay';

type NotesDetailSectionItemProps = {
  deleteNoteLoading: boolean;
  editingBody: string;
  editingReferenceUrl: string;
  isEditing: boolean;
  note: NoteView;
  onCancelEdit: () => void;
  onChangeBody: (value: string) => void;
  onChangeReferenceUrl: (value: string) => void;
  onDeleteNote?: (noteId: number) => void;
  onStartEdit?: () => void;
  onSubmitEdit: (event: FormEvent<HTMLFormElement>) => void;
  testIdDeleteButton?: string;
  testIdEditButton?: string;
  testIdEditCancel?: string;
  testIdEditForm?: string;
  testIdEditInput?: string;
  testIdEditReference?: string;
  testIdEditSave?: string;
  testIdItem?: string;
  testIdReference?: string;
  updateNoteLoading: boolean;
};

export function NotesDetailSectionItem({
  deleteNoteLoading,
  editingBody,
  editingReferenceUrl,
  isEditing,
  note,
  onCancelEdit,
  onChangeBody,
  onChangeReferenceUrl,
  onDeleteNote,
  onStartEdit,
  onSubmitEdit,
  testIdDeleteButton,
  testIdEditButton,
  testIdEditCancel,
  testIdEditForm,
  testIdEditInput,
  testIdEditReference,
  testIdEditSave,
  testIdItem,
  testIdReference,
  updateNoteLoading
}: NotesDetailSectionItemProps) {
  return (
    <li key={note.id} className="note-item" data-testid={testIdItem}>
      {isEditing ? (
        <NotesDetailSectionEditForm
          editingBody={editingBody}
          editingReferenceUrl={editingReferenceUrl}
          onCancelEdit={onCancelEdit}
          onChangeBody={onChangeBody}
          onChangeReferenceUrl={onChangeReferenceUrl}
          onSubmitEdit={onSubmitEdit}
          testIdCancel={testIdEditCancel}
          testIdForm={testIdEditForm}
          testIdInput={testIdEditInput}
          testIdReference={testIdEditReference}
          testIdSave={testIdEditSave}
          updateNoteLoading={updateNoteLoading}
        />
      ) : (
        <NotesDetailSectionItemDisplay
          deleteNoteLoading={deleteNoteLoading}
          note={note}
          onDeleteNote={onDeleteNote}
          onStartEdit={onStartEdit}
          testIdDeleteButton={testIdDeleteButton}
          testIdEditButton={testIdEditButton}
          testIdReference={testIdReference}
          updateNoteLoading={updateNoteLoading}
        />
      )}
    </li>
  );
}
