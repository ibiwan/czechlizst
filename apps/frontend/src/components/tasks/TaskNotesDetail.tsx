import { NotesDetailSection } from '../NotesDetailSection';
import { type NoteView } from '../../types/view';

type TaskNotesDetailProps = {
  createTaskNoteLoading: boolean;
  newTaskNoteBody: string;
  onChangeTaskNoteBody: (body: string) => void;
  onCreateTaskNote: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleOpen: (open: boolean) => void;
  open: boolean;
  resetTaskNoteBody: () => void;
  taskNotes: NoteView[];
  taskNotesError: boolean;
  taskNotesLoading: boolean;
};

export function TaskNotesDetail({
  createTaskNoteLoading,
  newTaskNoteBody,
  onChangeTaskNoteBody,
  onCreateTaskNote,
  onToggleOpen,
  open,
  resetTaskNoteBody,
  taskNotes,
  taskNotesError,
  taskNotesLoading
}: TaskNotesDetailProps) {
  return (
    <NotesDetailSection
      addNoteLabel="+ New task note"
      createNoteLoading={createTaskNoteLoading}
      inputPlaceholder="Add a task note"
      newNoteBody={newTaskNoteBody}
      notes={taskNotes}
      notesError={taskNotesError}
      notesLoading={taskNotesLoading}
      onChangeNoteBody={onChangeTaskNoteBody}
      onCreateNote={onCreateTaskNote}
      onToggleOpen={onToggleOpen}
      open={open}
      resetNoteBody={resetTaskNoteBody}
      title="Task Notes"
    />
  );
}
