import { type NoteView } from '@app-types/view';
import { NotesDetailSection } from '@utilities/NotesDetailSection';

type TaskNotesDetailProps = {
  createTaskNoteLoading: boolean;
  newTaskNoteBody: string;
  newTaskNoteReferenceUrl: string;
  onChangeTaskNoteBody: (body: string) => void;
  onChangeTaskNoteReferenceUrl: (value: string) => void;
  onCreateTaskNote: (event: React.FormEvent<HTMLFormElement>) => void;
  onUpdateTaskNote: (noteId: number, body: string, referenceUrl: string | null) => void;
  onToggleOpen: (open: boolean) => void;
  open: boolean;
  resetTaskNoteBody: () => void;
  resetTaskNoteReferenceUrl: () => void;
  taskNotes: NoteView[];
  taskNotesError: boolean;
  taskNotesLoading: boolean;
  updateTaskNoteLoading: boolean;
};

export function TaskNotesDetail({
  createTaskNoteLoading,
  newTaskNoteBody,
  newTaskNoteReferenceUrl,
  onChangeTaskNoteBody,
  onChangeTaskNoteReferenceUrl,
  onCreateTaskNote,
  onUpdateTaskNote,
  onToggleOpen,
  open,
  resetTaskNoteBody,
  resetTaskNoteReferenceUrl,
  taskNotes,
  taskNotesError,
  taskNotesLoading,
  updateTaskNoteLoading
}: TaskNotesDetailProps) {
  return (
    <NotesDetailSection
      addNoteLabel="New note"
      createNoteLoading={createTaskNoteLoading}
      inputPlaceholder="Add a task note"
      newNoteBody={newTaskNoteBody}
      newNoteReferenceUrl={newTaskNoteReferenceUrl}
      notes={taskNotes}
      notesError={taskNotesError}
      notesLoading={taskNotesLoading}
      onUpdateNote={onUpdateTaskNote}
      onChangeNoteBody={onChangeTaskNoteBody}
      onChangeNoteReferenceUrl={onChangeTaskNoteReferenceUrl}
      onCreateNote={onCreateTaskNote}
      onToggleOpen={onToggleOpen}
      open={open}
      resetNoteBody={resetTaskNoteBody}
      resetNoteReferenceUrl={resetTaskNoteReferenceUrl}
      testIdPrefix="task-notes"
      title="Task Notes"
      updateNoteLoading={updateTaskNoteLoading}
    />
  );
}
