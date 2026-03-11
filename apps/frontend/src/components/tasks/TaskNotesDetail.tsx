import { NotesDetailSection } from '../NotesDetailSection';
import { type NoteView, type TaskView } from '../../types/view';

type TaskNotesDetailProps = {
  activeTask: TaskView | null;
  createTaskNoteLoading: boolean;
  newTaskNoteBody: string;
  onChangeTaskNoteBody: (body: string) => void;
  onCreateTaskNote: (event: React.FormEvent<HTMLFormElement>) => void;
  onUpdateTaskNote: (noteId: number, body: string) => void;
  onToggleOpen: (open: boolean) => void;
  open: boolean;
  resetTaskNoteBody: () => void;
  taskNotes: NoteView[];
  taskNotesError: boolean;
  taskNotesLoading: boolean;
  updateTaskNoteLoading: boolean;
};

export function TaskNotesDetail({
  activeTask,
  createTaskNoteLoading,
  newTaskNoteBody,
  onChangeTaskNoteBody,
  onCreateTaskNote,
  onUpdateTaskNote,
  onToggleOpen,
  open,
  resetTaskNoteBody,
  taskNotes,
  taskNotesError,
  taskNotesLoading,
  updateTaskNoteLoading
}: TaskNotesDetailProps) {
  const beforeList = activeTask ? (
    <div className="detail-actions">
      <div className="detail-action-row">
        <span className="status-label">Task:</span>
        <span className="detail-text" data-testid="task-notes-title">
          {activeTask.title}
        </span>
      </div>
    </div>
  ) : null;

  return (
    <NotesDetailSection
      addNoteLabel="New note"
      beforeList={beforeList}
      createNoteLoading={createTaskNoteLoading}
      inputPlaceholder="Add a task note"
      newNoteBody={newTaskNoteBody}
      notes={taskNotes}
      notesError={taskNotesError}
      notesLoading={taskNotesLoading}
      onUpdateNote={onUpdateTaskNote}
      onChangeNoteBody={onChangeTaskNoteBody}
      onCreateNote={onCreateTaskNote}
      onToggleOpen={onToggleOpen}
      open={open}
      resetNoteBody={resetTaskNoteBody}
      testIdPrefix="task-notes"
      title="Task Notes"
      updateNoteLoading={updateTaskNoteLoading}
    />
  );
}
