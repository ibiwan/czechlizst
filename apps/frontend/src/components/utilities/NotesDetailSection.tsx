import { useState } from 'react';
import { type ReactNode } from 'react';
import { type NoteView } from '@app-types/view';
import { NotesDetailSectionEmpty } from './NotesDetailSection/NotesDetailSectionEmpty';
import { NotesDetailSectionHeader } from './NotesDetailSection/NotesDetailSectionHeader';
import { NotesDetailSectionList } from './NotesDetailSection/NotesDetailSectionList';
import { NotesDetailSectionListHeader } from './NotesDetailSection/NotesDetailSectionListHeader';
import { NotesDetailSectionStatus } from './NotesDetailSection/NotesDetailSectionStatus';

type NotesDetailSectionProps = {
  addNoteLabel?: string;
  createNoteLoading?: boolean;
  headerAction?: ReactNode;
  titleNode?: ReactNode;
  inputPlaceholder?: string;
  notes: NoteView[];
  notesError?: boolean;
  notesLoading?: boolean;
  onCreateNote: (body: string, referenceUrl: string | null) => Promise<void>;
  onDeleteNote?: (noteId: number) => void;
  onUpdateNote?: (noteId: number, body: string, referenceUrl: string | null) => void;
  testIdPrefix?: string;
  title: string;
  beforeList?: ReactNode;
  updateNoteLoading?: boolean;
  deleteNoteLoading?: boolean;
};

export function NotesDetailSection({
  addNoteLabel = 'Add note',
  beforeList,
  createNoteLoading = false,
  headerAction,
  inputPlaceholder = 'Add a note',
  notes,
  notesError = false,
  notesLoading = false,
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
  testIdPrefix,
  title,
  titleNode,
  updateNoteLoading = false,
  deleteNoteLoading = false
}: NotesDetailSectionProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteBody, setNewNoteBody] = useState('');
  const [newNoteReferenceUrl, setNewNoteReferenceUrl] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingBody, setEditingBody] = useState('');
  const [editingReferenceUrl, setEditingReferenceUrl] = useState('');

  const testId = (suffix: string) => testIdPrefix ? `${testIdPrefix}-${suffix}` : undefined;

  const resetNewNoteForm = () => {
    setNewNoteBody('');
    setNewNoteReferenceUrl('');
    setIsAddingNote(false);
  };

  const handleCreateNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = newNoteBody.trim();
    if (!trimmed) return;
    const ref = newNoteReferenceUrl.trim() || null;
    await onCreateNote(trimmed, ref);
    resetNewNoteForm();
  };

  const onCancelEdit = () => {
    setEditingNoteId(null);
    setEditingBody('');
    setEditingReferenceUrl('');
  };

  const onStartEdit = (note: NoteView) => {
    setEditingNoteId(note.id);
    setEditingBody(note.body);
    setEditingReferenceUrl(note.referenceUrl ?? '');
  };

  const onSubmitEdit = (note: NoteView, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = editingBody.trim();
    if (!trimmed) return;
    const ref = editingReferenceUrl.trim() || null;
    onUpdateNote?.(note.id, trimmed, ref);
    onCancelEdit();
  };

  return (
    <section className="detail-block" data-testid={testIdPrefix}>
      <NotesDetailSectionHeader
        headerAction={headerAction}
        testId={testId('header')}
        title={title}
        titleNode={titleNode}
      />

      {beforeList}

      <NotesDetailSectionStatus notesError={notesError} notesLoading={notesLoading} />

      {notes.length === 0 ? (
        <>
          <NotesDetailSectionEmpty
            addNoteLabel={addNoteLabel}
            createNoteLoading={createNoteLoading}
            open={isAddingNote}
            onToggleOpen={setIsAddingNote}
            testIdPrefix={testIdPrefix}
          />
          {isAddingNote && (
            <NotesDetailSectionList
              createNoteLoading={createNoteLoading}
              deleteNoteLoading={deleteNoteLoading}
              editingBody={editingBody}
              editingNoteId={editingNoteId}
              editingReferenceUrl={editingReferenceUrl}
              inputPlaceholder={inputPlaceholder}
              newNoteBody={newNoteBody}
              newNoteReferenceUrl={newNoteReferenceUrl}
              notes={notes}
              onCancelEdit={onCancelEdit}
              onChangeEditBody={setEditingBody}
              onChangeEditReferenceUrl={setEditingReferenceUrl}
              onChangeNoteBody={setNewNoteBody}
              onChangeNoteReferenceUrl={setNewNoteReferenceUrl}
              onCreateNote={handleCreateNote}
              onDeleteNote={onDeleteNote}
              onStartEdit={onStartEdit}
              onSubmitEdit={onSubmitEdit}
              onToggleOpen={setIsAddingNote}
              open={isAddingNote}
              resetNoteBody={() => setNewNoteBody('')}
              resetNoteReferenceUrl={() => setNewNoteReferenceUrl('')}
              testIdPrefix={testIdPrefix}
              updateNoteLoading={updateNoteLoading}
            />
          )}
        </>
      ) : (
        <>
          <NotesDetailSectionListHeader
            addNoteLabel={addNoteLabel}
            createNoteLoading={createNoteLoading}
            open={isAddingNote}
            onToggleOpen={setIsAddingNote}
            testIdPrefix={testIdPrefix}
          />
          <NotesDetailSectionList
            createNoteLoading={createNoteLoading}
            deleteNoteLoading={deleteNoteLoading}
            editingBody={editingBody}
            editingNoteId={editingNoteId}
            editingReferenceUrl={editingReferenceUrl}
            inputPlaceholder={inputPlaceholder}
            newNoteBody={newNoteBody}
            newNoteReferenceUrl={newNoteReferenceUrl}
            notes={notes}
            onCancelEdit={onCancelEdit}
            onChangeEditBody={setEditingBody}
            onChangeEditReferenceUrl={setEditingReferenceUrl}
            onChangeNoteBody={setNewNoteBody}
            onChangeNoteReferenceUrl={setNewNoteReferenceUrl}
            onCreateNote={handleCreateNote}
            onDeleteNote={onDeleteNote}
            onStartEdit={onStartEdit}
            onSubmitEdit={onSubmitEdit}
            onToggleOpen={setIsAddingNote}
            open={isAddingNote}
            resetNoteBody={() => setNewNoteBody('')}
            resetNoteReferenceUrl={() => setNewNoteReferenceUrl('')}
            testIdPrefix={testIdPrefix}
            updateNoteLoading={updateNoteLoading}
          />
        </>
      )}
    </section>
  );
}
