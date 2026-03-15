import { type FormEvent } from 'react';
import { type NoteView } from '@app-types/view';
import { NotesDetailSectionAddForm } from './NotesDetailSectionAddForm';
import { NotesDetailSectionItem } from './NotesDetailSectionItem';

type NotesDetailSectionListProps = {
  createNoteLoading?: boolean;
  deleteNoteLoading?: boolean;
  editingBody: string;
  editingNoteId: number | null;
  editingReferenceUrl: string;
  inputPlaceholder?: string;
  newNoteBody: string;
  newNoteReferenceUrl: string;
  notes: NoteView[];
  onCancelEdit: () => void;
  onChangeEditBody: (value: string) => void;
  onChangeEditReferenceUrl: (value: string) => void;
  onChangeNoteBody: (body: string) => void;
  onChangeNoteReferenceUrl: (value: string) => void;
  onCreateNote: (event: FormEvent<HTMLFormElement>) => void;
  onDeleteNote?: (noteId: number) => void;
  onStartEdit: (note: NoteView) => void;
  onSubmitEdit: (note: NoteView, event: FormEvent<HTMLFormElement>) => void;
  onToggleOpen: (open: boolean) => void;
  open: boolean;
  resetNoteBody: () => void;
  resetNoteReferenceUrl: () => void;
  testIdPrefix?: string;
  updateNoteLoading?: boolean;
};

export function NotesDetailSectionList({
  createNoteLoading,
  deleteNoteLoading,
  editingBody,
  editingNoteId,
  editingReferenceUrl,
  inputPlaceholder,
  newNoteBody,
  newNoteReferenceUrl,
  notes,
  onCancelEdit,
  onChangeEditBody,
  onChangeEditReferenceUrl,
  onChangeNoteBody,
  onChangeNoteReferenceUrl,
  onCreateNote,
  onDeleteNote,
  onStartEdit,
  onSubmitEdit,
  onToggleOpen,
  open,
  resetNoteBody,
  resetNoteReferenceUrl,
  testIdPrefix,
  updateNoteLoading
}: NotesDetailSectionListProps) {
  const testId = (suffix: string) => testIdPrefix ? `${testIdPrefix}-${suffix}` : undefined;

  return (
    <ul className="note-list" data-testid={testId('list')}>
      {open && (
        <NotesDetailSectionAddForm
          createNoteLoading={createNoteLoading}
          inputPlaceholder={inputPlaceholder}
          newNoteBody={newNoteBody}
          newNoteReferenceUrl={newNoteReferenceUrl}
          onChangeNoteBody={onChangeNoteBody}
          onChangeNoteReferenceUrl={onChangeNoteReferenceUrl}
          onCreateNote={onCreateNote}
          onToggleOpen={onToggleOpen}
          resetNoteBody={resetNoteBody}
          resetNoteReferenceUrl={resetNoteReferenceUrl}
          testIdPrefix={testIdPrefix}
        />
      )}
      {notes.map((note) => (
        <NotesDetailSectionItem
          key={note.id}
          deleteNoteLoading={deleteNoteLoading}
          editingBody={editingBody}
          editingReferenceUrl={editingReferenceUrl}
          isEditing={editingNoteId === note.id}
          note={note}
          onCancelEdit={onCancelEdit}
          onChangeBody={onChangeEditBody}
          onChangeReferenceUrl={onChangeEditReferenceUrl}
          onDeleteNote={onDeleteNote}
          onStartEdit={() => onStartEdit(note)}
          onSubmitEdit={(event) => onSubmitEdit(note, event)}
          testIdPrefix={testIdPrefix}
          updateNoteLoading={updateNoteLoading}
        />
      ))}
    </ul>
  );
}
