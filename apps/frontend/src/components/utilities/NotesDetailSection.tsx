import { useState } from 'react';
import { type ReactNode } from 'react';
import { type NoteView } from '@app-types/view';
import { NotesDetailSectionEmpty } from './NotesDetailSection/NotesDetailSectionEmpty';
import { NotesDetailSectionHeader } from './NotesDetailSection/NotesDetailSectionHeader';
import { NotesDetailSectionList } from './NotesDetailSection/NotesDetailSectionList';
import { NotesDetailSectionListHeader } from './NotesDetailSection/NotesDetailSectionListHeader';
import { NotesDetailSectionStatus } from './NotesDetailSection/NotesDetailSectionStatus';

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
    if (!trimmed) {
      return;
    }
    const refValue = editingReferenceUrl.trim();
    onUpdateNote?.(note.id, trimmed, refValue ? refValue : null);
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
            open={open}
            onToggleOpen={onToggleOpen}
            testId={testId('empty')}
            testIdAdd={testId('add-button')}
          />
          {open && (
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
              onChangeNoteBody={onChangeNoteBody}
              onChangeNoteReferenceUrl={onChangeNoteReferenceUrl}
              onCreateNote={onCreateNote}
              onDeleteNote={onDeleteNote}
              onStartEdit={onStartEdit}
              onSubmitEdit={onSubmitEdit}
              onToggleOpen={onToggleOpen}
              open={open}
              resetNoteBody={resetNoteBody}
              resetNoteReferenceUrl={resetNoteReferenceUrl}
              testIdAdd={testId('add-form')}
              testIdAddCancel={testId('add-cancel')}
              testIdAddInput={testId('add-input')}
              testIdAddReference={testId('add-reference')}
              testIdAddSave={testId('add-save')}
              testIdList={testId('list')}
              updateNoteLoading={updateNoteLoading}
            />
          )}
        </>
      ) : (
        <>
          <NotesDetailSectionListHeader
            addNoteLabel={addNoteLabel}
            createNoteLoading={createNoteLoading}
            open={open}
            onToggleOpen={onToggleOpen}
            testIdAdd={testId('add-button')}
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
            onChangeNoteBody={onChangeNoteBody}
            onChangeNoteReferenceUrl={onChangeNoteReferenceUrl}
            onCreateNote={onCreateNote}
            onDeleteNote={onDeleteNote}
            onStartEdit={onStartEdit}
            onSubmitEdit={onSubmitEdit}
            onToggleOpen={onToggleOpen}
            open={open}
            resetNoteBody={resetNoteBody}
            resetNoteReferenceUrl={resetNoteReferenceUrl}
            testIdAdd={testId('add-form')}
            testIdAddCancel={testId('add-cancel')}
            testIdAddInput={testId('add-input')}
            testIdAddReference={testId('add-reference')}
            testIdAddSave={testId('add-save')}
            testIdDeleteButton={(noteId) => testId(`delete-button-${noteId}`)}
            testIdEditButton={(noteId) => testId(`edit-button-${noteId}`)}
            testIdEditCancel={(noteId) => testId(`edit-cancel-${noteId}`)}
            testIdEditForm={(noteId) => testId(`edit-form-${noteId}`)}
            testIdEditInput={(noteId) => testId(`edit-input-${noteId}`)}
            testIdEditReference={(noteId) => testId(`edit-reference-${noteId}`)}
            testIdEditSave={(noteId) => testId(`edit-save-${noteId}`)}
            testIdItem={(noteId) => testId(`item-${noteId}`)}
            testIdList={testId('list')}
            testIdReference={(noteId) => testId(`ref-${noteId}`)}
            updateNoteLoading={updateNoteLoading}
          />
        </>
      )}
    </section>
  );
}
