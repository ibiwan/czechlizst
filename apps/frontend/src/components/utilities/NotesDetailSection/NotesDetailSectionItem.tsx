import { type FormEvent } from 'react';
import { type NoteView } from '@app-types/view';
import { NotesDetailSectionEditForm } from './NotesDetailSectionEditForm';
import { NotesDetailSectionItemDisplay } from './NotesDetailSectionItemDisplay';

type NotesDetailSectionItemProps = {
  deleteNoteLoading?: boolean;
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
  testIdPrefix?: string;
  updateNoteLoading?: boolean;
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
  testIdPrefix,
  updateNoteLoading
}: NotesDetailSectionItemProps) {
  const testId = (suffix: string) => testIdPrefix ? `${testIdPrefix}-${suffix}` : undefined;

  return (
    <li key={note.id} className="note-item" data-testid={testId('item')}>
      {isEditing ? (
        <NotesDetailSectionEditForm
          editingBody={editingBody}
          editingReferenceUrl={editingReferenceUrl}
          onCancelEdit={onCancelEdit}
          onChangeBody={onChangeBody}
          onChangeReferenceUrl={onChangeReferenceUrl}
          onSubmitEdit={onSubmitEdit}
          testIdPrefix={testIdPrefix}
          updateNoteLoading={updateNoteLoading}
        />
      ) : (
        <NotesDetailSectionItemDisplay
          deleteNoteLoading={deleteNoteLoading}
          note={note}
          onDeleteNote={onDeleteNote}
          onStartEdit={onStartEdit}
          testIdPrefix={testIdPrefix}
          updateNoteLoading={updateNoteLoading}
        />
      )}
    </li>
  );
}
