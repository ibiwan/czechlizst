import { type FormEvent } from 'react';
import { type NoteView } from '@app-types/view';
import { NotesDetailSectionAddForm } from './NotesDetailSectionAddForm';
import { NotesDetailSectionItem } from './NotesDetailSectionItem';

type NotesDetailSectionListProps = {
  createNoteLoading: boolean;
  deleteNoteLoading: boolean;
  editingBody: string;
  editingNoteId: number | null;
  editingReferenceUrl: string;
  inputPlaceholder: string;
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
  testIdAdd?: string;
  testIdAddCancel?: string;
  testIdAddInput?: string;
  testIdAddReference?: string;
  testIdAddSave?: string;
  testIdItem?: (noteId: number) => string | undefined;
  testIdEditButton?: (noteId: number) => string | undefined;
  testIdDeleteButton?: (noteId: number) => string | undefined;
  testIdEditCancel?: (noteId: number) => string | undefined;
  testIdEditForm?: (noteId: number) => string | undefined;
  testIdEditInput?: (noteId: number) => string | undefined;
  testIdEditReference?: (noteId: number) => string | undefined;
  testIdEditSave?: (noteId: number) => string | undefined;
  testIdReference?: (noteId: number) => string | undefined;
  testIdList?: string;
  updateNoteLoading: boolean;
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
  testIdAdd,
  testIdAddCancel,
  testIdAddInput,
  testIdAddReference,
  testIdAddSave,
  testIdItem,
  testIdDeleteButton,
  testIdEditButton,
  testIdEditCancel,
  testIdEditForm,
  testIdEditInput,
  testIdEditReference,
  testIdEditSave,
  testIdReference,
  testIdList,
  updateNoteLoading
}: NotesDetailSectionListProps) {
  return (
    <ul className="note-list" data-testid={testIdList}>
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
          testIdAdd={testIdAdd}
          testIdAddCancel={testIdAddCancel}
          testIdAddInput={testIdAddInput}
          testIdAddReference={testIdAddReference}
          testIdAddSave={testIdAddSave}
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
          testIdDeleteButton={testIdDeleteButton?.(note.id)}
          testIdEditButton={testIdEditButton?.(note.id)}
          testIdEditCancel={testIdEditCancel?.(note.id)}
          testIdEditForm={testIdEditForm?.(note.id)}
          testIdEditInput={testIdEditInput?.(note.id)}
          testIdEditReference={testIdEditReference?.(note.id)}
          testIdEditSave={testIdEditSave?.(note.id)}
          testIdItem={testIdItem?.(note.id)}
          testIdReference={testIdReference?.(note.id)}
          updateNoteLoading={updateNoteLoading}
        />
      ))}
    </ul>
  );
}
