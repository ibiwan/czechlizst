import { NotesDetailSection } from '@utilities/NotesDetailSection';
import { type TasksPanelModel } from '@state/tasks/TasksPanelModel';

import { TaskCard } from './ProjectDetailPane/ProjectDetailView/TasksListCard/TaskCard';

export function TaskNotesPane({ model }: { model: TasksPanelModel }) {
  if (model.activeProjectId === null) {
    return (
      <p className="state-copy" data-testid="task-notes-empty-project">
        Select a project first.
      </p>
    );
  }

  if (model.selectedTaskId === null) {
    return (
      <p className="state-copy" data-testid="task-notes-empty-task">
        Select a task first.
      </p>
    );
  }

  async function handleCreateNote(body: string, referenceUrl: string | null) {
    if (!body || model.selectedTaskId === null) return;
    // The existing onCreateTaskNote reads from local state, so we need to call the mutation directly
    // First set the state, then call the handler
    model.setNewTaskNoteBody(body);
    model.setNewTaskNoteReferenceUrl(referenceUrl || '');
    // Now call onCreateTaskNote which expects a form event
    await model.onCreateTaskNote({ preventDefault: () => { } } as React.FormEvent<HTMLFormElement>);
  }

  return (
    <>
      {model.activeTask && (
        <TaskCard
          onUpdateTaskStatus={model.onUpdateTaskStatus}
          onUpdateTaskTitle={model.onUpdateTaskTitle}
          isSelected
          multiline
          task={model.activeTask}
          updateTaskLoading={model.updateTaskState.isLoading}
          updateTaskStatusLoading={model.updateTaskStatusState.isLoading}
        />
      )}
      <NotesDetailSection
        addNoteLabel="New note"
        createNoteLoading={model.createTaskNoteState.isLoading}
        inputPlaceholder="Add a task note"
        notes={model.taskNotes}
        notesError={Boolean(model.taskNotesQuery.error)}
        notesLoading={model.taskNotesQuery.isLoading}
        onCreateNote={handleCreateNote}
        onUpdateNote={model.onUpdateTaskNote}
        testIdPrefix="task-notes"
        title="Task Notes"
        updateNoteLoading={model.updateTaskNoteState.isLoading}
      />
    </>
  );
}
