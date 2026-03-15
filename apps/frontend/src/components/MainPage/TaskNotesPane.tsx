import { TaskCard } from './TasksListPane/TaskCard';
import { TaskNotesDetail } from './TaskNotesPane/TaskNotesDetail';
import { type TasksPanelModel } from '@state/tasks/TasksPanelModel';

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

  return (
    <>
      {model.activeTask && (
        <TaskCard
          onDeleteTask={model.onDeleteTask}
          onUpdateTaskStatus={model.onUpdateTaskStatus}
          onUpdateTaskTitle={model.onUpdateTaskTitle}
          isSelected
          multiline
          task={model.activeTask}
          updateTaskLoading={model.updateTaskState.isLoading}
          updateTaskStatusLoading={model.updateTaskStatusState.isLoading}
        />
      )}
      <TaskNotesDetail
        createTaskNoteLoading={model.createTaskNoteState.isLoading}
        newTaskNoteBody={model.newTaskNoteBody}
        newTaskNoteReferenceUrl={model.newTaskNoteReferenceUrl}
        onChangeTaskNoteBody={model.setNewTaskNoteBody}
        onChangeTaskNoteReferenceUrl={model.setNewTaskNoteReferenceUrl}
        onCreateTaskNote={model.onCreateTaskNote}
        onUpdateTaskNote={model.onUpdateTaskNote}
        onToggleOpen={model.setTaskNoteInputOpen}
        open={model.taskNoteInputOpen}
        resetTaskNoteBody={() => model.setNewTaskNoteBody('')}
        resetTaskNoteReferenceUrl={() => model.setNewTaskNoteReferenceUrl('')}
        taskNotes={model.taskNotes}
        taskNotesError={Boolean(model.taskNotesQuery.error)}
        taskNotesLoading={model.taskNotesQuery.isLoading}
        updateTaskNoteLoading={model.updateTaskNoteState.isLoading}
      />
    </>
  );
}
